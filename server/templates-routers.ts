import { z } from 'zod';
import { sql } from 'drizzle-orm';
import { publicProcedure, protectedProcedure, router } from './_core/trpc';
import { getDb } from './db';

export const templatesRouter = router({
  // Listar todos os templates
  listarTemplates: protectedProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new Error('Database connection failed');
    
    const result: any = await db.execute(sql.raw(`
      SELECT 
        t.id,
        t.nome,
        t.tipo_veiculo,
        t.ativo,
        t.created_at,
        COUNT(i.id) as total_itens
      FROM templates_checklist t
      LEFT JOIN itens_template_checklist i ON t.id = i.template_id
      GROUP BY t.id
      ORDER BY t.created_at DESC
    `));
    return result[0] || [];
  }),

  // Obter template por ID com itens
  obterTemplate: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database connection failed');
      
      const templateResult: any = await db.execute(sql.raw(`
        SELECT * FROM templates_checklist WHERE id = ${input.id}
      `));

      const itensResult: any = await db.execute(sql.raw(`
        SELECT * FROM itens_template_checklist 
        WHERE template_id = ${input.id}
        ORDER BY ordem ASC
      `));

      return {
        template: templateResult[0]?.[0],
        itens: itensResult[0] || [],
      };
    }),

  // Criar novo template
  criarTemplate: protectedProcedure
    .input(
      z.object({
        nome: z.string(),
        tipoVeiculo: z.enum(['van', 'onibus', 'micro-onibus', 'carro']),
        itens: z.array(
          z.object({
            categoria: z.string(),
            descricao: z.string(),
            ordem: z.number(),
            obrigatorio: z.boolean(),
          })
        ),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database connection failed');
      
      // Criar template
      const result: any = await db.execute(sql.raw(`
        INSERT INTO templates_checklist (nome, tipo_veiculo, ativo)
        VALUES ('${input.nome}', '${input.tipoVeiculo}', TRUE)
      `));

      const templateId = result[0].insertId;

      // Inserir itens
      for (const item of input.itens) {
        await db.execute(sql.raw(`
          INSERT INTO itens_template_checklist 
          (template_id, categoria, descricao, ordem, obrigatorio)
          VALUES (
            ${templateId},
            '${item.categoria}',
            '${item.descricao}',
            ${item.ordem},
            ${item.obrigatorio ? 1 : 0}
          )
        `));
      }

      return { id: templateId, message: 'Template criado com sucesso!' };
    }),

  // Atualizar template
  atualizarTemplate: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        nome: z.string(),
        tipoVeiculo: z.enum(['van', 'onibus', 'micro-onibus', 'carro']),
        ativo: z.boolean(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database connection failed');
      
      await db.execute(sql.raw(`
        UPDATE templates_checklist
        SET nome = '${input.nome}',
            tipo_veiculo = '${input.tipoVeiculo}',
            ativo = ${input.ativo ? 1 : 0}
        WHERE id = ${input.id}
      `));

      return { message: 'Template atualizado com sucesso!' };
    }),

  // Adicionar item ao template
  adicionarItem: protectedProcedure
    .input(
      z.object({
        templateId: z.number(),
        categoria: z.string(),
        descricao: z.string(),
        ordem: z.number(),
        obrigatorio: z.boolean(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database connection failed');
      
      await db.execute(sql.raw(`
        INSERT INTO itens_template_checklist 
        (template_id, categoria, descricao, ordem, obrigatorio)
        VALUES (
          ${input.templateId},
          '${input.categoria}',
          '${input.descricao}',
          ${input.ordem},
          ${input.obrigatorio ? 1 : 0}
        )
      `));

      return { message: 'Item adicionado com sucesso!' };
    }),

  // Atualizar item
  atualizarItem: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        categoria: z.string(),
        descricao: z.string(),
        ordem: z.number(),
        obrigatorio: z.boolean(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database connection failed');
      
      await db.execute(sql.raw(`
        UPDATE itens_template_checklist
        SET categoria = '${input.categoria}',
            descricao = '${input.descricao}',
            ordem = ${input.ordem},
            obrigatorio = ${input.obrigatorio ? 1 : 0}
        WHERE id = ${input.id}
      `));

      return { message: 'Item atualizado com sucesso!' };
    }),

  // Remover item
  removerItem: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database connection failed');
      
      await db.execute(sql.raw(`
        DELETE FROM itens_template_checklist WHERE id = ${input.id}
      `));

      return { message: 'Item removido com sucesso!' };
    }),

  // Duplicar template
  duplicarTemplate: protectedProcedure
    .input(z.object({ id: z.number(), novoNome: z.string() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database connection failed');
      
      // Obter template original
      const templateResult: any = await db.execute(sql.raw(`
        SELECT * FROM templates_checklist WHERE id = ${input.id}
      `));

      const original = templateResult[0]?.[0];
      if (!original) throw new Error('Template não encontrado');

      // Criar novo template
      const result: any = await db.execute(sql.raw(`
        INSERT INTO templates_checklist (nome, tipo_veiculo, ativo)
        VALUES ('${input.novoNome}', '${original.tipo_veiculo}', TRUE)
      `));

      const novoTemplateId = result[0].insertId;

      // Copiar itens
      const itensResult: any = await db.execute(sql.raw(`
        SELECT * FROM itens_template_checklist WHERE template_id = ${input.id}
      `));

      const itens = itensResult[0] || [];
      for (const item of itens) {
        await db.execute(sql.raw(`
          INSERT INTO itens_template_checklist 
          (template_id, categoria, descricao, ordem, obrigatorio)
          VALUES (
            ${novoTemplateId},
            '${item.categoria}',
            '${item.descricao}',
            ${item.ordem},
            ${item.obrigatorio}
          )
        `));
      }

      return { id: novoTemplateId, message: 'Template duplicado com sucesso!' };
    }),

  // Deletar template
  deletarTemplate: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database connection failed');
      
      // Verificar se template está em uso
      const checkResult: any = await db.execute(sql.raw(`
        SELECT COUNT(*) as total FROM checklists WHERE template_id = ${input.id}
      `));

      const total = checkResult[0]?.[0]?.total || 0;

      if (total > 0) {
        throw new Error(
          `Não é possível deletar. Template está sendo usado em ${total} check-list(s).`
        );
      }

      // Deletar itens (cascade já faz isso, mas por segurança)
      await db.execute(sql.raw(`
        DELETE FROM itens_template_checklist WHERE template_id = ${input.id}
      `));

      // Deletar template
      await db.execute(sql.raw(`
        DELETE FROM templates_checklist WHERE id = ${input.id}
      `));

      return { message: 'Template deletado com sucesso!' };
    }),

  // Obter categorias únicas
  obterCategorias: protectedProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new Error('Database connection failed');
    
    const result: any = await db.execute(sql.raw(`
      SELECT DISTINCT categoria FROM itens_template_checklist ORDER BY categoria
    `));
    return (result[0] || []).map((row: any) => row.categoria);
  }),
});
