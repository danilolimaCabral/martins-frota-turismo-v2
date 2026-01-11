import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { User } from "../../drizzle/schema";
import { sdk } from "./sdk";
import { verifyToken, getUserById } from "../auth";
import { db } from "../db";
import { localUsers } from "../../drizzle/schema";
import { eq } from "drizzle-orm";

// Tipo estendido do usuário com permissions
export type LocalUser = {
  id: number;
  username: string;
  nome: string;
  name: string; // Alias para nome
  email: string;
  phone?: string | null;
  role: "admin" | "user";
  ativo: boolean;
  active: boolean; // Alias para ativo
  permissions?: string;
};

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: (User | LocalUser) | null;
};

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  let user: (User | LocalUser) | null = null;

  // Tenta autenticação via JWT local primeiro
  const authHeader = opts.req.headers.authorization;
  
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.substring(7);
    const payload = verifyToken(token);
    
    if (payload) {
      // Buscar de localUsers
      const [localUser] = await db
        .select()
        .from(localUsers)
        .where(eq(localUsers.id, payload.userId))
        .limit(1);
      
      if (localUser && localUser.ativo) {
        user = {
          id: localUser.id,
          username: localUser.username,
          nome: localUser.nome,
          name: localUser.nome, // Alias
          email: localUser.email,
          phone: null,
          role: localUser.role,
          ativo: localUser.ativo,
          active: localUser.ativo, // Alias
          permissions: localUser.permissions || "{}",
        };
      }
    }
  }

  // Se não encontrou via JWT local, tenta Manus OAuth
  if (!user) {
    try {
      user = await sdk.authenticateRequest(opts.req);
    } catch (error) {
      // Ignora erro do Manus OAuth
    }
  }

  return {
    req: opts.req,
    res: opts.res,
    user,
  };
}
