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
import { Calendar, Plus, Search, Edit, Trash2 , ArrowLeft } from "lucide-react";
import { toast } from "sonner";

interface CalendarioData {
  id: number;
  titulo: string;
  data: string;
  hora: string;
  descricao: string;
  categoria: string;
}

export default function AdminCalendarioAvancado() {
  const [, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    titulo: "",
    data: "",
    hora: "",
    descricao: "",
    categoria: "",
  });

  const [dados, setDados] = useState<CalendarioData[]>([
    {
      id: 1,
      titulo: "Exemplo 1",
      data: "Exemplo 2",
      hora: "Exemplo 3",
      descricao: "Exemplo 4",
      categoria: "Exemplo 5",
    },
    {
      id: 2,
      titulo: "Exemplo 2",
      data: "Exemplo 3",
      hora: "Exemplo 4",
      descricao: "Exemplo 5",
      categoria: "Exemplo 6",
    },
    {
      id: 3,
      titulo: "Exemplo 3",
      data: "Exemplo 4",
      hora: "Exemplo 5",
      descricao: "Exemplo 6",
      categoria: "Exemplo 7",
    },
  ]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.titulo) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    if (editingId) {
      setDados(dados.map(d => d.id === editingId ? { ...d, ...formData } : d));
      toast.success("Registro atualizado com sucesso!");
    } else {
      const novoRegistro: CalendarioData = {
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
    titulo: "",
    data: "",
    hora: "",
    descricao: "",
    categoria: "",
    });
    setEditingId(null);
  };

  const handleEdit = (item: CalendarioData) => {
    setFormData({
      titulo: item.titulo,
      data: item.data,
      hora: item.hora,
      descricao: item.descricao,
      categoria: item.categoria,
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
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-orange-600 hover:bg-orange-700 text-white transition-colors font-medium"
        >
          <ArrowLeft size={20} />
          <span>Voltar</span>
        </button>
      </div>

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg">
            <Calendar className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900">Calendário Avançado</h1>
        </div>
        <p className="text-slate-600">Gerenciamento de calendário com agendamentos</p>
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
            <Button className="bg-gradient-to-r from-orange-500 to-orange-600 hover:opacity-90">
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
                <Label htmlFor="titulo">Titulo</Label>
                <Input
                  id="titulo"
                  value={formData.titulo}
                  onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                  placeholder="titulo"
                />
              </div>
              <div>
                <Label htmlFor="data">Data</Label>
                <Input
                  id="data"
                  value={formData.data}
                  onChange={(e) => setFormData({ ...formData, data: e.target.value })}
                  placeholder="data"
                />
              </div>
              <div>
                <Label htmlFor="hora">Hora</Label>
                <Input
                  id="hora"
                  value={formData.hora}
                  onChange={(e) => setFormData({ ...formData, hora: e.target.value })}
                  placeholder="hora"
                />
              </div>
              <div>
                <Label htmlFor="descricao">Descricao</Label>
                <Input
                  id="descricao"
                  value={formData.descricao}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                  placeholder="descricao"
                />
              </div>
              <div>
                <Label htmlFor="categoria">Categoria</Label>
                <Input
                  id="categoria"
                  value={formData.categoria}
                  onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                  placeholder="categoria"
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
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Titulo</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Data</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Hora</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Descricao</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Categoria</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDados.map((item) => (
                    <tr key={item.id} className="border-b border-slate-100 hover:bg-slate-50">
      <td className="py-3 px-4">{item.titulo}</td>
      <td className="py-3 px-4">{item.data}</td>
      <td className="py-3 px-4">{item.hora}</td>
      <td className="py-3 px-4">{item.descricao}</td>
      <td className="py-3 px-4">{item.categoria}</td>
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
