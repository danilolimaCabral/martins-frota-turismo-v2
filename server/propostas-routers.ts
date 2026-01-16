import { router, protectedProcedure } from "./_core/trpc";
import { db } from "./db";
import { notifyOwner } from "./_core/notification";
import { propostas, propostaHistorico } from "../drizzle/schema";
import { eq, desc } from "drizzle-orm";
import { z } from "zod";
import { TRPCError } from "@trpc/server";

const propostaSchema = z.object({
  numeroOrcamento: z.string().min(1),
  nomeEmpresa: z.string().min(1),
  cnpj: z.string().optional(),
  contatoPrincipal: z.string().optional(),
  emailCliente: z.string().email().optional(),
  telefoneCliente: z.string().optional(),
  enderecoCliente: z.string().optional(),
  tipoFretamento: z.string().optional(),
  descricaoServico: z.string().optional(),
  dataInicio: z.string().optional(),
  dataTermino: z.string().optional(),
  frequencia: z.string().optional(),
  horariosColeta: z.string().optional(),
  pontosColeta: z.string().optional(),
  destinos: z.string().optional(),
  quantidadeVeiculos: z.number().optional(),
  tipoVeiculo: z.string().optional(),
  capacidadePassageiros: z.number().optional(),
  especificacoes: z.string().optional(),
  valorDia: z.number().optional(),
  quantidadeDias: z.number().optional(),
  desconto: z.number().optional(),
  valorTotal: z.number().optional(),
  formaPagamento: z.string().optional(),
  condicoesEspeciais: z.string().optional(),
  observacoes: z.string().optional(),
  dataProposta: z.string().optional(),
  dataValidade: z.string().optional(),
});

export const propostasRouter = router({
  // Criar nova proposta
  create: protectedProcedure
    .input(propostaSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        const result = await db.insert(propostas).values({
          ...input,
          propostoPor: ctx.user?.name || "Sistema",
          createdBy: ctx.user?.id?.toString(),
          dataProposta: new Date().toISOString().split("T")[0],
        });

        // Registrar no histórico
        const propostaId = result[0]?.insertId || 1;
        await db.insert(propostaHistorico).values({
          propostaId: propostaId as number,
          acao: "criada",
          descricao: `Proposta criada por ${ctx.user?.name}`,
          alteradoPor: ctx.user?.name,
        });

        return { success: true, id: propostaId };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erro ao criar proposta",
        });
      }
    }),

  // Listar propostas
  list: protectedProcedure.query(async ({ ctx }) => {
    try {
      const data = await db
        .select()
        .from(propostas)
        .orderBy(desc(propostas.createdAt));
      return { data, total: data.length };
    } catch (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Erro ao listar propostas",
      });
    }
  }),

  // Obter proposta por ID
  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      try {
        const data = await db
          .select()
          .from(propostas)
          .where(eq(propostas.id, input.id));
        return data[0] || null;
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erro ao obter proposta",
        });
      }
    }),

  // Atualizar proposta
  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        data: propostaSchema.partial(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        await db
          .update(propostas)
          .set(input.data)
          .where(eq(propostas.id, input.id));

        // Registrar no histórico
        await db.insert(propostaHistorico).values({
          propostaId: input.id,
          acao: "editada",
          descricao: `Proposta editada por ${ctx.user?.name}`,
          alteradoPor: ctx.user?.name,
        });

        return { success: true };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erro ao atualizar proposta",
        });
      }
    }),

  // Deletar proposta
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      try {
        await db.delete(propostas).where(eq(propostas.id, input.id));
        return { success: true };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erro ao deletar proposta",
        });
      }
    }),

  // Enviar proposta por email
  enviarEmail: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        emailDestino: z.string().email(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const proposta = await db
          .select()
          .from(propostas)
          .where(eq(propostas.id, input.id));

        if (!proposta[0]) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Proposta não encontrada",
          });
        }

        // Atualizar status
        await db
          .update(propostas)
          .set({ status: "enviada" })
          .where(eq(propostas.id, input.id));

        // Registrar no histórico
        await db.insert(propostaHistorico).values({
          propostaId: input.id,
          acao: "enviada",
          descricao: `Proposta enviada para ${input.emailDestino}`,
          alteradoPor: ctx.user?.name,
        });

        return { success: true, message: "Proposta enviada com sucesso" };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erro ao enviar proposta",
        });
      }
    }),

  // Aceitar proposta
  aceitar: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        assinadoPor: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const token = Math.random().toString(36).substring(2, 15);
        await db
          .update(propostas)
          .set({
            status: "aceita",
            assinadoPor: input.assinadoPor,
            dataAssinatura: new Date(),
            tokenAssinatura: token,
          })
          .where(eq(propostas.id, input.id));

        // Registrar no histórico
        await db.insert(propostaHistorico).values({
          propostaId: input.id,
          acao: "aceita",
          descricao: `Proposta aceita por ${input.assinadoPor}`,
          alteradoPor: input.assinadoPor,
        });

        return { success: true, token };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erro ao aceitar proposta",
        });
      }
    }),

  // Rejeitar proposta
  rejeitar: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        motivo: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        await db
          .update(propostas)
          .set({ status: "rejeitada" })
          .where(eq(propostas.id, input.id));

        // Registrar no histórico
        await db.insert(propostaHistorico).values({
          propostaId: input.id,
          acao: "rejeitada",
          descricao: `Proposta rejeitada. Motivo: ${input.motivo}`,
          alteradoPor: ctx.user?.name,
        });

        return { success: true };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erro ao rejeitar proposta",
        });
      }
    }),

  // Obter histórico
  getHistorico: protectedProcedure
    .input(z.object({ propostaId: z.number() }))
    .query(async ({ input }) => {
      try {
        const data = await db
          .select()
          .from(propostaHistorico)
          .where(eq(propostaHistorico.propostaId, input.propostaId))
          .orderBy(desc(propostaHistorico.createdAt));
        return data;
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erro ao obter histórico",
        });
      }
    }),
});
