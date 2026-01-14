import { useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
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
import { Plus, Edit, Trash2, User , ArrowLeft } from "lucide-react";
import { toast } from "sonner";

export default function AdminMotoristas() {
  const [, setLocation] = useLocation();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  
  const [formData, setFormData] = useState({
    name: "",
    cpf: "",
    rg: "",
    cnh: "",
    cnhCategory: "",
    cnhExpiry: "",
    phone: "",
    email: "",
    address: "",
    status: "ativo" as "ativo" | "inativo" | "ferias",
    hireDate: "",
    notes: "",
  });

  const utils = trpc.useUtils();
  const { data: drivers, isLoading } = trpc.driver.list.useQuery();

  const createMutation = trpc.driver.create.useMutation({
    onSuccess: () => {
      toast.success("Motorista criado com sucesso!");
      utils.driver.list.invalidate();
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast.error(`Erro ao criar motorista: ${error.message}`);
    },
  });

  const updateMutation = trpc.driver.update.useMutation({
    onSuccess: () => {
      toast.success("Motorista atualizado com sucesso!");
      utils.driver.list.invalidate();
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast.error(`Erro ao atualizar motorista: ${error.message}`);
    },
  });

  const deleteMutation = trpc.driver.delete.useMutation({
    onSuccess: () => {
      toast.success("Motorista excluído com sucesso!");
      utils.driver.list.invalidate();
    },
    onError: (error) => {
      toast.error(`Erro ao excluir motorista: ${error.message}`);
    },
  });

  const resetForm = () => {
    setFormData({
      name: "",
      cpf: "",
      rg: "",
      cnh: "",
      cnhCategory: "",
      cnhExpiry: "",
      phone: "",
      email: "",
      address: "",
      status: "ativo",
      hireDate: "",
      notes: "",
    });
    setEditingId(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const payload: any = {
      ...formData,
      cnhExpiry: formData.cnhExpiry ? new Date(formData.cnhExpiry) : undefined,
      hireDate: formData.hireDate ? new Date(formData.hireDate) : undefined,
    };

    if (editingId) {
      updateMutation.mutate({ id: editingId, ...payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const handleEdit = (driver: any) => {
    setFormData({
      name: driver.name,
      cpf: driver.cpf || "",
      rg: driver.rg || "",
      cnh: driver.cnh,
      cnhCategory: driver.cnhCategory || "",
      cnhExpiry: driver.cnhExpiry ? new Date(driver.cnhExpiry).toISOString().split('T')[0] : "",
      phone: driver.phone || "",
      email: driver.email || "",
      address: driver.address || "",
      status: driver.status,
      hireDate: driver.hireDate ? new Date(driver.hireDate).toISOString().split('T')[0] : "",
      notes: driver.notes || "",
    });
    setEditingId(driver.id);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Tem certeza que deseja excluir este motorista?")) {
      deleteMutation.mutate({ id });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ativo":
        return "bg-green-100 text-green-800";
      case "ferias":
        return "bg-yellow-100 text-yellow-800";
      case "inativo":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "ativo":
        return "Ativo";
      case "ferias":
        return "Férias";
      case "inativo":
        return "Inativo";
      default:
        return status;
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Gestão de Motoristas</h1>
          <p className="text-gray-600">Gerencie os motoristas da empresa</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button className="bg-orange-500 hover:bg-orange-600">
              <Plus className="h-4 w-4 mr-2" />
              Novo Motorista
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingId ? "Editar Motorista" : "Novo Motorista"}
              </DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label htmlFor="name">Nome Completo *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="João da Silva"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="cpf">CPF</Label>
                  <Input
                    id="cpf"
                    value={formData.cpf}
                    onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
                    placeholder="000.000.000-00"
                  />
                </div>
                
                <div>
                  <Label htmlFor="rg">RG</Label>
                  <Input
                    id="rg"
                    value={formData.rg}
                    onChange={(e) => setFormData({ ...formData, rg: e.target.value })}
                    placeholder="00.000.000-0"
                  />
                </div>
                
                <div>
                  <Label htmlFor="cnh">CNH *</Label>
                  <Input
                    id="cnh"
                    value={formData.cnh}
                    onChange={(e) => setFormData({ ...formData, cnh: e.target.value })}
                    placeholder="00000000000"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="cnhCategory">Categoria CNH</Label>
                  <Input
                    id="cnhCategory"
                    value={formData.cnhCategory}
                    onChange={(e) => setFormData({ ...formData, cnhCategory: e.target.value.toUpperCase() })}
                    placeholder="D"
                    maxLength={5}
                  />
                </div>
                
                <div>
                  <Label htmlFor="cnhExpiry">Vencimento CNH</Label>
                  <Input
                    id="cnhExpiry"
                    type="date"
                    value={formData.cnhExpiry}
                    onChange={(e) => setFormData({ ...formData, cnhExpiry: e.target.value })}
                  />
                </div>
                
                <div>
                  <Label htmlFor="phone">Telefone</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="(41) 99999-9999"
                  />
                </div>
                
                <div>
                  <Label htmlFor="email">E-mail</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="motorista@email.com"
                  />
                </div>
                
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value: any) => setFormData({ ...formData, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ativo">Ativo</SelectItem>
                      <SelectItem value="ferias">Férias</SelectItem>
                      <SelectItem value="inativo">Inativo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="hireDate">Data de Contratação</Label>
                  <Input
                    id="hireDate"
                    type="date"
                    value={formData.hireDate}
                    onChange={(e) => setFormData({ ...formData, hireDate: e.target.value })}
                  />
                </div>
                
                <div className="col-span-2">
                  <Label htmlFor="address">Endereço</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Rua, número, bairro, cidade"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="notes">Observações</Label>
                <textarea
                  id="notes"
                  className="w-full min-h-[100px] p-2 border rounded-md"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Observações adicionais sobre o motorista..."
                />
              </div>
              
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsDialogOpen(false);
                    resetForm();
                  }}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="bg-orange-500 hover:bg-orange-600"
                  disabled={createMutation.isPending || updateMutation.isPending}
                >
                  {editingId ? "Atualizar" : "Criar"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="text-center py-12">Carregando motoristas...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {drivers?.map((driver) => (
            <Card key={driver.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <User className="h-5 w-5 text-orange-500" />
                    <CardTitle className="text-lg">{driver.name}</CardTitle>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(driver.status)}`}>
                    {getStatusLabel(driver.status)}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <p><strong>CNH:</strong> {driver.cnh}</p>
                  {driver.cnhCategory && <p><strong>Categoria:</strong> {driver.cnhCategory}</p>}
                  {driver.phone && <p><strong>Telefone:</strong> {driver.phone}</p>}
                  {driver.email && <p><strong>E-mail:</strong> {driver.email}</p>}
                  {driver.cnhExpiry && (
                    <p><strong>Vencimento CNH:</strong> {new Date(driver.cnhExpiry).toLocaleDateString('pt-BR')}</p>
                  )}
                </div>
                
                <div className="flex gap-2 mt-4">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1"
                    onClick={() => handleEdit(driver)}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Editar
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(driver.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!isLoading && drivers?.length === 0 && (
        <Card className="p-12 text-center">
          <User className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold mb-2">Nenhum motorista cadastrado</h3>
          <p className="text-gray-600 mb-4">Comece adicionando o primeiro motorista</p>
          <Button
            className="bg-orange-500 hover:bg-orange-600"
            onClick={() => setIsDialogOpen(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Motorista
          </Button>
        </Card>
      )}
    </div>
  );
}
