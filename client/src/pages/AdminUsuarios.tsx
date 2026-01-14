import { useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "../lib/trpc";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Users, Plus, Edit, Trash2, Shield, User as UserIcon , ArrowLeft } from "lucide-react";

export default function AdminUsuarios() {
  const [, setLocation] = useLocation();
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    nome: "",
    email: "",
    role: "user" as "admin" | "user",
    permissions: {
      rh: false,
      financeiro: false,
      frota: false,
      agenda: false,
      roteirizacao: false,
      relatorios: false,
    },
  });

  const { data: users, refetch } = trpc.localAuth.listUsers.useQuery();
  const createMutation = trpc.localAuth.createUser.useMutation();
  const updateMutation = trpc.localAuth.updateUser.useMutation();
  const deleteMutation = trpc.localAuth.deleteUser.useMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingUser) {
        // Atualizar
        const updateData: any = {
          id: editingUser.id,
          username: formData.username,
          nome: formData.nome,
          email: formData.email,
          role: formData.role,
          permissions: JSON.stringify(formData.permissions),
        };
        if (formData.password) {
          updateData.password = formData.password;
        }
        await updateMutation.mutateAsync(updateData);
        alert("Usuário atualizado com sucesso!");
      } else {
        // Criar
        await createMutation.mutateAsync({
          username: formData.username,
          password: formData.password,
          nome: formData.nome,
          email: formData.email,
          role: formData.role,
          permissions: JSON.stringify(formData.permissions),
        });
        alert("Usuário criado com sucesso!");
      }

      setShowForm(false);
      setEditingUser(null);
      setFormData({
        username: "",
        password: "",
        nome: "",
        email: "",
        role: "user",
        permissions: {
          rh: false,
          financeiro: false,
          frota: false,
          agenda: false,
          roteirizacao: false,
          relatorios: false,
        },
      });
      refetch();
    } catch (err: any) {
      alert(err.message || "Erro ao salvar usuário");
    }
  };

  const handleEdit = (user: any) => {
    setEditingUser(user);
    let permissions = {
      rh: false,
      financeiro: false,
      frota: false,
      agenda: false,
      roteirizacao: false,
      relatorios: false,
    };
    if (user.permissions) {
      try {
        permissions = JSON.parse(user.permissions);
      } catch (e) {
        console.error("Erro ao parsear permissões", e);
      }
    }
    setFormData({
      username: user.username,
      password: "",
      nome: user.nome,
      email: user.email,
      role: user.role,
      permissions,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Tem certeza que deseja deletar este usuário?")) return;

    try {
      await deleteMutation.mutateAsync({ id });
      alert("Usuário deletado com sucesso!");
      refetch();
    } catch (err: any) {
      alert(err.message || "Erro ao deletar usuário");
    }
  };

  const handleToggleActive = async (user: any) => {
    try {
      await updateMutation.mutateAsync({
        id: user.id,
        ativo: !user.ativo,
      });
      refetch();
    } catch (err: any) {
      alert(err.message || "Erro ao atualizar status");
    }
  };

  return (
    <div className="container mx-auto p-6">
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

      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Users className="h-8 w-8" />
            Gestão de Usuários
          </h1>
          <p className="text-slate-600 mt-1">Gerencie usuários e permissões do sistema</p>
        </div>
        <Button onClick={() => {
          setShowForm(true);
          setEditingUser(null);
          setFormData({
            username: "",
            password: "",
            nome: "",
            email: "",
            role: "user",
            permissions: {
              rh: false,
              financeiro: false,
              frota: false,
              agenda: false,
              roteirizacao: false,
              relatorios: false,
            },
          });
        }}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Usuário
        </Button>
      </div>

      {showForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>{editingUser ? "Editar Usuário" : "Novo Usuário"}</CardTitle>
            <CardDescription>
              {editingUser ? "Atualize as informações do usuário" : "Preencha os dados do novo usuário"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="username">Usuário</Label>
                  <Input
                    id="username"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    required
                    disabled={!!editingUser}
                  />
                </div>
                <div>
                  <Label htmlFor="password">Senha {editingUser && "(deixe em branco para manter)"}</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required={!editingUser}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="nome">Nome Completo</Label>
                  <Input
                    id="nome"
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="email">E-mail</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="role">Perfil</Label>
                <select
                  id="role"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as "admin" | "user" })}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="user">Usuário</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>

              {/* Permissões Granulares (apenas para usuários não-admin) */}
              {formData.role !== "admin" && (
                <div className="border rounded-lg p-4 bg-slate-50">
                  <Label className="text-base font-semibold mb-3 block">Permissões de Acesso</Label>
                  <p className="text-sm text-slate-600 mb-4">Selecione os módulos que este usuário poderá acessar:</p>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { key: "rh", label: "RH" },
                      { key: "financeiro", label: "Financeiro" },
                      { key: "frota", label: "Frota" },
                      { key: "agenda", label: "Agenda" },
                      { key: "roteirizacao", label: "Roteirização" },
                      { key: "relatorios", label: "Relatórios" },
                    ].map((perm) => (
                      <label key={perm.key} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.permissions[perm.key as keyof typeof formData.permissions]}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              permissions: {
                                ...formData.permissions,
                                [perm.key]: e.target.checked,
                              },
                            })
                          }
                          className="w-4 h-4"
                        />
                        <span className="text-sm">{perm.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <Button type="submit">
                  {editingUser ? "Atualizar" : "Criar"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowForm(false);
                    setEditingUser(null);
                  }}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Usuários Cadastrados</CardTitle>
          <CardDescription>Total: {users?.length || 0} usuários</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3">Usuário</th>
                  <th className="text-left p-3">Nome</th>
                  <th className="text-left p-3">E-mail</th>
                  <th className="text-left p-3">Perfil</th>
                  <th className="text-left p-3">Status</th>
                  <th className="text-left p-3">Ações</th>
                </tr>
              </thead>
              <tbody>
                {users?.map((user) => (
                  <tr key={user.id} className="border-b hover:bg-slate-50">
                    <td className="p-3 font-mono">{user.username}</td>
                    <td className="p-3">{user.nome}</td>
                    <td className="p-3">{user.email}</td>
                    <td className="p-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs ${
                        user.role === "admin" ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"
                      }`}>
                        {user.role === "admin" ? <Shield className="h-3 w-3" /> : <UserIcon className="h-3 w-3" />}
                        {user.role === "admin" ? "Admin" : "Usuário"}
                      </span>
                    </td>
                    <td className="p-3">
                      <button
                        onClick={() => handleToggleActive(user)}
                        className={`px-2 py-1 rounded text-xs ${
                          user.ativo ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                        }`}
                      >
                        {user.ativo ? "Ativo" : "Inativo"}
                      </button>
                    </td>
                    <td className="p-3">
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(user)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(user.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
