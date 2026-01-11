import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { db } from "./db";
import { expenses } from "../drizzle/schema";
import { eq, desc, and } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

export const expenseRouter = router({
  // Listar todas as despesas
  list: protectedProcedure.query(async () => {
    return await db.select().from(expenses).orderBy(desc(expenses.createdAt));
  }),

  // Listar despesas pendentes de aprovação
  listPending: protectedProcedure.query(async () => {
    return await db
      .select()
      .from(expenses)
      .where(eq(expenses.status, "pendente"))
      .orderBy(desc(expenses.createdAt));
  }),

  // Listar despesas por usuário
  listByUser: protectedProcedure
    .input(z.object({ userId: z.number() }))
    .query(async ({ input }) => {
      return await db
        .select()
        .from(expenses)
        .where(eq(expenses.userId, input.userId))
        .orderBy(desc(expenses.createdAt));
    }),

  // Buscar despesa por ID
  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const expense = await db
        .select()
        .from(expenses)
        .where(eq(expenses.id, input.id))
        .limit(1);

      if (!expense[0]) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Despesa não encontrada",
        });
      }

      return expense[0];
    }),

  // Criar nova despesa
  create: protectedProcedure
    .input(
      z.object({
        userId: z.number(),
        vehicleId: z.number().optional(),
        tripId: z.number().optional(),
        category: z.enum(["combustivel", "manutencao", "pedagio", "alimentacao", "hospedagem", "estacionamento", "multa", "outros"]),
        description: z.string().min(1),
        amount: z.string(), // decimal
        date: z.date(),
        receipt: z.string().optional(),
        status: z.enum(["pendente", "aprovada", "recusada"]).default("pendente"),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const [result] = await db.insert(expenses).values(input);

      return { success: true };
    }),

  // Atualizar despesa
  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        userId: z.number().optional(),
        vehicleId: z.number().optional(),
        tripId: z.number().optional(),
        category: z.enum(["combustivel", "manutencao", "pedagio", "alimentacao", "hospedagem", "estacionamento", "multa", "outros"]).optional(),
        description: z.string().optional(),
        amount: z.string().optional(),
        date: z.date().optional(),
        receipt: z.string().optional(),
        status: z.enum(["pendente", "aprovada", "recusada"]).optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { id, ...data } = input;

      await db
        .update(expenses)
        .set(data)
        .where(eq(expenses.id, id));

      return { success: true };
    }),

  // Deletar despesa
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await db.delete(expenses).where(eq(expenses.id, input.id));

      return { success: true };
    }),

  // Aprovar despesa
  approve: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        approvedBy: z.number(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Verificar se é admin
      if (ctx.user.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Apenas administradores podem aprovar despesas",
        });
      }

      await db
        .update(expenses)
        .set({
          status: "aprovada",
          approvedBy: input.approvedBy,
          approvedAt: new Date(),
          notes: input.notes,
        })
        .where(eq(expenses.id, input.id));

      return { success: true };
    }),

  // Rejeitar despesa
  reject: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        approvedBy: z.number(),
        notes: z.string().min(1), // Motivo da rejeição é obrigatório
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Verificar se é admin
      if (ctx.user.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Apenas administradores podem rejeitar despesas",
        });
      }

      await db
        .update(expenses)
        .set({
          status: "recusada",
          approvedBy: input.approvedBy,
          approvedAt: new Date(),
          notes: input.notes,
        })
        .where(eq(expenses.id, input.id));

      return { success: true };
    }),
});
