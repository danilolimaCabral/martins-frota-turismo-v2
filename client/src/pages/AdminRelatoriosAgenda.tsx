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

interface RelatorioAgendaData {
  id: number;
  periodo: string;
  eventos: string;
  participantes: string;
  taxa: string;
  status: string;
}

export default function AdminRelatoriosAgenda() {
  const [, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    periodo: "",
    eventos: "",
    participantes: "",
    taxa: "",
    status: "",
  });

  const [dados, setDados] = useState<RelatorioAgendaData[]>([
    {
      id: 1,
      periodo: "Exemplo 1",
      eventos: "Exemplo 2",
      participantes: "Exemplo 3",
      taxa: "Exemplo 4",
      status: "Exemplo 5",
    },
    {
      id: 2,
      periodo: "Exemplo 2",
      eventos: "Exemplo 3",
      participantes: "Exemplo 4",
      taxa: "Exemplo 5",
      status: "Exemplo 6",
    },
    {
      id: 3,
      periodo: "Exemplo 3",
      eventos: "Exemplo 4",
      participantes: "Exemplo 5",
      taxa: "Exemplo 6",
      status: "Exemplo 7",
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
      const novoRegistro: RelatorioAgendaData = {
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
    eventos: "",
    participantes: "",
    taxa: "",
    status: "",
    });
    setEditingId(null);
  };

  const handleEdit = (item: RelatorioAgendaData) => {
    setFormData({
      periodo: item.periodo,
      eventos: item.eventos,
      participantes: item.participantes,
      taxa: item.taxa,
      status: item.status,
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
          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
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
          <h1 className="text-3xl font-bold text-slate-900">Relatórios de Agenda</h1>
        </div>
        <p className="text-slate-600">Relatórios e análises de agenda</p>
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
                <Label htmlFor="eventos">Eventos</Label>
                <Input
                  id="eventos"
                  value={formData.eventos}
                  onChange={(e) => setFormData({ ...formData, eventos: e.target.value })}
                  placeholder="eventos"
                />
              </div>
              <div>
                <Label htmlFor="participantes">Participantes</Label>
                <Input
                  id="participantes"
                  value={formData.participantes}
                  onChange={(e) => setFormData({ ...formData, participantes: e.target.value })}
                  placeholder="participantes"
                />
              </div>
              <div>
                <Label htmlFor="taxa">Taxa</Label>
                <Input
                  id="taxa"
                  value={formData.taxa}
                  onChange={(e) => setFormData({ ...formData, taxa: e.target.value })}
                  placeholder="taxa"
                />
              </div>
              <div>
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ativo">Ativo</SelectItem>
                    <SelectItem value="inativo">Inativo</SelectItem>
                  </SelectContent>
                </Select>
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
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Eventos</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Participantes</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Taxa</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Status</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDados.map((item) => (
                    <tr key={item.id} className="border-b border-slate-100 hover:bg-slate-50">
      <td className="py-3 px-4">{item.periodo}</td>
      <td className="py-3 px-4">{item.eventos}</td>
      <td className="py-3 px-4">{item.participantes}</td>
      <td className="py-3 px-4">{item.taxa}</td>
      <td className="py-3 px-4">
                        <span className={item.status === 'ativo' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'} style={{padding: '0.5rem', borderRadius: '0.375rem', fontSize: '0.75rem', fontWeight: '500'}}>
                          {item.status === 'ativo' ? 'Ativo' : 'Inativo'}
                        </span>
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
