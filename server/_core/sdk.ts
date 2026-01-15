/**
 * SDK simplificado - sem dependências do Manus OAuth
 * Autenticação é feita via JWT local
 */

import { ENV } from "./env";

// Utility function
const isNonEmptyString = (value: unknown): value is string =>
  typeof value === "string" && value.length > 0;

export type SessionPayload = {
  userId: number;
  username: string;
  name: string;
};

class SDKServer {
  private getSessionSecret() {
    const secret = ENV.cookieSecret;
    return new TextEncoder().encode(secret);
  }

  // Método mantido para compatibilidade, mas não faz nada
  async authenticateRequest(): Promise<null> {
    return null;
  }
}

export const sdk = new SDKServer();
