import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, FileText, Mail, CheckCircle, XCircle, ArrowLeft } from "lucide-react";
import { trpc } from "@/lib/trpc";


const statusColors: Record<string, string> = {
  rascunho: "bg-gray-100 text-gray-800",
  enviada: "bg-blue-100 text-blue-800",
  aceita: "bg-green-100 text-green-800",
  rejeitada: "bg-red-100 text-red-800",
  expirada: "bg-yellow-100 text-yellow-800",
};

const statusLabels: Record<string, string> = {
  rascunho: "Rascunho",
  enviada: "Enviada",
  aceita: "Aceita",
  rejeitada: "Rejeitada",
  expirada: "Expirada",
};

export default function AdminPropostas() {
  const [location, navigate] = useLocation();
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    numeroOrcamento: "",
    nomeEmpresa: "",
    cnpj: "",
    contatoPrincipal: "",
    emailCliente: "",
    telefoneCliente: "",
    enderecoCliente: "",
    tipoFretamento: "corporativo",
    descricaoServico: "",
    dataInicio: "",
    dataTermino: "",
    frequencia: "diária",
    horariosColeta: "",
    pontosColeta: "",
    destinos: "",
    quantidadeVeiculos: 1,
    tipoVeiculo: "van-pequena",
    capacidadePassageiros: 15,
    especificacoes: "",
    valorDia: 0,
    quantidadeDias: 1,
    desconto: 0,
    formaPagamento: "boleto",
    condicoesEspeciais: "",
    observacoes: "",
  });

  const { data: propostas } = trpc.propostas.list.useQuery();
  const createMutation = trpc.propostas.create.useMutation();
  const updateMutation = trpc.propostas.update.useMutation();
  const deleteMutation = trpc.propostas.delete.useMutation();
  const enviarMutation = trpc.propostas.enviarEmail.useMutation();

  const handleCreate = async () => {
    try {
      await createMutation.mutateAsync(formData as any);
      console.log("Proposta criada com sucesso");
      setIsCreating(false);
      setFormData({
        numeroOrcamento: "",
        nomeEmpresa: "",
        cnpj: "",
        contatoPrincipal: "",
        emailCliente: "",
        telefoneCliente: "",
        enderecoCliente: "",
        tipoFretamento: "corporativo",
        descricaoServico: "",
        dataInicio: "",
        dataTermino: "",
        frequencia: "diária",
        horariosColeta: "",
        pontosColeta: "",
        destinos: "",
        quantidadeVeiculos: 1,
        tipoVeiculo: "van-pequena",
        capacidadePassageiros: 15,
        especificacoes: "",
        valorDia: 0,
        quantidadeDias: 1,
        desconto: 0,
        formaPagamento: "boleto",
        condicoesEspeciais: "",
        observacoes: "",
      });
    } catch (error) {
      console.error("Erro ao criar proposta");
    }
  };

  const handleEnviar = async (id: number, email: string) => {
    try {
      await enviarMutation.mutateAsync({ id, emailDestino: email });
      console.log("Proposta enviada com sucesso");
    } catch (error) {
      console.error("Erro ao enviar proposta");
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteMutation.mutateAsync({ id });
      console.log("Proposta deletada com sucesso");
    } catch (error) {
      console.error("Erro ao deletar proposta");
    }
  };

  const valorTotal = (formData.valorDia * formData.quantidadeDias) - formData.desconto;

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => navigate("/admin")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Propostas de Fretamento</h1>
            <p className="text-gray-500">Gerencie e crie propostas para seus clientes</p>
          </div>
        </div>
        <Dialog open={isCreating} onOpenChange={setIsCreating}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <FileText className="h-4 w-4" />
              Nova Proposta
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto max-w-2xl">
            <DialogHeader>
              <DialogTitle>Criar Nova Proposta</DialogTitle>
              <DialogDescription>Preencha os dados da proposta de fretamento</DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {/* Informações da Proposta */}
              <div className="space-y-2">
                <h3 className="font-semibold text-sm">Informações da Proposta</h3>
                <Input
                  placeholder="Número do Orçamento (ex: #30/2026)"
                  value={formData.numeroOrcamento}
                  onChange={(e) => setFormData({ ...formData, numeroOrcamento: e.target.value })}
                />
              </div>

              {/* Informações do Cliente */}
              <div className="space-y-2">
                <h3 className="font-semibold text-sm">Informações do Cliente</h3>
                <Input
                  placeholder="Nome da Empresa"
                  value={formData.nomeEmpresa}
                  onChange={(e) => setFormData({ ...formData, nomeEmpresa: e.target.value })}
                />
                <Input
                  placeholder="CNPJ"
                  value={formData.cnpj}
                  onChange={(e) => setFormData({ ...formData, cnpj: e.target.value })}
                />
                <Input
                  placeholder="Contato Principal"
                  value={formData.contatoPrincipal}
                  onChange={(e) => setFormData({ ...formData, contatoPrincipal: e.target.value })}
                />
                <Input
                  type="email"
                  placeholder="Email"
                  value={formData.emailCliente}
                  onChange={(e) => setFormData({ ...formData, emailCliente: e.target.value })}
                />
                <Input
                  placeholder="Telefone"
                  value={formData.telefoneCliente}
                  onChange={(e) => setFormData({ ...formData, telefoneCliente: e.target.value })}
                />
                <Textarea
                  placeholder="Endereço"
                  value={formData.enderecoCliente}
                  onChange={(e) => setFormData({ ...formData, enderecoCliente: e.target.value })}
                />
              </div>

              {/* Detalhes do Serviço */}
              <div className="space-y-2">
                <h3 className="font-semibold text-sm">Detalhes do Serviço</h3>
                <Select value={formData.tipoFretamento} onValueChange={(value) => setFormData({ ...formData, tipoFretamento: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Tipo de Fretamento" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="corporativo">Corporativo</SelectItem>
                    <SelectItem value="turismo">Turismo</SelectItem>
                    <SelectItem value="escolar">Escolar</SelectItem>
                    <SelectItem value="evento">Evento</SelectItem>
                  </SelectContent>
                </Select>
                <Textarea
                  placeholder="Descrição do Serviço"
                  value={formData.descricaoServico}
                  onChange={(e) => setFormData({ ...formData, descricaoServico: e.target.value })}
                />
                <Input
                  type="date"
                  value={formData.dataInicio}
                  onChange={(e) => setFormData({ ...formData, dataInicio: e.target.value })}
                />
                <Input
                  type="date"
                  value={formData.dataTermino}
                  onChange={(e) => setFormData({ ...formData, dataTermino: e.target.value })}
                />
              </div>

              {/* Detalhes da Frota */}
              <div className="space-y-2">
                <h3 className="font-semibold text-sm">Detalhes da Frota</h3>
                <Input
                  type="number"
                  placeholder="Quantidade de Veículos"
                  value={formData.quantidadeVeiculos}
                  onChange={(e) => setFormData({ ...formData, quantidadeVeiculos: parseInt(e.target.value) })}
                />
                <Select value={formData.tipoVeiculo} onValueChange={(value) => setFormData({ ...formData, tipoVeiculo: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Tipo de Veículo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="van-pequena">Van Pequena (até 15 pass.)</SelectItem>
                    <SelectItem value="van-grande">Van Grande (até 19 pass.)</SelectItem>
                    <SelectItem value="microonibus">Micro-ônibus (até 30 pass.)</SelectItem>
                    <SelectItem value="onibus">Ônibus (até 45 pass.)</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  type="number"
                  placeholder="Capacidade de Passageiros"
                  value={formData.capacidadePassageiros}
                  onChange={(e) => setFormData({ ...formData, capacidadePassageiros: parseInt(e.target.value) })}
                />
              </div>

              {/* Valores */}
              <div className="space-y-2">
                <h3 className="font-semibold text-sm">Valores</h3>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    type="number"
                    placeholder="Valor por Dia"
                    value={formData.valorDia}
                    onChange={(e) => setFormData({ ...formData, valorDia: parseFloat(e.target.value) })}
                  />
                  <Input
                    type="number"
                    placeholder="Quantidade de Dias"
                    value={formData.quantidadeDias}
                    onChange={(e) => setFormData({ ...formData, quantidadeDias: parseInt(e.target.value) })}
                  />
                  <Input
                    type="number"
                    placeholder="Desconto"
                    value={formData.desconto}
                    onChange={(e) => setFormData({ ...formData, desconto: parseFloat(e.target.value) })}
                  />
                  <div className="flex items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm font-semibold">
                    Total: R$ {valorTotal.toFixed(2)}
                  </div>
                </div>
              </div>

              <Button onClick={handleCreate} disabled={createMutation.isPending} className="w-full">
                {createMutation.isPending ? "Criando..." : "Criar Proposta"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total de Propostas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{propostas?.data?.length || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Rascunhos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{propostas?.data?.filter((p: any) => p.status === "rascunho").length || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Aceitas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{propostas?.data?.filter((p: any) => p.status === "aceita").length || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Rejeitadas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{propostas?.data?.filter((p: any) => p.status === "rejeitada").length || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Propostas */}
      <Card>
        <CardHeader>
          <CardTitle>Propostas Criadas</CardTitle>
          <CardDescription>Gerencie todas as suas propostas de fretamento</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {propostas?.data?.map((proposta: any) => (
              <div key={proposta.id} className="flex items-center justify-between rounded-lg border p-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{proposta.nomeEmpresa}</h3>
                    <Badge className={statusColors[proposta.status]}>
                      {statusLabels[proposta.status]}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-500">Orçamento: {proposta.numeroOrcamento}</p>
                  <p className="text-sm text-gray-500">Valor: R$ {proposta.valorTotal?.toFixed(2) || "0.00"}</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEnviar(proposta.id, proposta.emailCliente)}
                    disabled={enviarMutation.isPending}
                  >
                    <Mail className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(proposta.id)}
                    disabled={deleteMutation.isPending}
                  >
                    <XCircle className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
