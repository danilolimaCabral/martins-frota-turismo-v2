import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Plus,
  Fuel,
  TrendingUp,
  DollarSign,
  Droplet,
  Download,
  Filter,
  Search,
  Trash2,
  Eye,
  BarChart3,
} from "lucide-react";
import { trpc } from "@/lib/trpc";

interface FuelingRecord {
  id: number;
  vehicleId: number;
  vehicleName: string | null;
  driverId: number | null;
  driverName: string | null;
  date: Date;
  km: string | number;
  liters: string | number;
  pricePerLiter: string | number;
  totalCost: string | number;
  station: string | null;
  city?: string | null;
  fuelType: "gasolina" | "etanol" | "diesel" | "gnv";
  receipt?: string | null;
  notes?: string | null;
  createdAt: Date;
}

export function AdminAbastecimento() {
  const [fuelings, setFuelings] = useState<FuelingRecord[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [selectedFueling, setSelectedFueling] = useState<FuelingRecord | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [filterVehicle, setFilterVehicle] = useState<string>("todos");
  const [filterType, setFilterType] = useState<string>("todos");
  const [searchTerm, setSearchTerm] = useState("");
  const [stats, setStats] = useState({
    totalLiters: 0,
    totalCost: 0,
    averagePrice: 0,
    count: 0,
  });

  const [formData, setFormData] = useState({
    vehicleId: "",
    driverId: "",
    date: new Date().toISOString().split("T")[0],
    km: "",
    liters: "",
    pricePerLiter: "",
    fuelType: "diesel" as "gasolina" | "etanol" | "diesel" | "gnv",
    station: "",
    city: "",
    notes: "",
  });

  // Usar hooks do tRPC
  const { data: vehiclesData } = trpc.fueling.getVehicles.useQuery();
  const { data: driversData } = trpc.fueling.getDrivers.useQuery();
  const { data: fuelingsData } = trpc.fueling.list.useQuery({
    limit: 100,
    offset: 0,
  });
  const { data: statsData } = trpc.fueling.getStats.useQuery({});

  const createMutation = trpc.fueling.create.useMutation();
  const deleteMutation = trpc.fueling.delete.useMutation();

  // Atualizar estado quando dados chegarem
  useEffect(() => {
    if (vehiclesData) setVehicles(vehiclesData);
  }, [vehiclesData]);

  useEffect(() => {
    if (driversData) setDrivers(driversData);
  }, [driversData]);

  useEffect(() => {
    if (fuelingsData?.data) setFuelings(fuelingsData.data);
  }, [fuelingsData]);

  useEffect(() => {
    if (statsData) setStats(statsData);
  }, [statsData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.vehicleId || !formData.km || !formData.liters) {
      alert("Preencha os campos obrigatórios");
      return;
    }

    try {
      await createMutation.mutateAsync({
        vehicleId: parseInt(formData.vehicleId),
        driverId: formData.driverId ? parseInt(formData.driverId) : undefined,
        date: new Date(formData.date),
        km: parseFloat(formData.km),
        liters: parseFloat(formData.liters),
        pricePerLiter: parseFloat(formData.pricePerLiter),
        fuelType: formData.fuelType,
        station: formData.station,
        city: formData.city,
        notes: formData.notes,
      });

      alert("Abastecimento registrado com sucesso!");
      setShowForm(false);
      setFormData({
        vehicleId: "",
        driverId: "",
        date: new Date().toISOString().split("T")[0],
        km: "",
        liters: "",
        pricePerLiter: "",
        fuelType: "diesel",
        station: "",
        city: "",
        notes: "",
      });
      // Recarregar dados
      window.location.reload();
    } catch (error) {
      console.error("Erro ao registrar abastecimento:", error);
      alert("Erro ao registrar abastecimento");
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm("Tem certeza que deseja deletar este registro?")) {
      try {
        await deleteMutation.mutateAsync(id);
        alert("Abastecimento deletado com sucesso!");
        window.location.reload();
      } catch (error) {
        console.error("Erro ao deletar:", error);
        alert("Erro ao deletar abastecimento");
      }
    }
  };

  const filteredFuelings = fuelings.filter((f) => {
    const vehicleMatch = filterVehicle === "todos" || f.vehicleId === parseInt(filterVehicle);
    const typeMatch = filterType === "todos" || f.fuelType === filterType;
    const searchMatch =
      f.vehicleName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.station?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.driverName?.toLowerCase().includes(searchTerm.toLowerCase());

    return vehicleMatch && typeMatch && searchMatch;
  });

  const fuelTypeLabels: Record<string, string> = {
    gasolina: "Gasolina",
    etanol: "Etanol",
    diesel: "Diesel",
    gnv: "GNV",
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-slate-900 flex items-center gap-3">
                <Fuel className="h-10 w-10 text-amber-600" />
                Controle de Abastecimento
              </h1>
              <p className="text-slate-600 mt-2">Gerencie o abastecimento da frota</p>
            </div>
            <Button
              onClick={() => setShowForm(!showForm)}
              className="gap-2 bg-amber-600 hover:bg-amber-700"
            >
              <Plus className="h-4 w-4" />
              Novo Abastecimento
            </Button>
          </div>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-600 text-sm font-medium">Total de Litros</p>
                  <p className="text-3xl font-bold text-slate-900 mt-2">
                    {stats.totalLiters.toFixed(2)}
                  </p>
                </div>
                <Droplet className="h-12 w-12 text-blue-500 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-600 text-sm font-medium">Custo Total</p>
                  <p className="text-3xl font-bold text-slate-900 mt-2">
                    R$ {stats.totalCost.toFixed(2)}
                  </p>
                </div>
                <DollarSign className="h-12 w-12 text-green-500 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-600 text-sm font-medium">Preço Médio</p>
                  <p className="text-3xl font-bold text-slate-900 mt-2">
                    R$ {stats.averagePrice.toFixed(2)}
                  </p>
                </div>
                <TrendingUp className="h-12 w-12 text-purple-500 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-600 text-sm font-medium">Registros</p>
                  <p className="text-3xl font-bold text-slate-900 mt-2">{stats.count}</p>
                </div>
                <BarChart3 className="h-12 w-12 text-orange-500 opacity-20" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Formulário */}
        {showForm && (
          <Card className="mb-8 border-amber-200 bg-amber-50">
            <CardHeader>
              <CardTitle>Registrar Novo Abastecimento</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Veículo */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Veículo *
                    </label>
                    <select
                      value={formData.vehicleId}
                      onChange={(e) => setFormData({ ...formData, vehicleId: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                      required
                    >
                      <option value="">Selecione um veículo</option>
                      {vehicles.map((v) => (
                        <option key={v.id} value={v.id}>
                          {v.plate} - {v.brand} {v.model}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Motorista */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Motorista
                    </label>
                    <select
                      value={formData.driverId}
                      onChange={(e) => setFormData({ ...formData, driverId: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                    >
                      <option value="">Selecione um motorista</option>
                      {drivers.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Data */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Data *
                    </label>
                    <input
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                      required
                    />
                  </div>

                  {/* Quilometragem */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Quilometragem *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.km}
                      onChange={(e) => setFormData({ ...formData, km: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                      placeholder="0.00"
                      required
                    />
                  </div>

                  {/* Litros */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Litros *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.liters}
                      onChange={(e) => setFormData({ ...formData, liters: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                      placeholder="0.00"
                      required
                    />
                  </div>

                  {/* Preço por Litro */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Preço por Litro *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.pricePerLiter}
                      onChange={(e) =>
                        setFormData({ ...formData, pricePerLiter: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                      placeholder="0.00"
                      required
                    />
                  </div>

                  {/* Tipo de Combustível */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Tipo de Combustível *
                    </label>
                    <select
                      value={formData.fuelType}
                      onChange={(e) => {
                        const value = e.target.value as "gasolina" | "etanol" | "diesel" | "gnv";
                        setFormData({
                          ...formData,
                          fuelType: value,
                        });
                      }}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                      required
                    >
                      <option value="diesel">Diesel</option>
                      <option value="gasolina">Gasolina</option>
                      <option value="etanol">Etanol</option>
                      <option value="gnv">GNV</option>
                    </select>
                  </div>

                  {/* Posto */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Posto de Abastecimento *
                    </label>
                    <input
                      type="text"
                      value={formData.station}
                      onChange={(e) => setFormData({ ...formData, station: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                      placeholder="Ex: Posto Shell"
                      required
                    />
                  </div>

                  {/* Cidade */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Cidade
                    </label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                      placeholder="Ex: São Paulo"
                    />
                  </div>
                </div>

                {/* Notas */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Observações
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                    rows={3}
                    placeholder="Notas adicionais..."
                  />
                </div>

                {/* Botões */}
                <div className="flex gap-2">
                  <Button type="submit" className="bg-amber-600 hover:bg-amber-700">
                    Registrar Abastecimento
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowForm(false)}
                  >
                    Cancelar
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Filtros */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex gap-4 flex-wrap">
              <div className="flex-1 min-w-[200px]">
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  <Search className="h-4 w-4 inline mr-2" />
                  Buscar
                </label>
                <input
                  type="text"
                  placeholder="Veículo, posto, motorista..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="flex-1 min-w-[200px]">
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  <Filter className="h-4 w-4 inline mr-2" />
                  Veículo
                </label>
                <select
                  value={filterVehicle}
                  onChange={(e) => setFilterVehicle(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="todos">Todos</option>
                  {vehicles.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.plate}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex-1 min-w-[200px]">
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Combustível
                </label>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="todos">Todos</option>
                  <option value="diesel">Diesel</option>
                  <option value="gasolina">Gasolina</option>
                  <option value="etanol">Etanol</option>
                  <option value="gnv">GNV</option>
                </select>
              </div>

              <div className="flex items-end gap-2">
                <Button variant="outline" className="gap-2">
                  <Download className="h-4 w-4" />
                  Exportar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabela */}
        <Card>
          <CardHeader>
            <CardTitle>Registros de Abastecimento ({filteredFuelings.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">
                      Veículo
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">
                      Data
                    </th>
                    <th className="text-right py-3 px-4 font-semibold text-slate-700">
                      Litros
                    </th>
                    <th className="text-right py-3 px-4 font-semibold text-slate-700">
                      Preço/L
                    </th>
                    <th className="text-right py-3 px-4 font-semibold text-slate-700">
                      Total
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">
                      Combustível
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">
                      Posto
                    </th>
                    <th className="text-center py-3 px-4 font-semibold text-slate-700">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredFuelings.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="text-center py-8 text-slate-500">
                        Nenhum registro encontrado
                      </td>
                    </tr>
                  ) : (
                    filteredFuelings.map((fueling) => (
                      <tr key={fueling.id} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="py-3 px-4">
                          <div>
                            <p className="font-medium text-slate-900">{fueling.vehicleName}</p>
                            <p className="text-sm text-slate-500">{fueling.driverName}</p>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-slate-600">
                          {new Date(fueling.date).toLocaleDateString("pt-BR")}
                        </td>
                        <td className="py-3 px-4 text-right font-medium text-slate-900">
                          {Number(fueling.liters).toFixed(2)} L
                        </td>
                        <td className="py-3 px-4 text-right text-slate-600">
                          R$ {Number(fueling.pricePerLiter).toFixed(2)}
                        </td>
                        <td className="py-3 px-4 text-right font-semibold text-amber-600">
                          R$ {Number(fueling.totalCost).toFixed(2)}
                        </td>
                        <td className="py-3 px-4">
                          <span className="inline-block px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                            {fuelTypeLabels[fueling.fuelType] || fueling.fuelType}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-600">{fueling.station}</td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex justify-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setSelectedFueling(fueling)}
                              className="text-blue-600 hover:text-blue-700"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(fueling.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Modal de Detalhes */}
        {selectedFueling && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-2xl">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Detalhes do Abastecimento</CardTitle>
                <Button
                  variant="ghost"
                  onClick={() => setSelectedFueling(null)}
                  className="text-slate-500 hover:text-slate-700"
                >
                  ✕
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-slate-600">Veículo</p>
                    <p className="font-semibold text-slate-900">{selectedFueling.vehicleName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Data</p>
                    <p className="font-semibold text-slate-900">
                      {new Date(selectedFueling.date).toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Quilometragem</p>
                    <p className="font-semibold text-slate-900">{Number(selectedFueling.km).toFixed(2)} km</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Litros</p>
                    <p className="font-semibold text-slate-900">{Number(selectedFueling.liters).toFixed(2)} L</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Preço por Litro</p>
                    <p className="font-semibold text-slate-900">
                      R$ {Number(selectedFueling.pricePerLiter).toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Custo Total</p>
                    <p className="font-semibold text-amber-600 text-lg">
                      R$ {Number(selectedFueling.totalCost).toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Combustível</p>
                    <p className="font-semibold text-slate-900">
                      {fuelTypeLabels[selectedFueling.fuelType] || selectedFueling.fuelType}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Posto</p>
                    <p className="font-semibold text-slate-900">{selectedFueling.station}</p>
                  </div>
                  {selectedFueling.city && (
                    <div>
                      <p className="text-sm text-slate-600">Cidade</p>
                      <p className="font-semibold text-slate-900">{selectedFueling.city}</p>
                    </div>
                  )}
                  {selectedFueling.driverName && (
                    <div>
                      <p className="text-sm text-slate-600">Motorista</p>
                      <p className="font-semibold text-slate-900">{selectedFueling.driverName}</p>
                    </div>
                  )}
                </div>
                {selectedFueling.notes && (
                  <div>
                    <p className="text-sm text-slate-600">Observações</p>
                    <p className="text-slate-900">{selectedFueling.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
