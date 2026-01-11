import { router, publicProcedure, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import { blogPosts } from "../drizzle/schema";
import { eq, desc, and, sql } from "drizzle-orm";
import { getDb } from "./db";

/**
 * Blog Routers - Procedures tRPC para gerenciamento de posts do blog
 */

export const blogRouter = router({
  /**
   * Listar todos os posts publicados (público)
   */
  list: publicProcedure
    .input(
      z.object({
        category: z.enum(["praias", "montanhas", "cidades-historicas", "ecoturismo", "cultura", "gastronomia", "aventura", "eventos"]).optional(),
        limit: z.number().min(1).max(100).default(12),
        offset: z.number().min(0).default(0),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const { category, limit, offset } = input;

      const conditions = [eq(blogPosts.status, "publicado")];
      if (category) {
        conditions.push(eq(blogPosts.category, category));
      }

      const posts = await db
        .select()
        .from(blogPosts)
        .where(and(...conditions))
        .orderBy(desc(blogPosts.publishedAt))
        .limit(limit)
        .offset(offset);

      const [countResult] = await db
        .select({ count: sql<number>`count(*)` })
        .from(blogPosts)
        .where(and(...conditions));

      return {
        posts,
        total: countResult?.count || 0,
        hasMore: (offset + limit) < (countResult?.count || 0),
      };
    }),

  /**
   * Listar posts em destaque (público)
   */
  listFeatured: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    return await db
      .select()
      .from(blogPosts)
      .where(and(eq(blogPosts.status, "publicado"), eq(blogPosts.featured, true)))
      .orderBy(desc(blogPosts.publishedAt))
      .limit(3);
  }),

  /**
   * Buscar post por slug (público)
   */
  getBySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const [post] = await db
        .select()
        .from(blogPosts)
        .where(and(eq(blogPosts.slug, input.slug), eq(blogPosts.status, "publicado")));

      if (!post) {
        throw new Error("Post não encontrado");
      }

      // Incrementar visualizações
      await db
        .update(blogPosts)
        .set({ views: sql`${blogPosts.views} + 1` })
        .where(eq(blogPosts.id, post.id));

      return post;
    }),

  /**
   * Listar todos os posts (admin)
   */
  listAll: protectedProcedure
    .input(
      z.object({
        status: z.enum(["rascunho", "publicado", "arquivado"]).optional(),
        limit: z.number().min(1).max(100).default(20),
        offset: z.number().min(0).default(0),
      })
    )
    .query(async ({ input, ctx }) => {
      if (ctx.user.role !== "admin") {
        throw new Error("Acesso negado");
      }

      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const { status, limit, offset } = input;

      const conditions = status ? [eq(blogPosts.status, status)] : [];

      const posts = await db
        .select()
        .from(blogPosts)
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .orderBy(desc(blogPosts.createdAt))
        .limit(limit)
        .offset(offset);

      const [countResult] = await db
        .select({ count: sql<number>`count(*)` })
        .from(blogPosts)
        .where(conditions.length > 0 ? and(...conditions) : undefined);

      return {
        posts,
        total: countResult?.count || 0,
      };
    }),

  /**
   * Buscar post por ID (admin)
   */
  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input, ctx }) => {
      if (ctx.user.role !== "admin") {
        throw new Error("Acesso negado");
      }

      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const [post] = await db
        .select()
        .from(blogPosts)
        .where(eq(blogPosts.id, input.id));

      if (!post) {
        throw new Error("Post não encontrado");
      }

      return post;
    }),

  /**
   * Criar novo post (admin)
   */
  create: protectedProcedure
    .input(
      z.object({
        title: z.string().min(1).max(300),
        slug: z.string().min(1).max(300),
        excerpt: z.string().min(1),
        content: z.string().min(1),
        coverImage: z.string().optional(),
        category: z.enum(["praias", "montanhas", "cidades-historicas", "ecoturismo", "cultura", "gastronomia", "aventura", "eventos"]),
        tags: z.string().optional(),
        metaDescription: z.string().optional(),
        metaKeywords: z.string().optional(),
        status: z.enum(["rascunho", "publicado", "arquivado"]).default("rascunho"),
        featured: z.boolean().default(false),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (ctx.user.role !== "admin") {
        throw new Error("Acesso negado");
      }

      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Verificar se slug já existe
      const [existing] = await db
        .select()
        .from(blogPosts)
        .where(eq(blogPosts.slug, input.slug));

      if (existing) {
        throw new Error("Slug já existe. Escolha outro.");
      }

      const [post] = await db.insert(blogPosts).values({
        ...input,
        authorId: ctx.user.id,
        authorName: ctx.user.name,
        publishedAt: input.status === "publicado" ? new Date() : null,
      });

      return post;
    }),

  /**
   * Atualizar post (admin)
   */
  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        title: z.string().min(1).max(300).optional(),
        slug: z.string().min(1).max(300).optional(),
        excerpt: z.string().min(1).optional(),
        content: z.string().min(1).optional(),
        coverImage: z.string().optional(),
        category: z.enum(["praias", "montanhas", "cidades-historicas", "ecoturismo", "cultura", "gastronomia", "aventura", "eventos"]).optional(),
        tags: z.string().optional(),
        metaDescription: z.string().optional(),
        metaKeywords: z.string().optional(),
        status: z.enum(["rascunho", "publicado", "arquivado"]).optional(),
        featured: z.boolean().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (ctx.user.role !== "admin") {
        throw new Error("Acesso negado");
      }

      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const { id, ...data } = input;

      // Verificar se slug já existe em outro post
      if (data.slug) {
        const [existing] = await db
          .select()
          .from(blogPosts)
          .where(and(eq(blogPosts.slug, data.slug), sql`${blogPosts.id} != ${id}`));

        if (existing) {
          throw new Error("Slug já existe em outro post");
        }
      }

      // Se mudou para publicado, definir data de publicação
      if (data.status === "publicado") {
        const [current] = await db.select().from(blogPosts).where(eq(blogPosts.id, id));
        if (current && current.status !== "publicado") {
          (data as any).publishedAt = new Date();
        }
      }

      await db.update(blogPosts).set(data).where(eq(blogPosts.id, id));

      return { success: true };
    }),

  /**
   * Deletar post (admin)
   */
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      if (ctx.user.role !== "admin") {
        throw new Error("Acesso negado");
      }

      const db = await getDb();
      if (!db) throw new Error("Database not available");
      await db.delete(blogPosts).where(eq(blogPosts.id, input.id));

      return { success: true };
    }),

  /**
   * Alternar destaque (admin)
   */
  toggleFeatured: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      if (ctx.user.role !== "admin") {
        throw new Error("Acesso negado");
      }

      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const [post] = await db.select().from(blogPosts).where(eq(blogPosts.id, input.id));

      if (!post) {
        throw new Error("Post não encontrado");
      }

      await db
        .update(blogPosts)
        .set({ featured: !post.featured })
        .where(eq(blogPosts.id, input.id));

      return { success: true, featured: !post.featured };
    }),

  /**
   * Obter estatísticas do blog (admin)
   */
  getStats: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.user.role !== "admin") {
      throw new Error("Acesso negado");
    }

    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const [totalPosts] = await db
      .select({ count: sql<number>`count(*)` })
      .from(blogPosts);

    const [publishedPosts] = await db
      .select({ count: sql<number>`count(*)` })
      .from(blogPosts)
      .where(eq(blogPosts.status, "publicado"));

    const [draftPosts] = await db
      .select({ count: sql<number>`count(*)` })
      .from(blogPosts)
      .where(eq(blogPosts.status, "rascunho"));

    const [totalViews] = await db
      .select({ total: sql<number>`sum(${blogPosts.views})` })
      .from(blogPosts);

    return {
      total: totalPosts?.count || 0,
      published: publishedPosts?.count || 0,
      drafts: draftPosts?.count || 0,
      totalViews: totalViews?.total || 0,
    };
  }),
});
