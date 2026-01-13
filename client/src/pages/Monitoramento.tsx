import { useState, useEffect } from "react";
import { MapView } from "@/components/Map";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useWebSocketTracking } from "@/hooks/useWebSocketTracking";
import {
  Truck,
  AlertTriangle,
  Activity,
  Fuel,
  Zap,
  Filter,
  Search,
  Eye,
  Phone,
  Navigation,
  Clock,
  Gauge,
  Droplet,
  Battery,
  MapPin,
  TrendingUp,
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import type { VehicleLocation } from "@/hooks/useWebSocketTracking";

interface Vehicle {
  id: number;
  plate: string;
  brand: string;
  model: string;
  status: "ativo" | "manutencao" | "inativo";
  currentLat?: number;
  currentLng?: number;
  currentSpeed?: number;
  currentKm?: number;
  fuelLevel?: number;
  lastUpdate?: Date;
  driverId?: number;
  driverName?: string;
  driverPhone?: string;
  destination?: string;
  estimatedArrival?: Date;
}

export function Monitoramento() {
  // WebSocket para rastreamento em tempo real
  const { isConnected, currentLocation, routeHistory, alerts } = useWebSocketTracking({
    onLocationUpdate: (location: VehicleLocation) => {
      // Atualizar veículo selecionado com nova localização
      setSelectedVehicle((prev) => {
        if (prev && prev.id === location.vehicleId) {
          return {
            ...prev,
            currentLat: location.lat,
            currentLng: location.lng,
            currentSpeed: location.speed,
            currentKm: location.km,
            fuelLevel: location.fuelLevel,
            lastUpdate: new Date(location.timestamp),
          };
        }
        return prev;
      });
    },
  });

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("todos");
  const [searchTerm, setSearchTerm] = useState("");
  const [mapCenter, setMapCenter] = useState({ lat: -25.4284, lng: -49.2733 }); // Curitiba
  const [showDetails, setShowDetails] = useState(true);

  // Buscar veículos
  const { data: vehiclesData } = trpc.vehicle.list.useQuery();

  useEffect(() => {
    if (vehiclesData) {
      // Simular dados de localização (em produção, viriam de GPS real)
      const vehiclesWithLocation = vehiclesData.map((v: any) => ({
        ...v,
        currentLat: -25.4284 + (Math.random() - 0.5) * 0.1,
        currentLng: -49.2733 + (Math.random() - 0.5) * 0.1,
        currentSpeed: Math.floor(Math.random() * 120),
        currentKm: Math.floor(Math.random() * 500000),
        fuelLevel: Math.floor(Math.random() * 100),
        lastUpdate: new Date(),
      }));
      setVehicles(vehiclesWithLocation);
      if (vehiclesWithLocation.length > 0) {
        setSelectedVehicle(vehiclesWithLocation[0]);
      }
    }
  }, [vehiclesData]);

  const filteredVehicles = vehicles.filter((v) => {
    const statusMatch = filterStatus === "todos" || v.status === filterStatus;
    const searchMatch =
      v.plate.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.driverName?.toLowerCase().includes(searchTerm.toLowerCase());
    return statusMatch && searchMatch;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ativo":
        return "bg-green-100 text-green-800 border-green-300";
      case "manutencao":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "inativo":
        return "bg-red-100 text-red-800 border-red-300";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "ativo":
        return "Ativo";
      case "manutencao":
        return "Manutenção";
      case "inativo":
        return "Inativo";
      default:
        return status;
    }
  };

  const getMarkerColor = (status: string) => {
    switch (status) {
      case "ativo":
        return "#22c55e"; // green
      case "manutencao":
        return "#eab308"; // yellow
      case "inativo":
        return "#ef4444"; // red
      default:
        return "#64748b"; // slate
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-red-600 text-white p-6 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-3 rounded-lg">
                <Navigation className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Monitoramento de Frota</h1>
                <p className="text-orange-100 mt-1">Acompanhe todos os veículos em tempo real</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold">{vehicles.length}</p>
              <p className="text-orange-100">Veículos Online</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Painel Lateral - Lista de Veículos */}
          <div className="lg:col-span-1 space-y-4">
            {/* Filtros */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Filtros</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    <Search className="h-4 w-4 inline mr-2" />
                    Buscar
                  </label>
                  <input
                    type="text"
                    placeholder="Placa, motorista..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    <Filter className="h-4 w-4 inline mr-2" />
                    Status
                  </label>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="todos">Todos</option>
                    <option value="ativo">Ativo</option>
                    <option value="manutencao">Manutenção</option>
                    <option value="inativo">Inativo</option>
                  </select>
                </div>
              </CardContent>
            </Card>

            {/* Lista de Veículos */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Veículos ({filteredVehicles.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {filteredVehicles.map((vehicle) => (
                    <button
                      key={vehicle.id}
                      onClick={() => {
                        setSelectedVehicle(vehicle);
                        setMapCenter({
                          lat: vehicle.currentLat || -25.4284,
                          lng: vehicle.currentLng || -49.2733,
                        });
                      }}
                      className={`w-full p-3 rounded-lg border-2 transition-all text-left ${
                        selectedVehicle?.id === vehicle.id
                          ? "border-orange-500 bg-orange-50"
                          : "border-slate-200 hover:border-orange-300 bg-white"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-semibold text-slate-900">{vehicle.plate}</p>
                          <p className="text-xs text-slate-500">
                            {vehicle.brand} {vehicle.model}
                          </p>
                          {vehicle.driverName && (
                            <p className="text-xs text-slate-600 mt-1">{vehicle.driverName}</p>
                          )}
                        </div>
                        <span
                          className={`px-2 py-1 rounded text-xs font-semibold border ${getStatusColor(
                            vehicle.status
                          )}`}
                        >
                          {getStatusLabel(vehicle.status)}
                        </span>
                      </div>

                      {/* Informações Rápidas */}
                      <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                        {vehicle.currentSpeed !== undefined && (
                          <div className="flex items-center gap-1 text-slate-600">
                            <Gauge className="h-3 w-3" />
                            {vehicle.currentSpeed} km/h
                          </div>
                        )}
                        {vehicle.fuelLevel !== undefined && (
                          <div className="flex items-center gap-1 text-slate-600">
                            <Droplet className="h-3 w-3" />
                            {vehicle.fuelLevel}%
                          </div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Mapa e Detalhes */}
          <div className="lg:col-span-3 space-y-4">
            {/* Mapa */}
            <Card className="h-96 lg:h-[500px]">
              <CardContent className="p-0 h-full">
                <MapView
                  onMapReady={(map) => {
                    // Adicionar marcadores dos veículos
                    filteredVehicles.forEach((vehicle) => {
                      const marker = new (window as any).google.maps.Marker({
                        position: {
                          lat: vehicle.currentLat || -25.4284,
                          lng: vehicle.currentLng || -49.2733,
                        },
                        map: map,
                        title: vehicle.plate,
                        icon: {
                          path: (window as any).google.maps.SymbolPath.CIRCLE,
                          scale: 8,
                          fillColor: getMarkerColor(vehicle.status),
                          fillOpacity: 1,
                          strokeColor: "#fff",
                          strokeWeight: 2,
                        },
                      });

                      marker.addListener("click", () => {
                        setSelectedVehicle(vehicle);
                      });
                    });
                  }}
                />
              </CardContent>
            </Card>

            {/* Detalhes do Veículo Selecionado */}
            {selectedVehicle && (
              <Card className="border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-white">
                <CardHeader className="bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-t-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Truck className="h-6 w-6" />
                      <div>
                        <CardTitle>{selectedVehicle.plate}</CardTitle>
                        <p className="text-sm text-orange-100">
                          {selectedVehicle.brand} {selectedVehicle.model}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-semibold border ${getStatusColor(
                        selectedVehicle.status
                      )}`}
                    >
                      {getStatusLabel(selectedVehicle.status)}
                    </span>
                  </div>
                </CardHeader>

                <CardContent className="pt-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {/* Velocidade */}
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                      <div className="flex items-center gap-2 text-blue-600 mb-2">
                        <Gauge className="h-4 w-4" />
                        <p className="text-xs font-semibold">Velocidade</p>
                      </div>
                      <p className="text-2xl font-bold text-slate-900">
                        {selectedVehicle.currentSpeed || 0}
                      </p>
                      <p className="text-xs text-slate-600">km/h</p>
                    </div>

                    {/* Combustível */}
                    <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                      <div className="flex items-center gap-2 text-green-600 mb-2">
                        <Droplet className="h-4 w-4" />
                        <p className="text-xs font-semibold">Combustível</p>
                      </div>
                      <p className="text-2xl font-bold text-slate-900">
                        {selectedVehicle.fuelLevel || 0}%
                      </p>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                        <div
                          className="bg-green-500 h-2 rounded-full"
                          style={{ width: `${selectedVehicle.fuelLevel || 0}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Quilometragem */}
                    <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                      <div className="flex items-center gap-2 text-purple-600 mb-2">
                        <TrendingUp className="h-4 w-4" />
                        <p className="text-xs font-semibold">Quilometragem</p>
                      </div>
                      <p className="text-2xl font-bold text-slate-900">
                        {(selectedVehicle.currentKm || 0).toLocaleString()}
                      </p>
                      <p className="text-xs text-slate-600">km</p>
                    </div>

                    {/* Última Atualização */}
                    <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                      <div className="flex items-center gap-2 text-slate-600 mb-2">
                        <Clock className="h-4 w-4" />
                        <p className="text-xs font-semibold">Atualizado</p>
                      </div>
                      <p className="text-sm font-bold text-slate-900">
                        {selectedVehicle.lastUpdate
                          ? new Date(selectedVehicle.lastUpdate).toLocaleTimeString("pt-BR")
                          : "N/A"}
                      </p>
                      <p className="text-xs text-slate-600">agora</p>
                    </div>
                  </div>

                  {/* Informações do Motorista */}
                  {selectedVehicle.driverName && (
                    <div className="mt-6 pt-6 border-t border-slate-200">
                      <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                        <Activity className="h-4 w-4 text-orange-500" />
                        Motorista
                      </h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-slate-600">Nome</p>
                          <p className="font-semibold text-slate-900">{selectedVehicle.driverName}</p>
                        </div>
                        {selectedVehicle.driverPhone && (
                          <div>
                            <p className="text-xs text-slate-600 flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              Contato
                            </p>
                            <p className="font-semibold text-slate-900">{selectedVehicle.driverPhone}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Rota */}
                  {selectedVehicle.destination && (
                    <div className="mt-6 pt-6 border-t border-slate-200">
                      <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-orange-500" />
                        Rota Atual
                      </h3>
                      <div className="space-y-2">
                        <div>
                          <p className="text-xs text-slate-600">Destino</p>
                          <p className="font-semibold text-slate-900">{selectedVehicle.destination}</p>
                        </div>
                        {selectedVehicle.estimatedArrival && (
                          <div>
                            <p className="text-xs text-slate-600">Chegada Estimada</p>
                            <p className="font-semibold text-slate-900">
                              {new Date(selectedVehicle.estimatedArrival).toLocaleTimeString("pt-BR")}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Ações */}
                  <div className="mt-6 flex gap-2">
                    <Button className="flex-1 bg-orange-500 hover:bg-orange-600 gap-2">
                      <Phone className="h-4 w-4" />
                      Chamar Motorista
                    </Button>
                    <Button variant="outline" className="flex-1 gap-2">
                      <Eye className="h-4 w-4" />
                      Ver Histórico
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
