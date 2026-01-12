import { z } from "zod";
import { protectedProcedure, router, createPermissionProcedure } from "./_core/trpc";

const financeiroProcedure = createPermissionProcedure("financeiro");
import { db } from "./db";
import { contasPagar, contasReceber, movimentacoesCaixa, categoriasFinanceiras } from "../drizzle/schema";
import { eq, and, desc, sql, between } from "drizzle-orm";

export const financeiroRouter = router({
  // ========== CONTAS A PAGAR ==========
  contasPagar: router({
    list: financeiroProcedure
      .input(z.object({ status: z.enum(["pendente", "paga", "vencida", "cancelada", "todos"]).optional() }).optional())
      .query(async ({ input }) => {
        const conditions = [];
        if (input?.status && input.status !== "todos") {
          conditions.push(eq(contasPagar.status, input.status));
        }
        return await db.select().from(contasPagar)
          .where(conditions.length > 0 ? and(...conditions) : undefined)
          .orderBy(desc(contasPagar.dataVencimento));
      }),

    create: financeiroProcedure
      .input(z.object({
        descricao: z.string(),
        fornecedor: z.string().optional(),
        valorOriginal: z.number(),
        dataEmissao: z.string(),
        dataVencimento: z.string(),
        categoriaId: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        const result = await db.insert(contasPagar).values({
          ...input,
          valorOriginal: input.valorOriginal.toFixed(2),
          valorTotal: input.valorOriginal.toFixed(2),
        } as any);
        return { success: true, id: result[0].insertId };
      }),

    pagar: financeiroProcedure
      .input(z.object({ id: z.number(), dataPagamento: z.string(), valorPago: z.number() }))
      .mutation(async ({ input }) => {
        await db.update(contasPagar).set({
          status: "paga",
          dataPagamento: input.dataPagamento,
          valorPago: input.valorPago.toFixed(2),
        } as any).where(eq(contasPagar.id, input.id));
        return { success: true };
      }),
  }),

  // ========== CONTAS A RECEBER ==========
  contasReceber: router({
    list: financeiroProcedure
      .input(z.object({ status: z.enum(["pendente", "recebida", "vencida", "cancelada", "todos"]).optional() }).optional())
      .query(async ({ input }) => {
        const conditions = [];
        if (input?.status && input.status !== "todos") {
          conditions.push(eq(contasReceber.status, input.status));
        }
        return await db.select().from(contasReceber)
          .where(conditions.length > 0 ? and(...conditions) : undefined)
          .orderBy(desc(contasReceber.dataVencimento));
      }),

    create: financeiroProcedure
      .input(z.object({
        descricao: z.string(),
        cliente: z.string().optional(),
        valorOriginal: z.number(),
        dataEmissao: z.string(),
        dataVencimento: z.string(),
        categoriaId: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        const result = await db.insert(contasReceber).values({
          ...input,
          valorOriginal: input.valorOriginal.toFixed(2),
          valorTotal: input.valorOriginal.toFixed(2),
        } as any);
        return { success: true, id: result[0].insertId };
      }),

    receber: financeiroProcedure
      .input(z.object({ id: z.number(), dataRecebimento: z.string(), valorRecebido: z.number() }))
      .mutation(async ({ input }) => {
        await db.update(contasReceber).set({
          status: "recebida",
          dataRecebimento: input.dataRecebimento,
          valorRecebido: input.valorRecebido.toFixed(2),
        } as any).where(eq(contasReceber.id, input.id));
        return { success: true };
      }),
  }),

  // ========== MOVIMENTAÇÕES CAIXA ==========
  caixa: router({
    list: financeiroProcedure
      .input(z.object({
        dataInicio: z.string().optional(),
        dataFim: z.string().optional(),
        tipo: z.enum(["entrada", "saida", "todos"]).optional(),
      }).optional())
      .query(async ({ input }) => {
        return await db.select().from(movimentacoesCaixa)
          .orderBy(desc(movimentacoesCaixa.data));
      }),

    registrar: financeiroProcedure
      .input(z.object({
        tipo: z.enum(["entrada", "saida"]),
        descricao: z.string(),
        valor: z.number(),
        data: z.string(),
        formaPagamento: z.enum(["dinheiro", "cartao_credito", "cartao_debito", "pix", "transferencia", "boleto", "cheque"]),
        categoriaId: z.number().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const result = await db.insert(movimentacoesCaixa).values({
          ...input,
          valor: input.valor.toFixed(2),
          createdBy: ctx.user.id,
        } as any);
        return { success: true, id: result[0].insertId };
      }),

     resumo: financeiroProcedure
      .query(async () => {
        const movimentacoes = await db.select().from(movimentacoesCaixa);
        const entradas = movimentacoes.filter(m => m.tipo === "entrada")
          .reduce((acc, m) => acc + parseFloat(String(m.valor)), 0);
        const saidas = movimentacoes.filter(m => m.tipo === "saida")
          .reduce((acc, m) => acc + parseFloat(String(m.valor)), 0);
        return {
          entradas: entradas.toFixed(2),
          saidas: saidas.toFixed(2),
          saldo: (entradas - saidas).toFixed(2),
        };
      }),
  }),

  // ========== DASHBOARD ==========
  getStats: protectedProcedure
    .query(async () => {
      const contasPagarPendentes = await db.select().from(contasPagar)
        .where(eq(contasPagar.status, "pendente"));
      
      const contasReceberPendentes = await db.select().from(contasReceber)
        .where(eq(contasReceber.status, "pendente"));

      const totalPagar = contasPagarPendentes.reduce((acc, c) => acc + parseFloat(String(c.valorTotal)), 0);
      const totalReceber = contasReceberPendentes.reduce((acc, c) => acc + parseFloat(String(c.valorTotal)), 0);

      return {
        contasPagarPendentes: contasPagarPendentes.length,
        totalPagar: totalPagar.toFixed(2),
        contasReceberPendentes: contasReceberPendentes.length,
        totalReceber: totalReceber.toFixed(2),
        saldoProjetado: (totalReceber - totalPagar).toFixed(2),
      };
    }),
});
