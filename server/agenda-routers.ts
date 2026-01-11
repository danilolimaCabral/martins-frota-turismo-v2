import { z } from "zod";
import { protectedProcedure, router } from "./_core/trpc";
import { db } from "./db";
import { eventos, pagamentosEvento, vehicles, drivers } from "../drizzle/schema";
import { eq, and, gte, lte, desc, sql } from "drizzle-orm";

export const agendaRouter = router({
  // Listar eventos
  list: protectedProcedure
    .input(z.object({
      mes: z.number().min(1).max(12).optional(),
      ano: z.number().optional(),
      status: z.enum(["agendado", "confirmado", "em_andamento", "concluido", "cancelado"]).optional(),
    }).optional())
    .query(async ({ input }) => {
      const now = new Date();
      const mes = input?.mes || now.getMonth() + 1;
      const ano = input?.ano || now.getFullYear();
      
      const inicioMes = new Date(ano, mes - 1, 1);
      const fimMes = new Date(ano, mes, 0, 23, 59, 59);
      
      let query = db.select().from(eventos);
      
      const result = await db.select()
        .from(eventos)
        .where(
          and(
            gte(eventos.dataInicio, inicioMes),
            lte(eventos.dataInicio, fimMes),
            input?.status ? eq(eventos.status, input.status) : undefined
          )
        )
        .orderBy(eventos.dataInicio);
      
      return result;
    }),

  // Obter evento por ID
  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const [evento] = await db.select().from(eventos).where(eq(eventos.id, input.id));
      if (!evento) throw new Error("Evento não encontrado");
      
      // Buscar pagamentos
      const pagamentos = await db.select()
        .from(pagamentosEvento)
        .where(eq(pagamentosEvento.eventoId, input.id))
        .orderBy(desc(pagamentosEvento.dataPagamento));
      
      return { ...evento, pagamentos };
    }),

  // Criar evento
  create: protectedProcedure
    .input(z.object({
      titulo: z.string().min(1),
      descricao: z.string().optional(),
      tipoServico: z.enum(["viagem", "especial", "fretamento", "transfer", "excursao"]),
      dataInicio: z.string(),
      dataFim: z.string(),
      clienteNome: z.string().optional(),
      clienteTelefone: z.string().optional(),
      clienteEmail: z.string().optional(),
      veiculoId: z.number().optional(),
      motoristaId: z.number().optional(),
      valorTotal: z.number().optional(),
      enderecoOrigem: z.string().optional(),
      enderecoDestino: z.string().optional(),
      observacoes: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const [result] = await db.insert(eventos).values({
        titulo: input.titulo,
        descricao: input.descricao,
        tipoServico: input.tipoServico,
        dataInicio: new Date(input.dataInicio),
        dataFim: new Date(input.dataFim),
        clienteNome: input.clienteNome,
        clienteTelefone: input.clienteTelefone,
        clienteEmail: input.clienteEmail,
        veiculoId: input.veiculoId,
        motoristaId: input.motoristaId,
        valorTotal: input.valorTotal?.toString() || "0",
        valorPago: "0",
        enderecoOrigem: input.enderecoOrigem,
        enderecoDestino: input.enderecoDestino,
        observacoes: input.observacoes,
        status: "agendado",
        createdBy: ctx.user.id,
      });
      
      return { id: result.insertId };
    }),

  // Atualizar evento
  update: protectedProcedure
    .input(z.object({
      id: z.number(),
      titulo: z.string().optional(),
      descricao: z.string().optional(),
      tipoServico: z.enum(["viagem", "especial", "fretamento", "transfer", "excursao"]).optional(),
      dataInicio: z.string().optional(),
      dataFim: z.string().optional(),
      clienteNome: z.string().optional(),
      clienteTelefone: z.string().optional(),
      clienteEmail: z.string().optional(),
      veiculoId: z.number().nullable().optional(),
      motoristaId: z.number().nullable().optional(),
      valorTotal: z.number().optional(),
      enderecoOrigem: z.string().optional(),
      enderecoDestino: z.string().optional(),
      observacoes: z.string().optional(),
      status: z.enum(["agendado", "confirmado", "em_andamento", "concluido", "cancelado"]).optional(),
    }))
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      
      const updateData: any = {};
      if (data.titulo) updateData.titulo = data.titulo;
      if (data.descricao !== undefined) updateData.descricao = data.descricao;
      if (data.tipoServico) updateData.tipoServico = data.tipoServico;
      if (data.dataInicio) updateData.dataInicio = new Date(data.dataInicio);
      if (data.dataFim) updateData.dataFim = new Date(data.dataFim);
      if (data.clienteNome !== undefined) updateData.clienteNome = data.clienteNome;
      if (data.clienteTelefone !== undefined) updateData.clienteTelefone = data.clienteTelefone;
      if (data.clienteEmail !== undefined) updateData.clienteEmail = data.clienteEmail;
      if (data.veiculoId !== undefined) updateData.veiculoId = data.veiculoId;
      if (data.motoristaId !== undefined) updateData.motoristaId = data.motoristaId;
      if (data.valorTotal !== undefined) updateData.valorTotal = data.valorTotal.toString();
      if (data.enderecoOrigem !== undefined) updateData.enderecoOrigem = data.enderecoOrigem;
      if (data.enderecoDestino !== undefined) updateData.enderecoDestino = data.enderecoDestino;
      if (data.observacoes !== undefined) updateData.observacoes = data.observacoes;
      if (data.status) updateData.status = data.status;
      
      await db.update(eventos).set(updateData).where(eq(eventos.id, id));
      return { success: true };
    }),

  // Excluir evento
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await db.delete(eventos).where(eq(eventos.id, input.id));
      return { success: true };
    }),

  // Registrar pagamento
  addPagamento: protectedProcedure
    .input(z.object({
      eventoId: z.number(),
      valor: z.number(),
      dataPagamento: z.string(),
      formaPagamento: z.enum(["dinheiro", "cartao_credito", "cartao_debito", "pix", "transferencia", "boleto", "cheque"]),
      observacoes: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      // Inserir pagamento
      await db.insert(pagamentosEvento).values({
        eventoId: input.eventoId,
        valor: input.valor.toString(),
        dataPagamento: new Date(input.dataPagamento),
        formaPagamento: input.formaPagamento,
        observacoes: input.observacoes,
      });
      
      // Atualizar valor pago no evento
      const [evento] = await db.select().from(eventos).where(eq(eventos.id, input.eventoId));
      const novoValorPago = parseFloat(evento.valorPago || "0") + input.valor;
      
      await db.update(eventos)
        .set({ valorPago: novoValorPago.toString() })
        .where(eq(eventos.id, input.eventoId));
      
      return { success: true };
    }),

  // Listar pagamentos de um evento
  getPagamentos: protectedProcedure
    .input(z.object({ eventoId: z.number() }))
    .query(async ({ input }) => {
      return db.select()
        .from(pagamentosEvento)
        .where(eq(pagamentosEvento.eventoId, input.eventoId))
        .orderBy(desc(pagamentosEvento.dataPagamento));
    }),

  // Estatísticas do mês
  getStats: protectedProcedure
    .input(z.object({
      mes: z.number().min(1).max(12).optional(),
      ano: z.number().optional(),
    }).optional())
    .query(async ({ input }) => {
      const now = new Date();
      const mes = input?.mes || now.getMonth() + 1;
      const ano = input?.ano || now.getFullYear();
      
      const inicioMes = new Date(ano, mes - 1, 1);
      const fimMes = new Date(ano, mes, 0, 23, 59, 59);
      
      const eventosDoMes = await db.select()
        .from(eventos)
        .where(
          and(
            gte(eventos.dataInicio, inicioMes),
            lte(eventos.dataInicio, fimMes)
          )
        );
      
      const totalEventos = eventosDoMes.length;
      const eventosConfirmados = eventosDoMes.filter(e => e.status === "confirmado" || e.status === "em_andamento").length;
      const eventosConcluidos = eventosDoMes.filter(e => e.status === "concluido").length;
      const valorTotal = eventosDoMes.reduce((acc, e) => acc + parseFloat(e.valorTotal || "0"), 0);
      const valorRecebido = eventosDoMes.reduce((acc, e) => acc + parseFloat(e.valorPago || "0"), 0);
      
      return {
        totalEventos,
        eventosConfirmados,
        eventosConcluidos,
        valorTotal,
        valorRecebido,
        valorPendente: valorTotal - valorRecebido,
      };
    }),

  // Listar veículos disponíveis
  getVeiculosDisponiveis: protectedProcedure
    .query(async () => {
      return db.select().from(vehicles).where(eq(vehicles.status, "ativo"));
    }),

  // Listar motoristas disponíveis
  getMotoristasDisponiveis: protectedProcedure
    .query(async () => {
      return db.select().from(drivers).where(eq(drivers.status, "ativo"));
    }),
});
