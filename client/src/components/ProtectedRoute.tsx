import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export function ProtectedRoute({ children, requireAdmin = false }: ProtectedRouteProps) {
  const [, setLocation] = useLocation();
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Ler token e dados do usuário do localStorage
    const token = localStorage.getItem("martins_auth_token");
    const userData = localStorage.getItem("martins_user_data");

    if (!token || !userData) {
      // Não autenticado, redireciona para login
      setLocation("/login");
      return;
    }

    try {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      
      // Verificar se requer admin
      if (requireAdmin && parsedUser.role !== "admin") {
        setLocation("/");
        return;
      }
      
      setIsLoading(false);
    } catch (error) {
      // Erro ao parsear dados, redireciona para login
      localStorage.removeItem("martins_auth_token");
      localStorage.removeItem("martins_user_data");
      setLocation("/login");
    }
  }, [setLocation, requireAdmin]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-slate-600">Verificando autenticação...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (requireAdmin && user.role !== "admin") {
    return null;
  }

  return <>{children}</>;
}
