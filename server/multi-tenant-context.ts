/**
 * Contexto Multi-Tenant para tRPC
 * Suporta múltiplos clientes com dados segregados
 */

import { z } from "zod";
import type { inferAsyncReturnType } from "@trpc/server";
import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";

// ============================================================================
// SCHEMAS ZOD PARA VALIDAÇÃO
// ============================================================================

const TenantSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  cnpj: z.string().regex(/^\d{14}$/),
  status: z.enum(["active", "inactive", "suspended"]),
  createdAt: z.date(),
  updatedAt: z.date(),
  ctaSmartToken: z.string().optional(),
  ctaSmartConfig: z.object({
    enabled: z.boolean(),
    baseUrl: z.string().url(),
    syncInterval: z.number().int().positive(),
  }).optional(),
});

const UserSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  email: z.string().email(),
  name: z.string(),
  role: z.enum(["admin", "user", "viewer"]),
  status: z.enum(["active", "inactive"]),
  createdAt: z.date(),
});

const TenantContextSchema = z.object({
  tenant: TenantSchema,
  user: UserSchema,
  isAdmin: z.boolean(),
  isMasterAdmin: z.boolean(),
});

// ============================================================================
// TIPOS DERIVADOS
// ============================================================================

type Tenant = z.infer<typeof TenantSchema>;
type User = z.infer<typeof UserSchema>;
type TenantContext = z.infer<typeof TenantContextSchema>;

// ============================================================================
// CONTEXTO MULTI-TENANT
// ============================================================================

/**
 * Cria contexto multi-tenant para requisição
 */
export async function createMultiTenantContext(
  opts: CreateExpressContextOptions
): Promise<{
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  tenant?: Tenant;
  user?: User;
  isAdmin: boolean;
  isMasterAdmin: boolean;
  tenantId?: string;
}> {
  const { req, res } = opts;

  // Extrair tenant ID do header ou cookie
  const tenantId = extractTenantId(req);
  const authHeader = req.headers.authorization;

  if (!tenantId || !authHeader) {
    return {
      req,
      res,
      isAdmin: false,
      isMasterAdmin: false,
    };
  }

  try {
    // Aqui você buscaria no banco de dados
    // const tenant = await db.query.tenants.findFirst({ where: { id: tenantId } });
    // const user = await db.query.users.findFirst({ where: { id: userId } });

    // Exemplo simulado
    const tenant: Tenant = {
      id: tenantId,
      name: "Martins Frota Turismo",
      cnpj: "12345678901234",
      status: "active",
      createdAt: new Date(),
      updatedAt: new Date(),
      ctaSmartToken: process.env.CTA_SMART_TOKEN,
      ctaSmartConfig: {
        enabled: true,
        baseUrl: "https://ctasmart.com.br:8443",
        syncInterval: 3600000, // 1 hora
      },
    };

    const user: User = {
      id: "user-123",
      tenantId,
      email: "admin@martinsfrota.com",
      name: "Administrador",
      role: "admin",
      status: "active",
      createdAt: new Date(),
    };

    return {
      req,
      res,
      tenant,
      user,
      isAdmin: user.role === "admin",
      isMasterAdmin: process.env.MASTER_ADMIN_ID === user.id,
      tenantId,
    };
  } catch (error) {
    console.error("Erro ao criar contexto multi-tenant:", error);
    return {
      req,
      res,
      isAdmin: false,
      isMasterAdmin: false,
    };
  }
}

/**
 * Extrai tenant ID da requisição
 */
function extractTenantId(req: any): string | undefined {
  // Tentar extrair do header
  const tenantIdHeader = req.headers["x-tenant-id"];
  if (tenantIdHeader) {
    return tenantIdHeader as string;
  }

  // Tentar extrair do cookie
  const cookies = parseCookies(req.headers.cookie || "");
  if (cookies["tenant-id"]) {
    return cookies["tenant-id"];
  }

  // Tentar extrair do JWT
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith("Bearer ")) {
    try {
      const token = authHeader.substring(7);
      const decoded = JSON.parse(Buffer.from(token.split(".")[1], "base64").toString());
      return decoded.tenantId;
    } catch (error) {
      // Ignorar erro de decodificação
    }
  }

  return undefined;
}

