import { describe, it, expect } from "vitest";
import {
  sincronizarAbastecimentosCTA,
  obterAbastecimentosRecentes,
  calcularEstatisticas,
} from "./cta-smart-service-v2";

describe("CTA Smart Integration", () => {
  const token = "8Uj0tAO8TJ";

  it("deve sincronizar abastecimentos da API CTA Smart", async () => {
    const resultado = await sincronizarAbastecimentosCTA(token);

    console.log("Resultado da sincronização:", JSON.stringify(resultado, null, 2));

    expect(resultado).toBeDefined();
    expect(resultado.sucesso).toBe(true);
    expect(resultado.total).toBeGreaterThanOrEqual(0);
    expect(Array.isArray(resultado.abastecimentos)).toBe(true);
  });

  it("deve obter abastecimentos recentes", async () => {
    const resultado = await obterAbastecimentosRecentes(token, 30);

    console.log("Abastecimentos recentes:", JSON.stringify(resultado, null, 2));

    expect(resultado).toBeDefined();
    expect(resultado.sucesso).toBe(true);
    expect(Array.isArray(resultado.abastecimentos)).toBe(true);

    if (resultado.abastecimentos && resultado.abastecimentos.length > 0) {
      const primeiro = resultado.abastecimentos[0];
      console.log("Primeiro abastecimento:", JSON.stringify(primeiro, null, 2));

      expect(primeiro.id).toBeDefined();
      expect(primeiro.placa).toBeDefined();
      expect(primeiro.litros).toBeGreaterThanOrEqual(0);
      expect(primeiro.valor).toBeGreaterThanOrEqual(0);
    }
  });

  it("deve calcular estatísticas corretamente", async () => {
    const resultado = await obterAbastecimentosRecentes(token, 30);

    if (resultado.abastecimentos && resultado.abastecimentos.length > 0) {
      const stats = calcularEstatisticas(resultado.abastecimentos);

      console.log("Estatísticas calculadas:", JSON.stringify(stats, null, 2));

      expect(stats.totalLitros).toBeGreaterThanOrEqual(0);
      expect(stats.totalValor).toBeGreaterThanOrEqual(0);
      expect(stats.precoMedio).toBeGreaterThanOrEqual(0);
      expect(stats.quantidade).toBeGreaterThan(0);
      expect(Array.isArray(stats.porVeiculo)).toBe(true);
      expect(Array.isArray(stats.porCombustivel)).toBe(true);
    }
  });

  it("deve retornar dados com estrutura correta", async () => {
    const resultado = await obterAbastecimentosRecentes(token, 7);

    if (resultado.abastecimentos && resultado.abastecimentos.length > 0) {
      const abastecimento = resultado.abastecimentos[0];

      console.log("Estrutura do abastecimento:", {
        id: typeof abastecimento.id,
        data: typeof abastecimento.data,
        hora: typeof abastecimento.hora,
        placa: typeof abastecimento.placa,
        motorista: typeof abastecimento.motorista,
        combustivel: typeof abastecimento.combustivel,
        litros: typeof abastecimento.litros,
        valor: typeof abastecimento.valor,
        odometro: typeof abastecimento.odometro,
        posto: typeof abastecimento.posto,
        cidade: typeof abastecimento.cidade,
        estado: typeof abastecimento.estado,
      });

      expect(typeof abastecimento.id).toBe("string");
      expect(typeof abastecimento.placa).toBe("string");
      expect(typeof abastecimento.litros).toBe("number");
      expect(typeof abastecimento.valor).toBe("number");
      expect(typeof abastecimento.odometro).toBe("number");
    }
  });
});
