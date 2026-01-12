import { protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { db } from "./db";
import { contasReceber, contasPagar, movimentacoesCaixa } from "../drizzle/schema";
import { eq, and, desc, sql, between, gte, lte } from "drizzle-orm";

export const dreRouter = router({
  // ========== DEMONSTRATIVO DE RESULTADOS DO EXERCÍCIO ==========
  
  // Obter resumo DRE para um período
  getSummary: protectedProcedure
    .input(z.object({
      dataInicio: z.string(),
      dataFim: z.string(),
    }))
    .query(async ({ input }) => {
      const startDate = new Date(input.dataInicio);
      const endDate = new Date(input.dataFim);

      // Receitas
      const receitas = await db
        .select({
          total: sql`SUM(${contasReceber.valorOriginal})`,
          count: sql`COUNT(*)`,
        })
        .from(contasReceber)
        .where(
          and(
            eq(contasReceber.status, "recebida"),
            between(contasReceber.dataRecebimento, startDate, endDate)
          )
        );

      // Despesas
      const despesasData = await db
        .select({
          total: sql`SUM(${contasPagar.valorTotal})`,
          count: sql`COUNT(*)`,
        })
        .from(contasPagar)
        .where(
          and(
            eq(contasPagar.status, "paga"),
            between(contasPagar.dataPagamento, startDate, endDate)
          )
        );

        const receitaTotal = parseFloat((receitas[0]?.total as any) || 0);
        const despesaTotal = parseFloat((despesasData[0]?.total as any) || 0);
      const lucroLiquido = receitaTotal - despesaTotal;

      return {
        receitas: receitaTotal,
        despesas: despesaTotal,
        lucroLiquido,
        margemLucro: receitaTotal > 0 ? ((lucroLiquido / receitaTotal) * 100).toFixed(2) : "0",
        periodo: {
          inicio: input.dataInicio,
          fim: input.dataFim,
        },
      };
    }),

  // Obter receitas por categoria
  receitas: protectedProcedure
    .input(z.object({
      dataInicio: z.string(),
      dataFim: z.string(),
    }))
    .query(async ({ input }) => {
      const startDate = new Date(input.dataInicio);
      const endDate = new Date(input.dataFim);

      return await db
        .select({
          descricao: contasReceber.descricao,
          valor: contasReceber.valorOriginal,
          data: contasReceber.dataRecebimento,
          status: contasReceber.status,
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

  // Obter despesas por categoria
  despesas: protectedProcedure
    .input(z.object({
      dataInicio: z.string(),
      dataFim: z.string(),
    }))
    .query(async ({ input }) => {
      const startDate = new Date(input.dataInicio);
      const endDate = new Date(input.dataFim);

      return await db
        .select({
          descricao: contasPagar.descricao,
          valor: contasPagar.valorTotal,
          data: contasPagar.dataPagamento,
          status: contasPagar.status,
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

  // Obter dados mensais para gráfico
  monthlyData: protectedProcedure
    .input(z.object({
      ano: z.number(),
    }))
    .query(async ({ input }) => {
      const months = [];
      for (let month = 1; month <= 12; month++) {
        const startDate = new Date(input.ano, month - 1, 1);
        const endDate = new Date(input.ano, month, 0);

        const receitas = await db
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

        const despesas = await db
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

        const receitaTotal = parseFloat((receitas[0]?.total as any) || 0);
        const despesaTotal = parseFloat((despesas[0]?.total as any) || 0);

        months.push({
          mes: month,
          receitas: receitaTotal,
          despesas: despesaTotal,
          lucro: receitaTotal - despesaTotal,
        });
      }
      return months;
    }),
});
