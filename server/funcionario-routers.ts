import { z } from "zod";
import { publicProcedure, protectedProcedure, router, createPermissionProcedure } from "./_core/trpc";

const rhProcedure = createPermissionProcedure("rh");
import { db } from "./db";
import { funcionarios, dependentes } from "../drizzle/schema";
import { eq, and, desc, sql, like } from "drizzle-orm";

/**
 * Router tRPC para Gestão de Funcionários
 * 
 * Endpoints:
 * - list: Listar funcionários com filtros
 * - getById: Buscar funcionário por ID
 * - create: Criar novo funcionário
 * - update: Atualizar funcionário
 * - delete: Deletar funcionário
 * - updateStatus: Atualizar status do funcionário
 * - listDependentes: Listar dependentes de um funcionário
 * - addDependente: Adicionar dependente
 * - deleteDependente: Remover dependente
 * - getStats: Estatísticas de RH
 */

export const funcionarioRouter = router({
  /**
   * Listar funcionários com filtros
   */
  list: rhProcedure
    .input(
      z.object({
        status: z.enum(["ativo", "ferias", "afastado", "demitido", "todos"]).optional(),
        departamento: z.string().optional(),
        cargo: z.string().optional(),
        search: z.string().optional(),
      }).optional()
    )
    .query(async ({ input }) => {
      const conditions = [];

      if (input?.status && input.status !== "todos") {
        conditions.push(eq(funcionarios.status, input.status));
      }

      if (input?.departamento) {
        conditions.push(eq(funcionarios.departamento, input.departamento));
      }

      if (input?.cargo) {
        conditions.push(eq(funcionarios.cargo, input.cargo));
      }

      if (input?.search) {
        conditions.push(
          sql`(${funcionarios.nome} LIKE ${`%${input.search}%`} OR ${funcionarios.cpf} LIKE ${`%${input.search}%`})`
        );
      }

      const results = await db
        .select()
        .from(funcionarios)
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .orderBy(desc(funcionarios.createdAt));

      return results;
    }),

  /**
   * Buscar funcionário por ID com dependentes
   */
  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const funcionario = await db
        .select()
        .from(funcionarios)
        .where(eq(funcionarios.id, input.id))
        .limit(1);

      if (funcionario.length === 0) {
        throw new Error("Funcionário não encontrado");
      }

      // Buscar dependentes
      const deps = await db
        .select()
        .from(dependentes)
        .where(eq(dependentes.funcionarioId, input.id));

      return {
        ...funcionario[0],
        dependentes: deps,
      };
    }),

  /**
   * Criar novo funcionário
   */
  create: protectedProcedure
    .input(
      z.object({
        userId: z.number().optional(),
        nome: z.string().min(3, "Nome deve ter no mínimo 3 caracteres"),
        cpf: z.string().regex(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/, "CPF inválido"),
        rg: z.string().optional(),
        rgOrgaoEmissor: z.string().optional(),
        dataNascimento: z.string().optional(),
        sexo: z.enum(["M", "F", "Outro"]).optional(),
        estadoCivil: z.enum(["Solteiro", "Casado", "Divorciado", "Viuvo", "Uniao Estavel"]).optional(),
        
        // Contato
        telefone: z.string().optional(),
        celular: z.string().optional(),
        email: z.string().email("Email inválido").optional(),
        
        // Endereço
        cep: z.string().optional(),
        endereco: z.string().optional(),
        numero: z.string().optional(),
        complemento: z.string().optional(),
        bairro: z.string().optional(),
        cidade: z.string().optional(),
        estado: z.string().optional(),
        
        // Dados Contratuais
        dataAdmissao: z.string(),
        cargo: z.string().min(2, "Cargo obrigatório"),
        departamento: z.string().optional(),
        tipoContrato: z.enum(["CLT", "PJ", "Estagiario", "Temporario"]).default("CLT"),
        
        // Dados Salariais
        salarioBase: z.string(),
        adicionalPericulosidade: z.string().optional(),
        adicionalInsalubridade: z.string().optional(),
        adicionalNoturno: z.string().optional(),
        valeTransporte: z.string().optional(),
        valeAlimentacao: z.string().optional(),
        planoSaude: z.string().optional(),
        
        // Dados Bancários
        banco: z.string().optional(),
        agencia: z.string().optional(),
        conta: z.string().optional(),
        tipoConta: z.enum(["Corrente", "Poupanca", "Salario"]).optional(),
        pixChave: z.string().optional(),
        
        // Documentos
        ctpsNumero: z.string().optional(),
        ctpsSerie: z.string().optional(),
        ctpsUf: z.string().optional(),
        pisNumero: z.string().optional(),
        tituloEleitor: z.string().optional(),
        reservista: z.string().optional(),
        
        // CNH (para motoristas)
        cnhNumero: z.string().optional(),
        cnhCategoria: z.string().optional(),
        cnhValidade: z.string().optional(),
        
        observacoes: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const result = await db.insert(funcionarios).values(input as any);
      return { success: true, id: result[0].insertId };
    }),

  /**
   * Atualizar funcionário
   */
  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        nome: z.string().min(3).optional(),
        cpf: z.string().optional(),
        rg: z.string().optional(),
        rgOrgaoEmissor: z.string().optional(),
        dataNascimento: z.string().optional(),
        sexo: z.enum(["M", "F", "Outro"]).optional(),
        estadoCivil: z.enum(["Solteiro", "Casado", "Divorciado", "Viuvo", "Uniao Estavel"]).optional(),
        
        telefone: z.string().optional(),
        celular: z.string().optional(),
        email: z.string().email().optional(),
        
        cep: z.string().optional(),
        endereco: z.string().optional(),
        numero: z.string().optional(),
        complemento: z.string().optional(),
        bairro: z.string().optional(),
        cidade: z.string().optional(),
        estado: z.string().optional(),
        
        dataAdmissao: z.string().optional(),
        dataDemissao: z.string().optional(),
        cargo: z.string().optional(),
        departamento: z.string().optional(),
        tipoContrato: z.enum(["CLT", "PJ", "Estagiario", "Temporario"]).optional(),
        
        salarioBase: z.string().optional(),
        adicionalPericulosidade: z.string().optional(),
        adicionalInsalubridade: z.string().optional(),
        adicionalNoturno: z.string().optional(),
        valeTransporte: z.string().optional(),
        valeAlimentacao: z.string().optional(),
        planoSaude: z.string().optional(),
        
        banco: z.string().optional(),
        agencia: z.string().optional(),
        conta: z.string().optional(),
        tipoConta: z.enum(["Corrente", "Poupanca", "Salario"]).optional(),
        pixChave: z.string().optional(),
        
        ctpsNumero: z.string().optional(),
        ctpsSerie: z.string().optional(),
        ctpsUf: z.string().optional(),
        pisNumero: z.string().optional(),
        tituloEleitor: z.string().optional(),
        reservista: z.string().optional(),
        
        cnhNumero: z.string().optional(),
        cnhCategoria: z.string().optional(),
        cnhValidade: z.string().optional(),
        
        status: z.enum(["ativo", "ferias", "afastado", "demitido"]).optional(),
        observacoes: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      await db.update(funcionarios).set(data as any).where(eq(funcionarios.id, id));
      return { success: true };
    }),

  /**
   * Deletar funcionário
   */
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await db.delete(funcionarios).where(eq(funcionarios.id, input.id));
      return { success: true };
    }),

  /**
   * Atualizar status do funcionário
   */
  updateStatus: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        status: z.enum(["ativo", "ferias", "afastado", "demitido"]),
      })
    )
    .mutation(async ({ input }) => {
      await db
        .update(funcionarios)
        .set({ status: input.status })
        .where(eq(funcionarios.id, input.id));
      return { success: true };
    }),

  /**
   * Listar dependentes de um funcionário
   */
  listDependentes: protectedProcedure
    .input(z.object({ funcionarioId: z.number() }))
    .query(async ({ input }) => {
      const results = await db
        .select()
        .from(dependentes)
        .where(eq(dependentes.funcionarioId, input.funcionarioId));
      return results;
    }),

  /**
   * Adicionar dependente
   */
  addDependente: protectedProcedure
    .input(
      z.object({
        funcionarioId: z.number(),
        nome: z.string().min(3, "Nome obrigatório"),
        cpf: z.string().optional(),
        dataNascimento: z.string(),
        parentesco: z.enum(["Filho", "Filha", "Conjuge", "Pai", "Mae", "Outro"]),
        dependenteIR: z.boolean().default(true),
        dependenteSF: z.boolean().default(true),
      })
    )
    .mutation(async ({ input }) => {
      const result = await db.insert(dependentes).values(input as any);
      return { success: true, id: result[0].insertId };
    }),

  /**
   * Remover dependente
   */
  deleteDependente: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await db.delete(dependentes).where(eq(dependentes.id, input.id));
      return { success: true };
    }),

  /**
   * Estatísticas de RH
   */
  getStats: protectedProcedure.query(async ({ input }: { input?: undefined }) => {
    // Total de funcionários ativos
    const totalAtivos = await db
      .select({ count: sql<number>`count(*)` })
      .from(funcionarios)
      .where(eq(funcionarios.status, "ativo"));

    // Total de funcionários em férias
    const totalFerias = await db
      .select({ count: sql<number>`count(*)` })
      .from(funcionarios)
      .where(eq(funcionarios.status, "ferias"));

    // Total de funcionários afastados
    const totalAfastados = await db
      .select({ count: sql<number>`count(*)` })
      .from(funcionarios)
      .where(eq(funcionarios.status, "afastado"));

    // Custo total da folha (salário base de todos ativos)
    const custoFolha = await db
      .select({ total: sql<number>`SUM(salario_base)` })
      .from(funcionarios)
      .where(eq(funcionarios.status, "ativo"));

    return {
      totalAtivos: Number(totalAtivos[0]?.count || 0),
      totalFerias: Number(totalFerias[0]?.count || 0),
      totalAfastados: Number(totalAfastados[0]?.count || 0),
      custoFolha: Number(custoFolha[0]?.total || 0),
    };
  }),
});
