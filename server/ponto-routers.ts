import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { db } from "./db";
import { registrosPonto, bancoHoras, funcionarios } from "../drizzle/schema";
import { eq, and, desc, sql, gte, lte } from "drizzle-orm";

/**
 * Router tRPC para Controle de Ponto
 * 
 * Endpoints:
 * - list: Listar registros de ponto
 * - getById: Buscar registro por ID
 * - registrar: Registrar entrada/saída
 * - aprovar: Aprovar registro de ponto
 * - calcularHoras: Calcular horas trabalhadas e extras
 * - getBancoHoras: Buscar banco de horas
 * - getResumoMensal: Resumo mensal de ponto
 */

export const pontoRouter = router({
  /**
   * Listar registros de ponto
   */
  list: protectedProcedure
    .input(
      z.object({
        funcionarioId: z.number().optional(),
        dataInicio: z.string().optional(),
        dataFim: z.string().optional(),
        aprovado: z.boolean().optional(),
      }).optional()
    )
    .query(async ({ input }) => {
      const conditions = [];

      if (input?.funcionarioId) {
        conditions.push(eq(registrosPonto.funcionarioId, input.funcionarioId));
      }

      if (input?.dataInicio) {
        conditions.push(sql`${registrosPonto.data} >= ${input.dataInicio}`);
      }

      if (input?.dataFim) {
        conditions.push(sql`${registrosPonto.data} <= ${input.dataFim}`);
      }

      if (input?.aprovado !== undefined) {
        conditions.push(eq(registrosPonto.aprovado, input.aprovado));
      }

      const results = await db
        .select({
          registro: registrosPonto,
          funcionario: funcionarios,
        })
        .from(registrosPonto)
        .leftJoin(funcionarios, eq(registrosPonto.funcionarioId, funcionarios.id))
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .orderBy(desc(registrosPonto.data));

      return results.map(r => ({
        ...r.registro,
        funcionarioNome: r.funcionario?.nome,
      }));
    }),

  /**
   * Buscar registro por ID
   */
  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const result = await db
        .select({
          registro: registrosPonto,
          funcionario: funcionarios,
        })
        .from(registrosPonto)
        .leftJoin(funcionarios, eq(registrosPonto.funcionarioId, funcionarios.id))
        .where(eq(registrosPonto.id, input.id))
        .limit(1);

      if (result.length === 0) {
        throw new Error("Registro não encontrado");
      }

      return {
        ...result[0].registro,
        funcionarioNome: result[0].funcionario?.nome,
      };
    }),

  /**
   * Registrar entrada/saída
   */
  registrar: protectedProcedure
    .input(
      z.object({
        funcionarioId: z.number(),
        data: z.string(),
        entradaManha: z.string().optional(),
        saidaManha: z.string().optional(),
        entradaTarde: z.string().optional(),
        saidaTarde: z.string().optional(),
        justificativa: z.string().optional(),
        observacoes: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      // Verificar se já existe registro para a data
      const existente = await db
        .select()
        .from(registrosPonto)
        .where(
          and(
            eq(registrosPonto.funcionarioId, input.funcionarioId),
            sql`${registrosPonto.data} = ${input.data}`
          )
        )
        .limit(1);

      // Calcular horas trabalhadas
      const calculos = calcularHorasTrabalhadas({
        entradaManha: input.entradaManha,
        saidaManha: input.saidaManha,
        entradaTarde: input.entradaTarde,
        saidaTarde: input.saidaTarde,
      });

      const dados = {
        funcionarioId: input.funcionarioId,
        data: input.data,
        entradaManha: input.entradaManha,
        saidaManha: input.saidaManha,
        entradaTarde: input.entradaTarde,
        saidaTarde: input.saidaTarde,
        horasTrabalhadas: calculos.horasTrabalhadas.toFixed(2),
        horasExtras50: calculos.horasExtras50.toFixed(2),
        horasExtras100: calculos.horasExtras100.toFixed(2),
        horasNoturnas: calculos.horasNoturnas.toFixed(2),
        atraso: calculos.atraso,
        minutosAtraso: calculos.minutosAtraso,
        falta: calculos.falta,
        justificativa: input.justificativa,
        observacoes: input.observacoes,
      };

      if (existente.length > 0) {
        // Atualizar registro existente
        await db
          .update(registrosPonto)
          .set(dados as any)
          .where(eq(registrosPonto.id, existente[0].id));
        return { success: true, id: existente[0].id };
      } else {
        // Criar novo registro
        const result = await db.insert(registrosPonto).values(dados as any);
        return { success: true, id: result[0].insertId };
      }
    }),

  /**
   * Aprovar registro de ponto
   */
  aprovar: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        aprovado: z.boolean(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      await db
        .update(registrosPonto)
        .set({
          aprovado: input.aprovado,
          aprovadoPor: ctx.user.id,
          dataAprovacao: new Date(),
        } as any)
        .where(eq(registrosPonto.id, input.id));

      return { success: true };
    }),

  /**
   * Buscar banco de horas
   */
  getBancoHoras: protectedProcedure
    .input(
      z.object({
        funcionarioId: z.number(),
        mes: z.number().optional(),
        ano: z.number().optional(),
      })
    )
    .query(async ({ input }) => {
      const conditions = [eq(bancoHoras.funcionarioId, input.funcionarioId)];

      if (input.mes) {
        conditions.push(eq(bancoHoras.mesReferencia, input.mes));
      }

      if (input.ano) {
        conditions.push(eq(bancoHoras.anoReferencia, input.ano));
      }

      const results = await db
        .select()
        .from(bancoHoras)
        .where(and(...conditions))
        .orderBy(desc(bancoHoras.anoReferencia), desc(bancoHoras.mesReferencia));

      return results;
    }),

  /**
   * Resumo mensal de ponto
   */
  getResumoMensal: protectedProcedure
    .input(
      z.object({
        funcionarioId: z.number(),
        mes: z.number(),
        ano: z.number(),
      })
    )
    .query(async ({ input }) => {
      const dataInicio = `${input.ano}-${String(input.mes).padStart(2, "0")}-01`;
      const ultimoDia = new Date(input.ano, input.mes, 0).getDate();
      const dataFim = `${input.ano}-${String(input.mes).padStart(2, "0")}-${ultimoDia}`;

      const registros = await db
        .select()
        .from(registrosPonto)
        .where(
          and(
            eq(registrosPonto.funcionarioId, input.funcionarioId),
            sql`${registrosPonto.data} >= ${dataInicio}`,
            sql`${registrosPonto.data} <= ${dataFim}`
          )
        );

      // Calcular totais
      const totalHorasTrabalhadas = registros.reduce(
        (acc, r) => acc + parseFloat(String(r.horasTrabalhadas || "0")),
        0
      );
      const totalHorasExtras50 = registros.reduce(
        (acc, r) => acc + parseFloat(String(r.horasExtras50 || "0")),
        0
      );
      const totalHorasExtras100 = registros.reduce(
        (acc, r) => acc + parseFloat(String(r.horasExtras100 || "0")),
        0
      );
      const totalHorasNoturnas = registros.reduce(
        (acc, r) => acc + parseFloat(String(r.horasNoturnas || "0")),
        0
      );
      const totalAtrasos = registros.filter((r) => r.atraso).length;
      const totalFaltas = registros.filter((r) => r.falta).length;

      return {
        totalRegistros: registros.length,
        totalHorasTrabalhadas: totalHorasTrabalhadas.toFixed(2),
        totalHorasExtras50: totalHorasExtras50.toFixed(2),
        totalHorasExtras100: totalHorasExtras100.toFixed(2),
        totalHorasNoturnas: totalHorasNoturnas.toFixed(2),
        totalAtrasos,
        totalFaltas,
        registros,
      };
    }),
});

