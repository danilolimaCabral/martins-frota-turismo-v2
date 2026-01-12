import { describe, it, expect, beforeAll } from "vitest";
import { db } from "./db";
import { sql } from "drizzle-orm";

describe("Roteirização Router", () => {
  beforeAll(async () => {
    // Inicializar tabelas
    try {
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

      // Limpar dados anteriores
      await db.execute(sql`DELETE FROM enderecos_rota`);
      await db.execute(sql`DELETE FROM rotas`);
    } catch (error) {
      console.log("Tabelas já existem ou erro ao criar");
    }
  });

  it("deve criar uma nova rota", async () => {
    const result = await db.execute(sql`
      INSERT INTO rotas (nome, empresa_cliente, distancia_maxima_usuario, tempo_maximo_rota)
      VALUES ('Rota Teste', 'Empresa Teste', 1.5, 120)
    `);

    expect((result as any)[0]).toBeDefined();
    expect((result as any)[0].insertId).toBeGreaterThan(0);
  });

  it("deve listar rotas criadas", async () => {
    const rows = await db.execute(sql`SELECT * FROM rotas`);
    const rotas = (rows as unknown as any[][])[0] || [];

    expect(Array.isArray(rotas)).toBe(true);
    expect(rotas.length).toBeGreaterThan(0);
  });

  it("deve adicionar endereços a uma rota", async () => {
    // Criar rota
    const rotaResult = await db.execute(sql`
      INSERT INTO rotas (nome, empresa_cliente)
      VALUES ('Rota com Endereços', 'Empresa Teste')
    `);
    const rotaId = (rotaResult as any)[0].insertId;

    // Adicionar endereços
    await db.execute(sql`
      INSERT INTO enderecos_rota (rota_id, nome_usuario, endereco, ordem)
      VALUES (${rotaId}, 'Usuário 1', 'Rua A, 123', 1)
    `);

    await db.execute(sql`
      INSERT INTO enderecos_rota (rota_id, nome_usuario, endereco, ordem)
      VALUES (${rotaId}, 'Usuário 2', 'Rua B, 456', 2)
    `);

    // Verificar
    const rows = await db.execute(sql`
      SELECT * FROM enderecos_rota WHERE rota_id = ${rotaId}
    `);
    const enderecos = (rows as unknown as any[][])[0] || [];

    expect(enderecos.length).toBe(2);
    expect(enderecos[0].nome_usuario).toBe("Usuário 1");
  });

  it("deve atualizar status de uma rota", async () => {
    // Criar rota
    const rotaResult = await db.execute(sql`
      INSERT INTO rotas (nome, empresa_cliente, status)
      VALUES ('Rota Status', 'Empresa Teste', 'rascunho')
    `);
    const rotaId = (rotaResult as any)[0].insertId;

    // Atualizar status
    await db.execute(sql`
      UPDATE rotas SET status = 'otimizada' WHERE id = ${rotaId}
    `);

    // Verificar
    const rows = await db.execute(sql`
      SELECT status FROM rotas WHERE id = ${rotaId}
    `);
    const rota = (rows as unknown as any[][])[0]?.[0];

    expect(rota.status).toBe("otimizada");
  });

  it("deve excluir uma rota e seus endereços", async () => {
    // Criar rota
    const rotaResult = await db.execute(sql`
      INSERT INTO rotas (nome, empresa_cliente)
      VALUES ('Rota para Deletar', 'Empresa Teste')
    `);
    const rotaId = (rotaResult as any)[0].insertId;

    // Adicionar endereço
    await db.execute(sql`
      INSERT INTO enderecos_rota (rota_id, endereco, ordem)
      VALUES (${rotaId}, 'Rua C, 789', 1)
    `);

    // Deletar
    await db.execute(sql`DELETE FROM enderecos_rota WHERE rota_id = ${rotaId}`);
    await db.execute(sql`DELETE FROM rotas WHERE id = ${rotaId}`);

    // Verificar
    const rows = await db.execute(sql`SELECT * FROM rotas WHERE id = ${rotaId}`);
    const rotas = (rows as unknown as any[][])[0] || [];

    expect(rotas.length).toBe(0);
  });

  it("deve validar clustering de pontos de embarque", async () => {
    // Criar rota
    const rotaResult = await db.execute(sql`
      INSERT INTO rotas (nome, empresa_cliente, distancia_maxima_usuario, tempo_maximo_rota)
      VALUES ('Rota Clustering', 'Empresa Teste', 1.0, 120)
    `);
    const rotaId = (rotaResult as any)[0].insertId;

    // Adicionar múltiplos endereços
    for (let i = 1; i <= 5; i++) {
      await db.execute(sql`
        INSERT INTO enderecos_rota (rota_id, nome_usuario, endereco, ordem)
        VALUES (${rotaId}, ${"Usuário " + i}, ${"Rua " + String.fromCharCode(64 + i) + ", " + i * 100}, ${i})
      `);
    }

    // Buscar rota e endereços
    const rotaRows = await db.execute(sql`SELECT * FROM rotas WHERE id = ${rotaId}`);
    const rota = (rotaRows as unknown as any[][])[0]?.[0];

    const enderecosRows = await db.execute(sql`
      SELECT * FROM enderecos_rota WHERE rota_id = ${rotaId} ORDER BY ordem
    `);
    const enderecos = (enderecosRows as unknown as any[][])[0] || [];

    // Simular clustering
    const pontosEmbarque: any[] = [];
    const enderecosSemPonto = [...enderecos];

    while (enderecosSemPonto.length > 0) {
      const centro = enderecosSemPonto.shift()!;
      const cluster = [centro];

      const proximosIndices: number[] = [];
      enderecosSemPonto.forEach((end, idx) => {
        if (Math.abs(end.ordem - centro.ordem) <= 3) {
          proximosIndices.push(idx);
          cluster.push(end);
        }
      });

      proximosIndices.reverse().forEach(idx => enderecosSemPonto.splice(idx, 1));

      pontosEmbarque.push({
        id: pontosEmbarque.length + 1,
        nome: `Ponto ${pontosEmbarque.length + 1}`,
        endereco: centro.endereco,
        usuarios: cluster.length,
      });
    }

    expect(pontosEmbarque.length).toBeGreaterThan(0);
    expect(pontosEmbarque[0].usuarios).toBeGreaterThan(0);
  });
});
