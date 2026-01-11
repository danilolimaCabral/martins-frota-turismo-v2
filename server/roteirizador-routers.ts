import { router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import { getDb } from "./db";
import { rotas, passageirosRota } from "../drizzle/schema";
import { eq, desc } from "drizzle-orm";
import * as XLSX from "xlsx";

export const roteirizadorRouter = router({
  // Criar nova rota
  create: protectedProcedure
    .input(
      z.object({
        nome: z.string(),
        empresaCliente: z.string(),
        observacoes: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      const [result] = await db.insert(rotas).values({
        nome: input.nome,
        empresaCliente: input.empresaCliente,
        observacoes: input.observacoes,
        status: "rascunho",
      });
      
      return { id: result.insertId, success: true };
    }),

  // Listar todas as rotas
  list: protectedProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    
    const result = await db
      .select()
      .from(rotas)
      .orderBy(desc(rotas.createdAt));
    
    return result;
  }),

  // Buscar rota por ID com passageiros
  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      const [rota] = await db
        .select()
        .from(rotas)
        .where(eq(rotas.id, input.id));
      
      if (!rota) {
        throw new Error("Rota não encontrada");
      }

      const passageiros = await db
        .select()
        .from(passageirosRota)
        .where(eq(passageirosRota.rotaId, input.id))
        .orderBy(passageirosRota.ordemColeta);

      return {
        rota,
        passageiros,
      };
    }),

  // Adicionar passageiro manualmente
  addPassageiro: protectedProcedure
    .input(
      z.object({
        rotaId: z.number(),
        nome: z.string(),
        endereco: z.string(),
        telefone: z.string().optional(),
        observacoes: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      const [result] = await db.insert(passageirosRota).values({
        rotaId: input.rotaId,
        nome: input.nome,
        endereco: input.endereco,
        telefone: input.telefone,
        observacoes: input.observacoes,
      });
      
      return { id: result.insertId, success: true };
    }),

  // Processar planilha Excel (recebe base64)
  processarPlanilha: protectedProcedure
    .input(
      z.object({
        rotaId: z.number(),
        fileBase64: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        
        // Decodificar base64
        const buffer = Buffer.from(input.fileBase64, "base64");
        
        // Ler planilha
        const workbook = XLSX.read(buffer, { type: "buffer" });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        
        // Converter para JSON
        const data: any[] = XLSX.utils.sheet_to_json(sheet);

        if (data.length === 0) {
          throw new Error("Planilha vazia");
        }

        // Inserir passageiros no banco
        let inserted = 0;

        for (const row of data) {
          // Tentar diferentes formatos de colunas
          const nome = row.nome || row.Nome || row.NOME || row.Funcionario || row.funcionario;
          const endereco = row.endereco || row.Endereco || row.ENDERECO || row.Endereço;
          const telefone = row.telefone || row.Telefone || row.TELEFONE || row.Celular || row.celular;

          if (nome && endereco) {
            await db.insert(passageirosRota).values({
              rotaId: input.rotaId,
              nome,
              endereco,
              telefone: telefone || null,
            });
            inserted++;
          }
        }

        return {
          success: true,
          totalLinhas: data.length,
          passageirosInseridos: inserted,
        };
      } catch (error: any) {
        throw new Error(`Erro ao processar planilha: ${error.message}`);
      }
    }),

  // Deletar rota
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      await db.delete(rotas).where(eq(rotas.id, input.id));
      return { success: true };
    }),

  // Deletar passageiro
  deletePassageiro: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      await db.delete(passageirosRota).where(eq(passageirosRota.id, input.id));
      return { success: true };
    }),
});
