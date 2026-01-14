/**
 * Router para sincronização com API CTA Smart - Versão 2
 * Com KPIs e listagens agregadas
 */

import { router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import {
  sincronizarTodosAbastecimentos,
  fetchCTASmartAbastecimentos,
  informarStatusCTASmart,
} from "./cta-smart-sync";
import { db } from "./db";
import { fuelings, vehicles } from "../drizzle/schema";
import { sum, count, eq, and, gte, lte } from "drizzle-orm";

export const ctaSmartRouterV2 = router({
  /**
   * Retorna KPIs agregados de abastecimentos
   */
  obterKPIsAbastecimentos: protectedProcedure.query(async () => {
    try {
      const resultado = await db
        .select({
          totalLitros: sum(fuelings.liters),
          totalCusto: sum(fuelings.totalCost),
          precoMedio: sum(fuelings.pricePerLiter),
          totalRegistros: count(),
        })
        .from(fuelings);

      const dados = resultado[0];
      const totalLitros = Number(dados.totalLitros) || 0;
      const totalCusto = Number(dados.totalCusto) || 0;
      const precoMedio = totalLitros > 0 ? totalCusto / totalLitros : 0;

      return {
        sucesso: true,
        totalLitros: parseFloat(totalLitros.toFixed(2)),
        totalCusto: parseFloat(totalCusto.toFixed(2)),
        precoMedio: parseFloat(precoMedio.toFixed(2)),
        totalRegistros: dados.totalRegistros || 0,
      };
    } catch (error) {
      return {
        sucesso: false,
        totalLitros: 0,
        totalCusto: 0,
        precoMedio: 0,
        totalRegistros: 0,
        erro: error instanceof Error ? error.message : "Erro ao obter KPIs",
      };
    }
  }),

  /**
   * Retorna lista de abastecimentos com filtros
   */
  listarAbastecimentos: protectedProcedure
    .input(
      z.object({
        veiculoId: z.number().optional(),
        tipoCombustivel: z.string().optional(),
        dataInicio: z.string().optional(),
        dataFim: z.string().optional(),
        limite: z.number().default(50),
      })
    )
    .query(async ({ input }) => {
      try {
        const filtros = [];

        if (input.veiculoId) {
          filtros.push(eq(fuelings.vehicleId, input.veiculoId));
        }

        if (input.tipoCombustivel) {
          filtros.push(eq(fuelings.fuelType, input.tipoCombustivel));
        }

        if (input.dataInicio) {
          filtros.push(gte(fuelings.date, new Date(input.dataInicio)));
        }

        if (input.dataFim) {
          filtros.push(lte(fuelings.date, new Date(input.dataFim)));
        }

        const abastecimentos = await db
          .select({
            id: fuelings.id,
            veiculo: vehicles.plate,
            data: fuelings.date,
            km: fuelings.km,
            litros: fuelings.liters,
            valorLitro: fuelings.pricePerLiter,
            valorTotal: fuelings.totalCost,
            tipoCombustivel: fuelings.fuelType,
            posto: fuelings.station,
            cidade: fuelings.city,
          })
          .from(fuelings)
          .innerJoin(vehicles, eq(fuelings.vehicleId, vehicles.id))
          .where(filtros.length > 0 ? and(...filtros) : undefined)
          .limit(input.limite);

        return {
          sucesso: true,
          registros: abastecimentos,
          total: abastecimentos.length,
        };
      } catch (error) {
        return {
          sucesso: false,
          registros: [],
          erro: error instanceof Error ? error.message : "Erro ao listar abastecimentos",
        };
      }
    }),

  /**
   * Retorna resumo por veículo
   */
  resumoPorVeiculo: protectedProcedure.query(async () => {
    try {
      const veiculos = await db
        .selectDistinct({ id: vehicles.id, placa: vehicles.plate })
        .from(vehicles);

      const resumo = await Promise.all(
        veiculos.map(async (veiculo) => {
          const dados = await db
            .select({
              totalLitros: sum(fuelings.liters),
              totalCusto: sum(fuelings.totalCost),
              totalRegistros: count(),
            })
            .from(fuelings)
            .where(eq(fuelings.vehicleId, veiculo.id));

          const d = dados[0];
          return {
            veiculoId: veiculo.id,
            placa: veiculo.placa,
            totalLitros: Number(d.totalLitros) || 0,
            totalCusto: Number(d.totalCusto) || 0,
            totalRegistros: d.totalRegistros || 0,
          };
        })
      );

      return {
        sucesso: true,
        resumo: resumo.filter((r) => r.totalRegistros > 0),
      };
    } catch (error) {
      return {
        sucesso: false,
        resumo: [],
        erro: error instanceof Error ? error.message : "Erro ao obter resumo",
      };
    }
  }),

  /**
   * Retorna estatísticas por tipo de combustível
   */
  estatisticasPorCombustivel: protectedProcedure.query(async () => {
    try {
      const dados = await db
        .select({
          tipoCombustivel: fuelings.fuelType,
          totalLitros: sum(fuelings.liters),
          totalCusto: sum(fuelings.totalCost),
          precoMedio: sum(fuelings.pricePerLiter),
          totalRegistros: count(),
        })
        .from(fuelings)
        .groupBy(fuelings.fuelType);

      return {
        sucesso: true,
        dados: dados.map((d) => ({
          tipoCombustivel: d.tipoCombustivel,
          totalLitros: Number(d.totalLitros) || 0,
          totalCusto: Number(d.totalCusto) || 0,
          precoMedio: d.totalRegistros > 0 ? (Number(d.precoMedio) || 0) / d.totalRegistros : 0,
          totalRegistros: d.totalRegistros || 0,
        })),
      };
    } catch (error) {
      return {
        sucesso: false,
        dados: [],
        erro: error instanceof Error ? error.message : "Erro ao obter estatísticas",
      };
    }
  }),

  /**
   * Retorna abastecimentos recentes
   */
  abastecimentosRecentes: protectedProcedure
    .input(z.object({ dias: z.number().default(30) }))
    .query(async ({ input }) => {
      try {
        const dataInicio = new Date();
        dataInicio.setDate(dataInicio.getDate() - input.dias);

        const abastecimentos = await db
          .select({
            id: fuelings.id,
            veiculo: vehicles.plate,
            data: fuelings.date,
            km: fuelings.km,
            litros: fuelings.liters,
            valorLitro: fuelings.pricePerLiter,
            valorTotal: fuelings.totalCost,
            tipoCombustivel: fuelings.fuelType,
            posto: fuelings.station,
            cidade: fuelings.city,
          })
          .from(fuelings)
          .innerJoin(vehicles, eq(fuelings.vehicleId, vehicles.id))
          .where(gte(fuelings.date, dataInicio))
          .limit(100);

        return {
          sucesso: true,
          registros: abastecimentos,
          total: abastecimentos.length,
        };
      } catch (error) {
        return {
          sucesso: false,
          registros: [],
          erro: error instanceof Error ? error.message : "Erro ao listar abastecimentos recentes",
        };
      }
    }),
});
