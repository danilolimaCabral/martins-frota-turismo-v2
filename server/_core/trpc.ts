import { NOT_ADMIN_ERR_MSG, UNAUTHED_ERR_MSG } from '@shared/const';
import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import type { TrpcContext } from "./context";

const t = initTRPC.context<TrpcContext>().create({
  transformer: superjson,
});

export const router = t.router;
export const publicProcedure = t.procedure;

const requireUser = t.middleware(async opts => {
  const { ctx, next } = opts;

  if (!ctx.user) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: UNAUTHED_ERR_MSG });
  }

  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
    },
  });
});

export const protectedProcedure = t.procedure.use(requireUser);

export const adminProcedure = t.procedure.use(
  t.middleware(async opts => {
    const { ctx, next } = opts;

    if (!ctx.user || ctx.user.role !== 'admin') {
      throw new TRPCError({ code: "FORBIDDEN", message: NOT_ADMIN_ERR_MSG });
    }

    return next({
      ctx: {
        ...ctx,
        user: ctx.user,
      },
    });
  }),
);

/**
 * Helper para criar procedure que requer permissão específica
 * Admin sempre tem acesso, usuários comuns precisam da permissão
 */
export const createPermissionProcedure = (permission: string) => {
  return t.procedure.use(
    t.middleware(async opts => {
      const { ctx, next } = opts;

      if (!ctx.user) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: UNAUTHED_ERR_MSG });
      }

      // Admin sempre tem acesso
      if (ctx.user.role === 'admin') {
        return next({ ctx: { ...ctx, user: ctx.user } });
      }

      // Verificar permissão do usuário (apenas LocalUser tem permissions)
      let permissions: any = {};
      const localUser = ctx.user as any;
      if (localUser.permissions) {
        try {
          permissions = JSON.parse(localUser.permissions);
        } catch (e) {
          console.error("Erro ao parsear permissões", e);
        }
      }

      if (!permissions[permission]) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: `Você não tem permissão para acessar o módulo ${permission}`,
        });
      }

      return next({ ctx: { ...ctx, user: ctx.user } });
    })
  );
};
