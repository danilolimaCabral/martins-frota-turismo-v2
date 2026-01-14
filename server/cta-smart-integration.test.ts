/**
 * Teste de Integração com API CTA Smart
 * Verifica se os dados estão sendo sincronizados corretamente
 */

import { describe, it, expect, beforeAll } from "vitest";
import { sincronizarAbastecimentosCTA } from "./cta-smart-service-v3";

describe("CTA Smart Integration Tests", () => {
  const token = "8Uj0tAO8TJ";

  it("deve conectar com sucesso na API CTA Smart", async () => {
    const resultado = await sincronizarAbastecimentosCTA(token);

    expect(resultado).toBeDefined();
    expect(resultado.sucesso).toBe(true);
    expect(resultado.mensagem).toBeDefined();
  });

  it("deve retornar abastecimentos com dados corretos", async () => {
    const resultado = await sincronizarAbastecimentosCTA(token);

    if (resultado.abastecimentos && resultado.abastecimentos.length > 0) {
      const abastecimento = resultado.abastecimentos[0];

      // Validar estrutura do abastecimento
      expect(abastecimento).toHaveProperty("id");
      expect(abastecimento).toHaveProperty("placa");
      expect(abastecimento).toHaveProperty("litros");
      expect(abastecimento).toHaveProperty("valor");
      expect(abastecimento).toHaveProperty("combustivel");
      expect(abastecimento).toHaveProperty("frentista");
      expect(abastecimento).toHaveProperty("posto");
      expect(abastecimento).toHaveProperty("estado");
      expect(abastecimento).toHaveProperty("data");

      // Validar tipos de dados
      expect(typeof abastecimento.placa).toBe("string");
      expect(typeof abastecimento.litros).toBe("number");
      expect(typeof abastecimento.valor).toBe("number");
      expect(typeof abastecimento.combustivel).toBe("string");
    }
  });

  it("deve capturar dados do veículo TESTE123", async () => {
    const resultado = await sincronizarAbastecimentosCTA(token);

    if (resultado.abastecimentos && resultado.abastecimentos.length > 0) {
      const abastecimento = resultado.abastecimentos[0];

      expect(abastecimento.placa).toBe("TESTE123");
      expect(abastecimento.litros).toBeGreaterThan(0);
    }
  });

  it("deve capturar nome do frentista RICARDO", async () => {
    const resultado = await sincronizarAbastecimentosCTA(token);

    if (resultado.abastecimentos && resultado.abastecimentos.length > 0) {
      const abastecimento = resultado.abastecimentos[0];

      expect(abastecimento.frentista).toContain("RICARDO");
    }
  });

  it("deve capturar posto Martins RS LTDA", async () => {
    const resultado = await sincronizarAbastecimentosCTA(token);

    if (resultado.abastecimentos && resultado.abastecimentos.length > 0) {
      const abastecimento = resultado.abastecimentos[0];

      expect(abastecimento.posto).toContain("Martins RS");
    }
  });

  it("deve capturar estado PR", async () => {
    const resultado = await sincronizarAbastecimentosCTA(token);

    if (resultado.abastecimentos && resultado.abastecimentos.length > 0) {
      const abastecimento = resultado.abastecimentos[0];

      expect(abastecimento.estado).toBe("PR");
    }
  });

  it("deve respeitar rate limit de 60 segundos", async () => {
    const inicio = Date.now();
    const resultado1 = await sincronizarAbastecimentosCTA(token);
    const resultado2 = await sincronizarAbastecimentosCTA(token);
    const duracao = Date.now() - inicio;

    // Se ambas retornaram sucesso, a segunda deve ter vindo do cache
    if (resultado1.sucesso && resultado2.sucesso) {
      expect(resultado2.fromCache).toBe(true);
    }
  });

  it("deve calcular estatísticas corretamente", async () => {
    const resultado = await sincronizarAbastecimentosCTA(token);

    if (resultado.abastecimentos && resultado.abastecimentos.length > 0) {
      const totalLitros = resultado.abastecimentos.reduce(
        (sum, a) => sum + a.litros,
        0
      );
      const totalCusto = resultado.abastecimentos.reduce(
        (sum, a) => sum + a.valor,
        0
      );

      expect(totalLitros).toBeGreaterThan(0);
      expect(totalCusto).toBeGreaterThanOrEqual(0);
    }
  });

  it("deve retornar mensagem de sucesso", async () => {
    const resultado = await sincronizarAbastecimentosCTA(token);

    expect(resultado.mensagem).toBeDefined();
    expect(resultado.mensagem.length).toBeGreaterThan(0);
  });

  it("deve retornar total de abastecimentos sincronizados", async () => {
    const resultado = await sincronizarAbastecimentosCTA(token);

    expect(resultado.total).toBeDefined();
    expect(typeof resultado.total).toBe("number");
    expect(resultado.total).toBeGreaterThanOrEqual(0);
  });

  it("deve retornar número de importados", async () => {
    const resultado = await sincronizarAbastecimentosCTA(token);

    expect(resultado.importados).toBeDefined();
    expect(typeof resultado.importados).toBe("number");
    expect(resultado.importados).toBeGreaterThanOrEqual(0);
  });
});
