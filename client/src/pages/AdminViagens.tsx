import { useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "../lib/trpc";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Textarea } from "../components/ui/textarea";
import { Plus, MapPin, Calendar, User, Truck, Play, CheckCircle, X, Filter , ArrowLeft } from "lucide-react";
import { toast } from "sonner";

export default function AdminViagens() {
  const [, setLocation] = useLocation();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState<any>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const { data: trips, refetch } = trpc.trip.list.useQuery();
  const { data: vehicles } = trpc.vehicle.list.useQuery();
  const { data: drivers } = trpc.driver.list.useQuery();

  const createMutation = trpc.trip.create.useMutation({
    onSuccess: () => {
      toast.success("Viagem criada com sucesso!");
      refetch();
      setIsDialogOpen(false);
    },
    onError: (error) => {
      toast.error(`Erro ao criar viagem: ${error.message}`);
    },
  });

  const updateMutation = trpc.trip.update.useMutation({
    onSuccess: () => {
      toast.success("Viagem atualizada com sucesso!");
      refetch();
      setIsDialogOpen(false);
      setSelectedTrip(null);
    },
    onError: (error) => {
      toast.error(`Erro ao atualizar viagem: ${error.message}`);
    },
  });

  const startTripMutation = trpc.trip.startTrip.useMutation({
    onSuccess: () => {
      toast.success("Viagem iniciada!");
      refetch();
    },
  });

  const completeTripMutation = trpc.trip.completeTrip.useMutation({
    onSuccess: () => {
      toast.success("Viagem finalizada!");
      refetch();
    },
  });

  const deleteMutation = trpc.trip.delete.useMutation({
    onSuccess: () => {
      toast.success("Viagem excluída!");
      refetch();
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const data = {
      bookingId: parseInt(formData.get("bookingId") as string) || 1, // Temporário
      vehicleId: parseInt(formData.get("vehicleId") as string),
      driverId: parseInt(formData.get("driverId") as string),
      origin: formData.get("origin") as string,
      destination: formData.get("destination") as string,
      startDate: new Date(formData.get("startDate") as string),
      endDate: formData.get("endDate") ? new Date(formData.get("endDate") as string) : undefined,
      startKm: formData.get("startKm") as string,
      endKm: formData.get("endKm") as string || undefined,
      totalKm: formData.get("totalKm") as string || undefined,
      status: (formData.get("status") as any) || "planejada",
      notes: formData.get("notes") as string || undefined,
    };

    if (selectedTrip) {
      updateMutation.mutate({ id: selectedTrip.id, ...data });
    } else {
      createMutation.mutate(data);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "planejada":
        return "bg-blue-100 text-blue-800 border-blue-300";
      case "em-andamento":
        return "bg-green-100 text-green-800 border-green-300";
      case "concluida":
        return "bg-gray-100 text-gray-800 border-gray-300";
      case "cancelada":
        return "bg-red-100 text-red-800 border-red-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "planejada":
        return "Planejada";
      case "em-andamento":
        return "Em Andamento";
      case "concluida":
        return "Concluída";
      case "cancelada":
        return "Cancelada";
      default:
        return status;
    }
  };

  const filteredTrips = trips?.filter((trip) => {
    if (statusFilter === "all") return true;
    return trip.status === statusFilter;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
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

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 mb-2">Gestão de Viagens</h1>
            <p className="text-slate-600">Gerencie todas as viagens da frota</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button
                onClick={() => setSelectedTrip(null)}
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
              >
                <Plus className="mr-2 h-4 w-4" />
                Nova Viagem
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{selectedTrip ? "Editar Viagem" : "Nova Viagem"}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="vehicleId">Veículo *</Label>
                    <Select name="vehicleId" defaultValue={selectedTrip?.vehicleId?.toString()} required>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o veículo" />
                      </SelectTrigger>
                      <SelectContent>
                        {vehicles?.map((vehicle) => (
                          <SelectItem key={vehicle.id} value={vehicle.id.toString()}>
                            {vehicle.plate} - {vehicle.model}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="driverId">Motorista *</Label>
                    <Select name="driverId" defaultValue={selectedTrip?.driverId?.toString()} required>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o motorista" />
                      </SelectTrigger>
                      <SelectContent>
                        {drivers?.map((driver) => (
                          <SelectItem key={driver.id} value={driver.id.toString()}>
                            {driver.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="origin">Origem *</Label>
                    <Input
                      id="origin"
                      name="origin"
                      defaultValue={selectedTrip?.origin}
                      placeholder="Cidade de origem"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="destination">Destino *</Label>
                    <Input
                      id="destination"
                      name="destination"
                      defaultValue={selectedTrip?.destination}
                      placeholder="Cidade de destino"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="startDate">Data/Hora Saída *</Label>
                    <Input
                      id="startDate"
                      name="startDate"
                      type="datetime-local"
                      defaultValue={selectedTrip?.startDate ? new Date(selectedTrip.startDate).toISOString().slice(0, 16) : ""}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="endDate">Data/Hora Retorno</Label>
                    <Input
                      id="endDate"
                      name="endDate"
                      type="datetime-local"
                      defaultValue={selectedTrip?.endDate ? new Date(selectedTrip.endDate).toISOString().slice(0, 16) : ""}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="startKm">KM Inicial *</Label>
                    <Input
                      id="startKm"
                      name="startKm"
                      type="number"
                      step="0.01"
                      defaultValue={selectedTrip?.startKm}
                      placeholder="0.00"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="endKm">KM Final</Label>
                    <Input
                      id="endKm"
                      name="endKm"
                      type="number"
                      step="0.01"
                      defaultValue={selectedTrip?.endKm}
                      placeholder="0.00"
                    />
                  </div>

                  <div>
                    <Label htmlFor="totalKm">KM Total</Label>
                    <Input
                      id="totalKm"
                      name="totalKm"
                      type="number"
                      step="0.01"
                      defaultValue={selectedTrip?.totalKm}
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select name="status" defaultValue={selectedTrip?.status || "planejada"}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="planejada">Planejada</SelectItem>
                      <SelectItem value="em-andamento">Em Andamento</SelectItem>
                      <SelectItem value="concluida">Concluída</SelectItem>
                      <SelectItem value="cancelada">Cancelada</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="notes">Observações</Label>
                  <Textarea
                    id="notes"
                    name="notes"
                    defaultValue={selectedTrip?.notes || ""}
                    placeholder="Observações sobre a viagem..."
                    rows={3}
                  />
                </div>

                <div className="flex gap-2 pt-4">
                  <Button type="submit" className="flex-1">
                    {selectedTrip ? "Atualizar" : "Criar"} Viagem
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsDialogOpen(false);
                      setSelectedTrip(null);
                    }}
                  >
                    Cancelar
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filtros */}
        <Card className="p-4 mb-6">
          <div className="flex items-center gap-4">
            <Filter className="h-5 w-5 text-slate-600" />
            <Label>Filtrar por status:</Label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="planejada">Planejada</SelectItem>
                <SelectItem value="em-andamento">Em Andamento</SelectItem>
                <SelectItem value="concluida">Concluída</SelectItem>
                <SelectItem value="cancelada">Cancelada</SelectItem>
              </SelectContent>
            </Select>
            <span className="text-sm text-slate-600 ml-auto">
              {filteredTrips?.length || 0} viagem(ns) encontrada(s)
            </span>
          </div>
        </Card>

        {/* Lista de Viagens */}
        <div className="grid gap-4">
          {filteredTrips?.map((trip) => (
            <Card key={trip.id} className={`p-6 border-2 ${getStatusColor(trip.status)}`}>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-2xl font-bold text-slate-900">#{trip.id}</span>
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(trip.status)}`}>
                      {getStatusLabel(trip.status)}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-slate-600" />
                      <span className="text-sm">
                        <strong>Rota:</strong> {trip.origin} → {trip.destination}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-slate-600" />
                      <span className="text-sm">
                        <strong>Saída:</strong> {new Date(trip.startDate).toLocaleString("pt-BR")}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Truck className="h-4 w-4 text-slate-600" />
                      <span className="text-sm">
                        <strong>Veículo ID:</strong> {trip.vehicleId}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-slate-600" />
                      <span className="text-sm">
                        <strong>Motorista ID:</strong> {trip.driverId}
                      </span>
                    </div>
                  </div>

                  {trip.notes && (
                    <p className="text-sm text-slate-600 italic">"{trip.notes}"</p>
                  )}
                </div>

                <div className="flex gap-2">
                  {trip.status === "planejada" && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="bg-green-50 hover:bg-green-100 text-green-700 border-green-300"
                      onClick={() => startTripMutation.mutate({ id: trip.id })}
                    >
                      <Play className="h-4 w-4 mr-1" />
                      Iniciar
                    </Button>
                  )}

                  {trip.status === "em-andamento" && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-300"
                      onClick={() => {
                        const endKm = prompt("Digite a quilometragem final:");
                        if (endKm) {
                          completeTripMutation.mutate({
                            id: trip.id,
                            endKm,
                            totalKm: (parseFloat(endKm) - parseFloat(trip.startKm)).toString(),
                          });
                        }
                      }}
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Finalizar
                    </Button>
                  )}

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setSelectedTrip(trip);
                      setIsDialogOpen(true);
                    }}
                  >
                    Editar
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    className="text-red-600 hover:bg-red-50"
                    onClick={() => {
                      if (confirm("Deseja realmente excluir esta viagem?")) {
                        deleteMutation.mutate({ id: trip.id });
                      }
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}

          {(!filteredTrips || filteredTrips.length === 0) && (
            <Card className="p-12 text-center">
              <p className="text-slate-500 text-lg">Nenhuma viagem encontrada</p>
              <p className="text-slate-400 text-sm mt-2">Clique em "Nova Viagem" para começar</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
