/**
 * Middleware de Validação tRPC com Zod
 * Valida automaticamente inputs antes de chegar aos procedimentos
 */

import { TRPCError } from "@trpc/server";
import { ZodSchema } from "zod";
import type { ProcedureParams } from "@trpc/server";

/**
 * Middleware para validar inputs com Zod
 * Uso: .use(validateInput(MySchema))
 */
export const validateInput = (schema: ZodSchema) => {
  return async ({ input, next }: any) => {
    try {
      const validatedInput = await schema.parseAsync(input);
      return next({ input: validatedInput });
    } catch (error: any) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: `Validação de input falhou: ${error.message}`,
        cause: error,
      });
    }
  };
};

/**
 * Middleware para validar contexto
 * Garante que usuário está autenticado
 */
export const requireAuth = async ({ ctx, next }: any) => {
  if (!ctx.user) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Usuário não autenticado",
    });
  }
  return next({ ctx });
};

/**
 * Middleware para validar role do usuário
 * Uso: .use(requireRole("admin"))
 */
export const requireRole = (role: string | string[]) => {
  return async ({ ctx, next }: any) => {
    if (!ctx.user) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Usuário não autenticado",
      });
    }

    const roles = Array.isArray(role) ? role : [role];
    if (!roles.includes(ctx.user.role)) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: `Acesso negado. Roles necessárias: ${roles.join(", ")}`,
      });
    }

    return next({ ctx });
  };
};

/**
 * Middleware para logging de procedimentos
 */
export const logProcedure = async ({ input, next, meta }: any) => {
  const start = Date.now();
  try {
    const result = await next({ input });
    const duration = Date.now() - start;
    console.warn(`✅ Procedimento executado com sucesso em ${duration}ms`);
    return result;
  } catch (error) {
    const duration = Date.now() - start;
    console.error(`❌ Procedimento falhou após ${duration}ms:`, error);
    throw error;
  }
};

/**
 * Middleware para rate limiting
 * Limita requisições por usuário
 */
const requestCounts = new Map<string, { count: number; resetTime: number }>();

export const rateLimit = (limit: number = 100, windowMs: number = 60000) => {
  return async ({ ctx, next }: any) => {
    const userId = ctx.user?.id || ctx.req?.ip || "anonymous";
    const now = Date.now();

    const record = requestCounts.get(userId);
    if (record && now < record.resetTime) {
      if (record.count >= limit) {
        throw new TRPCError({
          code: "TOO_MANY_REQUESTS",
          message: `Rate limit excedido. Máximo ${limit} requisições por ${windowMs / 1000}s`,
        });
      }
      record.count++;
    } else {
      requestCounts.set(userId, { count: 1, resetTime: now + windowMs });
    }

    return next();
  };
};

/**
 * Middleware para cache de resultados
 * Uso: .use(cacheResult(60000)) para 60 segundos
 */
const cache = new Map<string, { data: any; expiresAt: number }>();

export const cacheResult = (ttlMs: number = 60000) => {
  return async ({ input, next }: any) => {
    const cacheKey = JSON.stringify(input);
    const cached = cache.get(cacheKey);

    if (cached && Date.now() < cached.expiresAt) {
      console.warn(`✅ Resultado obtido do cache`);
      return cached.data;
    }

    const result = await next({ input });
    cache.set(cacheKey, { data: result, expiresAt: Date.now() + ttlMs });
    return result;
  };
};

/**
 * Middleware para tratamento de erros global
 */
export const errorHandler = async ({ next }: any) => {
  try {
    return await next();
  } catch (error: any) {
    if (error instanceof TRPCError) {
      throw error;
    }

    console.error("Erro não tratado:", error);
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Erro interno do servidor",
      cause: error,
    });
  }
};

/**
 * Composição de middlewares
 * Uso: .use(compose([requireAuth, requireRole("admin"), logProcedure]))
 */
export const compose = (middlewares: Array<(ctx: any) => Promise<any>>) => {
  return async (ctx: any) => {
    let index = -1;

    const dispatch = async (i: number): Promise<any> => {
      if (i <= index) return;
      index = i;

      const fn = middlewares[i];
      if (!fn) return;

      return fn({
        ...ctx,
        next: () => dispatch(i + 1),
      });
    };

    return dispatch(0);
  };
};
