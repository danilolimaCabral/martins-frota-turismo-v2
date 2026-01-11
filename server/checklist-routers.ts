import { z } from "zod";
import { sql } from "drizzle-orm";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { getDb } from "./db";

export const checklistRouter = router({
  // Listar templates de check-list
  listTemplates: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database connection failed");
    
    const result: any = await db.execute(
      sql.raw("SELECT * FROM checklist_templates WHERE ativo = 1 ORDER BY nome")
    );
    return result[0] || [];
  }),

  // Buscar template por ID com seus itens
  getTemplate: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database connection failed");
      
      const templatesResult: any = await db.execute(
        sql.raw(`SELECT * FROM checklist_templates WHERE id = ${input.id}`)
      );
      
      const itensResult: any = await db.execute(
        sql.raw(`SELECT * FROM checklist_itens WHERE template_id = ${input.id} ORDER BY ordem, categoria`)
      );
      
      return {
        template: templatesResult[0]?.[0],
        itens: itensResult[0] || []
      };
    }),

  // Iniciar novo check-list
  iniciarChecklist: protectedProcedure
    .input(z.object({
      veiculoId: z.number(),
      motoristaId: z.number(),
      templateId: z.number(),
      kmAtual: z.number()
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database connection failed");
      
      const result: any = await db.execute(
        sql.raw(`INSERT INTO checklists (veiculo_id, motorista_id, template_id, km_atual, status)
         VALUES (${input.veiculoId}, ${input.motoristaId}, ${input.templateId}, ${input.kmAtual}, 'em_andamento')`)
      );
      
      return { checklistId: result[0].insertId };
    }),

  // Salvar resposta de um item do check-list
  salvarResposta: protectedProcedure
    .input(z.object({
      checklistId: z.number(),
      itemId: z.number(),
      resposta: z.enum(['ok', 'problema', 'nao_aplicavel']),
      observacao: z.string().optional(),
      fotoUrl: z.string().optional()
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database connection failed");
      
      const obs = input.observacao ? `'${input.observacao.replace(/'/g, "''")}'` : 'NULL';
      const foto = input.fotoUrl ? `'${input.fotoUrl}'` : 'NULL';
      
      await db.execute(
        sql.raw(`INSERT INTO checklist_respostas (checklist_id, item_id, resposta, observacao, foto_url)
         VALUES (${input.checklistId}, ${input.itemId}, '${input.resposta}', ${obs}, ${foto})
         ON DUPLICATE KEY UPDATE resposta = VALUES(resposta), observacao = VALUES(observacao), foto_url = VALUES(foto_url)`)
      );
      
      return { success: true };
    }),

  // Finalizar check-list e criar OS automaticamente se houver problemas
  finalizarChecklist: protectedProcedure
    .input(z.object({
      checklistId: z.number(),
      observacoes: z.string().optional()
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database connection failed");
      
      // Buscar respostas com problema
      const problemasResult: any = await db.execute(
        sql.raw(`SELECT cr.*, ci.descricao, ci.categoria
         FROM checklist_respostas cr
         JOIN checklist_itens ci ON cr.item_id = ci.id
         WHERE cr.checklist_id = ${input.checklistId} AND cr.resposta = 'problema'`)
      );
      
      const problemas = problemasResult[0] || [];
      const temProblemas = problemas.length > 0;
      
      // Atualizar status do check-list
      const obs = input.observacoes ? `'${input.observacoes.replace(/'/g, "''")}'` : 'NULL';
      await db.execute(
        sql.raw(`UPDATE checklists 
         SET status = '${temProblemas ? 'com_problemas' : 'concluido'}', observacoes = ${obs}
         WHERE id = ${input.checklistId}`)
      );
      
      // Se houver problemas, criar OS automaticamente
      let osId = null;
      if (temProblemas) {
        // Buscar dados do check-list
        const checklistResult: any = await db.execute(
          sql.raw(`SELECT * FROM checklists WHERE id = ${input.checklistId}`)
        );
        const checklist = checklistResult[0]?.[0];
        
        if (checklist) {
          // Montar descrição dos problemas
          const descricaoProblema = problemas.map((p: any) => 
            `[${p.categoria}] ${p.descricao}${p.observacao ? ': ' + p.observacao : ''}`
          ).join('\\n');
          
          // Criar OS
          const osResult: any = await db.execute(
            sql.raw(`INSERT INTO ordens_servico 
             (veiculo_id, checklist_id, tipo, prioridade, status, descricao_problema, km_veiculo)
             VALUES (${checklist.veiculo_id}, ${input.checklistId}, 'corretiva', 'media', 'pendente', '${descricaoProblema.replace(/'/g, "''")}', ${checklist.km_atual})`)
          );
          
          osId = osResult[0].insertId;
        }
      }
      
      return {
        success: true,
        temProblemas,
        quantidadeProblemas: problemas.length,
        osId
      };
    }),

  // Listar check-lists (para admin)
  listarChecklists: protectedProcedure
    .input(z.object({
      status: z.enum(['em_andamento', 'concluido', 'com_problemas']).optional(),
      veiculoId: z.number().optional(),
      limit: z.number().default(50)
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database connection failed");
      
      let query = `
        SELECT c.*, v.plate as veiculo_placa, d.name as motorista_nome
        FROM checklists c
        LEFT JOIN vehicles v ON c.veiculo_id = v.id
        LEFT JOIN drivers d ON c.motorista_id = d.id
        WHERE 1=1
      `;
      
      if (input.status) {
        query += ` AND c.status = '${input.status}'`;
      }
      
      if (input.veiculoId) {
        query += ` AND c.veiculo_id = ${input.veiculoId}`;
      }
      
      query += ` ORDER BY c.data_realizacao DESC LIMIT ${input.limit}`;
      
      const result: any = await db.execute(sql.raw(query));
      return result[0] || [];
    }),

  // Buscar detalhes de um check-list
  getChecklist: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database connection failed");
      
      const checklistResult: any = await db.execute(
        sql.raw(`SELECT c.*, v.plate as veiculo_placa, v.model as veiculo_modelo,
                d.name as motorista_nome, t.nome as template_nome
         FROM checklists c
         LEFT JOIN vehicles v ON c.veiculo_id = v.id
         LEFT JOIN drivers d ON c.motorista_id = d.id
         LEFT JOIN checklist_templates t ON c.template_id = t.id
         WHERE c.id = ${input.id}`)
      );
      
      const respostasResult: any = await db.execute(
        sql.raw(`SELECT cr.*, ci.descricao, ci.categoria, ci.obrigatorio
         FROM checklist_respostas cr
         JOIN checklist_itens ci ON cr.item_id = ci.id
         WHERE cr.checklist_id = ${input.id}
         ORDER BY ci.ordem, ci.categoria`)
      );
      
      return {
        checklist: checklistResult[0]?.[0],
        respostas: respostasResult[0] || []
      };
    })
});
