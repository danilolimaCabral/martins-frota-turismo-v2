import { useState } from "react";
import { useLocation } from "wouter";
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
import { BarChart3, Plus, Search, Edit, Trash2 , ArrowLeft } from "lucide-react";
import { toast } from "sonner";

interface RelatorioRHData {
  id: number;
  periodo: string;
  funcionarios: string;
  admissoes: string;
  demissoes: string;
  rotatividade: string;
}

export default function AdminRelatoriosRH() {
  const [, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    periodo: "",
    funcionarios: "",
    admissoes: "",
    demissoes: "",
    rotatividade: "",
  });

  const [dados, setDados] = useState<RelatorioRHData[]>([
    {
      id: 1,
      periodo: "Exemplo 1",
      funcionarios: "Exemplo 2",
      admissoes: "Exemplo 3",
      demissoes: "Exemplo 4",
      rotatividade: "Exemplo 5",
    },
    {
      id: 2,
      periodo: "Exemplo 2",
      funcionarios: "Exemplo 3",
      admissoes: "Exemplo 4",
      demissoes: "Exemplo 5",
      rotatividade: "Exemplo 6",
    },
    {
      id: 3,
      periodo: "Exemplo 3",
      funcionarios: "Exemplo 4",
      admissoes: "Exemplo 5",
      demissoes: "Exemplo 6",
      rotatividade: "Exemplo 7",
    },
  ]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.periodo) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    if (editingId) {
      setDados(dados.map(d => d.id === editingId ? { ...d, ...formData } : d));
      toast.success("Registro atualizado com sucesso!");
    } else {
      const novoRegistro: RelatorioRHData = {
        id: Math.max(...dados.map(d => d.id), 0) + 1,
        ...formData,
      };
      setDados([...dados, novoRegistro]);
      toast.success("Registro criado com sucesso!");
    }

    resetForm();
    setIsDialogOpen(false);
  };

  const resetForm = () => {
    setFormData({
    periodo: "",
    funcionarios: "",
    admissoes: "",
    demissoes: "",
    rotatividade: "",
    });
    setEditingId(null);
  };

  const handleEdit = (item: RelatorioRHData) => {
    setFormData({
      periodo: item.periodo,
      funcionarios: item.funcionarios,
      admissoes: item.admissoes,
      demissoes: item.demissoes,
      rotatividade: item.rotatividade,
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
    Object.values(d).some(v => String(v).toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-8">
      {/* Botão Voltar */}
      <div className="mb-6 flex items-center gap-2">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-orange-600 hover:bg-orange-700 text-white transition-colors font-medium"
        >
          <ArrowLeft size={20} />
          <span>Voltar</span>
        </button>
      </div>

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg">
            <BarChart3 className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900">Relatórios RH</h1>
        </div>
        <p className="text-slate-600">Relatórios e análises de recursos humanos</p>
      </div>

      {/* Toolbar */}
      <div className="mb-6 flex flex-col md:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
          <Input
            placeholder="Buscar..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-blue-500 to-blue-600 hover:opacity-90">
              <Plus className="h-5 w-5 mr-2" />
              Novo Registro
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingId ? "Editar Registro" : "Novo Registro"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="periodo">Periodo</Label>
                <Input
                  id="periodo"
                  value={formData.periodo}
                  onChange={(e) => setFormData({ ...formData, periodo: e.target.value })}
                  placeholder="periodo"
                />
              </div>
              <div>
                <Label htmlFor="funcionarios">Funcionarios</Label>
                <Input
                  id="funcionarios"
                  value={formData.funcionarios}
                  onChange={(e) => setFormData({ ...formData, funcionarios: e.target.value })}
                  placeholder="funcionarios"
                />
              </div>
              <div>
                <Label htmlFor="admissoes">Admissoes</Label>
                <Input
                  id="admissoes"
                  value={formData.admissoes}
                  onChange={(e) => setFormData({ ...formData, admissoes: e.target.value })}
                  placeholder="admissoes"
                />
              </div>
              <div>
                <Label htmlFor="demissoes">Demissoes</Label>
                <Input
                  id="demissoes"
                  value={formData.demissoes}
                  onChange={(e) => setFormData({ ...formData, demissoes: e.target.value })}
                  placeholder="demissoes"
                />
              </div>
              <div>
                <Label htmlFor="rotatividade">Rotatividade</Label>
                <Input
                  id="rotatividade"
                  value={formData.rotatividade}
                  onChange={(e) => setFormData({ ...formData, rotatividade: e.target.value })}
                  placeholder="rotatividade"
                />
              </div>
              <div className="flex gap-2 pt-4">
                <Button type="submit" className="flex-1">
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
          <CardTitle>Registros</CardTitle>
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
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Periodo</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Funcionarios</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Admissoes</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Demissoes</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Rotatividade</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDados.map((item) => (
                    <tr key={item.id} className="border-b border-slate-100 hover:bg-slate-50">
      <td className="py-3 px-4">{item.periodo}</td>
      <td className="py-3 px-4">{item.funcionarios}</td>
      <td className="py-3 px-4">{item.admissoes}</td>
      <td className="py-3 px-4">{item.demissoes}</td>
      <td className="py-3 px-4">{item.rotatividade}</td>
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
