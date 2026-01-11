import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { db } from "./db";
import { reviews } from "../drizzle/schema";
import { eq, desc, and } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

export const reviewRouter = router({
  // Criar avaliação (público - clientes podem avaliar)
  create: publicProcedure
    .input(z.object({
      customerName: z.string().min(2).max(200),
      customerEmail: z.string().email().optional(),
      customerCompany: z.string().max(200).optional(),
      rating: z.number().int().min(1).max(5),
      comment: z.string().min(10).max(1000),
      tripId: z.number().optional(),
    }))
    .mutation(async ({ input }) => {
      const [review] = await db.insert(reviews).values({
        ...input,
        status: "pendente",
      }).$returningId();
      
      return { success: true, reviewId: review.id };
    }),

  // Listar avaliações aprovadas (público - exibir na home)
  listApproved: publicProcedure
    .input(z.object({
      limit: z.number().default(10),
      featuredOnly: z.boolean().default(false),
    }))
    .query(async ({ input }) => {
      const conditions = input.featuredOnly
        ? and(eq(reviews.status, "aprovada"), eq(reviews.featured, true))
        : eq(reviews.status, "aprovada");

      const reviewsList = await db
        .select()
        .from(reviews)
        .where(conditions)
        .orderBy(desc(reviews.createdAt))
        .limit(input.limit);

      return reviewsList;
    }),

  // Listar todas as avaliações (admin)
  listAll: protectedProcedure
    .input(z.object({
      status: z.enum(["pendente", "aprovada", "recusada", "todas"]).default("todas"),
    }))
    .query(async ({ input, ctx }) => {
      if (ctx.user.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Apenas administradores podem acessar" });
      }

      const conditions = input.status === "todas" 
        ? undefined 
        : eq(reviews.status, input.status);

      const reviewsList = await db
        .select()
        .from(reviews)
        .where(conditions)
        .orderBy(desc(reviews.createdAt));

      return reviewsList;
    }),

  // Aprovar avaliação
  approve: protectedProcedure
    .input(z.object({
      reviewId: z.number(),
      featured: z.boolean().default(false),
    }))
    .mutation(async ({ input, ctx }) => {
      if (ctx.user.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Apenas administradores podem aprovar" });
      }

      await db
        .update(reviews)
        .set({
          status: "aprovada",
          featured: input.featured,
          moderatedBy: ctx.user.id,
          moderatedAt: new Date(),
        })
        .where(eq(reviews.id, input.reviewId));

      return { success: true };
    }),

  // Rejeitar avaliação
  reject: protectedProcedure
    .input(z.object({
      reviewId: z.number(),
      moderationNotes: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      if (ctx.user.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Apenas administradores podem rejeitar" });
      }

      await db
        .update(reviews)
        .set({
          status: "recusada",
          moderatedBy: ctx.user.id,
          moderatedAt: new Date(),
          moderationNotes: input.moderationNotes,
        })
        .where(eq(reviews.id, input.reviewId));

      return { success: true };
    }),

  // Alternar destaque
  toggleFeatured: protectedProcedure
    .input(z.object({
      reviewId: z.number(),
    }))
    .mutation(async ({ input, ctx }) => {
      if (ctx.user.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Apenas administradores podem destacar" });
      }

      const [review] = await db
        .select()
        .from(reviews)
        .where(eq(reviews.id, input.reviewId))
        .limit(1);

      if (!review) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Avaliação não encontrada" });
      }

      await db
        .update(reviews)
        .set({ featured: !review.featured })
        .where(eq(reviews.id, input.reviewId));

      return { success: true, featured: !review.featured };
    }),

  // Deletar avaliação
  delete: protectedProcedure
    .input(z.object({
      reviewId: z.number(),
    }))
    .mutation(async ({ input, ctx }) => {
      if (ctx.user.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Apenas administradores podem deletar" });
      }

      await db
        .delete(reviews)
        .where(eq(reviews.id, input.reviewId));

      return { success: true };
    }),

  // Estatísticas
  stats: protectedProcedure
    .query(async ({ ctx }) => {
      if (ctx.user.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Apenas administradores podem acessar" });
      }

      const allReviews = await db.select().from(reviews);
      
      const stats = {
        total: allReviews.length,
        pendentes: allReviews.filter(r => r.status === "pendente").length,
        aprovadas: allReviews.filter(r => r.status === "aprovada").length,
        recusadas: allReviews.filter(r => r.status === "recusada").length,
        mediaAvaliacoes: allReviews.length > 0 
          ? (allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length).toFixed(1)
          : "0.0",
      };

      return stats;
    }),
});
