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
import { DollarSign, Plus, Search, Edit, Trash2 , ArrowLeft } from "lucide-react";
import { toast } from "sonner";

interface FolhaData {
  id: number;
  funcionario: string;
  salario: string;
  descontos: string;
  adicionais: string;
  liquido: string;
}

export default function AdminFolhaPagamentoAvancada() {
  const [, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    funcionario: "",
    salario: "",
    descontos: "",
    adicionais: "",
    liquido: "",
  });

  const [dados, setDados] = useState<FolhaData[]>([
    {
      id: 1,
      funcionario: "Exemplo 1",
      salario: "Exemplo 2",
      descontos: "Exemplo 3",
      adicionais: "Exemplo 4",
      liquido: "Exemplo 5",
    },
    {
      id: 2,
      funcionario: "Exemplo 2",
      salario: "Exemplo 3",
      descontos: "Exemplo 4",
      adicionais: "Exemplo 5",
      liquido: "Exemplo 6",
    },
    {
      id: 3,
      funcionario: "Exemplo 3",
      salario: "Exemplo 4",
      descontos: "Exemplo 5",
      adicionais: "Exemplo 6",
      liquido: "Exemplo 7",
    },
  ]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.funcionario) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    if (editingId) {
      setDados(dados.map(d => d.id === editingId ? { ...d, ...formData } : d));
      toast.success("Registro atualizado com sucesso!");
    } else {
      const novoRegistro: FolhaData = {
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
    funcionario: "",
    salario: "",
    descontos: "",
    adicionais: "",
    liquido: "",
    });
    setEditingId(null);
  };

  const handleEdit = (item: FolhaData) => {
    setFormData({
      funcionario: item.funcionario,
      salario: item.salario,
      descontos: item.descontos,
      adicionais: item.adicionais,
      liquido: item.liquido,
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
          onClick={() => window.history.back()}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-orange-600 hover:bg-orange-700 text-white transition-colors font-medium"
        >
          <ArrowLeft size={20} />
          <span>Voltar</span>
        </button>
      </div>

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-gradient-to-br from-green-500 to-green-600 rounded-lg">
            <DollarSign className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900">Folha de Pagamento Avançada</h1>
        </div>
        <p className="text-slate-600">Gerenciamento avançado de folha de pagamento</p>
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
            <Button className="bg-gradient-to-r from-green-500 to-green-600 hover:opacity-90">
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
                <Label htmlFor="funcionario">Funcionario</Label>
                <Input
                  id="funcionario"
                  value={formData.funcionario}
                  onChange={(e) => setFormData({ ...formData, funcionario: e.target.value })}
                  placeholder="funcionario"
                />
              </div>
              <div>
                <Label htmlFor="salario">Salario</Label>
                <Input
                  id="salario"
                  value={formData.salario}
                  onChange={(e) => setFormData({ ...formData, salario: e.target.value })}
                  placeholder="salario"
                />
              </div>
              <div>
                <Label htmlFor="descontos">Descontos</Label>
                <Input
                  id="descontos"
                  value={formData.descontos}
                  onChange={(e) => setFormData({ ...formData, descontos: e.target.value })}
                  placeholder="descontos"
                />
              </div>
              <div>
                <Label htmlFor="adicionais">Adicionais</Label>
                <Input
                  id="adicionais"
                  value={formData.adicionais}
                  onChange={(e) => setFormData({ ...formData, adicionais: e.target.value })}
                  placeholder="adicionais"
                />
              </div>
              <div>
                <Label htmlFor="liquido">Liquido</Label>
                <Input
                  id="liquido"
                  value={formData.liquido}
                  onChange={(e) => setFormData({ ...formData, liquido: e.target.value })}
                  placeholder="liquido"
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
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Funcionario</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Salario</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Descontos</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Adicionais</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Liquido</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDados.map((item) => (
                    <tr key={item.id} className="border-b border-slate-100 hover:bg-slate-50">
      <td className="py-3 px-4">{item.funcionario}</td>
      <td className="py-3 px-4">{item.salario}</td>
      <td className="py-3 px-4">{item.descontos}</td>
      <td className="py-3 px-4">{item.adicionais}</td>
      <td className="py-3 px-4">{item.liquido}</td>
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
