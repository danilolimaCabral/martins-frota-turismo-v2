import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BarChart3, Plus, Search, Download, Filter, Edit, Trash2, TrendingUp } from "lucide-react";
import { toast } from "sonner";

interface RotatividadeData {
  id: number;
  departamento: string;
  funcionario: string;
  dataAdmissao: string;
  dataSaida?: string;
  motivo?: string;
  diasTrabalhados: number;
  taxa: number;
}

export default function AdminAnaliseRotatividade() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    departamento: "",
    funcionario: "",
    dataAdmissao: "",
    dataSaida: "",
    motivo: "",
  });

  const [dados, setDados] = useState<RotatividadeData[]>([
    {
      id: 1,
      departamento: "Operacional",
      funcionario: "João Silva",
      dataAdmissao: "2020-03-15",
      dataSaida: "2024-01-10",
      motivo: "Pedido de demissão",
      diasTrabalhados: 1397,
      taxa: 3.2,
    },
    {
      id: 2,
      departamento: "Administrativo",
      funcionario: "Maria Santos",
      dataAdmissao: "2019-06-20",
      dataSaida: undefined,
      motivo: undefined,
      diasTrabalhados: 1691,
      taxa: 0,
    },
    {
      id: 3,
      departamento: "Manutenção",
      funcionario: "Carlos Oliveira",
      dataAdmissao: "2021-01-05",
      dataSaida: "2023-11-30",
      motivo: "Aposentadoria",
      diasTrabalhados: 1055,
      taxa: 4.1,
    },
    {
      id: 4,
      departamento: "RH",
      funcionario: "Ana Costa",
      dataAdmissao: "2018-09-10",
      dataSaida: undefined,
      motivo: undefined,
      diasTrabalhados: 2012,
      taxa: 0,
    },
    {
      id: 5,
      departamento: "Operacional",
      funcionario: "Pedro Ferreira",
      dataAdmissao: "2022-02-14",
      dataSaida: "2024-01-05",
      motivo: "Mudança de carreira",
      diasTrabalhados: 721,
      taxa: 5.8,
    },
  ]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.departamento || !formData.funcionario || !formData.dataAdmissao) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    if (editingId) {
      setDados(dados.map(d => 
        d.id === editingId 
          ? { ...d, ...formData, diasTrabalhados: Math.floor((new Date().getTime() - new Date(formData.dataAdmissao).getTime()) / (1000 * 60 * 60 * 24)), taxa: formData.dataSaida ? 3.5 : 0 }
          : d
      ));
      toast.success("Registro atualizado com sucesso!");
    } else {
      const novoRegistro: RotatividadeData = {
        id: Math.max(...dados.map(d => d.id), 0) + 1,
        ...formData,
        diasTrabalhados: Math.floor((new Date().getTime() - new Date(formData.dataAdmissao).getTime()) / (1000 * 60 * 60 * 24)),
        taxa: formData.dataSaida ? 3.5 : 0,
      };
      setDados([...dados, novoRegistro]);
      toast.success("Registro criado com sucesso!");
    }

    resetForm();
    setIsDialogOpen(false);
  };

  const resetForm = () => {
    setFormData({
      departamento: "",
      funcionario: "",
      dataAdmissao: "",
      dataSaida: "",
      motivo: "",
    });
    setEditingId(null);
  };

  const handleEdit = (item: RotatividadeData) => {
    setFormData({
      departamento: item.departamento,
      funcionario: item.funcionario,
      dataAdmissao: item.dataAdmissao,
      dataSaida: item.dataSaida || "",
      motivo: item.motivo || "",
    });
    setEditingId(item.id);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Tem certeza que deseja deletar este registro?")) {
      setDados(dados.filter(d => d.id !== id));
      toast.success("Registro deletado com sucesso!");
    }
  };

  const filteredDados = dados.filter(d =>
    d.funcionario.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.departamento.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const taxaMedia = (dados.filter(d => d.taxa > 0).reduce((acc, d) => acc + d.taxa, 0) / Math.max(dados.filter(d => d.taxa > 0).length, 1)).toFixed(2);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg">
            <BarChart3 className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900">Análise de Rotatividade</h1>
        </div>
        <p className="text-slate-600">Acompanhe e analise a rotatividade de funcionários</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Total de Funcionários</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{dados.length}</div>
            <p className="text-xs text-slate-500 mt-1">Registros no sistema</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Taxa Média de Rotatividade</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{taxaMedia}%</div>
            <p className="text-xs text-slate-500 mt-1">Funcionários desligados</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Funcionários Ativos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{dados.filter(d => !d.dataSaida).length}</div>
            <p className="text-xs text-slate-500 mt-1">Em atividade</p>
          </CardContent>
        </Card>
      </div>

      {/* Toolbar */}
      <div className="mb-6 flex flex-col md:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
          <Input
            placeholder="Buscar por nome ou departamento..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline" size="icon">
          <Filter className="h-5 w-5" />
        </Button>
        <Button variant="outline" size="icon">
          <Download className="h-5 w-5" />
        </Button>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700">
              <Plus className="h-5 w-5 mr-2" />
              Novo Registro
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingId ? "Editar Registro" : "Novo Registro de Rotatividade"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="departamento">Departamento *</Label>
                <Select value={formData.departamento} onValueChange={(value) => setFormData({ ...formData, departamento: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Operacional">Operacional</SelectItem>
                    <SelectItem value="Administrativo">Administrativo</SelectItem>
                    <SelectItem value="Manutenção">Manutenção</SelectItem>
                    <SelectItem value="RH">RH</SelectItem>
                    <SelectItem value="Financeiro">Financeiro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="funcionario">Funcionário *</Label>
                <Input
                  id="funcionario"
                  value={formData.funcionario}
                  onChange={(e) => setFormData({ ...formData, funcionario: e.target.value })}
                  placeholder="Nome do funcionário"
                />
              </div>
              <div>
                <Label htmlFor="dataAdmissao">Data de Admissão *</Label>
                <Input
                  id="dataAdmissao"
                  type="date"
                  value={formData.dataAdmissao}
                  onChange={(e) => setFormData({ ...formData, dataAdmissao: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="dataSaida">Data de Saída</Label>
                <Input
                  id="dataSaida"
                  type="date"
                  value={formData.dataSaida}
                  onChange={(e) => setFormData({ ...formData, dataSaida: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="motivo">Motivo da Saída</Label>
                <Input
                  id="motivo"
                  value={formData.motivo}
                  onChange={(e) => setFormData({ ...formData, motivo: e.target.value })}
                  placeholder="Ex: Pedido de demissão"
                />
              </div>
              <div className="flex gap-2 pt-4">
                <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700">
                  {editingId ? "Atualizar" : "Criar"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsDialogOpen(false);
                    resetForm();
                  }}
                  className="flex-1"
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Content */}
      <Card>
        <CardHeader>
          <CardTitle>Registros de Rotatividade</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredDados.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <p className="text-lg font-semibold mb-2">Nenhum registro encontrado</p>
              <p className="text-sm">Clique em "Novo Registro" para adicionar</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Funcionário</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Departamento</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Admissão</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Status</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Taxa</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDados.map((item) => (
                    <tr key={item.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="py-3 px-4">{item.funcionario}</td>
                      <td className="py-3 px-4">{item.departamento}</td>
                      <td className="py-3 px-4">{new Date(item.dataAdmissao).toLocaleDateString('pt-BR')}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${item.dataSaida ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                          {item.dataSaida ? "Desligado" : "Ativo"}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-semibold text-slate-900">{item.taxa}%</span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(item)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDelete(item.id)}
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
          )}
        </CardContent>
      </Card>
    </div>
  );
}
