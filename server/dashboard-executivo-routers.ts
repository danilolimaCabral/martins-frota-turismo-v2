import { protectedProcedure, router } from "./_core/trpc";
import { db } from "./db";
import { vehicles, fuelings, maintenances, expenses, trips, bookings } from "../drizzle/schema";
import { desc, sum, count, sql, and, gte, lte } from "drizzle-orm";

export const dashboardExecutivoRouter = router({
  // KPIs Principais
  getKPIs: protectedProcedure.query(async () => {
    try {
      // Receita total (últimos 6 meses)
      const receitaData = await db
        .select({
          total: sum(bookings.valorTotal).mapWith(Number),
        })
        .from(bookings)
        .where(
          gte(
            bookings.dataCriacao,
            new Date(new Date().setMonth(new Date().getMonth() - 6))
          )
        );

      const receita = receitaData[0]?.total || 0;

      // Custos totais (combustível + manutenção + despesas)
      const combustivelData = await db
        .select({
          total: sum(fuelings.valor).mapWith(Number),
        })
        .from(fuelings)
        .where(
          gte(
            fuelings.dataAbastecimento,
            new Date(new Date().setMonth(new Date().getMonth() - 6))
          )
        );

      const manutencaoData = await db
        .select({
          total: sum(maintenances.custoEstimado).mapWith(Number),
        })
        .from(maintenances)
        .where(
          gte(
            maintenances.dataPrevista,
            new Date(new Date().setMonth(new Date().getMonth() - 6))
          )
        );

      const despesasData = await db
        .select({
          total: sum(expenses.valor).mapWith(Number),
        })
        .from(expenses)
        .where(
          gte(
            expenses.dataDespesa,
            new Date(new Date().setMonth(new Date().getMonth() - 6))
          )
        );

      const custos =
        (combustivelData[0]?.total || 0) +
        (manutencaoData[0]?.total || 0) +
        (despesasData[0]?.total || 0);

      // Frota status
      const frotaStatus = await db
        .select({
          status: vehicles.status,
          count: count().mapWith(Number),
        })
        .from(vehicles)
        .groupBy(vehicles.status);

      const frotaAtiva = frotaStatus.find((f) => f.status === "ativo")?.count || 0;
      const frotaTotal = frotaStatus.reduce((acc, f) => acc + f.count, 0);

      // Taxa de ocupação
      const tripData = await db
        .select({
          totalPassageiros: sum(trips.passageirosConfirmados).mapWith(Number),
          totalCapacidade: sum(
            sql`${vehicles.capacity} * COUNT(DISTINCT ${trips.id})`
          ).mapWith(Number),
        })
        .from(trips)
        .innerJoin(vehicles, sql`${trips.veiculoId} = ${vehicles.id}`)
        .where(
          gte(
            trips.dataPartida,
            new Date(new Date().setMonth(new Date().getMonth() - 1))
          )
        );

      const ocupacao =
        tripData[0]?.totalCapacidade && tripData[0]?.totalCapacidade > 0
          ? Math.round(
              ((tripData[0]?.totalPassageiros || 0) /
                (tripData[0]?.totalCapacidade || 1)) *
                100
            )
          : 0;

      // Manutenções pendentes
      const manutencoesPendentes = await db
        .select({
          count: count().mapWith(Number),
        })
        .from(maintenances)
        .where(
          and(
            lte(maintenances.dataPrevista, new Date()),
            sql`${maintenances.status} != 'concluida'`
          )
        );

      return {
        receita,
        custos,
        lucro: receita - custos,
        margemLucro: receita > 0 ? ((receita - custos) / receita) * 100 : 0,
        frotaAtiva,
        frotaTotal,
        disponibilidade: frotaTotal > 0 ? (frotaAtiva / frotaTotal) * 100 : 0,
        taxaOcupacao: ocupacao,
        manutencoesPendentes: manutencoesPendentes[0]?.count || 0,
      };
    } catch (error) {
      console.error("Erro ao buscar KPIs:", error);
      return {
        receita: 0,
        custos: 0,
        lucro: 0,
        margemLucro: 0,
        frotaAtiva: 0,
        frotaTotal: 0,
        disponibilidade: 0,
        taxaOcupacao: 0,
        manutencoesPendentes: 0,
      };
    }
  }),

  // Dados de receita mensal
  getReceitaMensal: protectedProcedure.query(async () => {
    try {
      const dados = await db
        .select({
          mes: sql<string>`DATE_FORMAT(${bookings.dataCriacao}, '%Y-%m')`,
          total: sum(bookings.valorTotal).mapWith(Number),
        })
        .from(bookings)
        .where(
          gte(
            bookings.dataCriacao,
            new Date(new Date().setMonth(new Date().getMonth() - 6))
          )
        )
        .groupBy(sql`DATE_FORMAT(${bookings.dataCriacao}, '%Y-%m')`)
        .orderBy(sql`DATE_FORMAT(${bookings.dataCriacao}, '%Y-%m')`);

      return dados.map((d) => ({
        mes: d.mes,
        receita: d.total || 0,
      }));
    } catch (error) {
      console.error("Erro ao buscar receita mensal:", error);
      return [];
    }
  }),

  // Dados de custos por categoria
  getCustosPorCategoria: protectedProcedure.query(async () => {
    try {
      const combustivel = await db
        .select({
          total: sum(fuelings.valor).mapWith(Number),
        })
        .from(fuelings)
        .where(
          gte(
            fuelings.dataAbastecimento,
            new Date(new Date().setMonth(new Date().getMonth() - 1))
          )
        );

      const manutencao = await db
        .select({
          total: sum(maintenances.custoEstimado).mapWith(Number),
        })
        .from(maintenances)
        .where(
          gte(
            maintenances.dataPrevista,
            new Date(new Date().setMonth(new Date().getMonth() - 1))
          )
        );

      const despesas = await db
        .select({
          total: sum(expenses.valor).mapWith(Number),
        })
        .from(expenses)
        .where(
          gte(
            expenses.dataDespesa,
            new Date(new Date().setMonth(new Date().getMonth() - 1))
          )
        );

      return {
        combustivel: combustivel[0]?.total || 0,
        manutencao: manutencao[0]?.total || 0,
        despesas: despesas[0]?.total || 0,
      };
    } catch (error) {
      console.error("Erro ao buscar custos por categoria:", error);
      return {
        combustivel: 0,
        manutencao: 0,
        despesas: 0,
      };
    }
  }),

  // Status da frota
  getStatusFrota: protectedProcedure.query(async () => {
    try {
      const status = await db
        .select({
          status: vehicles.status,
          count: count().mapWith(Number),
        })
        .from(vehicles)
        .groupBy(vehicles.status);

      return {
        ativo: status.find((s) => s.status === "ativo")?.count || 0,
        manutencao: status.find((s) => s.status === "manutencao")?.count || 0,
        inativo: status.find((s) => s.status === "inativo")?.count || 0,
      };
    } catch (error) {
      console.error("Erro ao buscar status da frota:", error);
      return {
        ativo: 0,
        manutencao: 0,
        inativo: 0,
      };
    }
  }),

  // Taxa de ocupação mensal
  getTaxaOcupacaoMensal: protectedProcedure.query(async () => {
    try {
      const dados = await db
        .select({
          mes: sql<string>`DATE_FORMAT(${trips.dataPartida}, '%Y-%m')`,
          ocupacao: sql<number>`ROUND(AVG((${trips.passageirosConfirmados} / ${vehicles.capacity}) * 100), 2)`,
        })
        .from(trips)
        .innerJoin(vehicles, sql`${trips.veiculoId} = ${vehicles.id}`)
        .where(
          gte(
            trips.dataPartida,
            new Date(new Date().setMonth(new Date().getMonth() - 6))
          )
        )
        .groupBy(sql`DATE_FORMAT(${trips.dataPartida}, '%Y-%m')`)
        .orderBy(sql`DATE_FORMAT(${trips.dataPartida}, '%Y-%m')`);

      return dados.map((d) => ({
        mes: d.mes,
        ocupacao: d.ocupacao || 0,
      }));
    } catch (error) {
      console.error("Erro ao buscar taxa de ocupação mensal:", error);
      return [];
    }
  }),
});
