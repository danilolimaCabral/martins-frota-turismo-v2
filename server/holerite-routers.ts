import { protectedProcedure } from './routers';
import { z } from 'zod';
import { CLTCalculator, DadosFuncionario } from './clt-calculator';
import { HoleriteGenerator, DadosHolerite } from './holerite-generator';
import { db } from './db';
import { employees, folhasPagamento } from '@/drizzle/schema';
import { eq } from 'drizzle-orm';

/**
 * Router para gerar e gerenciar holerites
 */
export const holeriteRouter = {
  /**
   * Gera holerite para um funcionário em um período específico
   */
  gerar: protectedProcedure
    .input(
      z.object({
        funcionarioId: z.number(),
        mesReferencia: z.number().min(1).max(12),
        anoReferencia: z.number().min(2020),
        horasExtras50: z.number().default(0),
        horasExtras100: z.number().default(0),
        adicionais: z.number().default(0),
        comissoes: z.number().default(0),
        bonus: z.number().default(0),
        valeTransporte: z.number().default(0),
        valeAlimentacao: z.number().default(0),
        descontoValeTransporte: z.boolean().default(true),
        descontoValeAlimentacao: z.boolean().default(false),
        contribuicaoSindical: z.boolean().default(false),
        pensaoAlimenticia: z.number().default(0),
        adiantamento: z.number().default(0),
        emFerias: z.boolean().default(false),
        diasFerias: z.number().default(0),
        recebeDecimo: z.boolean().default(false),
      })
    )
    .query(async ({ input }) => {
      try {
        // Buscar funcionário
        const funcionario = await db
          .select()
          .from(employees)
          .where(eq(employees.id, input.funcionarioId))
          .limit(1);

        if (!funcionario.length) {
          throw new Error('Funcionário não encontrado');
        }

        const emp = funcionario[0];

        // Dados para cálculo
        const dadosFuncionario: DadosFuncionario = {
          nome: emp.nome || '',
          cpf: emp.cpf || '',
          salarioBase: emp.salario || 0,
          horasExtras50: input.horasExtras50,
          horasExtras100: input.horasExtras100,
          adicionalNoturno: input.adicionais > 0 ? input.adicionais : undefined,
          comissoes: input.comissoes,
          bonus: input.bonus,
          valeTransporte: input.valeTransporte,
          valeAlimentacao: input.valeAlimentacao,
          descontoValeTransporte: input.descontoValeTransporte,
          descontoValeAlimentacao: input.descontoValeAlimentacao,
          contribuicaoSindical: input.contribuicaoSindical,
          pensaoAlimenticia: input.pensaoAlimenticia,
          adiantamento: input.adiantamento,
          mesReferencia: input.mesReferencia,
          anoReferencia: input.anoReferencia,
          diasTrabalhados: 30,
          emFerias: input.emFerias,
          diasFerias: input.diasFerias,
          recebeDecimo: input.recebeDecimo,
        };

        // Calcular impostos
        const calculator = new CLTCalculator();
        const calculo = calculator.calcularFolha(dadosFuncionario);

        // Gerar holerite
        const generator = new HoleriteGenerator();
        const holeriteHTML = generator.gerarHTML({
          empresa: {
            cnpj: '12.345.678/0001-90',
            razaoSocial: 'MARTINS TURISMO LTDA',
            endereco: 'Rua das Flores, 123',
            cidade: 'CURITIBA',
            uf: 'PR',
            cep: '80000000',
          },
          funcionario: {
            nome: emp.nome || '',
            cpf: emp.cpf || '',
            matricula: emp.id.toString(),
            cargo: emp.cargo || '',
            departamento: emp.departamento || '',
            dataAdmissao: emp.dataAdmissao ? new Date(emp.dataAdmissao) : new Date(),
            salarioBase: emp.salario || 0,
          },
          calculo,
          mesReferencia: input.mesReferencia,
          anoReferencia: input.anoReferencia,
          dataEmissao: new Date(),
          sequencialHolerite: 1,
          observacoes: 'Holerite gerado automaticamente pelo sistema',
        });

        return {
          success: true,
          calculo,
          holeriteHTML,
          funcionario: {
            id: emp.id,
            nome: emp.nome,
            cpf: emp.cpf,
            matricula: emp.id.toString(),
            cargo: emp.cargo,
            departamento: emp.departamento,
            dataAdmissao: emp.dataAdmissao,
            salarioBase: emp.salario,
          },
          periodo: {
            mes: input.mesReferencia,
            ano: input.anoReferencia,
          },
        };
      } catch (error) {
        console.error('Erro ao gerar holerite:', error);
        throw new Error(`Erro ao gerar holerite: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
      }
    }),

  /**
   * Lista holerites de um funcionário
   */
  listar: protectedProcedure
    .input(
      z.object({
        funcionarioId: z.number(),
        ano: z.number().optional(),
      })
    )
    .query(async ({ input }) => {
      try {
        let query = db.select().from(folhasPagamento).where(eq(folhasPagamento.funcionarioId, input.funcionarioId));

        if (input.ano) {
          // Filtrar por ano (se houver campo de ano na tabela)
          // query = query.where(eq(folhasPagamento.ano, input.ano));
        }

        const holerites = await query;
        return holerites;
      } catch (error) {
        console.error('Erro ao listar holerites:', error);
        throw new Error(`Erro ao listar holerites: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
      }
    }),

  /**
   * Salva holerite no banco de dados
   */
  salvar: protectedProcedure
    .input(
      z.object({
        funcionarioId: z.number(),
        mesReferencia: z.number(),
        anoReferencia: z.number(),
        totalProventos: z.number(),
        totalDescontos: z.number(),
        liquido: z.number(),
        dados: z.record(z.any()).optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const result = await db.insert(folhasPagamento).values({
          funcionarioId: input.funcionarioId,
          mes: input.mesReferencia,
          ano: input.anoReferencia,
          totalProventos: input.totalProventos,
          totalDescontos: input.totalDescontos,
          liquido: input.liquido,
          status: 'gerada',
          dataGeracao: new Date(),
        });

        return {
          success: true,
          message: 'Holerite salvo com sucesso',
        };
      } catch (error) {
        console.error('Erro ao salvar holerite:', error);
        throw new Error(`Erro ao salvar holerite: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
      }
    }),
};
