import { z } from "zod";
import { protectedProcedure, router } from "./_core/trpc";
import { db } from "./db";
import { cnabArquivos } from "../drizzle/schema";
import { eq, desc, and, gte, lte, count } from "drizzle-orm";

/**
 * Router tRPC para Histórico de Arquivos CNAB
 * 
 * Endpoints:
 * - list: Listar arquivos CNAB com filtros
 * - getById: Buscar arquivo CNAB por ID
 * - updateStatus: Atualizar status do arquivo
 * - delete: Deletar arquivo do histórico
 * - getStats: Obter estatísticas de CNAB
 */

export const cnabHistoricoRouter = router({
  /**
   * Listar arquivos CNAB com paginação e filtros
   */
  list: protectedProcedure
    .input(
      z.object({
        status: z.enum(["gerado", "enviado", "processado", "erro"]).optional(),
        dataInicio: z.date().optional(),
        dataFim: z.date().optional(),
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(10),
      }).optional()
    )
    .query(async ({ input = {} }) => {
      const conditions = [];

      if (input.status) {
        conditions.push(eq(cnabArquivos.status, input.status));
      }

      if (input.dataInicio) {
        conditions.push(gte(cnabArquivos.dataGeracao, input.dataInicio));
      }

      if (input.dataFim) {
        conditions.push(lte(cnabArquivos.dataGeracao, input.dataFim));
      }

      const page = input.page || 1;
      const limit = input.limit || 10;
      const offset = (page - 1) * limit;

      const arquivos = await db
        .select()
        .from(cnabArquivos)
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .orderBy(desc(cnabArquivos.dataGeracao))
        .limit(limit)
        .offset(offset);

      // Contar total de registros
      const totalResult = await db
        .select({ count: count() })
        .from(cnabArquivos)
        .where(conditions.length > 0 ? and(...conditions) : undefined);

      const total = totalResult[0]?.count || 0;

      return {
        arquivos,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    }),

  /**
   * Buscar arquivo CNAB por ID
   */
  getById: protectedProcedure
    .input(z.number())
    .query(async ({ input: id }) => {
      const arquivo = await db
        .select()
        .from(cnabArquivos)
        .where(eq(cnabArquivos.id, id))
        .limit(1);

      if (!arquivo.length) {
        throw new Error("Arquivo CNAB não encontrado");
      }

      return arquivo[0];
    }),

  /**
   * Atualizar status do arquivo CNAB
   */
  updateStatus: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        status: z.enum(["gerado", "enviado", "processado", "erro"]),
        observacoes: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const updateData: any = {
        status: input.status,
      };

      if (input.status === "enviado") {
        updateData.dataEnvio = new Date();
      } else if (input.status === "processado") {
        updateData.dataProcessamento = new Date();
      }

      if (input.observacoes) {
        updateData.observacoes = input.observacoes;
      }

      const resultado = await db
        .update(cnabArquivos)
        .set(updateData)
        .where(eq(cnabArquivos.id, input.id));

      return {
        success: true,
        message: `Status atualizado para ${input.status}`,
      };
    }),

  /**
   * Deletar arquivo do histórico
   */
  delete: protectedProcedure
    .input(z.number())
    .mutation(async ({ input: id }) => {
      await db.delete(cnabArquivos).where(eq(cnabArquivos.id, id));

      return {
        success: true,
        message: "Arquivo deletado com sucesso",
      };
    }),

  /**
   * Obter estatísticas de CNAB
   */
  getStats: protectedProcedure
    .query(async () => {
      const arquivos = await db.select().from(cnabArquivos);

      const stats = {
        total: arquivos.length,
        gerado: arquivos.filter((a) => a.status === "gerado").length,
        enviado: arquivos.filter((a) => a.status === "enviado").length,
        processado: arquivos.filter((a) => a.status === "processado").length,
        erro: arquivos.filter((a) => a.status === "erro").length,
      };

      return stats;
    }),

  /**
   * Obter arquivo para download
   */
  download: protectedProcedure
    .input(z.number())
    .query(async ({ input: id }) => {
      const arquivo = await db
        .select()
        .from(cnabArquivos)
        .where(eq(cnabArquivos.id, id))
        .limit(1);

      if (!arquivo.length) {
        throw new Error("Arquivo CNAB não encontrado");
      }

      return {
        nomeArquivo: arquivo[0].nomeArquivo,
        conteudo: arquivo[0].conteudo,
      };
    }),
});