/**
 * Função auxiliar para calcular horas trabalhadas e extras
 */
function calcularHorasTrabalhadas(horarios: {
  entradaManha?: string;
  saidaManha?: string;
  entradaTarde?: string;
  saidaTarde?: string;
}) {
  const { entradaManha, saidaManha, entradaTarde, saidaTarde } = horarios;

  // Se não há horários, é falta
  if (!entradaManha && !saidaManha && !entradaTarde && !saidaTarde) {
    return {
      horasTrabalhadas: 0,
      horasExtras50: 0,
      horasExtras100: 0,
      horasNoturnas: 0,
      atraso: false,
      minutosAtraso: 0,
      falta: true,
    };
  }

  // Converter horários para minutos
  const toMinutes = (time?: string) => {
    if (!time) return 0;
    const [h, m] = time.split(":").map(Number);
    return h * 60 + m;
  };

  const entradaManhaMin = toMinutes(entradaManha);
  const saidaManhaMin = toMinutes(saidaManha);
  const entradaTardeMin = toMinutes(entradaTarde);
  const saidaTardeMin = toMinutes(saidaTarde);

  // Calcular horas trabalhadas
  let minutosTrabalhados = 0;
  if (entradaManha && saidaManha) {
    minutosTrabalhados += saidaManhaMin - entradaManhaMin;
  }
  if (entradaTarde && saidaTarde) {
    minutosTrabalhados += saidaTardeMin - entradaTardeMin;
  }

  const horasTrabalhadas = minutosTrabalhados / 60;

  // Verificar atraso (entrada manhã após 8:10)
  const horarioEntradaPadrao = 8 * 60; // 8:00
  const tolerancia = 10; // 10 minutos
  const atraso = entradaManha ? entradaManhaMin > horarioEntradaPadrao + tolerancia : false;
  const minutosAtraso = atraso ? entradaManhaMin - horarioEntradaPadrao : 0;

  // Calcular horas extras (acima de 8h diárias)
  const jornadaPadrao = 8; // 8 horas
  let horasExtras50 = 0;
  let horasExtras100 = 0;

  if (horasTrabalhadas > jornadaPadrao) {
    const extras = horasTrabalhadas - jornadaPadrao;
    if (extras <= 2) {
      horasExtras50 = extras; // Até 2h extras = 50%
    } else {
      horasExtras50 = 2;
      horasExtras100 = extras - 2; // Acima de 2h = 100%
    }
  }

  // Calcular horas noturnas (22:00 às 5:00)
  let horasNoturnas = 0;
  // Simplificado: considerar se saída tarde for após 22:00
  if (saidaTarde && saidaTardeMin >= 22 * 60) {
    horasNoturnas = (saidaTardeMin - 22 * 60) / 60;
  }

  return {
    horasTrabalhadas,
    horasExtras50,
    horasExtras100,
    horasNoturnas,
    atraso,
    minutosAtraso,
    falta: false,
  };
}
