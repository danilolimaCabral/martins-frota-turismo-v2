import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit2, Trash2, CheckCircle, AlertCircle, Clock , ArrowLeft } from "lucide-react";
import { toast } from "sonner";

interface Manutencao {
  id: number;
  veiculo: string;
  placa: string;
  tipo: "preventiva" | "corretiva";
  descricao: string;
  dataAgendada: string;
  dataConclusao?: string;
  status: "pendente" | "em_andamento" | "concluida" | "cancelada";
  custo: number;
  responsavel: string;
}

const mockManutencoes: Manutencao[] = [
  {
    id: 1,
    veiculo: "Ônibus Executivo 01",
    placa: "ABC-1234",
    tipo: "preventiva",
    descricao: "Troca de óleo e filtro",
    dataAgendada: "2026-01-20",
    status: "pendente",
    custo: 450,
    responsavel: "João Silva",
  },
  {
    id: 2,
    veiculo: "Van 02",
    placa: "XYZ-5678",
    tipo: "corretiva",
    descricao: "Reparo de freio dianteiro",
    dataAgendada: "2026-01-15",
    dataConclusao: "2026-01-16",
    status: "concluida",
    custo: 850,
    responsavel: "Carlos Santos",
  },
];

export function AdminManutencao() {
  const [, navigate] = useLocation();
  const [manutencoes, setManutencoes] = useState<Manutencao[]>(mockManutencoes);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    veiculo: "",
    placa: "",
    tipo: "preventiva" as "preventiva" | "corretiva",
    descricao: "",
    dataAgendada: "",
    status: "pendente" as "pendente" | "em_andamento" | "concluida" | "cancelada",
    custo: 0,
    responsavel: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.veiculo || !formData.descricao || !formData.dataAgendada) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    if (editingId) {
      setManutencoes(
        manutencoes.map((m) =>
          m.id === editingId
            ? { ...m, ...formData }
            : m
        )
      );
      toast.success("Manutenção atualizada com sucesso");
      setEditingId(null);
    } else {
      const novaManutencao: Manutencao = {
        id: Math.max(...manutencoes.map((m) => m.id), 0) + 1,
        ...formData,
      };
      setManutencoes([...manutencoes, novaManutencao]);
      toast.success("Manutenção criada com sucesso");
    }

    setFormData({
      veiculo: "",
      placa: "",
      tipo: "preventiva" as "preventiva" | "corretiva",
      descricao: "",
      dataAgendada: "",
      status: "pendente" as "pendente" | "em_andamento" | "concluida" | "cancelada",
      custo: 0,
      responsavel: "",
    });
    setShowForm(false);
  };

  const handleEdit = (manutencao: Manutencao) => {
    setFormData({
      veiculo: manutencao.veiculo,
      placa: manutencao.placa,
      tipo: manutencao.tipo,
      descricao: manutencao.descricao,
      dataAgendada: manutencao.dataAgendada,
      status: manutencao.status,
      custo: manutencao.custo,
      responsavel: manutencao.responsavel,
    });
    setEditingId(manutencao.id);
    setShowForm(true);
  };

  const handleDelete = (id: number) => {
    setManutencoes(manutencoes.filter((m) => m.id !== id));
    toast.success("Manutenção removida com sucesso");
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "concluida":
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "em_andamento":
        return <Clock className="w-4 h-4 text-blue-600" />;
      case "pendente":
        return <AlertCircle className="w-4 h-4 text-yellow-600" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "concluida":
        return "bg-green-100 text-green-800";
      case "em_andamento":
        return "bg-blue-100 text-blue-800";
      case "pendente":
        return "bg-yellow-100 text-yellow-800";
      case "cancelada":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
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

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Gestão de Manutenção</h1>
          <p className="text-gray-600 mt-1">Preventiva e Corretiva</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="gap-2">
          <Plus className="w-4 h-4" />
          Nova Manutenção
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingId ? "Editar Manutenção" : "Nova Manutenção"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Veículo *</Label>
                  <Input
                    value={formData.veiculo}
                    onChange={(e) =>
                      setFormData({ ...formData, veiculo: e.target.value })
                    }
                    placeholder="Ex: Ônibus Executivo 01"
                  />
                </div>
                <div>
                  <Label>Placa *</Label>
                  <Input
                    value={formData.placa}
                    onChange={(e) =>
                      setFormData({ ...formData, placa: e.target.value })
                    }
                    placeholder="Ex: ABC-1234"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Tipo de Manutenção</Label>
                  <Select
                    value={formData.tipo}
                    onValueChange={(value) =>
                      setFormData({
                        ...formData,
                        tipo: value as "preventiva" | "corretiva",
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="preventiva">Preventiva</SelectItem>
                      <SelectItem value="corretiva">Corretiva</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) =>
                      setFormData({
                        ...formData,
                        status: value as "pendente" | "em_andamento" | "concluida" | "cancelada",
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pendente">Pendente</SelectItem>
                      <SelectItem value="em_andamento">Em Andamento</SelectItem>
                      <SelectItem value="concluida">Concluída</SelectItem>
                      <SelectItem value="cancelada">Cancelada</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>Descrição *</Label>
                <Textarea
                  value={formData.descricao}
                  onChange={(e) =>
                    setFormData({ ...formData, descricao: e.target.value })
                  }
                  placeholder="Descreva o serviço de manutenção"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Data Agendada *</Label>
                  <Input
                    type="date"
                    value={formData.dataAgendada}
                    onChange={(e) =>
                      setFormData({ ...formData, dataAgendada: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label>Custo (R$)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.custo}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        custo: parseFloat(e.target.value),
                      })
                    }
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div>
                <Label>Responsável</Label>
                <Input
                  value={formData.responsavel}
                  onChange={(e) =>
                    setFormData({ ...formData, responsavel: e.target.value })
                  }
                  placeholder="Nome do responsável"
                />
              </div>

              <div className="flex gap-2">
                <Button type="submit">
                  {editingId ? "Atualizar" : "Criar"} Manutenção
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowForm(false);
                    setEditingId(null);
                    setFormData({
                      veiculo: "",
                      placa: "",
                      tipo: "preventiva",
                      descricao: "",
                      dataAgendada: "",
                      status: "pendente",
                      custo: 0,
                      responsavel: "",
                    });
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
          <CardTitle>Manutenções Agendadas</CardTitle>
          <CardDescription>
            Total: {manutencoes.length} | Pendentes:{" "}
            {manutencoes.filter((m) => m.status === "pendente").length}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Veículo</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Custo</TableHead>
                  <TableHead>Responsável</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {manutencoes.map((manutencao) => (
                  <TableRow key={manutencao.id}>
                    <TableCell className="font-medium">
                      {manutencao.veiculo}
                      <div className="text-sm text-gray-500">
                        {manutencao.placa}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {manutencao.tipo === "preventiva"
                          ? "Preventiva"
                          : "Corretiva"}
                      </Badge>
                    </TableCell>
                    <TableCell>{manutencao.descricao}</TableCell>
                    <TableCell>{manutencao.dataAgendada}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(manutencao.status)}
                        <Badge className={getStatusColor(manutencao.status)}>
                          {manutencao.status.replace("_", " ")}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>R$ {manutencao.custo.toFixed(2)}</TableCell>
                    <TableCell>{manutencao.responsavel}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(manutencao)}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(manutencao.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
