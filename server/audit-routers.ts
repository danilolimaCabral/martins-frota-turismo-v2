import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { db } from "./db";
import { auditLogs } from "../drizzle/schema";
import { desc, eq, and, gte, lte, like, sql } from "drizzle-orm";

/**
 * Router de Logs de Auditoria
 * 
 * Endpoints para consultar e gerenciar logs de auditoria do sistema.
 * Apenas administradores podem acessar os logs.
 */

export const auditRouter = router({
  /**
   * Listar logs de auditoria com filtros
   */
  list: protectedProcedure
    .input(
      z.object({
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(50),
        userId: z.number().optional(),
        username: z.string().optional(),
        action: z.enum(["create", "update", "delete", "login", "logout", "approve", "reject"]).optional(),
        module: z.string().optional(),
        entity: z.string().optional(),
        startDate: z.string().optional(), // ISO date
        endDate: z.string().optional(), // ISO date
      }).optional()
    )
    .query(async ({ input, ctx }) => {
      // Apenas admin pode ver logs
      if (ctx.user.role !== "admin") {
        throw new Error("Acesso negado. Apenas administradores podem visualizar logs de auditoria.");
      }

      const filters = input || {} as any;
      const page = filters?.page || 1;
      const limit = filters?.limit || 50;
      const offset = (page - 1) * limit;

      // Construir condições de filtro
      const conditions = [];

      if (filters?.userId) {
        conditions.push(eq(auditLogs.userId, filters.userId));
      }

      if (filters?.username) {
        conditions.push(like(auditLogs.username, `%${filters.username}%`));
      }

      if (filters?.action) {
        conditions.push(eq(auditLogs.action, filters.action));
      }

      if (filters?.module) {
        conditions.push(eq(auditLogs.module, filters.module));
      }

      if (filters?.entity) {
        conditions.push(eq(auditLogs.entity, filters.entity));
      }

      if (filters?.startDate) {
        conditions.push(gte(auditLogs.createdAt, new Date(filters.startDate)));
      }

      if (filters?.endDate) {
        conditions.push(lte(auditLogs.createdAt, new Date(filters.endDate)));
      }

      // Buscar logs com filtros
      const logs = await db
        .select()
        .from(auditLogs)
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .orderBy(desc(auditLogs.createdAt))
        .limit(limit)
        .offset(offset);

      // Contar total de registros
      const [{ count }] = await db
        .select({ count: sql<number>`count(*)` })
        .from(auditLogs)
        .where(conditions.length > 0 ? and(...conditions) : undefined);

      return {
        logs,
        pagination: {
          page,
          limit,
          total: Number(count),
          totalPages: Math.ceil(Number(count) / limit),
        },
      };
    }),

  /**
   * Buscar log por ID
   */
  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input, ctx }) => {
      // Apenas admin pode ver logs
      if (ctx.user.role !== "admin") {
        throw new Error("Acesso negado. Apenas administradores podem visualizar logs de auditoria.");
      }

      const [log] = await db
        .select()
        .from(auditLogs)
        .where(eq(auditLogs.id, input.id))
        .limit(1);

      if (!log) {
        throw new Error("Log não encontrado");
      }

      return log;
    }),

  /**
   * Estatísticas de auditoria
   */
  getStats: protectedProcedure
    .input(
      z.object({
        startDate: z.string().optional(),
        endDate: z.string().optional(),
      }).optional()
    )
    .query(async ({ input, ctx }) => {
      // Apenas admin pode ver stats
      if (ctx.user.role !== "admin") {
        throw new Error("Acesso negado. Apenas administradores podem visualizar estatísticas.");
      }

      const filters = input || {} as any;
      const conditions = [];

      if (filters?.startDate) {
        conditions.push(gte(auditLogs.createdAt, new Date(filters.startDate)));
      }

      if (filters?.endDate) {
        conditions.push(lte(auditLogs.createdAt, new Date(filters.endDate)));
      }

      // Total de logs
      const [{ totalLogs }] = await db
        .select({ totalLogs: sql<number>`count(*)` })
        .from(auditLogs)
        .where(conditions.length > 0 ? and(...conditions) : undefined);

      // Logs por ação
      const logsByAction = await db
        .select({
          action: auditLogs.action,
          count: sql<number>`count(*)`,
        })
        .from(auditLogs)
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .groupBy(auditLogs.action);

      // Logs por módulo
      const logsByModule = await db
        .select({
          module: auditLogs.module,
          count: sql<number>`count(*)`,
        })
        .from(auditLogs)
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .groupBy(auditLogs.module);

      // Usuários mais ativos
      const topUsers = await db
        .select({
          username: auditLogs.username,
          count: sql<number>`count(*)`,
        })
        .from(auditLogs)
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .groupBy(auditLogs.username)
        .orderBy(desc(sql`count(*)`))
        .limit(10);

      return {
        totalLogs: Number(totalLogs),
        logsByAction: logsByAction.map(item => ({
          action: item.action,
          count: Number(item.count),
        })),
        logsByModule: logsByModule.map(item => ({
          module: item.module,
          count: Number(item.count),
        })),
        topUsers: topUsers.map(item => ({
          username: item.username,
          count: Number(item.count),
        })),
      };
    }),

  /**
   * Buscar logs de uma entidade específica
   */
  getByEntity: protectedProcedure
    .input(
      z.object({
        entity: z.string(),
        entityId: z.number(),
      })
    )
    .query(async ({ input, ctx }) => {
      // Apenas admin pode ver logs
      if (ctx.user.role !== "admin") {
        throw new Error("Acesso negado. Apenas administradores podem visualizar logs de auditoria.");
      }

      const logs = await db
        .select()
        .from(auditLogs)
        .where(
          and(
            eq(auditLogs.entity, input.entity),
            eq(auditLogs.entityId, input.entityId)
          )
        )
        .orderBy(desc(auditLogs.createdAt));

      return logs;
    }),

  /**
   * Buscar logs de um usuário específico
   */
  getByUser: protectedProcedure
    .input(
      z.object({
        userId: z.number(),
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(50),
      })
    )
    .query(async ({ input, ctx }) => {
      // Apenas admin pode ver logs de outros usuários
      if (ctx.user.role !== "admin" && ctx.user.id !== input.userId) {
        throw new Error("Acesso negado. Você só pode visualizar seus próprios logs.");
      }

      const page = input.page;
      const limit = input.limit;
      const offset = (page - 1) * limit;

      const logs = await db
        .select()
        .from(auditLogs)
        .where(eq(auditLogs.userId, input.userId))
        .orderBy(desc(auditLogs.createdAt))
        .limit(limit)
        .offset(offset);

      const [{ count }] = await db
        .select({ count: sql<number>`count(*)` })
        .from(auditLogs)
        .where(eq(auditLogs.userId, input.userId));

      return {
        logs,
        pagination: {
          page,
          limit,
          total: Number(count),
          totalPages: Math.ceil(Number(count) / limit),
        },
      };
    }),
});
