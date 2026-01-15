import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { db } from "./db";
import { medicaoPeriodos, medicaoConfiguracaoValores, medicaoViagens, vehicleTypes, cityConfigs } from "../drizzle/schema";
import { eq, and, gte, lte, desc } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

export const medicaoRouter = router({
  // ==================== PERÍODOS ====================
  
  // Listar períodos
  listPeriodos: protectedProcedure.query(async () => {
    return await db.select().from(medicaoPeriodos).orderBy(desc(medicaoPeriodos.ano), desc(medicaoPeriodos.mes));
  }),

  // Criar período
  createPeriodo: protectedProcedure
    .input(
      z.object({
        ano: z.number(),
        mes: z.number().min(1).max(12),
        dataInicio: z.string(),
        dataFim: z.string(),
        observacoes: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const result = await db.insert(medicaoPeriodos).values({
        ...input,
        createdBy: ctx.user.username,
      });
      return { success: true, id: result[0].insertId };
    }),

  // Fechar período
  fecharPeriodo: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      // Apenas admin pode fechar período
      if (ctx.user.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Apenas administradores podem fechar períodos" });
      }

      await db.update(medicaoPeriodos).set({ status: "fechado" }).where(eq(medicaoPeriodos.id, input.id));
      return { success: true };
    }),

  // ==================== CONFIGURAÇÃO DE VALORES ====================

  // Listar configurações de valores
  listConfiguracaoValores: protectedProcedure.query(async ({ ctx }) => {
    // Apenas admin vê valores
    if (ctx.user.role !== "admin") {
      throw new TRPCError({ code: "FORBIDDEN", message: "Apenas administradores podem ver valores" });
    }

    const configs = await db
      .select({
        id: medicaoConfiguracaoValores.id,
        vehicleTypeId: medicaoConfiguracaoValores.vehicleTypeId,
        vehicleTypeName: vehicleTypes.name,
        cityId: medicaoConfiguracaoValores.cityId,
        cityName: cityConfigs.name,
        turno: medicaoConfiguracaoValores.turno,
        valorViagem: medicaoConfiguracaoValores.valorViagem,
        ativo: medicaoConfiguracaoValores.ativo,
        observacoes: medicaoConfiguracaoValores.observacoes,
      })
      .from(medicaoConfiguracaoValores)
      .leftJoin(vehicleTypes, eq(medicaoConfiguracaoValores.vehicleTypeId, vehicleTypes.id))
      .leftJoin(cityConfigs, eq(medicaoConfiguracaoValores.cityId, cityConfigs.id))
      .where(eq(medicaoConfiguracaoValores.ativo, true));

    return configs;
  }),

  // Criar/Atualizar configuração de valor
  saveConfiguracaoValor: protectedProcedure
    .input(
      z.object({
        id: z.number().optional(),
        vehicleTypeId: z.number(),
        cityId: z.number(),
        turno: z.string(),
        valorViagem: z.number(),
        observacoes: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Apenas admin pode configurar valores
      if (ctx.user.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Apenas administradores podem configurar valores" });
      }

      if (input.id) {
        // Atualizar
        await db
          .update(medicaoConfiguracaoValores)
          .set({
            vehicleTypeId: input.vehicleTypeId,
            cityId: input.cityId,
            turno: input.turno,
            valorViagem: String(input.valorViagem),
            observacoes: input.observacoes,
          })
          .where(eq(medicaoConfiguracaoValores.id, input.id));
      } else {
        // Criar
        await db.insert(medicaoConfiguracaoValores).values({
          vehicleTypeId: input.vehicleTypeId,
          cityId: input.cityId,
          turno: input.turno,
          valorViagem: String(input.valorViagem),
          observacoes: input.observacoes,
        });
      }

      return { success: true };
    }),

  // Desativar configuração
  desativarConfiguracaoValor: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      if (ctx.user.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Apenas administradores podem desativar valores" });
      }

      await db.update(medicaoConfiguracaoValores).set({ ativo: false }).where(eq(medicaoConfiguracaoValores.id, input.id));
      return { success: true };
    }),

  // ==================== MARCAÇÃO DE VIAGENS ====================

  // Listar viagens por período
  listViagensPorPeriodo: protectedProcedure
    .input(z.object({ periodoId: z.number() }))
    .query(async ({ input, ctx }) => {
      const viagens = await db
        .select({
          id: medicaoViagens.id,
          data: medicaoViagens.data,
          diaSemana: medicaoViagens.diaSemana,
          turno: medicaoViagens.turno,
          vehicleTypeId: medicaoViagens.vehicleTypeId,
          vehicleTypeName: vehicleTypes.name,
          cityId: medicaoViagens.cityId,
          cityName: cityConfigs.name,
          tipoViagem: medicaoViagens.tipoViagem,
          quantidade: medicaoViagens.quantidade,
          valorUnitario: medicaoViagens.valorUnitario,
          valorTotal: medicaoViagens.valorTotal,
          observacoes: medicaoViagens.observacoes,
        })
        .from(medicaoViagens)
        .leftJoin(vehicleTypes, eq(medicaoViagens.vehicleTypeId, vehicleTypes.id))
        .leftJoin(cityConfigs, eq(medicaoViagens.cityId, cityConfigs.id))
        .where(eq(medicaoViagens.periodoId, input.periodoId))
        .orderBy(medicaoViagens.data);

      // Se não for admin, não retornar valores
      if (ctx.user.role !== "admin") {
        return viagens.map((v) => ({
          ...v,
          valorUnitario: null,
          valorTotal: null,
        }));
      }

      return viagens;
    }),

  // Marcar viagem
  marcarViagem: protectedProcedure
    .input(
      z.object({
        periodoId: z.number(),
        data: z.string(),
        diaSemana: z.string(),
        turno: z.string(),
        vehicleTypeId: z.number(),
        cityId: z.number(),
        tipoViagem: z.string(),
        quantidade: z.number(),
        observacoes: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Buscar valor configurado
      const config = await db
        .select()
        .from(medicaoConfiguracaoValores)
        .where(
          and(
            eq(medicaoConfiguracaoValores.vehicleTypeId, input.vehicleTypeId),
            eq(medicaoConfiguracaoValores.cityId, input.cityId),
            eq(medicaoConfiguracaoValores.turno, input.turno),
            eq(medicaoConfiguracaoValores.ativo, true)
          )
        )
        .limit(1);

      const valorUnitario = config[0]?.valorViagem ? Number(config[0].valorViagem) : 0;
      const valorTotal = valorUnitario * input.quantidade;

      // Verificar se já existe marcação para esse dia/turno/veículo/cidade/tipo
      const existente = await db
        .select()
        .from(medicaoViagens)
        .where(
          and(
            eq(medicaoViagens.periodoId, input.periodoId),
            eq(medicaoViagens.data, input.data),
            eq(medicaoViagens.turno, input.turno),
            eq(medicaoViagens.vehicleTypeId, input.vehicleTypeId),
            eq(medicaoViagens.cityId, input.cityId),
            eq(medicaoViagens.tipoViagem, input.tipoViagem)
          )
        )
        .limit(1);

      if (existente.length > 0) {
        // Atualizar
        await db
          .update(medicaoViagens)
          .set({
            quantidade: input.quantidade,
            valorUnitario: String(valorUnitario),
            valorTotal: String(valorTotal),
            observacoes: input.observacoes,
          })
          .where(eq(medicaoViagens.id, existente[0].id));
      } else {
        // Criar
        await db.insert(medicaoViagens).values({
          periodoId: input.periodoId,
          data: input.data,
          diaSemana: input.diaSemana,
          turno: input.turno,
          vehicleTypeId: input.vehicleTypeId,
          cityId: input.cityId,
          tipoViagem: input.tipoViagem,
          quantidade: input.quantidade,
          valorUnitario: String(valorUnitario),
          valorTotal: String(valorTotal),
          observacoes: input.observacoes,
          createdBy: ctx.user.username,
        });
      }

      return { success: true };
    }),

  // Deletar viagem
  deletarViagem: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await db.delete(medicaoViagens).where(eq(medicaoViagens.id, input.id));
      return { success: true };
    }),

  // ==================== RELATÓRIOS ====================

  // Gerar resumo mensal
  getResumoMensal: protectedProcedure
    .input(z.object({ periodoId: z.number() }))
    .query(async ({ input, ctx }) => {
      // Apenas admin vê resumo com valores
      if (ctx.user.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Apenas administradores podem ver resumo com valores" });
      }

      const viagens = await db
        .select()
        .from(medicaoViagens)
        .where(eq(medicaoViagens.periodoId, input.periodoId));

      // Agrupar por turno e tipo de veículo
      const resumo: Record<string, any> = {};

      viagens.forEach((v) => {
        const key = `${v.turno}_${v.vehicleTypeId}`;
        if (!resumo[key]) {
          resumo[key] = {
            turno: v.turno,
            vehicleTypeId: v.vehicleTypeId,
            totalViagens: 0,
            valorTotal: 0,
          };
        }
        resumo[key].totalViagens += v.quantidade;
        resumo[key].valorTotal += Number(v.valorTotal || 0);
      });

      return Object.values(resumo);
    }),

  // ==================== DADOS AUXILIARES ====================

  // Listar tipos de veículos
  listVehicleTypes: publicProcedure.query(async () => {
    return await db.select().from(vehicleTypes);
  }),

  // Listar cidades
  listCities: publicProcedure.query(async () => {
    return await db.select().from(cityConfigs);
  }),
});
