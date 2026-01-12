import { protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { db } from "./db";
import { movimentacoesCaixa, contasReceber, contasPagar } from "../drizzle/schema";
import { eq, and, desc, sql, between } from "drizzle-orm";

export const fluxoCaixaRouter = router({
  // Obter resumo de fluxo de caixa
  getSummary: protectedProcedure
    .input(z.object({
      dataInicio: z.string(),
      dataFim: z.string(),
    }))
    .query(async ({ input }) => {
      const startDate = new Date(input.dataInicio);
      const endDate = new Date(input.dataFim);

      // Entradas (receitas recebidas)
      const entradas = await db
        .select({
          total: sql`SUM(${contasReceber.valorOriginal})`,
        })
        .from(contasReceber)
        .where(
          and(
            eq(contasReceber.status, "recebida"),
            between(contasReceber.dataRecebimento, startDate, endDate)
          )
        );

      // Saídas (despesas pagas)
      const saidas = await db
        .select({
          total: sql`SUM(${contasPagar.valorTotal})`,
        })
        .from(contasPagar)
        .where(
          and(
            eq(contasPagar.status, "paga"),
            between(contasPagar.dataPagamento, startDate, endDate)
          )
        );

      const totalEntradas = parseFloat((entradas[0]?.total as any) || 0);
      const totalSaidas = parseFloat((saidas[0]?.total as any) || 0);
      const saldo = totalEntradas - totalSaidas;

      return {
        entradas: totalEntradas,
        saidas: totalSaidas,
        saldo,
        periodo: {
          inicio: input.dataInicio,
          fim: input.dataFim,
        },
      };
    }),

  // Obter movimentações diárias
  movimentacoesDiarias: protectedProcedure
    .input(z.object({
      dataInicio: z.string(),
      dataFim: z.string(),
    }))
    .query(async ({ input }) => {
      const startDate = new Date(input.dataInicio);
      const endDate = new Date(input.dataFim);

      // Agrupar por data
      const dias: { [key: string]: { entradas: number; saidas: number; saldo: number } } = {};

      // Processar entradas
      const entradasData = await db
        .select({
          data: contasReceber.dataRecebimento,
          valor: contasReceber.valorOriginal,
        })
        .from(contasReceber)
        .where(
          and(
            eq(contasReceber.status, "recebida"),
            between(contasReceber.dataRecebimento, startDate, endDate)
          )
        );

      // Processar saídas
      const saidasData = await db
        .select({
          data: contasPagar.dataPagamento,
          valor: contasPagar.valorTotal,
        })
        .from(contasPagar)
        .where(
          and(
            eq(contasPagar.status, "paga"),
            between(contasPagar.dataPagamento, startDate, endDate)
          )
        );

      // Agrupar entradas
      entradasData.forEach((e: any) => {
        const dataStr = new Date(e.data).toISOString().split("T")[0];
        if (!dias[dataStr]) {
          dias[dataStr] = { entradas: 0, saidas: 0, saldo: 0 };
        }
        dias[dataStr].entradas += parseFloat(e.valor);
      });

      // Agrupar saídas
      saidasData.forEach((s: any) => {
        const dataStr = new Date(s.data).toISOString().split("T")[0];
        if (!dias[dataStr]) {
          dias[dataStr] = { entradas: 0, saidas: 0, saldo: 0 };
        }
        dias[dataStr].saidas += parseFloat(s.valor);
      });

      // Calcular saldo
      Object.keys(dias).forEach((data) => {
        dias[data].saldo = dias[data].entradas - dias[data].saidas;
      });

      return Object.entries(dias)
        .map(([data, valores]) => ({
          data,
          ...valores,
        }))
        .sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime());
    }),

  // Obter dados mensais para gráfico
  dadosMensais: protectedProcedure
    .input(z.object({
      ano: z.number(),
    }))
    .query(async ({ input }) => {
      const months = [];
      for (let month = 1; month <= 12; month++) {
        const startDate = new Date(input.ano, month - 1, 1);
        const endDate = new Date(input.ano, month, 0);

        const entradas = await db
          .select({
            total: sql`SUM(${contasReceber.valorOriginal})`,
          })
          .from(contasReceber)
          .where(
            and(
              eq(contasReceber.status, "recebida"),
              between(contasReceber.dataRecebimento, startDate, endDate)
            )
          );

        const saidas = await db
          .select({
            total: sql`SUM(${contasPagar.valorTotal})`,
          })
          .from(contasPagar)
          .where(
            and(
              eq(contasPagar.status, "paga"),
              between(contasPagar.dataPagamento, startDate, endDate)
            )
          );

        const totalEntradas = parseFloat((entradas[0]?.total as any) || 0);
        const totalSaidas = parseFloat((saidas[0]?.total as any) || 0);

        months.push({
          mes: month,
          entradas: totalEntradas,
          saidas: totalSaidas,
          saldo: totalEntradas - totalSaidas,
        });
      }
      return months;
    }),

  // Obter detalhes de entradas
  detalhesEntradas: protectedProcedure
    .input(z.object({
      dataInicio: z.string(),
      dataFim: z.string(),
    }))
    .query(async ({ input }) => {
      const startDate = new Date(input.dataInicio);
      const endDate = new Date(input.dataFim);

      return await db
        .select({
          id: contasReceber.id,
          descricao: contasReceber.descricao,
          cliente: contasReceber.cliente,
          valor: contasReceber.valorOriginal,
          data: contasReceber.dataRecebimento,
        })
        .from(contasReceber)
        .where(
          and(
            eq(contasReceber.status, "recebida"),
            between(contasReceber.dataRecebimento, startDate, endDate)
          )
        )
        .orderBy(desc(contasReceber.dataRecebimento));
    }),

  // Obter detalhes de saídas
  detalhesSaidas: protectedProcedure
    .input(z.object({
      dataInicio: z.string(),
      dataFim: z.string(),
    }))
    .query(async ({ input }) => {
      const startDate = new Date(input.dataInicio);
      const endDate = new Date(input.dataFim);

      return await db
        .select({
          id: contasPagar.id,
          descricao: contasPagar.descricao,
          fornecedor: contasPagar.fornecedor,
          valor: contasPagar.valorTotal,
          data: contasPagar.dataPagamento,
        })
        .from(contasPagar)
        .where(
          and(
            eq(contasPagar.status, "paga"),
            between(contasPagar.dataPagamento, startDate, endDate)
          )
        )
        .orderBy(desc(contasPagar.dataPagamento));
    }),
});
