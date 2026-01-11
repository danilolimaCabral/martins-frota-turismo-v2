/**
 * Sistema de Permissões Granulares
 * Controla acesso por módulo para usuários não-admin
 */

import { TRPCError } from "@trpc/server";

export type Permission = "rh" | "financeiro" | "frota" | "agenda" | "roteirizacao" | "relatorios";

export interface UserPermissions {
  rh?: boolean;
  financeiro?: boolean;
  frota?: boolean;
  agenda?: boolean;
  roteirizacao?: boolean;
  relatorios?: boolean;
}

/**
 * Verifica se o usuário tem permissão para acessar um módulo
 */
export function hasPermission(
  user: { role: string; permissions?: string | null },
  requiredPermission: Permission
): boolean {
  // Admin tem acesso total
  if (user.role === "admin") {
    return true;
  }

  // Parse permissions JSON
  let permissions: UserPermissions = {};
  if (user.permissions) {
    try {
      permissions = JSON.parse(user.permissions);
    } catch (e) {
      console.error("Erro ao parsear permissões:", e);
      return false;
    }
  }

  // Verifica se tem a permissão específica
  return permissions[requiredPermission] === true;
}

/**
 * Middleware para verificar permissão em procedures
 */
export function requirePermission(permission: Permission) {
  return (opts: any) => {
    const { ctx } = opts;

    if (!ctx.user) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Você precisa estar autenticado para acessar este recurso",
      });
    }

    if (!hasPermission(ctx.user, permission)) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: `Você não tem permissão para acessar o módulo: ${permission}`,
      });
    }

    return opts.next({
      ctx: {
        ...ctx,
        user: ctx.user,
      },
    });
  };
}
