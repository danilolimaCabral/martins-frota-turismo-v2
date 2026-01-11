import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { db } from "./db";
import { alertasDocumentos, funcionarios } from "../drizzle/schema";
import { eq, and, desc, sql, lte, gte } from "drizzle-orm";

/**
 * Router tRPC para Alertas de Documentos
 * Gerencia alertas de vencimento de documentos de funcionários
 */

export const alertasRouter = router({
  /**
   * Listar alertas
   */
  list: protectedProcedure
    .input(
      z.object({
        funcionarioId: z.number().optional(),
        status: z.enum(["pendente", "alertado", "renovado", "vencido", "todos"]).optional(),
        tipoDocumento: z.enum(["cnh", "exame_medico", "certificado_curso", "contrato_trabalho", "seguro_vida", "outro", "todos"]).optional(),
      }).optional()
    )
    .query(async ({ input }) => {
      const conditions = [];

      if (input?.funcionarioId) {
        conditions.push(eq(alertasDocumentos.funcionarioId, input.funcionarioId));
      }

      if (input?.status && input.status !== "todos") {
        conditions.push(eq(alertasDocumentos.status, input.status));
      }

      if (input?.tipoDocumento && input.tipoDocumento !== "todos") {
        conditions.push(eq(alertasDocumentos.tipoDocumento, input.tipoDocumento));
      }

      const results = await db
        .select({
          alerta: alertasDocumentos,
          funcionario: funcionarios,
        })
        .from(alertasDocumentos)
        .leftJoin(funcionarios, eq(alertasDocumentos.funcionarioId, funcionarios.id))
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .orderBy(alertasDocumentos.dataVencimento);

      return results.map(r => ({
        ...r.alerta,
        funcionarioNome: r.funcionario?.nome,
      }));
    }),

  /**
   * Buscar alerta por ID
   */
  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const result = await db
        .select({
          alerta: alertasDocumentos,
          funcionario: funcionarios,
        })
        .from(alertasDocumentos)
        .leftJoin(funcionarios, eq(alertasDocumentos.funcionarioId, funcionarios.id))
        .where(eq(alertasDocumentos.id, input.id))
        .limit(1);

      if (result.length === 0) {
        throw new Error("Alerta não encontrado");
      }

      return {
        ...result[0].alerta,
        funcionarioNome: result[0].funcionario?.nome,
      };
    }),

  /**
   * Criar alerta
   */
  create: protectedProcedure
    .input(
      z.object({
        funcionarioId: z.number(),
        tipoDocumento: z.enum(["cnh", "exame_medico", "certificado_curso", "contrato_trabalho", "seguro_vida", "outro"]),
        dataVencimento: z.string(),
        diasAntecedencia: z.number().default(30), // Alertar X dias antes
        descricao: z.string(),
        observacoes: z.string().optional(),
        notificadoPara: z.string().optional(), // Emails separados por vírgula
      })
    )
    .mutation(async ({ input }) => {
      // Calcular data de alerta
      const vencimento = new Date(input.dataVencimento);
      const dataAlerta = new Date(vencimento);
      dataAlerta.setDate(dataAlerta.getDate() - input.diasAntecedencia);

      const result = await db.insert(alertasDocumentos).values({
        funcionarioId: input.funcionarioId,
        tipoDocumento: input.tipoDocumento,
        dataVencimento: input.dataVencimento,
        dataAlerta: dataAlerta.toISOString().split("T")[0],
        descricao: input.descricao,
        observacoes: input.observacoes,
        notificadoPara: input.notificadoPara,
        status: "pendente",
      } as any);

      return { success: true, id: result[0].insertId };
    }),

  /**
   * Atualizar alerta
   */
  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        dataVencimento: z.string().optional(),
        diasAntecedencia: z.number().optional(),
        descricao: z.string().optional(),
        observacoes: z.string().optional(),
        status: z.enum(["pendente", "alertado", "renovado", "vencido"]).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { id, diasAntecedencia, dataVencimento, ...data } = input;

      const updateData: any = { ...data };

      // Se mudou a data de vencimento ou dias de antecedência, recalcular dataAlerta
      if (dataVencimento || diasAntecedencia) {
        const alertaAtual = await db
          .select()
          .from(alertasDocumentos)
          .where(eq(alertasDocumentos.id, id))
          .limit(1);

        if (alertaAtual.length > 0) {
          const vencimento = new Date(dataVencimento || alertaAtual[0].dataVencimento);
          const dias = diasAntecedencia || 30;
          const dataAlerta = new Date(vencimento);
          dataAlerta.setDate(dataAlerta.getDate() - dias);

          updateData.dataVencimento = vencimento.toISOString().split("T")[0];
          updateData.dataAlerta = dataAlerta.toISOString().split("T")[0];
        }
      }

      await db
        .update(alertasDocumentos)
        .set(updateData)
        .where(eq(alertasDocumentos.id, id));

      return { success: true };
    }),

  /**
   * Deletar alerta
   */
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await db.delete(alertasDocumentos).where(eq(alertasDocumentos.id, input.id));
      return { success: true };
    }),

  /**
   * Buscar alertas pendentes (para notificação)
   */
  getPendentes: protectedProcedure
    .query(async () => {
      const hoje = new Date().toISOString().split("T")[0];

      const results = await db
        .select({
          alerta: alertasDocumentos,
          funcionario: funcionarios,
        })
        .from(alertasDocumentos)
        .leftJoin(funcionarios, eq(alertasDocumentos.funcionarioId, funcionarios.id))
        .where(
          and(
            sql`${alertasDocumentos.dataAlerta} <= ${hoje}`,
            eq(alertasDocumentos.status, "pendente")
          )
        )
        .orderBy(alertasDocumentos.dataVencimento);

      return results.map(r => ({
        ...r.alerta,
        funcionarioNome: r.funcionario?.nome,
        funcionarioEmail: r.funcionario?.email,
      }));
    }),

  /**
   * Buscar documentos vencidos
   */
  getVencidos: protectedProcedure
    .query(async () => {
      const hoje = new Date().toISOString().split("T")[0];

      const results = await db
        .select({
          alerta: alertasDocumentos,
          funcionario: funcionarios,
        })
        .from(alertasDocumentos)
        .leftJoin(funcionarios, eq(alertasDocumentos.funcionarioId, funcionarios.id))
        .where(
          and(
            sql`${alertasDocumentos.dataVencimento} < ${hoje}`,
            eq(alertasDocumentos.status, "alertado")
          )
        )
        .orderBy(alertasDocumentos.dataVencimento);

      return results.map(r => ({
        ...r.alerta,
        funcionarioNome: r.funcionario?.nome,
        funcionarioEmail: r.funcionario?.email,
      }));
    }),

  /**
   * Marcar alerta como notificado
   */
  marcarNotificado: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await db
        .update(alertasDocumentos)
        .set({
          status: "alertado",
          notificadoEm: new Date(),
        } as any)
        .where(eq(alertasDocumentos.id, input.id));

      return { success: true };
    }),

  /**
   * Marcar documento como renovado
   */
  marcarRenovado: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        novaDataVencimento: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      // Marcar o alerta atual como renovado
      await db
        .update(alertasDocumentos)
        .set({ status: "renovado" } as any)
        .where(eq(alertasDocumentos.id, input.id));

      // Buscar dados do alerta para criar um novo
      const alertaAtual = await db
        .select()
        .from(alertasDocumentos)
        .where(eq(alertasDocumentos.id, input.id))
        .limit(1);

      if (alertaAtual.length > 0) {
        const vencimento = new Date(input.novaDataVencimento);
        const dataAlerta = new Date(vencimento);
        dataAlerta.setDate(dataAlerta.getDate() - 30); // 30 dias antes

        // Criar novo alerta
        await db.insert(alertasDocumentos).values({
          funcionarioId: alertaAtual[0].funcionarioId,
          tipoDocumento: alertaAtual[0].tipoDocumento,
          dataVencimento: input.novaDataVencimento,
          dataAlerta: dataAlerta.toISOString().split("T")[0],
          descricao: alertaAtual[0].descricao,
          observacoes: alertaAtual[0].observacoes,
          notificadoPara: alertaAtual[0].notificadoPara,
          status: "pendente",
        } as any);
      }

      return { success: true };
    }),

  /**
   * Estatísticas de alertas
   */
  getStats: protectedProcedure
    .query(async () => {
      const hoje = new Date().toISOString().split("T")[0];

      const todosAlertas = await db.select().from(alertasDocumentos);

      const pendentes = todosAlertas.filter(a => a.status === "pendente").length;
      const alertados = todosAlertas.filter(a => a.status === "alertado").length;
      const vencidos = todosAlertas.filter(
        a => new Date(a.dataVencimento) < new Date(hoje) && a.status !== "renovado"
      ).length;
      const renovados = todosAlertas.filter(a => a.status === "renovado").length;

      // Próximos vencimentos (30 dias)
      const dataLimite = new Date();
      dataLimite.setDate(dataLimite.getDate() + 30);
      const dataLimiteStr = dataLimite.toISOString().split("T")[0];

      const proximosVencimentos = todosAlertas.filter(
        a =>
          new Date(a.dataVencimento) >= new Date(hoje) &&
          new Date(a.dataVencimento) <= new Date(dataLimiteStr) &&
          a.status !== "renovado"
      ).length;

      return {
        total: todosAlertas.length,
        pendentes,
        alertados,
        vencidos,
        renovados,
        proximosVencimentos,
      };
    }),
});
