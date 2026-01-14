import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Download, CheckCircle, AlertCircle , ArrowLeft } from "lucide-react";
import { toast } from "sonner";

interface ChecklistItem {
  id: number;
  nome: string;
  descricao: string;
  obrigatorio: boolean;
}

interface Checklist {
  id: number;
  veiculo: string;
  placa: string;
  data: string;
  motorista: string;
  itens: ChecklistItem[];
  status: "pendente" | "completo" | "com_problemas";
  observacoes: string;
}

const mockChecklistItems: ChecklistItem[] = [
  { id: 1, nome: "Pneus", descricao: "Verificar calibragem e desgaste", obrigatorio: true },
  { id: 2, nome: "Freios", descricao: "Testar eficiência do freio", obrigatorio: true },
  { id: 3, nome: "Luzes", descricao: "Verificar faróis, lanternas", obrigatorio: true },
  { id: 4, nome: "Óleo", descricao: "Verificar nível de óleo", obrigatorio: true },
  { id: 5, nome: "Água", descricao: "Verificar nível de água", obrigatorio: false },
  { id: 6, nome: "Limpadores", descricao: "Verificar palhetas", obrigatorio: false },
];

const mockChecklists: Checklist[] = [
  {
    id: 1,
    veiculo: "Ônibus Executivo 01",
    placa: "ABC-1234",
    data: "2026-01-18",
    motorista: "João Silva",
    itens: mockChecklistItems,
    status: "completo",
    observacoes: "Tudo OK",
  },
];

export function AdminChecklist() {
  const [, navigate] = useLocation();
  const [checklists, setChecklists] = useState<Checklist[]>(mockChecklists);
  const [showForm, setShowForm] = useState(false);
  const [selectedChecklist, setSelectedChecklist] = useState<Checklist | null>(null);
  const [formData, setFormData] = useState({
    veiculo: "",
    placa: "",
    motorista: "",
    observacoes: "",
    itensCompletos: new Set<number>(),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.veiculo || !formData.motorista) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    const status =
      formData.itensCompletos.size === mockChecklistItems.length
        ? "completo"
        : formData.itensCompletos.size > 0
          ? "com_problemas"
          : "pendente";

    const novoChecklist: Checklist = {
      id: Math.max(...checklists.map((c) => c.id), 0) + 1,
      veiculo: formData.veiculo,
      placa: formData.placa,
      data: new Date().toISOString().split("T")[0],
      motorista: formData.motorista,
      itens: mockChecklistItems,
      status,
      observacoes: formData.observacoes,
    };

    setChecklists([...checklists, novoChecklist]);
    toast.success("Checklist criado com sucesso");

    setFormData({
      veiculo: "",
      placa: "",
      motorista: "",
      observacoes: "",
      itensCompletos: new Set(),
    });
    setShowForm(false);
  };

  const handleExportPDF = (checklist: Checklist) => {
    toast.success("Checklist exportado para PDF");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completo":
        return "bg-green-100 text-green-800";
      case "com_problemas":
        return "bg-yellow-100 text-yellow-800";
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
          <h1 className="text-3xl font-bold">Checklist de Inspeção</h1>
          <p className="text-gray-600 mt-1">Inspeção pré-viagem de veículos</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="gap-2">
          <Plus className="w-4 h-4" />
          Novo Checklist
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Novo Checklist de Inspeção</CardTitle>
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

              <div>
                <Label>Motorista *</Label>
                <Input
                  value={formData.motorista}
                  onChange={(e) =>
                    setFormData({ ...formData, motorista: e.target.value })
                  }
                  placeholder="Nome do motorista"
                />
              </div>

              <div>
                <Label>Itens de Inspeção</Label>
                <div className="space-y-3 mt-3 p-4 border rounded-lg bg-gray-50">
                  {mockChecklistItems.map((item) => (
                    <div key={item.id} className="flex items-start gap-3">
                      <Checkbox
                        id={`item-${item.id}`}
                        checked={formData.itensCompletos.has(item.id)}
                        onCheckedChange={(checked) => {
                          const newItens = new Set(formData.itensCompletos);
                          if (checked) {
                            newItens.add(item.id);
                          } else {
                            newItens.delete(item.id);
                          }
                          setFormData({ ...formData, itensCompletos: newItens });
                        }}
                      />
                      <div className="flex-1">
                        <label
                          htmlFor={`item-${item.id}`}
                          className="font-medium cursor-pointer"
                        >
                          {item.nome}
                          {item.obrigatorio && (
                            <span className="text-red-500 ml-1">*</span>
                          )}
                        </label>
                        <p className="text-sm text-gray-600">{item.descricao}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label>Observações</Label>
                <Input
                  value={formData.observacoes}
                  onChange={(e) =>
                    setFormData({ ...formData, observacoes: e.target.value })
                  }
                  placeholder="Observações adicionais"
                />
              </div>

              <div className="flex gap-2">
                <Button type="submit">Criar Checklist</Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowForm(false);
                    setFormData({
                      veiculo: "",
                      placa: "",
                      motorista: "",
                      observacoes: "",
                      itensCompletos: new Set(),
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
          <CardTitle>Checklists Realizados</CardTitle>
          <CardDescription>Total: {checklists.length}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Veículo</TableHead>
                  <TableHead>Motorista</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Observações</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {checklists.map((checklist) => (
                  <TableRow key={checklist.id}>
                    <TableCell className="font-medium">
                      {checklist.veiculo}
                      <div className="text-sm text-gray-500">
                        {checklist.placa}
                      </div>
                    </TableCell>
                    <TableCell>{checklist.motorista}</TableCell>
                    <TableCell>{checklist.data}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {checklist.status === "completo" ? (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-yellow-600" />
                        )}
                        <Badge className={getStatusColor(checklist.status)}>
                          {checklist.status === "completo"
                            ? "Completo"
                            : "Com Problemas"}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>{checklist.observacoes}</TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleExportPDF(checklist)}
                        className="gap-2"
                      >
                        <Download className="w-4 h-4" />
                        PDF
                      </Button>
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
