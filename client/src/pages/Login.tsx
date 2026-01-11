import React from "react";
import { trpc } from "../lib/trpc";

export default function Login() {
  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  const loginMutation = trpc.localAuth.login.useMutation();
  const { data: setupData } = trpc.localAuth.needsSetup.useQuery();
  const createAdminMutation = trpc.localAuth.createDefaultAdmin.useMutation();

  const handleCreateAdmin = async () => {
    setLoading(true);
    try {
      const result = await createAdminMutation.mutateAsync();
      alert(`Admin criado!\nUsuário: ${result.username}\nSenha: ${result.password}`);
      setUsername("admin");
      setPassword("admin123");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username || !password) {
      setError("Preencha todos os campos");
      return;
    }
    
    setError("");
    setLoading(true);

    try {
      const result = await loginMutation.mutateAsync({
        username,
        password,
      });

      localStorage.setItem("martins_auth_token", result.token);
      localStorage.setItem("martins_user_data", JSON.stringify(result.user));
      
      window.location.href = "/admin";
    } catch (err: any) {
      setError(err.message || "Erro ao fazer login");
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "linear-gradient(135deg, #EBF4FF 0%, #FFE5D9 100%)",
      padding: "1rem"
    }}>
      <div style={{
        background: "white",
        borderRadius: "12px",
        boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
        padding: "2rem",
        width: "100%",
        maxWidth: "400px"
      }}>
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <img
            src="/logo-martins-clean.webp"
            alt="Martins"
            style={{ height: "64px", marginBottom: "1rem" }}
          />
          <h1 style={{ fontSize: "1.5rem", fontWeight: "bold", marginBottom: "0.5rem" }}>
            Sistema Martins
          </h1>
          <p style={{ color: "#666" }}>
            Entre com suas credenciais
          </p>
        </div>

        {setupData?.needsSetup && (
          <div style={{
            background: "#FEF3C7",
            border: "1px solid #FDE047",
            borderRadius: "6px",
            padding: "1rem",
            marginBottom: "1rem"
          }}>
            <p style={{ fontSize: "0.875rem", color: "#92400E", marginBottom: "0.5rem" }}>
              Nenhum usuário cadastrado. Clique abaixo para criar o admin padrão:
            </p>
            <button
              onClick={handleCreateAdmin}
              disabled={loading}
              style={{
                width: "100%",
                padding: "0.5rem",
                background: loading ? "#E5E7EB" : "white",
                color: "#1F2937",
                border: "1px solid #D1D5DB",
                borderRadius: "6px",
                fontSize: "0.875rem",
                fontWeight: "500",
                cursor: loading ? "not-allowed" : "pointer"
              }}
            >
              {loading ? "Criando..." : "Criar Usuário Admin"}
            </button>
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: "1rem" }}>
            <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "500" }}>
              Usuário
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Digite seu usuário"
              disabled={loading}
              style={{
                width: "100%",
                padding: "0.75rem",
                border: "1px solid #ddd",
                borderRadius: "6px",
                fontSize: "1rem"
              }}
            />
          </div>

          <div style={{ marginBottom: "1rem" }}>
            <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "500" }}>
              Senha
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Digite sua senha"
              disabled={loading}
              style={{
                width: "100%",
                padding: "0.75rem",
                border: "1px solid #ddd",
                borderRadius: "6px",
                fontSize: "1rem"
              }}
            />
          </div>

          {error && (
            <div style={{
              background: "#FEE2E2",
              color: "#DC2626",
              padding: "0.75rem",
              borderRadius: "6px",
              marginBottom: "1rem",
              fontSize: "0.875rem"
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "0.75rem",
              background: loading ? "#93C5FD" : "#2563EB",
              color: "white",
              border: "none",
              borderRadius: "6px",
              fontSize: "1rem",
              fontWeight: "500",
              cursor: loading ? "not-allowed" : "pointer"
            }}
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>
      </div>
    </div>
  );
}
