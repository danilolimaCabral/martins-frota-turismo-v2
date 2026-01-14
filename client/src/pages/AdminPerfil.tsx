import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Lock, Mail, CheckCircle2 , ArrowLeft } from "lucide-react";
import { trpc } from "@/lib/trpc";

export default function AdminPerfil() {
  const [, setLocation] = useLocation();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const { data: profile, refetch } = trpc.profile.getProfile.useQuery();
  const updateProfile = trpc.profile.updateProfile.useMutation();
  const changePassword = trpc.profile.changePassword.useMutation();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
  });

  // Atualizar formData quando profile carregar
  useState(() => {
    if (profile) {
      setFormData({
        name: profile.nome || "",
        email: profile.email || "",
      });
    }
  });

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateProfile.mutateAsync(formData);
      alert("Perfil atualizado com sucesso!");
      refetch();
    } catch (error: any) {
      alert(`Erro: ${error.message}`);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      alert("As senhas não coincidem!");
      return;
    }

    if (newPassword.length < 6) {
      alert("A nova senha deve ter pelo menos 6 caracteres!");
      return;
    }

    try {
      await changePassword.mutateAsync({
        currentPassword,
        newPassword,
      });
      alert("Senha alterada com sucesso!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      alert(`Erro: ${error.message}`);
    }
  };

  if (!profile) {
    return <div className="p-6">Carregando perfil...</div>;
  }

  // Parse permissions
  const permissions = profile.permissions 
    ? (typeof profile.permissions === 'string' ? JSON.parse(profile.permissions) : profile.permissions)
    : {};

  const permissionLabels: Record<string, string> = {
    rh: "Recursos Humanos",
    financeiro: "Financeiro",
    frota: "Frota",
    agenda: "Agenda",
    roteirizacao: "Roteirização",
    relatorios: "Relatórios",
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Botão Voltar */}
      <div className="mb-6 flex items-center gap-2">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-orange-600 hover:bg-orange-700 text-white transition-colors font-medium"
        >
          <ArrowLeft size={20} />
          <span>Voltar</span>
        </button>
      </div>

      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-900">Meu Perfil</h1>
        <p className="text-slate-600">Gerencie suas informações pessoais e senha</p>
      </div>

      <div className="grid gap-6">
        {/* Informações Pessoais */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Informações Pessoais
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div>
                <Label htmlFor="username">Usuário</Label>
                <Input
                  id="username"
                  value={profile.username}
                  disabled
                  className="bg-slate-50"
                />
              </div>

              <div>
                <Label htmlFor="name">Nome Completo</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Seu nome completo"
                />
              </div>

              <div>
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="seu@email.com"
                />
              </div>

              <div>
                <Label>Perfil</Label>
                <Input
                  value={profile.role === 'admin' ? 'Administrador' : 'Usuário'}
                  disabled
                  className="bg-slate-50 capitalize"
                />
              </div>

              <Button type="submit" disabled={updateProfile.isPending}>
                {updateProfile.isPending ? "Salvando..." : "Salvar Alterações"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Permissões */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5" />
              Minhas Permissões
            </CardTitle>
          </CardHeader>
          <CardContent>
            {profile.role === 'admin' ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-green-800 font-semibold">✅ Administrador - Acesso Total</p>
                <p className="text-sm text-green-700 mt-1">
                  Você tem acesso completo a todos os módulos do sistema.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {Object.keys(permissionLabels).map((key) => (
                  <div
                    key={key}
                    className={`flex items-center gap-3 p-3 rounded-lg border ${
                      permissions[key]
                        ? "bg-green-50 border-green-200"
                        : "bg-slate-50 border-slate-200"
                    }`}
                  >
                    {permissions[key] ? (
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                    ) : (
                      <div className="w-5 h-5 rounded-full border-2 border-slate-300" />
                    )}
                    <span
                      className={
                        permissions[key] ? "text-green-800 font-medium" : "text-slate-500"
                      }
                    >
                      {permissionLabels[key]}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Alterar Senha */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5" />
              Alterar Senha
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <Label htmlFor="currentPassword">Senha Atual</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Digite sua senha atual"
                  required
                />
              </div>

              <div>
                <Label htmlFor="newPassword">Nova Senha</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Digite a nova senha (mínimo 6 caracteres)"
                  required
                />
              </div>

              <div>
                <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Digite novamente a nova senha"
                  required
                />
              </div>

              <Button type="submit" disabled={changePassword.isPending}>
                {changePassword.isPending ? "Alterando..." : "Alterar Senha"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
