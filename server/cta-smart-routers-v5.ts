/**
 * Routers tRPC para CTA Smart - Versão 5 com Cache e Rate Limiting
 */

import { router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import {
  sincronizarAbastecimentosCTA,
  obterAbastecimentosRecentes,
  calcularEstatisticas,
} from "./cta-smart-service-v3";

export const ctaSmartRouter = router({
  /**
   * Sincroniza abastecimentos da API CTA Smart
   */
  sincronizar: protectedProcedure
    .input(
      z.object({
        token: z.string().min(1, "Token é obrigatório"),
        dataInicio: z.string().optional(),
        dataFim: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const resultado = await sincronizarAbastecimentosCTA(
          input.token,
          input.dataInicio,
          input.dataFim
        );

        return {
          sucesso: resultado.sucesso,
          mensagem: resultado.mensagem,
          total: resultado.total,
          importados: resultado.importados,
          erros: resultado.erros,
          abastecimentos: resultado.abastecimentos || [],
          fromCache: resultado.fromCache,
        };
      } catch (error) {
        return {
          sucesso: false,
          mensagem:
            error instanceof Error
              ? error.message
              : "Erro ao sincronizar abastecimentos",
          total: 0,
          importados: 0,
          erros: 1,
          abastecimentos: [],
        };
      }
    }),

  /**
   * Obtém abastecimentos recentes
   */
  obterRecentes: protectedProcedure
    .input(
      z.object({
        token: z.string().min(1, "Token é obrigatório"),
        dias: z.number().int().min(1).max(365).default(30),
      })
    )
    .query(async ({ input }) => {
      try {
        const resultado = await obterAbastecimentosRecentes(
          input.token,
          input.dias
        );

        return {
          sucesso: resultado.sucesso,
          mensagem: resultado.mensagem,
          total: resultado.total,
          abastecimentos: resultado.abastecimentos || [],
          fromCache: resultado.fromCache,
        };
      } catch (error) {
        return {
          sucesso: false,
          mensagem:
            error instanceof Error
              ? error.message
              : "Erro ao obter abastecimentos",
          total: 0,
          abastecimentos: [],
        };
      }
    }),

  /**
   * Calcula estatísticas de abastecimentos
   */
  calcularEstatisticas: protectedProcedure
    .input(
      z.object({
        token: z.string().min(1, "Token é obrigatório"),
        dias: z.number().int().min(1).max(365).default(30),
      })
    )
    .query(async ({ input }) => {
      try {
        const resultado = await obterAbastecimentosRecentes(
          input.token,
          input.dias
        );

        if (!resultado.sucesso || !resultado.abastecimentos) {
          return {
            sucesso: false,
            mensagem: "Erro ao obter dados para cálculo",
            estatisticas: null,
          };
        }

        const estatisticas = calcularEstatisticas(resultado.abastecimentos);

        return {
          sucesso: true,
          mensagem: "Estatísticas calculadas com sucesso",
          estatisticas,
        };
      } catch (error) {
        return {
          sucesso: false,
          mensagem:
            error instanceof Error
              ? error.message
              : "Erro ao calcular estatísticas",
          estatisticas: null,
        };
      }
    }),

  /**
   * Obtém KPIs de abastecimento
   */
  obterKPIs: protectedProcedure
    .input(
      z.object({
        token: z.string().min(1, "Token é obrigatório"),
        dias: z.number().int().min(1).max(365).default(30),
      })
    )
    .query(async ({ input }) => {
      try {
        const resultado = await obterAbastecimentosRecentes(
          input.token,
          input.dias
        );

        if (!resultado.sucesso || !resultado.abastecimentos) {
          return {
            sucesso: false,
            totalLitros: 0,
            custoTotal: 0,
            precoMedio: 0,
            registros: 0,
            veiculos: 0,
          };
        }

        const abastecimentos = resultado.abastecimentos;
        const placastotais = new Set(abastecimentos.map((a) => a.placa)).size;

        return {
          sucesso: true,
          totalLitros: abastecimentos.reduce((sum, a) => sum + a.litros, 0),
          custoTotal: abastecimentos.reduce((sum, a) => sum + a.valor, 0),
          precoMedio:
            abastecimentos.length > 0
              ? abastecimentos.reduce((sum, a) => sum + a.valor, 0) /
                abastecimentos.reduce((sum, a) => sum + a.litros, 0)
              : 0,
          registros: abastecimentos.length,
          veiculos: placastotais,
        };
      } catch (error) {
        return {
          sucesso: false,
          totalLitros: 0,
          custoTotal: 0,
          precoMedio: 0,
          registros: 0,
          veiculos: 0,
        };
      }
    }),

  /**
   * Lista abastecimentos com filtros
   */
  listar: protectedProcedure
    .input(
      z.object({
        token: z.string().min(1, "Token é obrigatório"),
        dias: z.number().int().min(1).max(365).default(30),
        placa: z.string().optional(),
        combustivel: z.string().optional(),
        limite: z.number().int().min(1).max(1000).default(100),
      })
    )
    .query(async ({ input }) => {
      try {
        const resultado = await obterAbastecimentosRecentes(
          input.token,
          input.dias
        );

        if (!resultado.sucesso || !resultado.abastecimentos) {
          return {
            sucesso: false,
            abastecimentos: [],
            total: 0,
          };
        }

        let abastecimentos = resultado.abastecimentos;

        // Aplicar filtros
        if (input.placa) {
          abastecimentos = abastecimentos.filter((a) =>
            a.placa.toUpperCase().includes(input.placa!.toUpperCase())
          );
        }

        if (input.combustivel) {
          abastecimentos = abastecimentos.filter((a) =>
            a.combustivel
              .toUpperCase()
              .includes(input.combustivel!.toUpperCase())
          );
        }

        // Limitar resultados
        abastecimentos = abastecimentos.slice(0, input.limite);

        return {
          sucesso: true,
          abastecimentos,
          total: abastecimentos.length,
        };
      } catch (error) {
        return {
          sucesso: false,
          abastecimentos: [],
          total: 0,
        };
      }
    }),

  /**
   * Resumo por veículo
   */
  resumoPorVeiculo: protectedProcedure
    .input(
      z.object({
        token: z.string().min(1, "Token é obrigatório"),
        dias: z.number().int().min(1).max(365).default(30),
      })
    )
    .query(async ({ input }) => {
      try {
        const resultado = await obterAbastecimentosRecentes(
          input.token,
          input.dias
        );

        if (!resultado.sucesso || !resultado.abastecimentos) {
          return {
            sucesso: false,
            resumo: [],
          };
        }

        const estatisticas = calcularEstatisticas(resultado.abastecimentos);

        return {
          sucesso: true,
          resumo: estatisticas.porVeiculo,
        };
      } catch (error) {
        return {
          sucesso: false,
          resumo: [],
        };
      }
    }),

  /**
   * Estatísticas por combustível
   */
  estatisticasPorCombustivel: protectedProcedure
    .input(
      z.object({
        token: z.string().min(1, "Token é obrigatório"),
        dias: z.number().int().min(1).max(365).default(30),
      })
    )
    .query(async ({ input }) => {
      try {
        const resultado = await obterAbastecimentosRecentes(
          input.token,
          input.dias
        );

        if (!resultado.sucesso || !resultado.abastecimentos) {
          return {
            sucesso: false,
            estatisticas: [],
          };
        }

        const estatisticas = calcularEstatisticas(resultado.abastecimentos);

        return {
          sucesso: true,
          estatisticas: estatisticas.porCombustivel,
        };
      } catch (error) {
        return {
          sucesso: false,
          estatisticas: [],
        };
      }
    }),
});
