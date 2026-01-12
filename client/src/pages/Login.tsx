import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Eye, EyeOff, Loader } from "lucide-react";
import { trpc } from "@/lib/trpc";

export function Login() {
  const [, setLocation] = useLocation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showSetupButton, setShowSetupButton] = useState(false);

  // Verificar se precisa criar admin
  const { data: setupData } = trpc.localAuth.needsSetup.useQuery();
  
  const createAdminMutation = trpc.localAuth.createDefaultAdmin.useMutation({
    onSuccess: (data) => {
      setShowSetupButton(false);
      setError("");
      setUsername(data.username);
      setPassword(data.password);
    },
    onError: (error) => {
      setError(error.message || "Erro ao criar admin");
    },
  });

  const loginMutation = trpc.localAuth.login.useMutation({
    onSuccess: (data) => {
      // Salvar token no localStorage
      localStorage.setItem("martins_auth_token", data.token);
      localStorage.setItem("martins_user_data", JSON.stringify(data.user));
      
      // Redirecionar para o dashboard
      setLocation("/admin");
    },
    onError: (error) => {
      setError(error.message || "Erro ao fazer login");
      setIsLoading(false);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    if (!username || !password) {
      setError("Usuário e senha são obrigatórios");
      setIsLoading(false);
      return;
    }

    loginMutation.mutate({ username, password });
  };

  const handleCreateAdmin = () => {
    createAdminMutation.mutate();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl" />
      </div>

      {/* Login Card */}
      <Card className="relative w-full max-w-md bg-white/10 backdrop-blur-md border-white/20 shadow-2xl">
        <CardHeader className="space-y-4 text-center pb-6">
          {/* Logo */}
          <div className="flex justify-center mb-4">
            <img
              src="/logo-martins-clean.png"
              alt="Martins Turismo"
              className="h-20 w-auto object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "/logo-martins-clean.webp";
              }}
            />
          </div>

          <div>
            <CardTitle className="text-3xl font-bold text-white mb-2">
              Martins Turismo
            </CardTitle>
            <p className="text-white/60">Sistema de Gestão</p>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Error Message */}
          {error && (
            <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-red-200 text-sm">{error}</p>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username Field */}
            <div className="space-y-2">
              <label className="text-white text-sm font-medium">Usuário</label>
              <Input
                type="text"
                placeholder="Digite seu usuário"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:border-blue-500"
                disabled={isLoading}
              />
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label className="text-white text-sm font-medium">Senha</label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Digite sua senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:border-blue-500 pr-10"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white transition-colors"
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-2 rounded-lg transition-all"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader className="h-4 w-4 mr-2 animate-spin" />
                  Entrando...
                </>
              ) : (
                "Entrar"
              )}
            </Button>
          </form>

          {/* Setup Button */}
          {setupData?.needsSetup && (
            <Button
              type="button"
              onClick={handleCreateAdmin}
              className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-2 rounded-lg transition-all"
              disabled={createAdminMutation.isPending}
            >
              {createAdminMutation.isPending ? (
                <>
                  <Loader className="h-4 w-4 mr-2 animate-spin" />
                  Criando Admin...
                </>
              ) : (
                "🚀 Criar Usuário Admin"
              )}
            </Button>
          )}

          {/* Demo Credentials */}
          <div className="bg-white/5 border border-white/10 rounded-lg p-4">
            <p className="text-white/60 text-xs font-semibold mb-2">
              Credenciais de Teste:
            </p>
            <div className="space-y-1 text-white/50 text-xs">
              <p>👤 Usuário: <span className="text-white/70 font-mono">admin</span></p>
              <p>🔑 Senha: <span className="text-white/70 font-mono">admin123</span></p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default Login;
