import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { User } from "../../drizzle/schema";
import { sdk } from "./sdk";
import { verifyToken, getUserById } from "../auth";

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: User | null;
};

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  let user: User | null = null;

  try {
    // Tenta autenticação via Manus OAuth primeiro
    user = await sdk.authenticateRequest(opts.req);
  } catch (error) {
    // Se falhar, tenta autenticação via JWT local
    const authHeader = opts.req.headers.authorization;
    
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.substring(7);
      const payload = verifyToken(token);
      
      if (payload) {
        const userData = await getUserById(payload.userId);
        if (userData) {
          user = userData as User;
        }
      }
    }
  }

  return {
    req: opts.req,
    res: opts.res,
    user,
  };
}
