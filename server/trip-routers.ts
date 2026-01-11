import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { db } from "./db";
import { trips } from "../drizzle/schema";
import { eq, desc } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

export const tripRouter = router({
  // Listar todas as viagens
  list: protectedProcedure.query(async () => {
    return await db.select().from(trips).orderBy(desc(trips.createdAt));
  }),

  // Buscar viagem por ID
  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const trip = await db
        .select()
        .from(trips)
        .where(eq(trips.id, input.id))
        .limit(1);

      if (!trip[0]) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Viagem não encontrada",
        });
      }

      return trip[0];
    }),

  // Criar nova viagem
  create: protectedProcedure
    .input(
      z.object({
        bookingId: z.number(),
        vehicleId: z.number(),
        driverId: z.number(),
        origin: z.string().min(1),
        destination: z.string().min(1),
        startDate: z.date(),
        endDate: z.date().optional(),
        startKm: z.string(),
        endKm: z.string().optional(),
        totalKm: z.string().optional(),
        status: z.enum(["planejada", "em-andamento", "concluida", "cancelada"]).default("planejada"),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const [result] = await db.insert(trips).values(input);

      return { success: true };
    }),

  // Atualizar viagem
  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        bookingId: z.number().optional(),
        vehicleId: z.number().optional(),
        driverId: z.number().optional(),
        origin: z.string().optional(),
        destination: z.string().optional(),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
        startKm: z.string().optional(),
        endKm: z.string().optional(),
        totalKm: z.string().optional(),
        status: z.enum(["planejada", "em-andamento", "concluida", "cancelada"]).optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { id, ...data } = input;

      await db
        .update(trips)
        .set(data)
        .where(eq(trips.id, id));

      return { success: true };
    }),

  // Deletar viagem
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await db.delete(trips).where(eq(trips.id, input.id));

      return { success: true };
    }),

  // Atualizar status da viagem
  updateStatus: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        status: z.enum(["planejada", "em-andamento", "concluida", "cancelada"]),
      })
    )
    .mutation(async ({ input }) => {
      await db
        .update(trips)
        .set({
          status: input.status,
        })
        .where(eq(trips.id, input.id));

      return { success: true };
    }),

  // Iniciar viagem
  startTrip: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await db
        .update(trips)
        .set({
          status: "em-andamento",
        })
        .where(eq(trips.id, input.id));

      return { success: true };
    }),

  // Finalizar viagem
  completeTrip: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        endKm: z.string().optional(),
        totalKm: z.string().optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { id, ...data } = input;

      await db
        .update(trips)
        .set({
          ...data,
          status: "concluida",
          endDate: new Date(),
        })
        .where(eq(trips.id, id));

      return { success: true };
    }),
});
