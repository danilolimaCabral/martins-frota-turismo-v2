import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { db } from "./db";
import { funcionarios, vehicles, folhasPagamento, itensFolha, contasPagar, contasReceber, movimentacoesCaixa } from "../drizzle/schema";
import { eq, and, desc, sql } from "drizzle-orm";

/**
 * Router tRPC para Geração de Relatórios
 * 
 * Endpoints:
 * - relatorioFinanceiro: Relatório financeiro geral
 * - relatorioFolhaPagamento: Relatório de folha de pagamento
 * - relatorioCustosOperacionais: Relatório de custos operacionais
 * - relatorioFuncionarios: Relatório de funcionários
 * - relatorioVeiculos: Relatório de veículos
 */

export const relatoriosRouter = router({
  /**
   * Relatório Financeiro Geral
   */
  relatorioFinanceiro: protectedProcedure
    .input(
      z.object({
        dataInicio: z.string(),
        dataFim: z.string(),
      })
    )
    .query(async ({ input }) => {
      // Buscar contas a pagar
      const contasPagarResult = await db
        .select({
          total: sql<number>`COALESCE(SUM(valor), 0)`,
          totalPago: sql<number>`COALESCE(SUM(CASE WHEN status = 'pago' THEN valor ELSE 0 END), 0)`,
          totalPendente: sql<number>`COALESCE(SUM(CASE WHEN status = 'pendente' THEN valor ELSE 0 END), 0)`,
        })
        .from(contasPagar)
        .where(
          and(
            sql`data_vencimento >= ${input.dataInicio}`,
            sql`data_vencimento <= ${input.dataFim}`
          )
        );

      // Buscar contas a receber
      const contasReceberResult = await db
        .select({
          total: sql<number>`COALESCE(SUM(valor), 0)`,
          totalRecebido: sql<number>`COALESCE(SUM(CASE WHEN status = 'recebido' THEN valor ELSE 0 END), 0)`,
          totalPendente: sql<number>`COALESCE(SUM(CASE WHEN status = 'pendente' THEN valor ELSE 0 END), 0)`,
        })
        .from(contasReceber)
        .where(
          and(
            sql`data_vencimento >= ${input.dataInicio}`,
            sql`data_vencimento <= ${input.dataFim}`
          )
        );

      // Buscar movimentações de caixa
      const movimentacoesResult = await db
        .select({
          totalEntradas: sql<number>`COALESCE(SUM(CASE WHEN tipo = 'entrada' THEN valor ELSE 0 END), 0)`,
          totalSaidas: sql<number>`COALESCE(SUM(CASE WHEN tipo = 'saida' THEN valor ELSE 0 END), 0)`,
        })
        .from(movimentacoesCaixa)
        .where(
          and(
            sql`data >= ${input.dataInicio}`,
            sql`data <= ${input.dataFim}`
          )
        );

      // Detalhamento por categoria
      const despesasPorCategoria = await db
        .select({
          categoriaId: contasPagar.categoriaId,
          total: sql<number>`COALESCE(SUM(valor), 0)`,
        })
        .from(contasPagar)
        .where(
          and(
            sql`data_vencimento >= ${input.dataInicio}`,
            sql`data_vencimento <= ${input.dataFim}`
          )
        )
        .groupBy(contasPagar.categoriaId);

      const receitasPorCategoria = await db
        .select({
          categoriaId: contasReceber.categoriaId,
          total: sql<number>`COALESCE(SUM(valor), 0)`,
        })
        .from(contasReceber)
        .where(
          and(
            sql`data_vencimento >= ${input.dataInicio}`,
            sql`data_vencimento <= ${input.dataFim}`
          )
        )
        .groupBy(contasReceber.categoriaId);

      return {
        periodo: { inicio: input.dataInicio, fim: input.dataFim },
        resumo: {
          totalDespesas: contasPagarResult[0]?.total || 0,
          despesasPagas: contasPagarResult[0]?.totalPago || 0,
          despesasPendentes: contasPagarResult[0]?.totalPendente || 0,
          totalReceitas: contasReceberResult[0]?.total || 0,
          receitasRecebidas: contasReceberResult[0]?.totalRecebido || 0,
          receitasPendentes: contasReceberResult[0]?.totalPendente || 0,
          saldoCaixa: (movimentacoesResult[0]?.totalEntradas || 0) - (movimentacoesResult[0]?.totalSaidas || 0),
          lucroLiquido: (contasReceberResult[0]?.totalRecebido || 0) - (contasPagarResult[0]?.totalPago || 0),
        },
        despesasPorCategoria: despesasPorCategoria.map(d => ({ categoria: `Categoria ${d.categoriaId}`, total: d.total })),
        receitasPorCategoria: receitasPorCategoria.map(r => ({ categoria: `Categoria ${r.categoriaId}`, total: r.total })),
        geradoEm: new Date().toISOString(),
      };
    }),

  /**
   * Relatório de Folha de Pagamento
   */
  relatorioFolhaPagamento: protectedProcedure
    .input(
      z.object({
        mes: z.number().min(1).max(12),
        ano: z.number(),
      })
    )
    .query(async ({ input }) => {
      // Buscar folhas do mês
      const folhas = await db
        .select()
        .from(folhasPagamento)
        .where(
          and(
            eq(folhasPagamento.mesReferencia, input.mes),
            eq(folhasPagamento.anoReferencia, input.ano)
          )
        );

      // Buscar itens da folha com funcionários
      const itens = await db
        .select({
          item: itensFolha,
          funcionario: funcionarios,
        })
        .from(itensFolha)
        .leftJoin(funcionarios, eq(itensFolha.funcionarioId, funcionarios.id))
        .where(
          sql`${itensFolha.folhaId} IN (SELECT id FROM folhas_pagamento WHERE mes_referencia = ${input.mes} AND ano_referencia = ${input.ano})`
        );

      // Calcular totais
      let totalBruto = 0;
      let totalDescontos = 0;
      let totalLiquido = 0;
      let totalINSS = 0;
      let totalIRRF = 0;
      let totalFGTS = 0;

      const detalhamento = itens.map(i => {
        const salarioBase = parseFloat(i.item.salarioBase?.toString() || "0");
        const inss = parseFloat(i.item.inss?.toString() || "0");
        const irrf = parseFloat(i.item.irrf?.toString() || "0");
        const fgts = parseFloat(i.item.fgts?.toString() || "0");
        const totalProventos = parseFloat(i.item.totalProventos?.toString() || "0");
        const totalDesc = parseFloat(i.item.totalDescontos?.toString() || "0");
        const liquido = parseFloat(i.item.salarioLiquido?.toString() || "0");

        totalBruto += totalProventos;
        totalDescontos += totalDesc;
        totalLiquido += liquido;
        totalINSS += inss;
        totalIRRF += irrf;
        totalFGTS += fgts;

        return {
          funcionarioId: i.item.funcionarioId,
          funcionarioNome: i.funcionario?.nome || "N/A",
          cargo: i.funcionario?.cargo || "N/A",
          salarioBase,
          totalProventos,
          totalDescontos: totalDesc,
          salarioLiquido: liquido,
          inss,
          irrf,
          fgts,
        };
      });

      return {
        periodo: { mes: input.mes, ano: input.ano },
        resumo: {
          totalFuncionarios: itens.length,
          totalBruto,
          totalDescontos,
          totalLiquido,
          totalINSS,
          totalIRRF,
          totalFGTS,
          custoTotal: totalBruto + totalFGTS,
        },
        detalhamento,
        geradoEm: new Date().toISOString(),
      };
    }),

  /**
   * Relatório de Custos Operacionais
   */
  relatorioCustosOperacionais: protectedProcedure
    .input(
      z.object({
        dataInicio: z.string(),
        dataFim: z.string(),
      })
    )
    .query(async ({ input }) => {
      // Buscar veículos
      const veiculosResult = await db.select().from(vehicles);

      // Buscar despesas operacionais (combustível, manutenção, etc)
      const despesasOperacionais = await db
        .select({
          categoriaId: contasPagar.categoriaId,
          total: sql<number>`COALESCE(SUM(valor), 0)`,
          count: sql<number>`COUNT(*)`,
        })
        .from(contasPagar)
        .where(
          and(
            sql`data_vencimento >= ${input.dataInicio}`,
            sql`data_vencimento <= ${input.dataFim}`
          )
        )
        .groupBy(contasPagar.categoriaId);

      // Custos com pessoal (folha)
      const custosPessoal = await db
        .select({
          total: sql<number>`COALESCE(SUM(total_liquido), 0)`,
        })
        .from(folhasPagamento)
        .where(
          and(
            sql`CONCAT(ano_referencia, '-', LPAD(mes_referencia, 2, '0'), '-01') >= ${input.dataInicio}`,
            sql`CONCAT(ano_referencia, '-', LPAD(mes_referencia, 2, '0'), '-01') <= ${input.dataFim}`
          )
        );

      // Calcular totais
      const totalDespesasOperacionais = despesasOperacionais.reduce((acc, d) => acc + (d.total || 0), 0);
      const totalPessoal = custosPessoal[0]?.total || 0;

      return {
        periodo: { inicio: input.dataInicio, fim: input.dataFim },
        resumo: {
          totalVeiculos: veiculosResult.length,
          totalDespesasOperacionais,
          totalCustosPessoal: totalPessoal,
          custoTotalOperacional: totalDespesasOperacionais + totalPessoal,
          custoMedioPorVeiculo: veiculosResult.length > 0 ? totalDespesasOperacionais / veiculosResult.length : 0,
        },
        despesasPorCategoria: despesasOperacionais.map(d => ({ categoria: `Categoria ${d.categoriaId}`, total: d.total })),
        custosPessoal: {
          salarios: totalPessoal,
          encargos: 0,
        },
        geradoEm: new Date().toISOString(),
      };
    }),

  /**
   * Relatório de Funcionários
   */
  relatorioFuncionarios: protectedProcedure
    .query(async () => {
      const funcionariosResult = await db
        .select()
        .from(funcionarios)
        .orderBy(funcionarios.nome);

      // Agrupar por cargo
      const porCargo: Record<string, number> = {};
      const porStatus: Record<string, number> = {};

      funcionariosResult.forEach(f => {
        const cargo = f.cargo || "Não definido";
        const status = f.status || "ativo";
        porCargo[cargo] = (porCargo[cargo] || 0) + 1;
        porStatus[status] = (porStatus[status] || 0) + 1;
      });

      // Verificar documentos vencendo
      const hoje = new Date();
      const em30Dias = new Date();
      em30Dias.setDate(em30Dias.getDate() + 30);

      const documentosVencendo = funcionariosResult.filter(f => {
        if (f.cnhValidade) {
          const validade = new Date(f.cnhValidade);
          return validade <= em30Dias;
        }
        return false;
      });

      return {
        resumo: {
          totalFuncionarios: funcionariosResult.length,
          ativos: porStatus["ativo"] || 0,
          inativos: porStatus["inativo"] || 0,
          afastados: porStatus["afastado"] || 0,
          documentosVencendo: documentosVencendo.length,
        },
        porCargo: Object.entries(porCargo).map(([cargo, total]) => ({ cargo, total })),
        porStatus: Object.entries(porStatus).map(([status, total]) => ({ status, total })),
        documentosVencendo: documentosVencendo.map(f => ({
          id: f.id,
          nome: f.nome,
          documento: "CNH",
          validade: f.cnhValidade,
        })),
        lista: funcionariosResult,
        geradoEm: new Date().toISOString(),
      };
    }),

  /**
   * Relatório de Veículos
   */
  relatorioVeiculos: protectedProcedure
    .query(async () => {
      const veiculosResult = await db
        .select()
        .from(vehicles)
        .orderBy(vehicles.plate);

      // Agrupar por tipo
      const porTipo: Record<string, number> = {};
      const porStatus: Record<string, number> = {};

      veiculosResult.forEach(v => {
        const tipo = v.type || "Não definido";
        const status = v.status || "disponivel";
        porTipo[tipo] = (porTipo[tipo] || 0) + 1;
        porStatus[status] = (porStatus[status] || 0) + 1;
      });

      // Verificar documentos vencendo
      const hoje = new Date();
      const em30Dias = new Date();
      em30Dias.setDate(em30Dias.getDate() + 30);

      const documentosVencendo = veiculosResult.filter(v => {
        // Verificar ANTT, DER, Cadastur
        const verificar = [v.anttExpiry, v.derExpiry, v.cadasturExpiry];
        return verificar.some(data => {
          if (data) {
            const validade = new Date(data);
            return validade <= em30Dias;
          }
          return false;
        });
      });

      return {
        resumo: {
          totalVeiculos: veiculosResult.length,
          disponiveis: porStatus["disponivel"] || 0,
          emViagem: porStatus["em_viagem"] || 0,
          emManutencao: porStatus["manutencao"] || 0,
          documentosVencendo: documentosVencendo.length,
        },
        porTipo: Object.entries(porTipo).map(([tipo, total]) => ({ tipo, total })),
        porStatus: Object.entries(porStatus).map(([status, total]) => ({ status, total })),
        documentosVencendo: documentosVencendo.map(v => ({
          id: v.id,
          placa: v.plate,
          modelo: v.model,
          documentos: [
            v.anttExpiry && new Date(v.anttExpiry) <= em30Dias ? "ANTT" : null,
            v.derExpiry && new Date(v.derExpiry) <= em30Dias ? "DER" : null,
            v.cadasturExpiry && new Date(v.cadasturExpiry) <= em30Dias ? "Cadastur" : null,
          ].filter(Boolean),
        })),
        lista: veiculosResult,
        geradoEm: new Date().toISOString(),
      };
    }),
});
