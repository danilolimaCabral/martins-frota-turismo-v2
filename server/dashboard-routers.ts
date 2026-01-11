import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { db } from "./db";
import { vehicles, funcionarios, expenses, trips } from "../drizzle/schema";
import { sql, eq, and, gte, lte, desc } from "drizzle-orm";

/**
 * Router tRPC para Estatísticas do Dashboard
 * 
 * Endpoints públicos para exibir dados no dashboard sem autenticação
 */

export const dashboardRouter = router({
  /**
   * Estatísticas gerais do sistema
   */
  getStats: publicProcedure.query(async () => {
    // Contar veículos
    const totalVeiculos = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(vehicles);
    
    const veiculosAtivos = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(vehicles)
      .where(sql`${vehicles.status} = 'ativo'`);

    // Contar funcionários
    const totalFuncionarios = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(funcionarios);

    const motoristas = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(funcionarios)
      .where(sql`LOWER(${funcionarios.cargo}) LIKE '%motorista%'`);

    // Distribuição da frota por tipo
    const frotaPorTipo = await db
      .select({
        tipo: vehicles.type,
        count: sql<number>`COUNT(*)`,
      })
      .from(vehicles)
      .groupBy(vehicles.type);

    return {
      totalVeiculos: Number(totalVeiculos[0]?.count || 0),
      veiculosAtivos: Number(veiculosAtivos[0]?.count || 0),
      totalFuncionarios: Number(totalFuncionarios[0]?.count || 0),
      motoristas: Number(motoristas[0]?.count || 0),
      frotaPorTipo: frotaPorTipo.map((item) => ({
        tipo: item.tipo,
        count: Number(item.count),
      })),
    };
  }),

  /**
   * Dados para gráfico de expenses mensais
   */
  getDespesasMensais: publicProcedure
    .input(
      z.object({
        ano: z.number().default(new Date().getFullYear()),
      }).optional()
    )
    .query(async ({ input }) => {
      const ano = input?.ano || new Date().getFullYear();

      // Buscar expenses agrupadas por mês
      const expensesMensais = await db
        .select({
          mes: sql<number>`MONTH(${expenses.date})`,
          total: sql<number>`SUM(${expenses.amount})`,
        })
        .from(expenses)
        .where(sql`YEAR(${expenses.date}) = ${ano}`)
        .groupBy(sql`MONTH(${expenses.date})`);

      // Preencher meses sem dados com 0
      const mesesCompletos = Array.from({ length: 12 }, (_, i) => {
        const mesData = expensesMensais.find((d) => d.mes === i + 1);
        return {
          mes: i + 1,
          total: mesData ? Number(mesData.total) : 0,
        };
      });

      return mesesCompletos;
    }),

  /**
   * Dados para gráfico de trips mensais
   */
  getViagensMensais: publicProcedure
    .input(
      z.object({
        ano: z.number().default(new Date().getFullYear()),
      }).optional()
    )
    .query(async ({ input }) => {
      const ano = input?.ano || new Date().getFullYear();

      // Buscar trips agrupadas por mês
      const tripsMensais = await db
        .select({
          mes: sql<number>`MONTH(${trips.startDate})`,
          total: sql<number>`COUNT(*)`,
        })
        .from(trips)
        .where(sql`YEAR(${trips.startDate}) = ${ano}`)
        .groupBy(sql`MONTH(${trips.startDate})`);

      // Preencher meses sem dados com 0
      const mesesCompletos = Array.from({ length: 12 }, (_, i) => {
        const mesData = tripsMensais.find((v) => v.mes === i + 1);
        return {
          mes: i + 1,
          total: mesData ? Number(mesData.total) : 0,
        };
      });

      return mesesCompletos;
    }),
});