/**
 * Parse cookies
 */
function parseCookies(cookieString: string): Record<string, string> {
  const cookies: Record<string, string> = {};
  cookieString.split(";").forEach((cookie) => {
    const [name, value] = cookie.trim().split("=");
    if (name && value) {
      cookies[name] = decodeURIComponent(value);
    }
  });
  return cookies;
}

// ============================================================================
// MIDDLEWARE DE TENANT
// ============================================================================

/**
 * Middleware para validar tenant
 */
export function requireTenant() {
  return async ({ ctx, next }: any) => {
    if (!ctx.tenant) {
      throw new Error("Tenant não encontrado");
    }
    return next({ ctx });
  };
}

/**
 * Middleware para validar admin
 */
export function requireAdmin() {
  return async ({ ctx, next }: any) => {
    if (!ctx.isAdmin) {
      throw new Error("Acesso restrito a administradores");
    }
    return next({ ctx });
  };
}

/**
 * Middleware para validar master admin
 */
export function requireMasterAdmin() {
  return async ({ ctx, next }: any) => {
    if (!ctx.isMasterAdmin) {
      throw new Error("Acesso restrito a master admin");
    }
    return next({ ctx });
  };
}

/**
 * Middleware para validar CTA Smart configurado
 */
export function requireCTASmartConfig() {
  return async ({ ctx, next }: any) => {
    if (!ctx.tenant?.ctaSmartConfig?.enabled) {
      throw new Error("CTA Smart não está configurado para este tenant");
    }
    return next({ ctx });
  };
}

// ============================================================================
// TIPOS PARA EXPORTAÇÃO
// ============================================================================

export type MultiTenantContext = Awaited<ReturnType<typeof createMultiTenantContext>>;

// ============================================================================
// EXEMPLO DE USO
// ============================================================================

export const multiTenantContextExample = `
// ============================================================================
// EXEMPLO: Como Usar o Contexto Multi-Tenant
// ============================================================================

import { createTRPCRouter, protectedProcedure } from "./trpc";
import { 
  createMultiTenantContext, 
  requireTenant, 
  requireAdmin,
  requireCTASmartConfig 
} from "./multi-tenant-context";

// Configurar contexto no Express
app.use(
  "/api/trpc",
  createExpressMiddleware({
    router: appRouter,
    createContext: createMultiTenantContext,
  })
);

// Usar no router
export const myRouter = createTRPCRouter({
  // Procedimento que requer tenant
  getTenantData: protectedProcedure
    .use(requireTenant())
    .query(({ ctx }) => {
      return {
        tenantId: ctx.tenant?.id,
        tenantName: ctx.tenant?.name,
      };
    }),

  // Procedimento que requer admin
  updateTenantSettings: protectedProcedure
    .use(requireTenant())
    .use(requireAdmin())
    .input(z.object({ setting: z.string(), value: z.any() }))
    .mutation(async ({ ctx, input }) => {
      // Apenas admins podem fazer isso
      return { success: true };
    }),

  // Procedimento que requer CTA Smart configurado
  syncCTAData: protectedProcedure
    .use(requireTenant())
    .use(requireCTASmartConfig())
    .mutation(async ({ ctx }) => {
      // CTA Smart está configurado
      return { synced: true };
    }),

  // Acessar dados do tenant
  getMyData: protectedProcedure
    .use(requireTenant())
    .query(({ ctx }) => {
      return {
        userId: ctx.user?.id,
        tenantId: ctx.tenant?.id,
        userRole: ctx.user?.role,
        isAdmin: ctx.isAdmin,
      };
    }),
});

// ============================================================================
// HEADERS ESPERADOS
// ============================================================================

// Option 1: Header X-Tenant-ID
fetch("/api/trpc/myRouter.getTenantData", {
  headers: {
    "X-Tenant-ID": "tenant-123",
    "Authorization": "Bearer token",
  },
});

// Option 2: Cookie tenant-id
fetch("/api/trpc/myRouter.getTenantData", {
  headers: {
    "Authorization": "Bearer token",
    "Cookie": "tenant-id=tenant-123",
  },
});

// Option 3: JWT com tenantId
// JWT payload: { tenantId: "tenant-123", userId: "user-123", ... }
`;
