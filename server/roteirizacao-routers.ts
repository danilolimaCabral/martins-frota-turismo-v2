import { z } from "zod";
import { protectedProcedure, router } from "./_core/trpc";
import { db } from "./db";
import { sql } from "drizzle-orm";

// Schema para rotas
const rotasTable = sql`
  CREATE TABLE IF NOT EXISTS rotas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    descricao TEXT,
    distancia_maxima_usuario DECIMAL(5,2) DEFAULT 1.0,
    tempo_maximo_rota INT DEFAULT 120,
    status ENUM('rascunho', 'otimizada', 'ativa', 'concluida') DEFAULT 'rascunho',
    pontos_embarque JSON,
    rota_otimizada JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  )
`;

const enderecosRotaTable = sql`
  CREATE TABLE IF NOT EXISTS enderecos_rota (
    id INT AUTO_INCREMENT PRIMARY KEY,
    rota_id INT NOT NULL,
    nome_usuario VARCHAR(255),
    endereco TEXT NOT NULL,
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    ordem INT,
    ponto_embarque_id INT,
    distancia_ate_ponto DECIMAL(5,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
`;

export const roteirizacaoRouter = router({
  // Criar nova rota
  create: protectedProcedure
    .input(z.object({
      nome: z.string().min(1),
      descricao: z.string().optional(),
      distanciaMaximaUsuario: z.number().default(1.0), // km
      tempoMaximoRota: z.number().default(120), // minutos
    }))
    .mutation(async ({ input }) => {
      const [result] = await db.execute(sql`
        INSERT INTO rotas (nome, descricao, distancia_maxima_usuario, tempo_maximo_rota)
        VALUES (${input.nome}, ${input.descricao || null}, ${input.distanciaMaximaUsuario}, ${input.tempoMaximoRota})
      `);
      return { id: (result as any).insertId };
    }),

  // Listar rotas
  list: protectedProcedure
    .query(async () => {
      const rows = await db.execute(sql`
        SELECT * FROM rotas ORDER BY created_at DESC
      `);
      return (rows as unknown as any[][])[0] || [];
    }),

  // Obter rota por ID
  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const rows = await db.execute(sql`
        SELECT * FROM rotas WHERE id = ${input.id}
      `);
      const rota = (rows as unknown as any[][])[0]?.[0];
      if (!rota) throw new Error("Rota não encontrada");
      
      // Buscar endereços
      const enderecosResult = await db.execute(sql`
        SELECT * FROM enderecos_rota WHERE rota_id = ${input.id} ORDER BY ordem
      `);
      const enderecos = (enderecosResult as unknown as any[][])[0] || [];
      
      return { ...rota, enderecos };
    }),

  // Adicionar endereços (upload de planilha)
  addEnderecos: protectedProcedure
    .input(z.object({
      rotaId: z.number(),
      enderecos: z.array(z.object({
        nomeUsuario: z.string().optional(),
        endereco: z.string(),
        latitude: z.number().optional(),
        longitude: z.number().optional(),
      })),
    }))
    .mutation(async ({ input }) => {
      // Limpar endereços anteriores
      await db.execute(sql`DELETE FROM enderecos_rota WHERE rota_id = ${input.rotaId}`);
      
      // Inserir novos endereços
      for (let i = 0; i < input.enderecos.length; i++) {
        const end = input.enderecos[i];
        await db.execute(sql`
          INSERT INTO enderecos_rota (rota_id, nome_usuario, endereco, latitude, longitude, ordem)
          VALUES (${input.rotaId}, ${end.nomeUsuario || null}, ${end.endereco}, ${end.latitude || null}, ${end.longitude || null}, ${i + 1})
        `);
      }
      
      return { count: input.enderecos.length };
    }),

  // Otimizar rota (calcular pontos de embarque)
  otimizar: protectedProcedure
    .input(z.object({ rotaId: z.number() }))
    .mutation(async ({ input }) => {
      // Buscar rota e endereços
      const rotaRows = await db.execute(sql`SELECT * FROM rotas WHERE id = ${input.rotaId}`);
      const rota = (rotaRows as unknown as any[][])[0]?.[0];
      if (!rota) throw new Error("Rota não encontrada");
      
      const enderecosRows = await db.execute(sql`
        SELECT * FROM enderecos_rota WHERE rota_id = ${input.rotaId} ORDER BY ordem
      `);
      const enderecos = (enderecosRows as unknown as any[][])[0] || [];
      
      if (enderecos.length === 0) {
        throw new Error("Nenhum endereço cadastrado na rota");
      }
      
      // Algoritmo simplificado de clustering para pontos de embarque
      // Em produção, usar Google Maps Directions API para otimização real
      const distanciaMax = parseFloat(rota.distancia_maxima_usuario) || 1.0;
      const pontosEmbarque: any[] = [];
      const enderecosSemPonto = [...enderecos];
      
      while (enderecosSemPonto.length > 0) {
        // Pegar primeiro endereço como centro do cluster
        const centro = enderecosSemPonto.shift()!;
        const cluster = [centro];
        
        // Agrupar endereços próximos (simulação - em produção usar distância real)
        const proximosIndices: number[] = [];
        enderecosSemPonto.forEach((end, idx) => {
          // Simulação: agrupar por proximidade de ordem (em produção usar lat/lng)
          if (Math.abs(end.ordem - centro.ordem) <= 3) {
            proximosIndices.push(idx);
            cluster.push(end);
          }
        });
        
        // Remover do array original (de trás pra frente)
        proximosIndices.reverse().forEach(idx => enderecosSemPonto.splice(idx, 1));
        
        // Criar ponto de embarque
        pontosEmbarque.push({
          id: pontosEmbarque.length + 1,
          nome: `Ponto ${pontosEmbarque.length + 1}`,
          endereco: centro.endereco,
          latitude: centro.latitude,
          longitude: centro.longitude,
          usuarios: cluster.map(c => ({
            id: c.id,
            nome: c.nome_usuario,
            endereco: c.endereco,
          })),
        });
      }
      
      // Salvar pontos de embarque
      await db.execute(sql`
        UPDATE rotas 
        SET pontos_embarque = ${JSON.stringify(pontosEmbarque)}, status = 'otimizada'
        WHERE id = ${input.rotaId}
      `);
      
      return { pontosEmbarque, totalPontos: pontosEmbarque.length };
    }),

  // Atualizar status da rota
  updateStatus: protectedProcedure
    .input(z.object({
      id: z.number(),
      status: z.enum(["rascunho", "otimizada", "ativa", "concluida"]),
    }))
    .mutation(async ({ input }) => {
      await db.execute(sql`
        UPDATE rotas SET status = ${input.status} WHERE id = ${input.id}
      `);
      return { success: true };
    }),

  // Excluir rota
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await db.execute(sql`DELETE FROM enderecos_rota WHERE rota_id = ${input.id}`);
      await db.execute(sql`DELETE FROM rotas WHERE id = ${input.id}`);
      return { success: true };
    }),

  // Inicializar tabelas (executar uma vez)
  initTables: protectedProcedure
    .mutation(async () => {
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS rotas (
          id INT AUTO_INCREMENT PRIMARY KEY,
          nome VARCHAR(255) NOT NULL,
          descricao TEXT,
          distancia_maxima_usuario DECIMAL(5,2) DEFAULT 1.0,
          tempo_maximo_rota INT DEFAULT 120,
          status ENUM('rascunho', 'otimizada', 'ativa', 'concluida') DEFAULT 'rascunho',
          pontos_embarque JSON,
          rota_otimizada JSON,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
      `);
      
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS enderecos_rota (
          id INT AUTO_INCREMENT PRIMARY KEY,
          rota_id INT NOT NULL,
          nome_usuario VARCHAR(255),
          endereco TEXT NOT NULL,
          latitude DECIMAL(10,8),
          longitude DECIMAL(11,8),
          ordem INT,
          ponto_embarque_id INT,
          distancia_ate_ponto DECIMAL(5,2),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      
      return { success: true };
    }),
});
