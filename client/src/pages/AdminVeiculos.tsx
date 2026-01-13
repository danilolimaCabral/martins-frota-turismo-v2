import { useState } from "react";
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
import { Plus, Edit, Trash2, Car, Image } from "lucide-react";
import { toast } from "sonner";

export default function AdminVeiculos() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  
  const [formData, setFormData] = useState({
    plate: "",
    model: "",
    brand: "",
    year: new Date().getFullYear(),
    type: "van" as "van" | "micro-onibus" | "onibus",
    capacity: 0,
    color: "",
    renavam: "",
    chassis: "",
    status: "ativo" as "ativo" | "manutencao" | "inativo",
    currentKm: "0",
    gpsDevice: "",
    notes: "",
  });

  const utils = trpc.useUtils();
  const { data: vehicles, isLoading } = trpc.vehicle.list.useQuery();

  const createMutation = trpc.vehicle.create.useMutation({
    onSuccess: () => {
      toast.success("Veículo criado com sucesso!");
      utils.vehicle.list.invalidate();
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast.error(`Erro ao criar veículo: ${error.message}`);
    },
  });

  const updateMutation = trpc.vehicle.update.useMutation({
    onSuccess: () => {
      toast.success("Veículo atualizado com sucesso!");
      utils.vehicle.list.invalidate();
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast.error(`Erro ao atualizar veículo: ${error.message}`);
    },
  });

  const deleteMutation = trpc.vehicle.delete.useMutation({
    onSuccess: () => {
      toast.success("Veículo excluído com sucesso!");
      utils.vehicle.list.invalidate();
    },
    onError: (error) => {
      toast.error(`Erro ao excluir veículo: ${error.message}`);
    },
  });

  const resetForm = () => {
    setFormData({
      plate: "",
      model: "",
      brand: "",
      year: new Date().getFullYear(),
      type: "van",
      capacity: 0,
      color: "",
      renavam: "",
      chassis: "",
      status: "ativo",
      currentKm: "0",
      gpsDevice: "",
      notes: "",
    });
    setEditingId(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingId) {
      updateMutation.mutate({ id: editingId, ...formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (vehicle: any) => {
    setFormData({
      plate: vehicle.plate,
      model: vehicle.model || "",
      brand: vehicle.brand || "",
      year: vehicle.year || new Date().getFullYear(),
      type: vehicle.type,
      capacity: vehicle.capacity || 0,
      color: vehicle.color || "",
      renavam: vehicle.renavam || "",
      chassis: vehicle.chassis || "",
      status: vehicle.status,
      currentKm: vehicle.currentKm || "0",
      gpsDevice: vehicle.gpsDevice || "",
      notes: vehicle.notes || "",
    });
    setEditingId(vehicle.id);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Tem certeza que deseja excluir este veículo?")) {
      deleteMutation.mutate({ id });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ativo":
        return "bg-green-100 text-green-800";
      case "manutencao":
        return "bg-yellow-100 text-yellow-800";
      case "inativo":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "van":
        return "Van";
      case "micro-onibus":
        return "Micro-ônibus";
      case "onibus":
        return "Ônibus";
      default:
        return type;
    }
  };

  // Imagens de vans disponíveis
  const frota_images = [
    { id: 1, name: "Van Executiva", src: "/images/frota/Gws7YuKTcYxJ.jpeg" },
    { id: 2, name: "Van Branca", src: "/images/frota/W1iYzw2TnrYu.webp" },
    { id: 3, name: "Ônibus Executivo", src: "/images/frota/nHyZXNDzoHEC.jpeg" },
    { id: 4, name: "Ônibus de Turismo", src: "/images/frota/mefGUHXmB6yZ.jpg" },
  ];

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Galeria de Frota */}
      <div className="bg-gradient-to-r from-blue-50 to-orange-50 p-6 rounded-lg border border-blue-200">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <Image className="w-6 h-6 text-orange-600" />
          Galeria da Frota
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {frota_images.map((img) => (
            <div key={img.id} className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow">
              <img 
                src={img.src} 
                alt={img.name}
                className="w-full h-40 object-cover"
              />
              <div className="p-3 text-center">
                <p className="font-semibold text-sm text-gray-700">{img.name}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Gestão de Veículos</h1>
          <p className="text-gray-600">Gerencie a frota de veículos da empresa</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button className="bg-orange-500 hover:bg-orange-600">
              <Plus className="h-4 w-4 mr-2" />
              Novo Veículo
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingId ? "Editar Veículo" : "Novo Veículo"}
              </DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="plate">Placa *</Label>
                  <Input
                    id="plate"
                    value={formData.plate}
                    onChange={(e) => setFormData({ ...formData, plate: e.target.value.toUpperCase() })}
                    placeholder="ABC1234"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="type">Tipo *</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value: any) => setFormData({ ...formData, type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="van">Van</SelectItem>
                      <SelectItem value="micro-onibus">Micro-ônibus</SelectItem>
                      <SelectItem value="onibus">Ônibus</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="brand">Marca</Label>
                  <Input
                    id="brand"
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    placeholder="Mercedes-Benz"
                  />
                </div>
                
                <div>
                  <Label htmlFor="model">Modelo</Label>
                  <Input
                    id="model"
                    value={formData.model}
                    onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                    placeholder="Sprinter"
                  />
                </div>
                
                <div>
                  <Label htmlFor="year">Ano</Label>
                  <Input
                    id="year"
                    type="number"
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                  />
                </div>
                
                <div>
                  <Label htmlFor="capacity">Capacidade (passageiros)</Label>
                  <Input
                    id="capacity"
                    type="number"
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
                  />
                </div>
                
                <div>
                  <Label htmlFor="color">Cor</Label>
                  <Input
                    id="color"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    placeholder="Branco"
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
                      <SelectItem value="manutencao">Manutenção</SelectItem>
                      <SelectItem value="inativo">Inativo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="currentKm">KM Atual</Label>
                  <Input
                    id="currentKm"
                    value={formData.currentKm}
                    onChange={(e) => setFormData({ ...formData, currentKm: e.target.value })}
                  />
                </div>
                
                <div>
                  <Label htmlFor="renavam">RENAVAM</Label>
                  <Input
                    id="renavam"
                    value={formData.renavam}
                    onChange={(e) => setFormData({ ...formData, renavam: e.target.value })}
                  />
                </div>
                
                <div>
                  <Label htmlFor="chassis">Chassi</Label>
                  <Input
                    id="chassis"
                    value={formData.chassis}
                    onChange={(e) => setFormData({ ...formData, chassis: e.target.value })}
                  />
                </div>
                
                <div>
                  <Label htmlFor="gpsDevice">ID Dispositivo GPS</Label>
                  <Input
                    id="gpsDevice"
                    value={formData.gpsDevice}
                    onChange={(e) => setFormData({ ...formData, gpsDevice: e.target.value })}
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
                  placeholder="Observações adicionais sobre o veículo..."
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
        <div className="text-center py-12">Carregando veículos...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {vehicles?.map((vehicle) => (
            <Card key={vehicle.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <Car className="h-5 w-5 text-orange-500" />
                    <CardTitle className="text-lg">{vehicle.plate}</CardTitle>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(vehicle.status)}`}>
                    {vehicle.status}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <p><strong>Tipo:</strong> {getTypeLabel(vehicle.type)}</p>
                  {vehicle.brand && <p><strong>Marca:</strong> {vehicle.brand}</p>}
                  {vehicle.model && <p><strong>Modelo:</strong> {vehicle.model}</p>}
                  {vehicle.year && <p><strong>Ano:</strong> {vehicle.year}</p>}
                  {vehicle.capacity && <p><strong>Capacidade:</strong> {vehicle.capacity} passageiros</p>}
                  <p><strong>KM:</strong> {vehicle.currentKm}</p>
                </div>
                
                <div className="flex gap-2 mt-4">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1"
                    onClick={() => handleEdit(vehicle)}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Editar
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(vehicle.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!isLoading && vehicles?.length === 0 && (
        <Card className="p-12 text-center">
          <Car className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold mb-2">Nenhum veículo cadastrado</h3>
          <p className="text-gray-600 mb-4">Comece adicionando o primeiro veículo da frota</p>
          <Button
            className="bg-orange-500 hover:bg-orange-600"
            onClick={() => setIsDialogOpen(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Veículo
          </Button>
        </Card>
      )}
    </div>
  );
}
