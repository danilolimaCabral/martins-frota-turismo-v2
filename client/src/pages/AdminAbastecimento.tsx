import { useState, useEffect } from "react";
import { useLocation } from "wouter";
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
  RefreshCw,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

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
  const [, navigate] = useLocation();
  const [fuelings, setFuelings] = useState<FuelingRecord[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [selectedFueling, setSelectedFueling] = useState<FuelingRecord | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [filterVehicle, setFilterVehicle] = useState<string>("todos");
  const [filterType, setFilterType] = useState<string>("todos");
  const [searchTerm, setSearchTerm] = useState("");
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<any>(null);
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

  // Mutation para sincronizar com CTA Smart
  const syncMutation = trpc.ctaSmart.sincronizar.useMutation({
    onSuccess: (data) => {
      setSyncStatus(data);
      setIsSyncing(false);
      if (data.sucesso) {
        toast.success(`✅ ${data.mensagem}`);
        // Recarregar dados após sincronização
        setTimeout(() => window.location.reload(), 1000);
      } else {
        toast.error(`❌ ${data.mensagem}`);
      }
    },
    onError: (error) => {
      toast.error("Erro ao sincronizar: " + error.message);
      setIsSyncing(false);
    },
  });

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

  const handleSync = async () => {
    setIsSyncing(true);
    await syncMutation.mutateAsync();
  };

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

  const filteredFuelings = fuelings.filter((fueling) => {
    const matchesSearch =
      !searchTerm ||
      (fueling.vehicleName?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
      (fueling.station?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
      (fueling.driverName?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);

    const matchesVehicle =
      filterVehicle === "todos" || fueling.vehicleId.toString() === filterVehicle;

    const matchesType =
      filterType === "todos" || fueling.fuelType === filterType;

    return matchesSearch && matchesVehicle && matchesType;
  });

  return (
    <div className="space-y-6 p-6">
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Fuel className="w-8 h-8 text-orange-600" />
            Controle de Abastecimento
          </h1>
          <p className="text-gray-600 mt-1">Gerencie o abastecimento da frota</p>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={handleSync}
            disabled={isSyncing}
            className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${isSyncing ? "animate-spin" : ""}`} />
            {isSyncing ? "Sincronizando..." : "Sincronizar CTA Smart"}
          </Button>
          <Button
            onClick={() => setShowForm(true)}
            className="bg-orange-600 hover:bg-orange-700 text-white flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Novo Abastecimento
          </Button>
        </div>
      </div>

      {/* Status de Sincronização */}
      {syncStatus && (
        <Card className={`border-l-4 ${syncStatus.sucesso ? "border-l-green-500 bg-green-50" : "border-l-red-500 bg-red-50"}`}>
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              {syncStatus.sucesso ? (
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              )}
              <div className="flex-1">
                <p className={`font-semibold ${syncStatus.sucesso ? "text-green-900" : "text-red-900"}`}>
                  {syncStatus.mensagem}
                </p>
                {syncStatus.total > 0 && (
                  <p className={`text-sm mt-1 ${syncStatus.sucesso ? "text-green-700" : "text-red-700"}`}>
                    Total: {syncStatus.total} | Sucesso: {syncStatus.sucesso} | Erros: {syncStatus.erro}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total de Litros</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {stats.totalLiters.toFixed(2)}
                </p>
              </div>
              <Droplet className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Custo Total</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  R$ {stats.totalCost.toFixed(2)}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Preço Médio</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  R$ {stats.averagePrice.toFixed(2)}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Registros</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {stats.count}
                </p>
              </div>
              <BarChart3 className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar veículo, posto, motorista..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>

            <select
              value={filterVehicle}
              onChange={(e) => setFilterVehicle(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="todos">Todos os Veículos</option>
              {vehicles.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name}
                </option>
              ))}
            </select>

            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="todos">Todos os Combustíveis</option>
              <option value="gasolina">Gasolina</option>
              <option value="etanol">Etanol</option>
              <option value="diesel">Diesel</option>
              <option value="gnv">GNV</option>
            </select>

            <Button className="bg-gray-600 hover:bg-gray-700 text-white flex items-center gap-2">
              <Download className="w-4 h-4" />
              Exportar
            </Button>
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
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">
                    Veículo
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">
                    Data
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">
                    Litros
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">
                    Preço/L
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">
                    Total
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">
                    Combustível
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">
                    Posto
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredFuelings.length > 0 ? (
                  filteredFuelings.map((fueling) => (
                    <tr key={fueling.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">{fueling.vehicleName}</td>
                      <td className="py-3 px-4">
                        {new Date(fueling.date).toLocaleDateString("pt-BR")}
                      </td>
                      <td className="py-3 px-4">{fueling.liters} L</td>
                      <td className="py-3 px-4">
                        R$ {parseFloat(fueling.pricePerLiter.toString()).toFixed(2)}
                      </td>
                      <td className="py-3 px-4 font-semibold">
                        R$ {parseFloat(fueling.totalCost.toString()).toFixed(2)}
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                          {fueling.fuelType}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-600">{fueling.station}</td>
                      <td className="py-3 px-4 flex gap-2">
                        <button
                          onClick={() => setSelectedFueling(fueling)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(fueling.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-gray-500">
                      Nenhum registro encontrado
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle>Novo Abastecimento</CardTitle>
              <button
                onClick={() => setShowForm(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Veículo *
                    </label>
                    <select
                      value={formData.vehicleId}
                      onChange={(e) =>
                        setFormData({ ...formData, vehicleId: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    >
                      <option value="">Selecione um veículo</option>
                      {vehicles.map((v) => (
                        <option key={v.id} value={v.id}>
                          {v.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Data *
                    </label>
                    <input
                      type="date"
                      value={formData.date}
                      onChange={(e) =>
                        setFormData({ ...formData, date: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Litros *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.liters}
                      onChange={(e) =>
                        setFormData({ ...formData, liters: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Preço por Litro
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.pricePerLiter}
                      onChange={(e) =>
                        setFormData({ ...formData, pricePerLiter: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      KM *
                    </label>
                    <input
                      type="number"
                      value={formData.km}
                      onChange={(e) =>
                        setFormData({ ...formData, km: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Combustível
                    </label>
                    <select
                      value={formData.fuelType}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          fuelType: e.target.value as any,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    >
                      <option value="gasolina">Gasolina</option>
                      <option value="etanol">Etanol</option>
                      <option value="diesel">Diesel</option>
                      <option value="gnv">GNV</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Posto
                    </label>
                    <input
                      type="text"
                      value={formData.station}
                      onChange={(e) =>
                        setFormData({ ...formData, station: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Motorista
                    </label>
                    <select
                      value={formData.driverId}
                      onChange={(e) =>
                        setFormData({ ...formData, driverId: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    >
                      <option value="">Selecione um motorista</option>
                      {drivers.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Observações
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) =>
                      setFormData({ ...formData, notes: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    rows={3}
                  />
                </div>

                <div className="flex gap-3 justify-end">
                  <Button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="bg-gray-300 hover:bg-gray-400 text-gray-800"
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    className="bg-orange-600 hover:bg-orange-700 text-white"
                  >
                    Salvar
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
