import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { getDb } from "./db";
import { notifyOwner } from "./_core/notification";
import { sql } from "drizzle-orm";

export const contatoRouter = router({
  // Criar novo contato (público)
  create: publicProcedure
    .input(
      z.object({
        nome: z.string().min(1, "Nome é obrigatório"),
        email: z.string().email("Email inválido"),
        telefone: z.string().optional(),
        empresa: z.string().optional(),
        mensagem: z.string().min(1, "Mensagem é obrigatória"),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      await db.execute(
        sql.raw(`INSERT INTO contatos (nome, email, telefone, empresa, mensagem, status)
         VALUES ('${input.nome}', '${input.email}', ${input.telefone ? `'${input.telefone}'` : 'NULL'}, ${input.empresa ? `'${input.empresa}'` : 'NULL'}, '${input.mensagem.replace(/'/g, "''")}', 'novo')`)
      );

      // Notificar proprietário sobre novo contato
      await notifyOwner({
        title: "Nova Mensagem de Contato",
        content: `Nova mensagem recebida:\n\nNome: ${input.nome}\nEmail: ${input.email}${input.telefone ? `\nTelefone: ${input.telefone}` : ''}${input.empresa ? `\nEmpresa: ${input.empresa}` : ''}\n\nMensagem:\n${input.mensagem}`,
      });

      return { success: true };
    }),

  // Listar todos os contatos (protegido - admin)
  list: protectedProcedure
    .input(
      z.object({
        status: z.enum(["novo", "lido", "respondido"]).optional(),
        limit: z.number().default(50),
        offset: z.number().default(0),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      let query = "SELECT * FROM contatos";
      
      if (input.status) {
        query += ` WHERE status = '${input.status}'`;
      }
      
      query += ` ORDER BY createdAt DESC LIMIT ${input.limit} OFFSET ${input.offset}`;
      
      const result: any = await db.execute(sql.raw(query));
      return result[0] || [];
    }),

  // Atualizar status do contato (protegido - admin)
  updateStatus: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        status: z.enum(["novo", "lido", "respondido"]),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      await db.execute(
        sql.raw(`UPDATE contatos SET status = '${input.status}' WHERE id = ${input.id}`)
      );
      
      return { success: true };
    }),

  // Buscar contato por ID (protegido - admin)
  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      const result: any = await db.execute(
        sql.raw(`SELECT * FROM contatos WHERE id = ${input.id}`)
      );
      
      return result[0]?.[0] || null;
    }),

  // Deletar contato (protegido - admin)
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      await db.execute(sql.raw(`DELETE FROM contatos WHERE id = ${input.id}`));
      
      return { success: true };
    }),
});
