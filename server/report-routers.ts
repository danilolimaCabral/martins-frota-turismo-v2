import { z } from "zod";
import { protectedProcedure, router } from "./_core/trpc";
import { db } from "./db";
import { expenses, trips, vehicles, drivers, maintenances, fuelings } from "../drizzle/schema";
import { eq, gte, lte, and, sql } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

export const reportRouter = router({
  // Resumo financeiro geral
  financialSummary: protectedProcedure
    .input(z.object({
      startDate: z.string(), // YYYY-MM-DD
      endDate: z.string(),
    }))
    .query(async ({ input, ctx }) => {
      if (ctx.user.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Apenas administradores podem acessar" });
      }

      const start = new Date(input.startDate);
      const end = new Date(input.endDate);

      // Buscar todas as despesas no período
      const allExpenses = await db
        .select()
        .from(expenses)
        .where(
          and(
            gte(expenses.createdAt, start),
            lte(expenses.createdAt, end),
            eq(expenses.status, "aprovada")
          )
        );

      // Calcular totais por categoria
      const byCategory = allExpenses.reduce((acc, exp) => {
        const category = exp.category;
        const amount = parseFloat(exp.amount);
        acc[category] = (acc[category] || 0) + amount;
        return acc;
      }, {} as Record<string, number>);

      // Total geral
      const totalExpenses = Object.values(byCategory).reduce((sum, val) => sum + val, 0);

      return {
        totalExpenses: totalExpenses.toFixed(2),
        byCategory,
        expenseCount: allExpenses.length,
      };
    }),

  // Despesas por mês (últimos 12 meses)
  expensesByMonth: protectedProcedure
    .query(async ({ ctx }) => {
      if (ctx.user.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Apenas administradores podem acessar" });
      }

      const allExpenses = await db
        .select()
        .from(expenses)
        .where(eq(expenses.status, "aprovada"));

      // Agrupar por mês
      const byMonth = allExpenses.reduce((acc, exp) => {
        const month = new Date(exp.createdAt).toLocaleDateString("pt-BR", { 
          year: "numeric", 
          month: "short" 
        });
        const amount = parseFloat(exp.amount);
        acc[month] = (acc[month] || 0) + amount;
        return acc;
      }, {} as Record<string, number>);

      // Converter para array ordenado
      const months = Object.keys(byMonth).slice(-12); // Últimos 12 meses
      const values = months.map(m => byMonth[m]);

      return {
        labels: months,
        data: values,
      };
    }),

  // Top 5 categorias de despesas
  topExpenseCategories: protectedProcedure
    .query(async ({ ctx }) => {
      if (ctx.user.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Apenas administradores podem acessar" });
      }

      const allExpenses = await db
        .select()
        .from(expenses)
        .where(eq(expenses.status, "aprovada"));

      // Agrupar por categoria
      const byCategory = allExpenses.reduce((acc, exp) => {
        const category = exp.category;
        const amount = parseFloat(exp.amount);
        acc[category] = (acc[category] || 0) + amount;
        return acc;
      }, {} as Record<string, number>);

      // Ordenar e pegar top 5
      const sorted = Object.entries(byCategory)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5);

      return {
        labels: sorted.map(([cat]) => cat),
        data: sorted.map(([, val]) => val),
      };
    }),

  // Estatísticas de viagens
  tripStats: protectedProcedure
    .query(async ({ ctx }) => {
      if (ctx.user.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Apenas administradores podem acessar" });
      }

      const allTrips = await db.select().from(trips);

      const stats = {
        total: allTrips.length,
        planejadas: allTrips.filter(t => t.status === "planejada").length,
        emAndamento: allTrips.filter(t => t.status === "em-andamento").length,
        concluidas: allTrips.filter(t => t.status === "concluida").length,
        canceladas: allTrips.filter(t => t.status === "cancelada").length,
      };

      return stats;
    }),

  // Estatísticas de frota
  fleetStats: protectedProcedure
    .query(async ({ ctx }) => {
      if (ctx.user.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Apenas administradores podem acessar" });
      }

      const allVehicles = await db.select().from(vehicles);

      const stats = {
        total: allVehicles.length,
        ativos: allVehicles.filter(v => v.status === "ativo").length,
        manutencao: allVehicles.filter(v => v.status === "manutencao").length,
        inativo: allVehicles.filter(v => v.status === "inativo").length,
        porTipo: {
          van: allVehicles.filter(v => v.type === "van").length,
          microOnibus: allVehicles.filter(v => v.type === "micro-onibus").length,
          onibus: allVehicles.filter(v => v.type === "onibus").length,
        },
      };

      return stats;
    }),

  // Estatísticas de motoristas
  driverStats: protectedProcedure
    .query(async ({ ctx }) => {
      if (ctx.user.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Apenas administradores podem acessar" });
      }

      const allDrivers = await db.select().from(drivers);

      const stats = {
        total: allDrivers.length,
        ativos: allDrivers.filter(d => d.status === "ativo").length,
        ferias: allDrivers.filter(d => d.status === "ferias").length,
        inativos: allDrivers.filter(d => d.status === "inativo").length,
      };

      return stats;
    }),
});
