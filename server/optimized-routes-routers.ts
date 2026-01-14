/**
 * Procedures tRPC para Roteirização Otimizada
 * Gerencia rotas otimizadas, histórico de versões e restrições
 */

import { protectedProcedure } from "./routers";
import { z } from "zod";
import { db } from "./db";
import { optimizedRoutes, routeVersionHistory, embarquePoints, routeConstraints, routeAnalytics } from "../drizzle/schema";
import { eq, desc } from "drizzle-orm";

export const optimizedRoutesRouter = {
  // Criar nova rota otimizada
  create: protectedProcedure
    .input<any>(
      z.object({
        name: z.string(),
        description: z.string().optional(),
        vehicleId: z.number().optional(),
        totalDistance: z.number(),
        estimatedTime: z.number(),
        originalDistance: z.number().optional(),
        savings: z.number().optional(),
        savingsPercentage: z.number().optional(),
        algorithmUsed: z.string().optional(),
        routePoints: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const result = await db.insert(optimizedRoutes).values({
        name: input.name,
        description: input.description,
        vehicleId: input.vehicleId,
        totalDistance: input.totalDistance,
        estimatedTime: input.estimatedTime,
        originalDistance: input.originalDistance,
        savings: input.savings,
        savingsPercentage: input.savingsPercentage,
        algorithmUsed: input.algorithmUsed,
        routePoints: input.routePoints,
        status: "optimized",
        createdBy: ctx.user.id,
        updatedBy: ctx.user.id,
      } as any);

      return {
        success: true,
        message: "Rota otimizada criada com sucesso",
      };
    }),

  // Listar rotas otimizadas
  list: protectedProcedure
    .input<any>(
      z.object({
        limit: z.number().default(10),
        offset: z.number().default(0),
      })
    )
    .query(async () => {
      const routes = await db
        .select()
        .from(optimizedRoutes)
        .orderBy(desc(optimizedRoutes.createdAt))
        .limit(10)
        .offset(0);

      return routes || [];
    }),

  // Obter detalhes de uma rota
  getById: protectedProcedure
    .input(z.number())
    .query(async ({ input }) => {
      const route = await db
        .select()
        .from(optimizedRoutes)
        .where(eq(optimizedRoutes.id, input))
        .limit(1);

      if (!route || route.length === 0) {
        return null;
      }

      return route[0];
    }),

  // Salvar versão da rota
  saveVersion: protectedProcedure
    .input<any>(
      z.object({
        routeId: z.number(),
        changeDescription: z.string(),
        totalDistance: z.number(),
        estimatedTime: z.number(),
        savings: z.number().optional(),
        savingsPercentage: z.number().optional(),
        routePoints: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const result = await db.insert(routeVersionHistory).values({
        routeId: input.routeId,
        versionNumber: 1,
        totalDistance: input.totalDistance,
        estimatedTime: input.estimatedTime,
        savings: input.savings,
        savingsPercentage: input.savingsPercentage,
        routePoints: input.routePoints,
        changeDescription: input.changeDescription,
        createdBy: ctx.user.id,
      } as any);

      return {
        success: true,
        message: "Versão salva com sucesso",
      };
    }),

  // Obter histórico de versões
  getVersionHistory: protectedProcedure
    .input(z.number())
    .query(async ({ input }: { input: number }) => {
      const versions = await db
        .select()
        .from(routeVersionHistory)
        .where(eq(routeVersionHistory.routeId, input))
        .orderBy(desc(routeVersionHistory.versionNumber));

      return versions || [];
    }),

  // Registrar análise de execução
  recordAnalytics: protectedProcedure
    .input<any>(
      z.object({
        routeId: z.number(),
        actualDistance: z.number(),
        actualTime: z.number(),
        onTimeDelivery: z.number(),
        passengersDelivered: z.number(),
        executionDate: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const route = await db
        .select()
        .from(optimizedRoutes)
        .where(eq(optimizedRoutes.id, input.routeId))
        .limit(1);

      if (!route || route.length === 0) {
        throw new Error("Rota não encontrada");
      }

      const originalDistance = (route[0].totalDistance as any) || 0;
      const distanceVariance =
        ((input.actualDistance - originalDistance) / originalDistance) * 100;

      const result = await db.insert(routeAnalytics).values({
        routeId: input.routeId,
        actualDistance: input.actualDistance,
        actualTime: input.actualTime,
        distanceVariance: distanceVariance,
        onTimeDelivery: input.onTimeDelivery,
        passengersDelivered: input.passengersDelivered,
        executionDate: new Date(input.executionDate),
      } as any);

      return {
        success: true,
        message: "Análise registrada com sucesso",
      };
    }),

  // Obter estatísticas de uma rota
  getAnalytics: protectedProcedure
    .input(z.number())
    .query(async ({ input }) => {
      const analytics = await db
        .select()
        .from(routeAnalytics)
        .where(eq(routeAnalytics.routeId, input))
        .orderBy(desc(routeAnalytics.executionDate));

      return analytics || [];
    }),

  // Deletar rota
  delete: protectedProcedure
    .input(z.number())
    .mutation(async ({ input }) => {
      await db.delete(optimizedRoutes).where(eq(optimizedRoutes.id, input));

      return {
        success: true,
        message: "Rota deletada com sucesso",
      };
    }),
};
