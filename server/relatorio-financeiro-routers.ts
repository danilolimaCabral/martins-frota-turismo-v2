import { protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { db } from "./db";
import { contasReceber, contasPagar, categoriasFinanceiras } from "../drizzle/schema";
import { eq, and, desc, sql, between } from "drizzle-orm";

export const relatorioFinanceiroRouter = router({
  // Receitas por categoria
  receitasPorCategoria: protectedProcedure
    .input(z.object({
      dataInicio: z.string(),
      dataFim: z.string(),
    }))
    .query(async ({ input }) => {
      const startDate = new Date(input.dataInicio);
      const endDate = new Date(input.dataFim);

      const resultado = await db
        .select({
          categoria: categoriasFinanceiras.nome,
          total: sql`SUM(${contasReceber.valorOriginal})`,
          quantidade: sql`COUNT(*)`,
        })
        .from(contasReceber)
        .leftJoin(categoriasFinanceiras, eq(contasReceber.categoriaId, categoriasFinanceiras.id))
        .where(
          and(
            eq(contasReceber.status, "recebida"),
            between(contasReceber.dataRecebimento, startDate, endDate)
          )
        )
        .groupBy(categoriasFinanceiras.id);

      return resultado.map((r: any) => ({
        categoria: r.categoria || "Sem categoria",
        total: parseFloat(r.total || 0),
        quantidade: parseInt(r.quantidade || 0),
      }));
    }),

  // Despesas por categoria
  despesasPorCategoria: protectedProcedure
    .input(z.object({
      dataInicio: z.string(),
      dataFim: z.string(),
    }))
    .query(async ({ input }) => {
      const startDate = new Date(input.dataInicio);
      const endDate = new Date(input.dataFim);

      const resultado = await db
        .select({
          categoria: categoriasFinanceiras.nome,
          total: sql`SUM(${contasPagar.valorTotal})`,
          quantidade: sql`COUNT(*)`,
        })
        .from(contasPagar)
        .leftJoin(categoriasFinanceiras, eq(contasPagar.categoriaId, categoriasFinanceiras.id))
        .where(
          and(
            eq(contasPagar.status, "paga"),
            between(contasPagar.dataPagamento, startDate, endDate)
          )
        )
        .groupBy(categoriasFinanceiras.id);

      return resultado.map((r: any) => ({
        categoria: r.categoria || "Sem categoria",
        total: parseFloat(r.total || 0),
        quantidade: parseInt(r.quantidade || 0),
      }));
    }),

  // Tendência de lucro (últimos 12 meses)
  tendenciaLucro: protectedProcedure.query(async () => {
    const meses = [];
    const hoje = new Date();

    for (let i = 11; i >= 0; i--) {
      const data = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1);
      const startDate = new Date(data.getFullYear(), data.getMonth(), 1);
      const endDate = new Date(data.getFullYear(), data.getMonth() + 1, 0);

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

      const totalReceitas = parseFloat((receitas[0]?.total as any) || 0);
      const totalDespesas = parseFloat((despesas[0]?.total as any) || 0);

      meses.push({
        mes: data.toLocaleString("pt-BR", { month: "short", year: "2-digit" }),
        receitas: totalReceitas,
        despesas: totalDespesas,
        lucro: totalReceitas - totalDespesas,
      });
    }

    return meses;
  }),

  // Comparativo anual
  comparativoAnual: protectedProcedure
    .input(z.object({
      ano: z.number(),
    }))
    .query(async ({ input }) => {
      const meses = [];

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

        const totalReceitas = parseFloat((receitas[0]?.total as any) || 0);
        const totalDespesas = parseFloat((despesas[0]?.total as any) || 0);

        meses.push({
          mes: month,
          receitas: totalReceitas,
          despesas: totalDespesas,
          lucro: totalReceitas - totalDespesas,
          margemLucro: totalReceitas > 0 ? ((totalReceitas - totalDespesas) / totalReceitas * 100).toFixed(2) : "0",
        });
      }

      return meses;
    }),

  // Top 10 maiores receitas
  top10Receitas: protectedProcedure
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
        .orderBy(desc(contasReceber.valorOriginal))
        .limit(10);
    }),

  // Top 10 maiores despesas
  top10Despesas: protectedProcedure
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
        .orderBy(desc(contasPagar.valorTotal))
        .limit(10);
    }),
});
