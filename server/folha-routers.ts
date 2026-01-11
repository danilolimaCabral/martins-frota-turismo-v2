import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { db } from "./db";
import { CNABGenerator } from "./cnab-generator";
import { folhasPagamento, itensFolha, funcionarios, horasExtras } from "../drizzle/schema";
import { eq, and, desc, sql } from "drizzle-orm";

/**
 * Router tRPC para Folha de Pagamento
 * 
 * Endpoints:
 * - list: Listar folhas de pagamento
 * - getById: Buscar folha por ID com itens
 * - create: Criar nova folha
 * - addItem: Adicionar funcionário à folha
 * - updateItem: Atualizar item da folha
 * - deleteItem: Remover item da folha
 * - fecharFolha: Fechar folha e calcular totais
 * - registrarPagamento: Registrar pagamento da folha
 * - getHorasExtras: Listar horas extras pendentes
 * - aprovarHoraExtra: Aprovar hora extra
 */

export const folhaRouter = router({
  /**
   * Listar folhas de pagamento
   */
  list: protectedProcedure
    .input(
      z.object({
        ano: z.number().optional(),
        mes: z.number().optional(),
        status: z.enum(["aberta", "processando", "fechada", "paga", "todos"]).optional(),
      }).optional()
    )
    .query(async ({ input }) => {
      const conditions = [];

      if (input?.ano) {
        conditions.push(eq(folhasPagamento.anoReferencia, input.ano));
      }

      if (input?.mes) {
        conditions.push(eq(folhasPagamento.mesReferencia, input.mes));
      }

      if (input?.status && input.status !== "todos") {
        conditions.push(eq(folhasPagamento.status, input.status));
      }

      const results = await db
        .select()
        .from(folhasPagamento)
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .orderBy(desc(folhasPagamento.anoReferencia), desc(folhasPagamento.mesReferencia));

      return results;
    }),

  /**
   * Buscar folha por ID com itens
   */
  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const folha = await db
        .select()
        .from(folhasPagamento)
        .where(eq(folhasPagamento.id, input.id))
        .limit(1);

      if (folha.length === 0) {
        throw new Error("Folha de pagamento não encontrada");
      }

      // Buscar itens da folha com dados dos funcionários
      const itens = await db
        .select({
          item: itensFolha,
          funcionario: funcionarios,
        })
        .from(itensFolha)
        .leftJoin(funcionarios, eq(itensFolha.funcionarioId, funcionarios.id))
        .where(eq(itensFolha.folhaId, input.id));

      return {
        ...folha[0],
        itens: itens.map(i => ({
          ...i.item,
          funcionarioNome: i.funcionario?.nome,
        })),
      };
    }),

  /**
   * Criar nova folha de pagamento
   */
  create: protectedProcedure
    .input(
      z.object({
        mesReferencia: z.number().min(1).max(12),
        anoReferencia: z.number().min(2020).max(2100),
        dataPagamento: z.string().optional(),
        observacoes: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      // Verificar se já existe folha para o mês/ano
      const existente = await db
        .select()
        .from(folhasPagamento)
        .where(
          and(
            eq(folhasPagamento.mesReferencia, input.mesReferencia),
            eq(folhasPagamento.anoReferencia, input.anoReferencia)
          )
        )
        .limit(1);

      if (existente.length > 0) {
        throw new Error("Já existe uma folha de pagamento para este mês/ano");
      }

      const result = await db.insert(folhasPagamento).values(input as any);
      return { success: true, id: result[0].insertId };
    }),

  /**
   * Adicionar funcionário à folha
   */
  addItem: protectedProcedure
    .input(
      z.object({
        folhaId: z.number(),
        funcionarioId: z.number(),
        salarioBase: z.string(),
        horasExtras50: z.string().optional(),
        horasExtras100: z.string().optional(),
        adicionalNoturno: z.string().optional(),
        adicionalPericulosidade: z.string().optional(),
        adicionalInsalubridade: z.string().optional(),
        comissoes: z.string().optional(),
        bonus: z.string().optional(),
        outrosProventos: z.string().optional(),
        
        inss: z.string().optional(),
        irrf: z.string().optional(),
        fgts: z.string().optional(),
        valeTransporte: z.string().optional(),
        valeAlimentacao: z.string().optional(),
        planoSaude: z.string().optional(),
        adiantamento: z.string().optional(),
        faltas: z.string().optional(),
        outrosDescontos: z.string().optional(),
        
        observacoes: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      // Calcular totais
      const proventos = [
        input.salarioBase,
        input.horasExtras50 || "0",
        input.horasExtras100 || "0",
        input.adicionalNoturno || "0",
        input.adicionalPericulosidade || "0",
        input.adicionalInsalubridade || "0",
        input.comissoes || "0",
        input.bonus || "0",
        input.outrosProventos || "0",
      ];

      const descontos = [
        input.inss || "0",
        input.irrf || "0",
        input.fgts || "0",
        input.valeTransporte || "0",
        input.valeAlimentacao || "0",
        input.planoSaude || "0",
        input.adiantamento || "0",
        input.faltas || "0",
        input.outrosDescontos || "0",
      ];

      const totalProventos = proventos.reduce((acc, val) => acc + parseFloat(val), 0).toFixed(2);
      const totalDescontos = descontos.reduce((acc, val) => acc + parseFloat(val), 0).toFixed(2);
      const salarioLiquido = (parseFloat(totalProventos) - parseFloat(totalDescontos)).toFixed(2);

      const result = await db.insert(itensFolha).values({
        ...input,
        totalProventos,
        totalDescontos,
        salarioLiquido,
      } as any);

      return { success: true, id: result[0].insertId };
    }),

  /**
   * Atualizar item da folha
   */
  updateItem: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        salarioBase: z.string().optional(),
        horasExtras50: z.string().optional(),
        horasExtras100: z.string().optional(),
        adicionalNoturno: z.string().optional(),
        adicionalPericulosidade: z.string().optional(),
        adicionalInsalubridade: z.string().optional(),
        comissoes: z.string().optional(),
        bonus: z.string().optional(),
        outrosProventos: z.string().optional(),
        
        inss: z.string().optional(),
        irrf: z.string().optional(),
        fgts: z.string().optional(),
        valeTransporte: z.string().optional(),
        valeAlimentacao: z.string().optional(),
        planoSaude: z.string().optional(),
        adiantamento: z.string().optional(),
        faltas: z.string().optional(),
        outrosDescontos: z.string().optional(),
        
        observacoes: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { id, ...data } = input;

      // Buscar item atual
      const itemAtual = await db
        .select()
        .from(itensFolha)
        .where(eq(itensFolha.id, id))
        .limit(1);

      if (itemAtual.length === 0) {
        throw new Error("Item não encontrado");
      }

      // Mesclar dados
      const dadosAtualizados = { ...itemAtual[0], ...data };

      // Recalcular totais
      const proventos = [
        dadosAtualizados.salarioBase,
        dadosAtualizados.horasExtras50,
        dadosAtualizados.horasExtras100,
        dadosAtualizados.adicionalNoturno,
        dadosAtualizados.adicionalPericulosidade,
        dadosAtualizados.adicionalInsalubridade,
        dadosAtualizados.comissoes,
        dadosAtualizados.bonus,
        dadosAtualizados.outrosProventos,
      ];

      const descontos = [
        dadosAtualizados.inss,
        dadosAtualizados.irrf,
        dadosAtualizados.fgts,
        dadosAtualizados.valeTransporte,
        dadosAtualizados.valeAlimentacao,
        dadosAtualizados.planoSaude,
        dadosAtualizados.adiantamento,
        dadosAtualizados.faltas,
        dadosAtualizados.outrosDescontos,
      ];

      const totalProventos = proventos.reduce((acc, val) => acc + parseFloat(String(val || "0")), 0).toFixed(2);
      const totalDescontos = descontos.reduce((acc, val) => acc + parseFloat(String(val || "0")), 0).toFixed(2);
      const salarioLiquido = (parseFloat(totalProventos) - parseFloat(totalDescontos)).toFixed(2);

      await db.update(itensFolha).set({
        ...data,
        totalProventos,
        totalDescontos,
        salarioLiquido,
      } as any).where(eq(itensFolha.id, id));

      return { success: true };
    }),

  /**
   * Remover item da folha
   */
  deleteItem: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await db.delete(itensFolha).where(eq(itensFolha.id, input.id));
      return { success: true };
    }),

  /**
   * Fechar folha e calcular totais
   */
  fecharFolha: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      // Buscar todos os itens da folha
      const itens = await db
        .select()
        .from(itensFolha)
        .where(eq(itensFolha.folhaId, input.id));

      // Calcular totais
      const totalBruto = itens.reduce((acc, item) => acc + parseFloat(String(item.totalProventos || "0")), 0).toFixed(2);
      const totalDescontos = itens.reduce((acc, item) => acc + parseFloat(String(item.totalDescontos || "0")), 0).toFixed(2);
      const totalLiquido = itens.reduce((acc, item) => acc + parseFloat(String(item.salarioLiquido || "0")), 0).toFixed(2);

      // Atualizar folha
      await db.update(folhasPagamento).set({
        status: "fechada",
        dataFechamento: new Date(),
        totalBruto,
        totalDescontos,
        totalLiquido,
      } as any).where(eq(folhasPagamento.id, input.id));

      return { success: true, totalBruto, totalDescontos, totalLiquido };
    }),

  /**
   * Registrar pagamento da folha
   */
  registrarPagamento: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        dataPagamento: z.string(),
        arquivoCnab: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      await db.update(folhasPagamento).set({
        status: "paga",
        dataPagamento: input.dataPagamento,
        arquivoCnab: input.arquivoCnab,
      } as any).where(eq(folhasPagamento.id, input.id));

      return { success: true };
    }),

  /**
   * Listar horas extras pendentes de aprovação
   */
  getHorasExtras: protectedProcedure
    .input(
      z.object({
        funcionarioId: z.number().optional(),
        aprovado: z.boolean().optional(),
      }).optional()
    )
    .query(async ({ input }) => {
      const conditions = [];

      if (input?.funcionarioId) {
        conditions.push(eq(horasExtras.funcionarioId, input.funcionarioId));
      }

      if (input?.aprovado !== undefined) {
        conditions.push(eq(horasExtras.aprovado, input.aprovado));
      }

      const results = await db
        .select({
          horaExtra: horasExtras,
          funcionario: funcionarios,
        })
        .from(horasExtras)
        .leftJoin(funcionarios, eq(horasExtras.funcionarioId, funcionarios.id))
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .orderBy(desc(horasExtras.data));

      return results.map(r => ({
        ...r.horaExtra,
        funcionarioNome: r.funcionario?.nome,
      }));
    }),

  /**
   * Aprovar hora extra
   */
  aprovarHoraExtra: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        aprovado: z.boolean(),
      })
    )
    .mutation(async ({ input }) => {
      await db.update(horasExtras).set({
        aprovado: input.aprovado,
      }).where(eq(horasExtras.id, input.id));

      return { success: true };
    }),

  /**
   * Gerar arquivo CNAB 240 para pagamento bancário
   */
  gerarCNAB: protectedProcedure
    .input(
      z.object({
        folhaId: z.number(),
        dadosBancarios: z.object({
          codigoBanco: z.string(),
          agencia: z.string(),
          conta: z.string(),
          digitoConta: z.string(),
        }),
        dadosEmpresa: z.object({
          cnpj: z.string(),
          razaoSocial: z.string(),
          endereco: z.string(),
          cidade: z.string(),
          uf: z.string(),
          cep: z.string(),
        }),
      })
    )
    .mutation(async ({ input }) => {
      // Buscar folha e itens
      const folha = await db
        .select()
        .from(folhasPagamento)
        .where(eq(folhasPagamento.id, input.folhaId))
        .limit(1);

      if (folha.length === 0) {
        throw new Error("Folha de pagamento não encontrada");
      }

      if (folha[0].status !== "fechada") {
        throw new Error("Folha de pagamento deve estar fechada para gerar CNAB");
      }

      // Buscar itens com dados bancários dos funcionários
      const itens = await db
        .select({
          item: itensFolha,
          funcionario: funcionarios,
        })
        .from(itensFolha)
        .leftJoin(funcionarios, eq(itensFolha.funcionarioId, funcionarios.id))
        .where(eq(itensFolha.folhaId, input.folhaId));

      // Preparar dados para CNAB
      const pagamentos = itens.map(i => ({
        nome: i.funcionario?.nome || "",
        cpf: i.funcionario?.cpf || "",
        agencia: i.funcionario?.agencia || "",
        conta: i.funcionario?.conta || "",
        digitoConta: i.funcionario?.conta?.slice(-1) || "0",
        valor: parseFloat(String(i.item.salarioLiquido || "0")),
        tipoConta: (i.funcionario?.tipoConta as "CC" | "CP" | "CS") || "CC",
      }));

      // Gerar arquivo CNAB
      const cnabGenerator = new CNABGenerator();
      const arquivoCNAB = cnabGenerator.gerarArquivo(
        input.dadosBancarios,
        input.dadosEmpresa,
        pagamentos
      );

      // Retornar arquivo como string (frontend pode fazer download)
      return {
        success: true,
        arquivo: arquivoCNAB,
        nomeArquivo: `CNAB_${folha[0].mesReferencia}_${folha[0].anoReferencia}.txt`,
        totalPagamentos: pagamentos.length,
        valorTotal: pagamentos.reduce((acc, p) => acc + p.valor, 0).toFixed(2),
      };
    }),
});
