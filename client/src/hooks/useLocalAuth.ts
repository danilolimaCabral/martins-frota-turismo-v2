import { trpc } from "@/lib/trpc";
import { useCallback, useEffect, useMemo, useState } from "react";

const TOKEN_KEY = "martins_auth_token";
const USER_KEY = "martins_user_data";

interface AuthUser {
  id: number;
  username: string;
  name: string;
  email: string | null;
  phone: string | null;
  role: "admin" | "funcionario" | "motorista";
  active: boolean;
}

interface UseAuthOptions {
  redirectOnUnauthenticated?: boolean;
  redirectPath?: string;
}

/**
 * Hook de autenticação local (sem Manus OAuth)
 */
export function useLocalAuth(options?: UseAuthOptions) {
  const { redirectOnUnauthenticated = false, redirectPath = "/login" } =
    options ?? {};

  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem(TOKEN_KEY)
  );
  const [user, setUser] = useState<AuthUser | null>(() => {
    const stored = localStorage.getItem(USER_KEY);
    return stored ? JSON.parse(stored) : null;
  });

  // Decodifica o token JWT para pegar o userId
  const getUserIdFromToken = useCallback((token: string): number | null => {
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload.userId || null;
    } catch {
      return null;
    }
  }, []);

  const userId = useMemo(() => {
    if (!token) return null;
    return getUserIdFromToken(token);
  }, [token, getUserIdFromToken]);

  // Função de login
  const login = useCallback((newToken: string, userData: AuthUser) => {
    localStorage.setItem(TOKEN_KEY, newToken);
    localStorage.setItem(USER_KEY, JSON.stringify(userData));
    setToken(newToken);
    setUser(userData);
  }, []);

  // Função de logout
  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setToken(null);
    setUser(null);
  }, []);

  // Busca dados do usuário se tiver token
  const meQuery = trpc.auth.me.useQuery(
    undefined,
    {
      enabled: !!userId,
      retry: false,
      refetchOnWindowFocus: false,
    }
  );

  // Atualiza user quando meQuery retorna dados
  useEffect(() => {
    if (meQuery.data) {
      setUser(meQuery.data);
      localStorage.setItem(USER_KEY, JSON.stringify(meQuery.data));
    }
  }, [meQuery.data]);

  // Limpa auth se houver erro
  useEffect(() => {
    if (meQuery.error) {
      logout();
    }
  }, [meQuery.error, logout]);

  // Redireciona se não autenticado
  useEffect(() => {
    if (!redirectOnUnauthenticated) return;
    if (meQuery.isLoading) return;
    if (user) return;
    if (typeof window === "undefined") return;
    if (window.location.pathname === redirectPath) return;

    window.location.href = redirectPath;
  }, [redirectOnUnauthenticated, redirectPath, meQuery.isLoading, user]);

  return {
    user,
    token,
    loading: meQuery.isLoading,
    error: meQuery.error,
    isAuthenticated: !!user && !!token,
    login,
    logout,
    refresh: () => meQuery.refetch(),
  };
}
