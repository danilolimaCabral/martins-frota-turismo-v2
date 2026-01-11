import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import {
  Users,
  Plus,
  Edit,
  Trash2,
  UserCheck,
  UserX,
  Briefcase,
  DollarSign,
  Phone,
  Mail,
  Calendar,
  FileText,
  ArrowLeft,
} from "lucide-react";

export default function AdminFuncionarios() {
  const [, setLocation] = useLocation();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("todos");
  const [searchTerm, setSearchTerm] = useState("");

  // Form state
  const [formData, setFormData] = useState({
    nome: "",
    cpf: "",
    rg: "",
    dataNascimento: "",
    sexo: "M" as "M" | "F" | "Outro",
    estadoCivil: "Solteiro" as "Solteiro" | "Casado" | "Divorciado" | "Viuvo" | "Uniao Estavel",
    telefone: "",
    celular: "",
    email: "",
    cep: "",
    endereco: "",
    numero: "",
    bairro: "",
    cidade: "",
    estado: "",
    dataAdmissao: "",
    cargo: "",
    departamento: "",
    tipoContrato: "CLT" as "CLT" | "PJ" | "Estagiario" | "Temporario",
    salarioBase: "",
    valeTransporte: "0",
    valeAlimentacao: "0",
    planoSaude: "0",
    banco: "",
    agencia: "",
    conta: "",
    pisNumero: "",
    ctpsNumero: "",
    observacoes: "",
  });

  // Queries
  const { data: funcionarios, refetch } = trpc.funcionario.list.useQuery({
    status: statusFilter === "todos" ? undefined : statusFilter as any,
    search: searchTerm || undefined,
  });

  const { data: stats } = trpc.funcionario.getStats.useQuery();

  // Mutations
  const createMutation = trpc.funcionario.create.useMutation({
    onSuccess: () => {
      toast.success("Funcionário cadastrado com sucesso!");
      setIsDialogOpen(false);
      resetForm();
      refetch();
    },
    onError: (error) => {
      toast.error(`Erro: ${error.message}`);
    },
  });

  const updateMutation = trpc.funcionario.update.useMutation({
    onSuccess: () => {
      toast.success("Funcionário atualizado com sucesso!");
      setIsDialogOpen(false);
      resetForm();
      refetch();
    },
    onError: (error) => {
      toast.error(`Erro: ${error.message}`);
    },
  });

  const deleteMutation = trpc.funcionario.delete.useMutation({
    onSuccess: () => {
      toast.success("Funcionário removido com sucesso!");
      refetch();
    },
    onError: (error) => {
      toast.error(`Erro: ${error.message}`);
    },
  });

  const resetForm = () => {
    setFormData({
      nome: "",
      cpf: "",
      rg: "",
      dataNascimento: "",
      sexo: "M",
      estadoCivil: "Solteiro",
      telefone: "",
      celular: "",
      email: "",
      cep: "",
      endereco: "",
      numero: "",
      bairro: "",
      cidade: "",
      estado: "",
      dataAdmissao: "",
      cargo: "",
      departamento: "",
      tipoContrato: "CLT",
      salarioBase: "",
      valeTransporte: "0",
      valeAlimentacao: "0",
      planoSaude: "0",
      banco: "",
      agencia: "",
      conta: "",
      pisNumero: "",
      ctpsNumero: "",
      observacoes: "",
    });
    setEditingId(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingId) {
      updateMutation.mutate({ id: editingId, ...formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (funcionario: any) => {
    setFormData({
      nome: funcionario.nome || "",
      cpf: funcionario.cpf || "",
      rg: funcionario.rg || "",
      dataNascimento: funcionario.dataNascimento || "",
      sexo: funcionario.sexo || "M",
      estadoCivil: funcionario.estadoCivil || "Solteiro",
      telefone: funcionario.telefone || "",
      celular: funcionario.celular || "",
      email: funcionario.email || "",
      cep: funcionario.cep || "",
      endereco: funcionario.endereco || "",
      numero: funcionario.numero || "",
      bairro: funcionario.bairro || "",
      cidade: funcionario.cidade || "",
      estado: funcionario.estado || "",
      dataAdmissao: funcionario.dataAdmissao || "",
      cargo: funcionario.cargo || "",
      departamento: funcionario.departamento || "",
      tipoContrato: funcionario.tipoContrato || "CLT",
      salarioBase: funcionario.salarioBase || "",
      valeTransporte: funcionario.valeTransporte || "0",
      valeAlimentacao: funcionario.valeAlimentacao || "0",
      planoSaude: funcionario.planoSaude || "0",
      banco: funcionario.banco || "",
      agencia: funcionario.agencia || "",
      conta: funcionario.conta || "",
      pisNumero: funcionario.pisNumero || "",
      ctpsNumero: funcionario.ctpsNumero || "",
      observacoes: funcionario.observacoes || "",
    });
    setEditingId(funcionario.id);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Tem certeza que deseja remover este funcionário?")) {
      deleteMutation.mutate({ id });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ativo":
        return "bg-green-100 text-green-800 border-green-300";
      case "ferias":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "afastado":
        return "bg-orange-100 text-orange-800 border-orange-300";
      case "demitido":
        return "bg-gray-100 text-gray-800 border-gray-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setLocation("/admin")}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                  <Users className="h-6 w-6 text-blue-600" />
                  Gestão de Funcionários
                </h1>
                <p className="text-sm text-slate-600">
                  Cadastro e gerenciamento de colaboradores
                </p>
              </div>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  onClick={resetForm}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Funcionário
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {editingId ? "Editar Funcionário" : "Novo Funcionário"}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Dados Pessoais */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Dados Pessoais</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="nome">Nome Completo *</Label>
                        <Input
                          id="nome"
                          value={formData.nome}
                          onChange={(e) =>
                            setFormData({ ...formData, nome: e.target.value })
                          }
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="cpf">CPF *</Label>
                        <Input
                          id="cpf"
                          value={formData.cpf}
                          onChange={(e) =>
                            setFormData({ ...formData, cpf: e.target.value })
                          }
                          placeholder="000.000.000-00"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="rg">RG</Label>
                        <Input
                          id="rg"
                          value={formData.rg}
                          onChange={(e) =>
                            setFormData({ ...formData, rg: e.target.value })
                          }
                        />
                      </div>
                      <div>
                        <Label htmlFor="dataNascimento">Data de Nascimento</Label>
                        <Input
                          id="dataNascimento"
                          type="date"
                          value={formData.dataNascimento}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              dataNascimento: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div>
                        <Label htmlFor="sexo">Sexo</Label>
                        <Select
                          value={formData.sexo}
                          onValueChange={(value: any) =>
                            setFormData({ ...formData, sexo: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="M">Masculino</SelectItem>
                            <SelectItem value="F">Feminino</SelectItem>
                            <SelectItem value="Outro">Outro</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="estadoCivil">Estado Civil</Label>
                        <Select
                          value={formData.estadoCivil}
                          onValueChange={(value: any) =>
                            setFormData({ ...formData, estadoCivil: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Solteiro">Solteiro(a)</SelectItem>
                            <SelectItem value="Casado">Casado(a)</SelectItem>
                            <SelectItem value="Divorciado">Divorciado(a)</SelectItem>
                            <SelectItem value="Viuvo">Viúvo(a)</SelectItem>
                            <SelectItem value="Uniao Estavel">União Estável</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  {/* Contato */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Contato</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="telefone">Telefone</Label>
                        <Input
                          id="telefone"
                          value={formData.telefone}
                          onChange={(e) =>
                            setFormData({ ...formData, telefone: e.target.value })
                          }
                        />
                      </div>
                      <div>
                        <Label htmlFor="celular">Celular</Label>
                        <Input
                          id="celular"
                          value={formData.celular}
                          onChange={(e) =>
                            setFormData({ ...formData, celular: e.target.value })
                          }
                        />
                      </div>
                      <div>
                        <Label htmlFor="email">E-mail</Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) =>
                            setFormData({ ...formData, email: e.target.value })
                          }
                        />
                      </div>
                    </div>
                  </div>

                  {/* Endereço */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Endereço</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="cep">CEP</Label>
                        <Input
                          id="cep"
                          value={formData.cep}
                          onChange={(e) =>
                            setFormData({ ...formData, cep: e.target.value })
                          }
                        />
                      </div>
                      <div>
                        <Label htmlFor="endereco">Endereço</Label>
                        <Input
                          id="endereco"
                          value={formData.endereco}
                          onChange={(e) =>
                            setFormData({ ...formData, endereco: e.target.value })
                          }
                        />
                      </div>
                      <div>
                        <Label htmlFor="numero">Número</Label>
                        <Input
                          id="numero"
                          value={formData.numero}
                          onChange={(e) =>
                            setFormData({ ...formData, numero: e.target.value })
                          }
                        />
                      </div>
                      <div>
                        <Label htmlFor="bairro">Bairro</Label>
                        <Input
                          id="bairro"
                          value={formData.bairro}
                          onChange={(e) =>
                            setFormData({ ...formData, bairro: e.target.value })
                          }
                        />
                      </div>
                      <div>
                        <Label htmlFor="cidade">Cidade</Label>
                        <Input
                          id="cidade"
                          value={formData.cidade}
                          onChange={(e) =>
                            setFormData({ ...formData, cidade: e.target.value })
                          }
                        />
                      </div>
                      <div>
                        <Label htmlFor="estado">Estado</Label>
                        <Input
                          id="estado"
                          value={formData.estado}
                          onChange={(e) =>
                            setFormData({ ...formData, estado: e.target.value })
                          }
                          maxLength={2}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Dados Contratuais */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Dados Contratuais</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="dataAdmissao">Data de Admissão *</Label>
                        <Input
                          id="dataAdmissao"
                          type="date"
                          value={formData.dataAdmissao}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              dataAdmissao: e.target.value,
                            })
                          }
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="cargo">Cargo *</Label>
                        <Input
                          id="cargo"
                          value={formData.cargo}
                          onChange={(e) =>
                            setFormData({ ...formData, cargo: e.target.value })
                          }
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="departamento">Departamento</Label>
                        <Input
                          id="departamento"
                          value={formData.departamento}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              departamento: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div>
                        <Label htmlFor="tipoContrato">Tipo de Contrato</Label>
                        <Select
                          value={formData.tipoContrato}
                          onValueChange={(value: any) =>
                            setFormData({ ...formData, tipoContrato: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="CLT">CLT</SelectItem>
                            <SelectItem value="PJ">PJ</SelectItem>
                            <SelectItem value="Estagiario">Estagiário</SelectItem>
                            <SelectItem value="Temporario">Temporário</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  {/* Dados Salariais */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Dados Salariais</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="salarioBase">Salário Base *</Label>
                        <Input
                          id="salarioBase"
                          type="number"
                          step="0.01"
                          value={formData.salarioBase}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              salarioBase: e.target.value,
                            })
                          }
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="valeTransporte">Vale Transporte</Label>
                        <Input
                          id="valeTransporte"
                          type="number"
                          step="0.01"
                          value={formData.valeTransporte}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              valeTransporte: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div>
                        <Label htmlFor="valeAlimentacao">Vale Alimentação</Label>
                        <Input
                          id="valeAlimentacao"
                          type="number"
                          step="0.01"
                          value={formData.valeAlimentacao}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              valeAlimentacao: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div>
                        <Label htmlFor="planoSaude">Plano de Saúde</Label>
                        <Input
                          id="planoSaude"
                          type="number"
                          step="0.01"
                          value={formData.planoSaude}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              planoSaude: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>
                  </div>

                  {/* Dados Bancários */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Dados Bancários</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="banco">Banco</Label>
                        <Input
                          id="banco"
                          value={formData.banco}
                          onChange={(e) =>
                            setFormData({ ...formData, banco: e.target.value })
                          }
                        />
                      </div>
                      <div>
                        <Label htmlFor="agencia">Agência</Label>
                        <Input
                          id="agencia"
                          value={formData.agencia}
                          onChange={(e) =>
                            setFormData({ ...formData, agencia: e.target.value })
                          }
                        />
                      </div>
                      <div>
                        <Label htmlFor="conta">Conta</Label>
                        <Input
                          id="conta"
                          value={formData.conta}
                          onChange={(e) =>
                            setFormData({ ...formData, conta: e.target.value })
                          }
                        />
                      </div>
                    </div>
                  </div>

                  {/* Documentos */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Documentos</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="pisNumero">PIS</Label>
                        <Input
                          id="pisNumero"
                          value={formData.pisNumero}
                          onChange={(e) =>
                            setFormData({ ...formData, pisNumero: e.target.value })
                          }
                        />
                      </div>
                      <div>
                        <Label htmlFor="ctpsNumero">CTPS</Label>
                        <Input
                          id="ctpsNumero"
                          value={formData.ctpsNumero}
                          onChange={(e) =>
                            setFormData({ ...formData, ctpsNumero: e.target.value })
                          }
                        />
                      </div>
                    </div>
                  </div>

                  {/* Observações */}
                  <div>
                    <Label htmlFor="observacoes">Observações</Label>
                    <Textarea
                      id="observacoes"
                      value={formData.observacoes}
                      onChange={(e) =>
                        setFormData({ ...formData, observacoes: e.target.value })
                      }
                      rows={3}
                    />
                  </div>

                  <div className="flex justify-end gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsDialogOpen(false)}
                    >
                      Cancelar
                    </Button>
                    <Button
                      type="submit"
                      className="bg-blue-600 hover:bg-blue-700"
                      disabled={createMutation.isPending || updateMutation.isPending}
                    >
                      {editingId ? "Atualizar" : "Cadastrar"}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">
                Funcionários Ativos
              </CardTitle>
              <UserCheck className="h-5 w-5 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">
                {stats?.totalAtivos || 0}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">
                Em Férias
              </CardTitle>
              <Calendar className="h-5 w-5 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">
                {stats?.totalFerias || 0}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">
                Afastados
              </CardTitle>
              <UserX className="h-5 w-5 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">
                {stats?.totalAfastados || 0}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">
                Custo Mensal
              </CardTitle>
              <DollarSign className="h-5 w-5 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">
                R$ {((stats?.custoFolha || 0) / 1000).toFixed(1)}k
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="search">Buscar</Label>
                <Input
                  id="search"
                  placeholder="Nome ou CPF..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="statusFilter">Status</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                    <SelectItem value="ativo">Ativos</SelectItem>
                    <SelectItem value="ferias">Em Férias</SelectItem>
                    <SelectItem value="afastado">Afastados</SelectItem>
                    <SelectItem value="demitido">Demitidos</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Funcionários List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {funcionarios?.map((func: any) => (
            <Card key={func.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-1">{func.nome}</CardTitle>
                    <p className="text-sm text-slate-600 flex items-center gap-1">
                      <Briefcase className="h-4 w-4" />
                      {func.cargo}
                    </p>
                  </div>
                  <span
                    className={`px-2 py-1 text-xs font-semibold rounded border ${getStatusColor(
                      func.status
                    )}`}
                  >
                    {func.status}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="text-sm text-slate-600 flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  CPF: {func.cpf}
                </div>
                {func.celular && (
                  <div className="text-sm text-slate-600 flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    {func.celular}
                  </div>
                )}
                {func.email && (
                  <div className="text-sm text-slate-600 flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    {func.email}
                  </div>
                )}
                <div className="text-sm font-semibold text-blue-600 flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  R$ {parseFloat(func.salarioBase || "0").toLocaleString("pt-BR", {
                    minimumFractionDigits: 2,
                  })}
                </div>

                <div className="flex gap-2 pt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(func)}
                    className="flex-1"
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Editar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(func.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {funcionarios?.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <Users className="h-12 w-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-600">Nenhum funcionário encontrado</p>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
