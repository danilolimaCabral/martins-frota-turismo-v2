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
import { Route, Plus, Search, Edit, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface RotaData {
  id: number;
  veiculo: string;
  data: string;
  origem: string;
  destino: string;
  duracao: string;
}

export default function AdminHistoricoRotas() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    veiculo: "",
    data: "",
    origem: "",
    destino: "",
    duracao: "",
  });

  const [dados, setDados] = useState<RotaData[]>([
    {
      id: 1,
      veiculo: "Exemplo 1",
      data: "Exemplo 2",
      origem: "Exemplo 3",
      destino: "Exemplo 4",
      duracao: "Exemplo 5",
    },
    {
      id: 2,
      veiculo: "Exemplo 2",
      data: "Exemplo 3",
      origem: "Exemplo 4",
      destino: "Exemplo 5",
      duracao: "Exemplo 6",
    },
    {
      id: 3,
      veiculo: "Exemplo 3",
      data: "Exemplo 4",
      origem: "Exemplo 5",
      destino: "Exemplo 6",
      duracao: "Exemplo 7",
    },
  ]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.veiculo) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    if (editingId) {
      setDados(dados.map(d => d.id === editingId ? { ...d, ...formData } : d));
      toast.success("Registro atualizado com sucesso!");
    } else {
      const novoRegistro: RotaData = {
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
    veiculo: "",
    data: "",
    origem: "",
    destino: "",
    duracao: "",
    });
    setEditingId(null);
  };

  const handleEdit = (item: RotaData) => {
    setFormData({
      veiculo: item.veiculo,
      data: item.data,
      origem: item.origem,
      destino: item.destino,
      duracao: item.duracao,
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
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg">
            <Route className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900">Histórico de Rotas</h1>
        </div>
        <p className="text-slate-600">Visualização do histórico de rotas realizadas</p>
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
            <Button className="bg-gradient-to-r from-purple-500 to-purple-600 hover:opacity-90">
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
                <Label htmlFor="veiculo">Veiculo</Label>
                <Input
                  id="veiculo"
                  value={formData.veiculo}
                  onChange={(e) => setFormData({ ...formData, veiculo: e.target.value })}
                  placeholder="veiculo"
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
                <Label htmlFor="origem">Origem</Label>
                <Input
                  id="origem"
                  value={formData.origem}
                  onChange={(e) => setFormData({ ...formData, origem: e.target.value })}
                  placeholder="origem"
                />
              </div>
              <div>
                <Label htmlFor="destino">Destino</Label>
                <Input
                  id="destino"
                  value={formData.destino}
                  onChange={(e) => setFormData({ ...formData, destino: e.target.value })}
                  placeholder="destino"
                />
              </div>
              <div>
                <Label htmlFor="duracao">Duracao</Label>
                <Input
                  id="duracao"
                  value={formData.duracao}
                  onChange={(e) => setFormData({ ...formData, duracao: e.target.value })}
                  placeholder="duracao"
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
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Veiculo</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Data</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Origem</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Destino</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Duracao</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDados.map((item) => (
                    <tr key={item.id} className="border-b border-slate-100 hover:bg-slate-50">
      <td className="py-3 px-4">{item.veiculo}</td>
      <td className="py-3 px-4">{item.data}</td>
      <td className="py-3 px-4">{item.origem}</td>
      <td className="py-3 px-4">{item.destino}</td>
      <td className="py-3 px-4">{item.duracao}</td>
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
