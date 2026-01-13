import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { db } from "./db";
import { drivers } from "../drizzle/schema";
import { eq, sql } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

export const driverRouter = router({
  // Listar todos os motoristas com paginação
  list: protectedProcedure
    .input(
      z.object({
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(20),
        search: z.string().optional(),
        status: z.enum(["ativo", "inativo", "ferias"]).optional(),
      }).optional()
    )
    .query(async ({ input }) => {
      const page = input?.page || 1;
      const limit = input?.limit || 20;
      const offset = (page - 1) * limit;
      const search = input?.search;
      const statusFilter = input?.status;

      let query = db.select().from(drivers);

      // Aplicar filtros
      if (search) {
        query = query.where(
          sql`${drivers.name} LIKE ${`%${search}%`} OR ${drivers.cpf} LIKE ${`%${search}%`}`
        );
      }

      if (statusFilter) {
        query = query.where(eq(drivers.status, statusFilter));
      }

      // Contar total
      const countQuery = db.select({ count: sql`COUNT(*)` }).from(drivers);
      const countResult = await countQuery.execute();
      const total = countResult[0]?.count || 0;

      // Buscar dados com paginação
      const data = await query
        .orderBy(drivers.createdAt)
        .limit(limit)
        .offset(offset)
        .execute();

      return {
        data,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      };
    }),

  // Buscar motorista por ID
  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const driver = await db
        .select()
        .from(drivers)
        .where(eq(drivers.id, input.id))
        .limit(1);

      if (!driver[0]) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Motorista não encontrado",
        });
      }

      return driver[0];
    }),

  // Criar novo motorista
  create: protectedProcedure
    .input(
      z.object({
        userId: z.number().optional(),
        name: z.string().min(1),
        cpf: z.string().optional(),
        rg: z.string().optional(),
        cnh: z.string().min(1),
        cnhCategory: z.string().optional(),
        cnhExpiry: z.date().optional(),
        phone: z.string().optional(),
        email: z.string().email().optional(),
        address: z.string().optional(),
        status: z.enum(["ativo", "inativo", "ferias"]).default("ativo"),
        hireDate: z.date().optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const [result] = await db.insert(drivers).values(input);

      return { success: true };
    }),

  // Atualizar motorista
  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        userId: z.number().optional(),
        name: z.string().min(1).optional(),
        cpf: z.string().optional(),
        rg: z.string().optional(),
        cnh: z.string().optional(),
        cnhCategory: z.string().optional(),
        cnhExpiry: z.date().optional(),
        phone: z.string().optional(),
        email: z.string().email().optional(),
        address: z.string().optional(),
        status: z.enum(["ativo", "inativo", "ferias"]).optional(),
        hireDate: z.date().optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { id, ...data } = input;

      await db
        .update(drivers)
        .set(data)
        .where(eq(drivers.id, id));

      return { success: true };
    }),

  // Deletar motorista
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await db.delete(drivers).where(eq(drivers.id, input.id));

      return { success: true };
    }),

  // Atualizar status do motorista
  updateStatus: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        status: z.enum(["ativo", "inativo", "ferias"]),
      })
    )
    .mutation(async ({ input }) => {
      await db
        .update(drivers)
        .set({
          status: input.status,
        })
        .where(eq(drivers.id, input.id));

      return { success: true };
    }),
});
