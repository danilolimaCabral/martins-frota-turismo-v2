import { z } from "zod";
import { publicProcedure, router } from "./_core/trpc";
import { db } from "./db";
import { localUsers } from "../drizzle/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "martins-turismo-secret-key-2024";

/**
 * Router tRPC para Autenticação Local (sem Manus OAuth)
 */

export const localAuthRouter = router({
  /**
   * Login local
   */
  login: publicProcedure
    .input(
      z.object({
        username: z.string().min(3),
        password: z.string().min(6),
      })
    )
    .mutation(async ({ input }) => {
      // Buscar usuário
      const user = await db
        .select()
        .from(localUsers)
        .where(eq(localUsers.username, input.username))
        .limit(1);

      if (!user[0]) {
        throw new Error("Usuário ou senha inválidos");
      }

      if (!user[0].ativo) {
        throw new Error("Usuário inativo");
      }

      // Verificar senha
      const passwordMatch = await bcrypt.compare(input.password, user[0].password);

      if (!passwordMatch) {
        throw new Error("Usuário ou senha inválidos");
      }

      // Gerar token JWT
      const token = jwt.sign(
        {
          id: user[0].id,
          username: user[0].username,
          nome: user[0].nome,
          email: user[0].email,
          role: user[0].role,
        },
        JWT_SECRET,
        { expiresIn: "7d" }
      );

      return {
        token,
        user: {
          id: user[0].id,
          username: user[0].username,
          nome: user[0].nome,
          email: user[0].email,
          role: user[0].role,
        },
      };
    }),

  /**
   * Criar usuário admin padrão (apenas se não existir nenhum)
   */
  createDefaultAdmin: publicProcedure.mutation(async () => {
    // Verificar se já existe algum usuário
    const existingUsers = await db.select().from(localUsers).limit(1);

    if (existingUsers.length > 0) {
      throw new Error("Já existem usuários cadastrados");
    }

    // Criar admin padrão
    const hashedPassword = await bcrypt.hash("admin123", 10);

    await db.insert(localUsers).values({
      username: "admin",
      password: hashedPassword,
      nome: "Administrador",
      email: "admin@martinsturismo.com.br",
      role: "admin",
      ativo: true,
    });

    return {
      message: "Usuário admin criado com sucesso",
      username: "admin",
      password: "admin123",
    };
  }),

  /**
   * Verificar se precisa criar admin padrão
   */
  needsSetup: publicProcedure.query(async () => {
    const users = await db.select().from(localUsers).limit(1);
    return { needsSetup: users.length === 0 };
  }),

  /**
   * Listar todos os usuários
   */
  listUsers: publicProcedure.query(async () => {
    const users = await db
      .select({
        id: localUsers.id,
        username: localUsers.username,
        nome: localUsers.nome,
        email: localUsers.email,
        role: localUsers.role,
        ativo: localUsers.ativo,
        createdAt: localUsers.createdAt,
      })
      .from(localUsers)
      .orderBy(localUsers.createdAt);

    return users;
  }),

  /**
   * Criar novo usuário
   */
  createUser: publicProcedure
    .input(
      z.object({
        username: z.string().min(3),
        password: z.string().min(6),
        nome: z.string().min(3),
        email: z.string().email(),
        role: z.enum(["admin", "user"]).default("user"),
        permissions: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      // Verificar se username já existe
      const existing = await db
        .select()
        .from(localUsers)
        .where(eq(localUsers.username, input.username))
        .limit(1);

      if (existing[0]) {
        throw new Error("Usuário já existe");
      }

      // Hash da senha
      const hashedPassword = await bcrypt.hash(input.password, 10);

      // Criar usuário
      await db.insert(localUsers).values({
        username: input.username,
        password: hashedPassword,
        nome: input.nome,
        email: input.email,
        role: input.role,
        ativo: true,
        permissions: input.permissions || "{}",
      });

      return { message: "Usuário criado com sucesso" };
    }),

  /**
   * Atualizar usuário
   */
  updateUser: publicProcedure
    .input(
      z.object({
        id: z.number(),
        nome: z.string().min(3).optional(),
        email: z.string().email().optional(),
        role: z.enum(["admin", "user"]).optional(),
        ativo: z.boolean().optional(),
        password: z.string().min(6).optional(),
        permissions: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const updates: any = {};

      if (input.nome) updates.nome = input.nome;
      if (input.email) updates.email = input.email;
      if (input.role) updates.role = input.role;
      if (input.ativo !== undefined) updates.ativo = input.ativo;
      if (input.permissions) updates.permissions = input.permissions;
      if (input.password) {
        updates.password = await bcrypt.hash(input.password, 10);
      }

      await db
        .update(localUsers)
        .set(updates)
        .where(eq(localUsers.id, input.id));

      return { message: "Usuário atualizado com sucesso" };
    }),

  /**
   * Deletar usuário
   */
  deleteUser: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await db.delete(localUsers).where(eq(localUsers.id, input.id));
      return { message: "Usuário deletado com sucesso" };
    }),
});
