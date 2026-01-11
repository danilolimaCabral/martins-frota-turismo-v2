import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { db } from "./db";
import { ferias, saldoFerias, funcionarios } from "../drizzle/schema";
import { eq, and, desc, sql } from "drizzle-orm";

/**
 * Router tRPC para Módulo de Férias
 * 
 * Endpoints:
 * - list: Listar férias
 * - getById: Buscar férias por ID
 * - solicitar: Solicitar férias
 * - aprovar: Aprovar/reprovar férias
 * - cancelar: Cancelar férias
 * - getSaldo: Buscar saldo de férias
 * - calcularSaldo: Calcular saldo de férias
 */

export const feriasRouter = router({
  /**
   * Listar férias
   */
  list: protectedProcedure
    .input(
      z.object({
        funcionarioId: z.number().optional(),
        status: z.enum(["solicitado", "aprovado", "reprovado", "em_gozo", "concluido", "cancelado", "todos"]).optional(),
      }).optional()
    )
    .query(async ({ input }) => {
      const conditions = [];

      if (input?.funcionarioId) {
        conditions.push(eq(ferias.funcionarioId, input.funcionarioId));
      }

      if (input?.status && input.status !== "todos") {
        conditions.push(eq(ferias.status, input.status));
      }

      const results = await db
        .select({
          ferias: ferias,
          funcionario: funcionarios,
        })
        .from(ferias)
        .leftJoin(funcionarios, eq(ferias.funcionarioId, funcionarios.id))
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .orderBy(desc(ferias.dataInicio));

      return results.map(r => ({
        ...r.ferias,
        funcionarioNome: r.funcionario?.nome,
      }));
    }),

  /**
   * Buscar férias por ID
   */
  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const result = await db
        .select({
          ferias: ferias,
          funcionario: funcionarios,
        })
        .from(ferias)
        .leftJoin(funcionarios, eq(ferias.funcionarioId, funcionarios.id))
        .where(eq(ferias.id, input.id))
        .limit(1);

      if (result.length === 0) {
        throw new Error("Férias não encontradas");
      }

      return {
        ...result[0].ferias,
        funcionarioNome: result[0].funcionario?.nome,
      };
    }),

  /**
   * Solicitar férias
   */
  solicitar: protectedProcedure
    .input(
      z.object({
        funcionarioId: z.number(),
        periodoAquisitivoInicio: z.string(),
        periodoAquisitivoFim: z.string(),
        dataInicio: z.string(),
        dataFim: z.string(),
        abonoPecuniario: z.boolean().default(false),
        diasAbono: z.number().default(0),
        adiantamento13: z.boolean().default(false),
        observacoes: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      // Calcular dias corridos e úteis
      const inicio = new Date(input.dataInicio);
      const fim = new Date(input.dataFim);
      const diasCorridos = Math.ceil((fim.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      
      // Calcular dias úteis (simplificado: considerar 5/7 dos dias)
      const diasUteis = Math.ceil(diasCorridos * (5 / 7));

      // Verificar saldo disponível
      const saldo = await db
        .select()
        .from(saldoFerias)
        .where(
          and(
            eq(saldoFerias.funcionarioId, input.funcionarioId),
            sql`${saldoFerias.periodoAquisitivoInicio} = ${input.periodoAquisitivoInicio}`,
            sql`${saldoFerias.periodoAquisitivoFim} = ${input.periodoAquisitivoFim}`
          )
        )
        .limit(1);

      if (saldo.length === 0) {
        throw new Error("Saldo de férias não encontrado para este período aquisitivo");
      }

      if (saldo[0].diasDisponiveis < diasCorridos) {
        throw new Error(`Saldo insuficiente. Disponível: ${saldo[0].diasDisponiveis} dias`);
      }

      // Criar solicitação
      const result = await db.insert(ferias).values({
        funcionarioId: input.funcionarioId,
        periodoAquisitivoInicio: input.periodoAquisitivoInicio,
        periodoAquisitivoFim: input.periodoAquisitivoFim,
        dataInicio: input.dataInicio,
        dataFim: input.dataFim,
        diasCorridos,
        diasUteis,
        abonoPecuniario: input.abonoPecuniario,
        diasAbono: input.diasAbono,
        adiantamento13: input.adiantamento13,
        status: "solicitado",
        observacoes: input.observacoes,
      } as any);

      return { success: true, id: result[0].insertId };
    }),

  /**
   * Aprovar/reprovar férias
   */
  aprovar: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        aprovado: z.boolean(),
        motivoReprovacao: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const feriasData = await db
        .select()
        .from(ferias)
        .where(eq(ferias.id, input.id))
        .limit(1);

      if (feriasData.length === 0) {
        throw new Error("Férias não encontradas");
      }

      if (input.aprovado) {
        // Aprovar férias
        await db
          .update(ferias)
          .set({
            status: "aprovado",
            aprovadoPor: ctx.user.id,
            dataAprovacao: new Date(),
          } as any)
          .where(eq(ferias.id, input.id));

        // Atualizar saldo
        await db
          .update(saldoFerias)
          .set({
            diasGozados: sql`${saldoFerias.diasGozados} + ${feriasData[0].diasCorridos}`,
            diasAbono: sql`${saldoFerias.diasAbono} + ${feriasData[0].diasAbono}`,
            diasDisponiveis: sql`${saldoFerias.diasDisponiveis} - ${feriasData[0].diasCorridos}`,
          } as any)
          .where(
            and(
              eq(saldoFerias.funcionarioId, feriasData[0].funcionarioId),
              sql`${saldoFerias.periodoAquisitivoInicio} = ${feriasData[0].periodoAquisitivoInicio}`
            )
          );
      } else {
        // Reprovar férias
        await db
          .update(ferias)
          .set({
            status: "reprovado",
            aprovadoPor: ctx.user.id,
            dataAprovacao: new Date(),
            motivoReprovacao: input.motivoReprovacao,
          } as any)
          .where(eq(ferias.id, input.id));
      }

      return { success: true };
    }),

  /**
   * Cancelar férias
   */
  cancelar: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const feriasData = await db
        .select()
        .from(ferias)
        .where(eq(ferias.id, input.id))
        .limit(1);

      if (feriasData.length === 0) {
        throw new Error("Férias não encontradas");
      }

      // Se já foi aprovado, devolver dias ao saldo
      if (feriasData[0].status === "aprovado") {
        await db
          .update(saldoFerias)
          .set({
            diasGozados: sql`${saldoFerias.diasGozados} - ${feriasData[0].diasCorridos}`,
            diasAbono: sql`${saldoFerias.diasAbono} - ${feriasData[0].diasAbono}`,
            diasDisponiveis: sql`${saldoFerias.diasDisponiveis} + ${feriasData[0].diasCorridos}`,
          } as any)
          .where(
            and(
              eq(saldoFerias.funcionarioId, feriasData[0].funcionarioId),
              sql`${saldoFerias.periodoAquisitivoInicio} = ${feriasData[0].periodoAquisitivoInicio}`
            )
          );
      }

      // Cancelar férias
      await db
        .update(ferias)
        .set({ status: "cancelado" } as any)
        .where(eq(ferias.id, input.id));

      return { success: true };
    }),

  /**
   * Buscar saldo de férias
   */
  getSaldo: protectedProcedure
    .input(z.object({ funcionarioId: z.number() }))
    .query(async ({ input }) => {
      const results = await db
        .select()
        .from(saldoFerias)
        .where(eq(saldoFerias.funcionarioId, input.funcionarioId))
        .orderBy(desc(saldoFerias.periodoAquisitivoInicio));

      return results;
    }),

  /**
   * Calcular e criar saldo de férias para um funcionário
   */
  calcularSaldo: protectedProcedure
    .input(
      z.object({
        funcionarioId: z.number(),
        dataAdmissao: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const admissao = new Date(input.dataAdmissao);
      const hoje = new Date();

      // Calcular períodos aquisitivos (12 meses cada)
      const periodos: Array<{
        inicio: string;
        fim: string;
        vencimento: string;
      }> = [];

      let periodoInicio = new Date(admissao);
      while (periodoInicio < hoje) {
        const periodoFim = new Date(periodoInicio);
        periodoFim.setFullYear(periodoFim.getFullYear() + 1);
        periodoFim.setDate(periodoFim.getDate() - 1);

        const vencimento = new Date(periodoFim);
        vencimento.setFullYear(vencimento.getFullYear() + 1);

        periodos.push({
          inicio: periodoInicio.toISOString().split("T")[0],
          fim: periodoFim.toISOString().split("T")[0],
          vencimento: vencimento.toISOString().split("T")[0],
        });

        periodoInicio = new Date(periodoFim);
        periodoInicio.setDate(periodoInicio.getDate() + 1);
      }

      // Criar saldos para cada período
      for (const periodo of periodos) {
        // Verificar se já existe
        const existente = await db
          .select()
          .from(saldoFerias)
          .where(
            and(
              eq(saldoFerias.funcionarioId, input.funcionarioId),
              sql`${saldoFerias.periodoAquisitivoInicio} = ${periodo.inicio}`
            )
          )
          .limit(1);

        if (existente.length === 0) {
          await db.insert(saldoFerias).values({
            funcionarioId: input.funcionarioId,
            periodoAquisitivoInicio: periodo.inicio,
            periodoAquisitivoFim: periodo.fim,
            diasDireito: 30,
            diasGozados: 0,
            diasAbono: 0,
            diasDisponiveis: 30,
            vencido: new Date(periodo.vencimento) < hoje,
            dataVencimento: periodo.vencimento,
          } as any);
        }
      }

      return { success: true, periodosCalculados: periodos.length };
    }),
});
