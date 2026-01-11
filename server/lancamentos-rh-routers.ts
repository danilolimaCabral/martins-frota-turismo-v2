import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { db } from "./db";
import { lancamentosRH, funcionarios, folhasPagamento } from "../drizzle/schema";
import { eq, and, desc, sql } from "drizzle-orm";

/**
 * Router tRPC para Lançamentos RH
 * Sistema flexível de créditos e débitos para folha de pagamento
 */

export const lancamentosRHRouter = router({
  /**
   * Listar lançamentos
   */
  list: protectedProcedure
    .input(
      z.object({
        funcionarioId: z.number().optional(),
        tipo: z.enum(["credito", "debito", "todos"]).optional(),
        mes: z.number().optional(),
        ano: z.number().optional(),
        folhaPagamentoId: z.number().optional(),
      }).optional()
    )
    .query(async ({ input }) => {
      const conditions = [];

      if (input?.funcionarioId) {
        conditions.push(eq(lancamentosRH.funcionarioId, input.funcionarioId));
      }

      if (input?.tipo && input.tipo !== "todos") {
        conditions.push(eq(lancamentosRH.tipo, input.tipo));
      }

      if (input?.mes) {
        conditions.push(eq(lancamentosRH.mesReferencia, input.mes));
      }

      if (input?.ano) {
        conditions.push(eq(lancamentosRH.anoReferencia, input.ano));
      }

      if (input?.folhaPagamentoId) {
        conditions.push(eq(lancamentosRH.folhaPagamentoId, input.folhaPagamentoId));
      }

      const results = await db
        .select({
          lancamento: lancamentosRH,
          funcionario: funcionarios,
        })
        .from(lancamentosRH)
        .leftJoin(funcionarios, eq(lancamentosRH.funcionarioId, funcionarios.id))
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .orderBy(desc(lancamentosRH.dataLancamento));

      return results.map(r => ({
        ...r.lancamento,
        funcionarioNome: r.funcionario?.nome,
      }));
    }),

  /**
   * Buscar lançamento por ID
   */
  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const result = await db
        .select({
          lancamento: lancamentosRH,
          funcionario: funcionarios,
        })
        .from(lancamentosRH)
        .leftJoin(funcionarios, eq(lancamentosRH.funcionarioId, funcionarios.id))
        .where(eq(lancamentosRH.id, input.id))
        .limit(1);

      if (result.length === 0) {
        throw new Error("Lançamento não encontrado");
      }

      return {
        ...result[0].lancamento,
        funcionarioNome: result[0].funcionario?.nome,
      };
    }),

  /**
   * Criar lançamento
   */
  create: protectedProcedure
    .input(
      z.object({
        funcionarioId: z.number(),
        folhaPagamentoId: z.number().optional(),
        tipo: z.enum(["credito", "debito"]),
        categoria: z.enum([
          "salario", "hora_extra_50", "hora_extra_100", "adicional_noturno",
          "adicional_periculosidade", "adicional_insalubridade", "comissao",
          "bonus", "gratificacao", "ferias", "decimo_terceiro",
          "vale_transporte", "vale_alimentacao", "vale_refeicao",
          "auxilio_creche", "plano_saude", "seguro_vida", "outros_creditos",
          "adiantamento_salarial", "desconto_falta", "desconto_atraso",
          "inss", "irrf", "vale_transporte_desc", "vale_alimentacao_desc",
          "plano_saude_desc", "emprestimo", "pensao_alimenticia", "outros_debitos"
        ]),
        descricao: z.string(),
        valor: z.number(),
        mesReferencia: z.number().min(1).max(12),
        anoReferencia: z.number(),
        dataLancamento: z.string(),
        observacoes: z.string().optional(),
        comprovanteUrl: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const result = await db.insert(lancamentosRH).values({
        ...input,
        valor: input.valor.toFixed(2),
        createdBy: ctx.user.id,
      } as any);

      return { success: true, id: result[0].insertId };
    }),

  /**
   * Atualizar lançamento
   */
  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        tipo: z.enum(["credito", "debito"]).optional(),
        categoria: z.enum([
          "salario", "hora_extra_50", "hora_extra_100", "adicional_noturno",
          "adicional_periculosidade", "adicional_insalubridade", "comissao",
          "bonus", "gratificacao", "ferias", "decimo_terceiro",
          "vale_transporte", "vale_alimentacao", "vale_refeicao",
          "auxilio_creche", "plano_saude", "seguro_vida", "outros_creditos",
          "adiantamento_salarial", "desconto_falta", "desconto_atraso",
          "inss", "irrf", "vale_transporte_desc", "vale_alimentacao_desc",
          "plano_saude_desc", "emprestimo", "pensao_alimenticia", "outros_debitos"
        ]).optional(),
        descricao: z.string().optional(),
        valor: z.number().optional(),
        observacoes: z.string().optional(),
        comprovanteUrl: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      
      const updateData: any = {};
      if (data.tipo) updateData.tipo = data.tipo;
      if (data.categoria) updateData.categoria = data.categoria;
      if (data.descricao) updateData.descricao = data.descricao;
      if (data.valor) updateData.valor = data.valor.toFixed(2);
      if (data.observacoes !== undefined) updateData.observacoes = data.observacoes;
      if (data.comprovanteUrl !== undefined) updateData.comprovanteUrl = data.comprovanteUrl;

      await db
        .update(lancamentosRH)
        .set(updateData)
        .where(eq(lancamentosRH.id, id));

      return { success: true };
    }),

  /**
   * Deletar lançamento
   */
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await db.delete(lancamentosRH).where(eq(lancamentosRH.id, input.id));
      return { success: true };
    }),

  /**
   * Resumo de lançamentos por funcionário
   */
  getResumoFuncionario: protectedProcedure
    .input(
      z.object({
        funcionarioId: z.number(),
        mes: z.number(),
        ano: z.number(),
      })
    )
    .query(async ({ input }) => {
      const lancamentos = await db
        .select()
        .from(lancamentosRH)
        .where(
          and(
            eq(lancamentosRH.funcionarioId, input.funcionarioId),
            eq(lancamentosRH.mesReferencia, input.mes),
            eq(lancamentosRH.anoReferencia, input.ano)
          )
        );

      const totalCreditos = lancamentos
        .filter(l => l.tipo === "credito")
        .reduce((acc, l) => acc + parseFloat(String(l.valor)), 0);

      const totalDebitos = lancamentos
        .filter(l => l.tipo === "debito")
        .reduce((acc, l) => acc + parseFloat(String(l.valor)), 0);

      const totalLiquido = totalCreditos - totalDebitos;

      // Agrupar por categoria
      const porCategoria: Record<string, number> = {};
      lancamentos.forEach(l => {
        const categoria = l.categoria;
        if (!porCategoria[categoria]) {
          porCategoria[categoria] = 0;
        }
        const valor = parseFloat(String(l.valor));
        porCategoria[categoria] += l.tipo === "credito" ? valor : -valor;
      });

      return {
        totalCreditos: totalCreditos.toFixed(2),
        totalDebitos: totalDebitos.toFixed(2),
        totalLiquido: totalLiquido.toFixed(2),
        porCategoria,
        lancamentos,
      };
    }),

  /**
   * Importar lançamentos em lote
   */
  importarLote: protectedProcedure
    .input(
      z.object({
        lancamentos: z.array(
          z.object({
            funcionarioId: z.number(),
            tipo: z.enum(["credito", "debito"]),
            categoria: z.string(),
            descricao: z.string(),
            valor: z.number(),
            mesReferencia: z.number(),
            anoReferencia: z.number(),
            dataLancamento: z.string(),
          })
        ),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const lancamentosParaInserir = input.lancamentos.map(l => ({
        ...l,
        valor: l.valor.toFixed(2),
        createdBy: ctx.user.id,
      }));

      await db.insert(lancamentosRH).values(lancamentosParaInserir as any);

      return { success: true, total: lancamentosParaInserir.length };
    }),
});
