import { z } from "zod";
import { sql } from "drizzle-orm";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { getDb } from "./db";

export const manutencaoRouter = router({
  // Listar ordens de serviço
  listarOS: protectedProcedure
    .input(z.object({
      status: z.enum(['pendente', 'em_andamento', 'aguardando_pecas', 'concluida', 'cancelada']).optional(),
      veiculoId: z.number().optional(),
      prioridade: z.enum(['baixa', 'media', 'alta', 'urgente']).optional(),
      limit: z.number().default(50)
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database connection failed");
      
      let query = `
        SELECT os.*, v.plate as veiculo_placa, v.model as veiculo_modelo,
               u.name as mecanico_nome
        FROM ordens_servico os
        LEFT JOIN vehicles v ON os.veiculo_id = v.id
        LEFT JOIN users u ON os.mecanico_id = u.id
        WHERE 1=1
      `;
      
      if (input.status) {
        query += ` AND os.status = '${input.status}'`;
      }
      
      if (input.veiculoId) {
        query += ` AND os.veiculo_id = ${input.veiculoId}`;
      }
      
      if (input.prioridade) {
        query += ` AND os.prioridade = '${input.prioridade}'`;
      }
      
      query += ` ORDER BY FIELD(os.prioridade, 'urgente', 'alta', 'media', 'baixa'), os.data_abertura DESC LIMIT ${input.limit}`;
      
      const result: any = await db.execute(sql.raw(query));
      return result[0] || [];
    }),

  // Buscar OS por ID
  getOS: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database connection failed");
      
      const ordensResult: any = await db.execute(
        sql.raw(`SELECT os.*, v.plate as veiculo_placa, v.model as veiculo_modelo,
                u.name as mecanico_nome
         FROM ordens_servico os
         LEFT JOIN vehicles v ON os.veiculo_id = v.id
         LEFT JOIN users u ON os.mecanico_id = u.id
         WHERE os.id = ${input.id}`)
      );
      
      const itensResult: any = await db.execute(
        sql.raw(`SELECT * FROM os_itens WHERE os_id = ${input.id}`)
      );
      
      return {
        os: ordensResult[0]?.[0],
        itens: itensResult[0] || []
      };
    }),

  // Criar OS manualmente
  criarOS: protectedProcedure
    .input(z.object({
      veiculoId: z.number(),
      tipo: z.enum(['preventiva', 'corretiva', 'preditiva']),
      prioridade: z.enum(['baixa', 'media', 'alta', 'urgente']),
      descricaoProblema: z.string(),
      kmVeiculo: z.number()
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database connection failed");
      
      const descricao = input.descricaoProblema.replace(/'/g, "''");
      
      const result: any = await db.execute(
        sql.raw(`INSERT INTO ordens_servico 
         (veiculo_id, tipo, prioridade, status, descricao_problema, km_veiculo)
         VALUES (${input.veiculoId}, '${input.tipo}', '${input.prioridade}', 'pendente', '${descricao}', ${input.kmVeiculo})`)
      );
      
      return { osId: result[0].insertId };
    }),

  // Atribuir mecânico à OS
  atribuirMecanico: protectedProcedure
    .input(z.object({
      osId: z.number(),
      mecanicoId: z.number()
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database connection failed");
      
      await db.execute(
        sql.raw(`UPDATE ordens_servico 
         SET mecanico_id = ${input.mecanicoId}, status = 'em_andamento', data_inicio = NOW()
         WHERE id = ${input.osId}`)
      );
      
      return { success: true };
    }),

  // Adicionar item/serviço à OS
  adicionarItem: protectedProcedure
    .input(z.object({
      osId: z.number(),
      tipo: z.enum(['servico', 'peca']),
      descricao: z.string(),
      quantidade: z.number(),
      valorUnitario: z.number(),
      pecaId: z.number().optional()
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database connection failed");
      
      const valorTotal = input.quantidade * input.valorUnitario;
      const descricao = input.descricao.replace(/'/g, "''");
      const pecaId = input.pecaId ? input.pecaId : 'NULL';
      
      const result: any = await db.execute(
        sql.raw(`INSERT INTO os_itens (os_id, tipo, descricao, quantidade, valor_unitario, valor_total, peca_id)
         VALUES (${input.osId}, '${input.tipo}', '${descricao}', ${input.quantidade}, ${input.valorUnitario}, ${valorTotal}, ${pecaId})`)
      );
      
      // Atualizar valor total da OS
      await db.execute(
        sql.raw(`UPDATE ordens_servico 
         SET valor_total = (SELECT SUM(valor_total) FROM os_itens WHERE os_id = ${input.osId})
         WHERE id = ${input.osId}`)
      );
      
      return { itemId: result[0].insertId };
    }),

  // Concluir OS e gerar conta a pagar automaticamente
  concluirOS: protectedProcedure
    .input(z.object({
      osId: z.number(),
      diagnosticoFinal: z.string().optional(),
      kmFinal: z.number().optional()
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database connection failed");
      
      // Buscar dados da OS
      const ordensResult: any = await db.execute(
        sql.raw(`SELECT * FROM ordens_servico WHERE id = ${input.osId}`)
      );
      const os = ordensResult[0]?.[0];
      
      if (!os) throw new Error("OS não encontrada");
      
      // Atualizar OS
      const diagnostico = input.diagnosticoFinal ? `'${input.diagnosticoFinal.replace(/'/g, "''")}'` : 'NULL';
      const kmFinal = input.kmFinal ? input.kmFinal : 'NULL';
      
      await db.execute(
        sql.raw(`UPDATE ordens_servico 
         SET status = 'concluida', 
             data_conclusao = NOW(),
             diagnostico_final = ${diagnostico},
             km_final = ${kmFinal}
         WHERE id = ${input.osId}`)
      );
      
      // Criar conta a pagar automaticamente se houver valor
      let contaPagarId = null;
      if (os.valor_total && os.valor_total > 0) {
        const descricao = `Manutenção ${os.tipo} - OS #${os.id} - Veículo ${os.veiculo_id}`;
        
        const contaResult: any = await db.execute(
          sql.raw(`INSERT INTO contas_pagar 
           (descricao, valor, data_vencimento, categoria, os_id, status)
           VALUES ('${descricao}', ${os.valor_total}, DATE_ADD(NOW(), INTERVAL 7 DAY), 'manutencao', ${input.osId}, 'pendente')`)
        );
        
        contaPagarId = contaResult[0].insertId;
      }
      
      // Registrar custo do veículo
      const descCusto = input.diagnosticoFinal ? input.diagnosticoFinal.replace(/'/g, "''") : os.descricao_problema.replace(/'/g, "''");
      await db.execute(
        sql.raw(`INSERT INTO custos_veiculo 
         (veiculo_id, tipo, categoria, valor, data, os_id, descricao)
         VALUES (${os.veiculo_id}, 'manutencao', '${os.tipo}', ${os.valor_total || 0}, NOW(), ${input.osId}, '${descCusto}')`)
      );
      
      return {
        success: true,
        contaPagarId,
        valorTotal: os.valor_total
      };
    }),

  // Cancelar OS
  cancelarOS: protectedProcedure
    .input(z.object({
      osId: z.number(),
      motivo: z.string()
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database connection failed");
      
      const motivo = input.motivo.replace(/'/g, "''");
      
      await db.execute(
        sql.raw(`UPDATE ordens_servico 
         SET status = 'cancelada', observacoes = '${motivo}'
         WHERE id = ${input.osId}`)
      );
      
      return { success: true };
    }),

  // Estatísticas de manutenção
  getStats: protectedProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database connection failed");
    
    const result: any = await db.execute(sql.raw(`
      SELECT 
        COUNT(*) as total_os,
        SUM(CASE WHEN status = 'pendente' THEN 1 ELSE 0 END) as pendentes,
        SUM(CASE WHEN status = 'em_andamento' THEN 1 ELSE 0 END) as em_andamento,
        SUM(CASE WHEN status = 'concluida' THEN 1 ELSE 0 END) as concluidas,
        SUM(CASE WHEN status = 'concluida' THEN valor_total ELSE 0 END) as valor_total_concluidas,
        AVG(CASE WHEN status = 'concluida' THEN DATEDIFF(data_conclusao, data_abertura) ELSE NULL END) as tempo_medio_dias
      FROM ordens_servico
      WHERE MONTH(data_abertura) = MONTH(NOW()) AND YEAR(data_abertura) = YEAR(NOW())
    `));
    
    return result[0]?.[0] || {};
  }),

  // Listar peças do estoque
  listarPecas: protectedProcedure
    .input(z.object({
      search: z.string().optional(),
      limit: z.number().default(50)
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database connection failed");
      
      let query = "SELECT * FROM pecas WHERE 1=1";
      
      if (input.search) {
        const search = input.search.replace(/'/g, "''");
        query += ` AND (nome LIKE '%${search}%' OR codigo LIKE '%${search}%')`;
      }
      
      query += ` ORDER BY nome LIMIT ${input.limit}`;
      
      const result: any = await db.execute(sql.raw(query));
      return result[0] || [];
    })
});
