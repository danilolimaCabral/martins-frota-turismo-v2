import { z } from "zod";
import { publicProcedure, router } from "./_core/trpc";
import { COOKIE_NAME } from "../shared/const";
import {
  authenticateUser,
  authenticateUserByUsername,
  createUser,
  getUserById,
} from "./auth";
import { TRPCError } from "@trpc/server";

/**
 * Rotas de autenticação local (sem Manus OAuth)
 */
export const authRouter = router({
  /**
   * Login com username/senha
   */
  loginByUsername: publicProcedure
    .input(
      z.object({
        username: z.string().min(3, "Username deve ter no mínimo 3 caracteres"),
        password: z.string().min(6, "Senha deve ter no mínimo 6 caracteres"),
      })
    )
    .mutation(async ({ input }) => {
      const result = await authenticateUserByUsername(
        input.username,
        input.password
      );

      if (!result.success) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: result.error || "Falha na autenticação",
        });
      }

      return {
        token: result.token!,
        user: result.user,
      };
    }),

  /**
   * Login com email/senha
   */
  loginByEmail: publicProcedure
    .input(
      z.object({
        email: z.string().email("Email inválido"),
        password: z.string().min(6, "Senha deve ter no mínimo 6 caracteres"),
      })
    )
    .mutation(async ({ input }) => {
      const result = await authenticateUser(input.email, input.password);

      if (!result.success) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: result.error || "Falha na autenticação",
        });
      }

      return {
        token: result.token!,
        user: result.user,
      };
    }),

  /**
   * Registro de novo usuário
   */
  register: publicProcedure
    .input(
      z.object({
        username: z.string().min(3, "Username deve ter no mínimo 3 caracteres"),
        name: z.string().min(3, "Nome deve ter no mínimo 3 caracteres"),
        email: z.string().email("Email inválido").optional(),
        password: z.string().min(6, "Senha deve ter no mínimo 6 caracteres"),
        phone: z.string().optional(),
        role: z.enum(["admin", "funcionario", "motorista"]).default("funcionario"),
      })
    )
    .mutation(async ({ input }) => {
      const result = await createUser(input);

      if (!result.success) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: result.error || "Erro ao criar usuário",
        });
      }

      return {
        user: result.user,
      };
    }),

  /**
   * Buscar usuário atual pelo token
   * Retorna null se não autenticado (para compatibilidade com useAuth)
   */
  me: publicProcedure
    .query(async ({ ctx }): Promise<{ id: number; username: string; name: string; email: string | null; phone: string | null; role: "admin" | "funcionario" | "motorista"; active: boolean } | null> => {
      if (!ctx.user) {
        return null;
      }

      // Retorna dados do usuário do contexto (autenticado via JWT ou Manus OAuth)
      return {
        id: ctx.user.id,
        username: ctx.user.username,
        name: ctx.user.name,
        email: ctx.user.email,
        phone: ctx.user.phone || null,
        role: ctx.user.role as "admin" | "funcionario" | "motorista",
        active: ctx.user.active ?? true,
      };
    }),

  /**
   * Logout (limpa o cookie de sessão)
   */
  logout: publicProcedure.mutation(async ({ ctx }) => {
    if (ctx.res && typeof ctx.res.clearCookie === 'function') {
      ctx.res.clearCookie(COOKIE_NAME, {
        maxAge: -1,
        secure: true,
        sameSite: 'none',
        httpOnly: true,
        path: '/',
      });
    }
    return { success: true };
  }),
});
