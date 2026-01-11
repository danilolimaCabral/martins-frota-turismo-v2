import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { getDb } from "./db";
import { notifyOwner } from "./_core/notification";
import { sql } from "drizzle-orm";

export const orcamentoRouter = router({
  // Criar novo orçamento (público)
  create: publicProcedure
    .input(
      z.object({
        origem: z.string().min(1, "Origem é obrigatória"),
        destino: z.string().min(1, "Destino é obrigatório"),
        dataIda: z.string().min(1, "Data de ida é obrigatória"),
        passageiros: z.number().min(1, "Número de passageiros inválido"),
        tipoVeiculo: z.string().optional(),
        custoEstimado: z.string().optional(),
        nome: z.string().optional(),
        email: z.string().email("Email inválido").optional(),
        telefone: z.string().optional(),
        empresa: z.string().optional(),
        mensagem: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      await db.execute(
        sql.raw(`INSERT INTO orcamentos (origem, destino, dataIda, passageiros, tipoVeiculo, custoEstimado, nome, email, telefone, empresa, mensagem, status)
         VALUES ('${input.origem}', '${input.destino}', '${input.dataIda}', ${input.passageiros}, ${input.tipoVeiculo ? `'${input.tipoVeiculo}'` : 'NULL'}, ${input.custoEstimado ? `'${input.custoEstimado}'` : 'NULL'}, ${input.nome ? `'${input.nome}'` : 'NULL'}, ${input.email ? `'${input.email}'` : 'NULL'}, ${input.telefone ? `'${input.telefone}'` : 'NULL'}, ${input.empresa ? `'${input.empresa}'` : 'NULL'}, ${input.mensagem ? `'${input.mensagem.replace(/'/g, "''")}'` : 'NULL'}, 'pendente')`)
      );

      // Notificar proprietário sobre novo orçamento
      await notifyOwner({
        title: "Novo Orçamento Recebido",
        content: `Nova solicitação de orçamento:\n\nOrigem: ${input.origem}\nDestino: ${input.destino}\nData: ${input.dataIda}\nPassageiros: ${input.passageiros}${input.nome ? `\nNome: ${input.nome}` : ''}${input.email ? `\nEmail: ${input.email}` : ''}${input.telefone ? `\nTelefone: ${input.telefone}` : ''}`,
      });

      return { success: true };
    }),

  // Listar todos os orçamentos (protegido - admin)
  list: protectedProcedure
    .input(
      z.object({
        status: z.enum(["pendente", "em_analise", "aprovado", "recusado"]).optional(),
        limit: z.number().default(50),
        offset: z.number().default(0),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      let query = "SELECT * FROM orcamentos";
      
      if (input.status) {
        query += ` WHERE status = '${input.status}'`;
      }
      
      query += ` ORDER BY createdAt DESC LIMIT ${input.limit} OFFSET ${input.offset}`;
      
      const result: any = await db.execute(sql.raw(query));
      return result[0] || [];
    }),

  // Atualizar status do orçamento (protegido - admin)
  updateStatus: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        status: z.enum(["pendente", "em_analise", "aprovado", "recusado"]),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      await db.execute(
        sql.raw(`UPDATE orcamentos SET status = '${input.status}' WHERE id = ${input.id}`)
      );
      
      return { success: true };
    }),

  // Buscar orçamento por ID (protegido - admin)
  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      const result: any = await db.execute(
        sql.raw(`SELECT * FROM orcamentos WHERE id = ${input.id}`)
      );
      
      return result[0]?.[0] || null;
    }),

  // Deletar orçamento (protegido - admin)
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      await db.execute(sql.raw(`DELETE FROM orcamentos WHERE id = ${input.id}`));
      
      return { success: true };
    }),
});
