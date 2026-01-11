import { useState, useEffect } from "react";
import { useLocalAuth } from "@/hooks/useLocalAuth";
import { Redirect } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  MapPin,
  Navigation,
  Clock,
  Gauge,
  AlertTriangle,
  CheckCircle2,
  Pause,
  Filter,
  RefreshCw,
} from "lucide-react";
import { MapView } from "@/components/Map";

// Tipo de dados do veículo rastreado
interface VehicleTracking {
  id: number;
  placa: string;
  tipo: "onibus" | "van" | "carro";
  motorista: string;
  status: "em_viagem" | "parado" | "manutencao" | "alerta";
  latitude: number;
  longitude: number;
  velocidade: number;
  ultimaAtualizacao: Date;
  destino?: string;
}

export default function Rastreamento() {
  const { user } = useLocalAuth();
  const [vehicles, setVehicles] = useState<VehicleTracking[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleTracking | null>(null);
  const [filterType, setFilterType] = useState<"todos" | "onibus" | "van" | "carro">("todos");
  const [filterStatus, setFilterStatus] = useState<"todos" | "em_viagem" | "parado" | "manutencao" | "alerta">("todos");
  const [mapReady, setMapReady] = useState(false);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [markers, setMarkers] = useState<google.maps.Marker[]>([]);

  // Redirecionar se não for admin
  if (!user || user.role !== "admin") {
    return <Redirect to="/login" />;
  }

  // Dados simulados com 50+ veículos (substituir por API real do rastreador)
  useEffect(() => {
    const motoristas = [
      "João Silva", "Maria Santos", "Pedro Costa", "Ana Oliveira", "Carlos Ferreira",
      "Juliana Souza", "Roberto Lima", "Fernanda Alves", "Ricardo Martins", "Patrícia Rocha",
      "Marcos Pereira", "Luciana Dias", "André Gomes", "Beatriz Cunha", "Felipe Araújo",
      "Camila Barbosa", "Diego Monteiro", "Gabriela Cardoso", "Henrique Nunes", "Isabela Freitas",
      "Leonardo Castro", "Mariana Pinto", "Otávio Ribeiro", "Priscila Moraes", "Rafael Teixeira",
      "Sabrina Correia", "Thiago Mendes", "Vanessa Duarte", "Wellington Azevedo", "Yasmin Farias",
    ];

    const destinos = [
      "Florianópolis", "São Paulo", "Curitiba", "Araucária", "Foz do Iguaçu",
      "Beto Carrero", "Camboriú", "Gramado", "Aparecida", "Rio de Janeiro",
      "Ponta Grossa", "Londrina", "Maringá", "Cascavel", "Paranaguá",
      "São José dos Pinhais", "Colombo", "Pinhais", "Guaratuba", "Morretes",
    ];

    const tipos: Array<"onibus" | "van" | "carro"> = ["onibus", "van", "carro"];
    const statuses: Array<"em_viagem" | "parado" | "manutencao" | "alerta"> = [
      "em_viagem", "em_viagem", "em_viagem", "em_viagem", "em_viagem",
      "parado", "parado", "manutencao", "alerta",
    ];

    // Gerar 60 veículos espalhados pela região
    const mockVehicles: VehicleTracking[] = Array.from({ length: 60 }, (_, i) => {
      // Espalhar veículos em um raio maior ao redor de Curitiba
      const baseLatCuritiba = -25.4284;
      const baseLngCuritiba = -49.2733;
      
      // Variação de até 2 graus (aproximadamente 220km de raio)
      const latVariation = (Math.random() - 0.5) * 4;
      const lngVariation = (Math.random() - 0.5) * 4;

      const tipo = tipos[Math.floor(Math.random() * tipos.length)];
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const motorista = motoristas[Math.floor(Math.random() * motoristas.length)];
      const destino = destinos[Math.floor(Math.random() * destinos.length)];

      // Velocidade baseada no status
      let velocidade = 0;
      if (status === "em_viagem") {
        velocidade = Math.floor(Math.random() * 50) + 40; // 40-90 km/h
      } else if (status === "alerta") {
        velocidade = Math.floor(Math.random() * 30) + 90; // 90-120 km/h (excesso)
      } else if (status === "parado") {
        velocidade = 0;
      } else {
        velocidade = 0;
      }

      // Gerar placa aleatória
      const letras = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
      const placa = `${letras[Math.floor(Math.random() * 26)]}${letras[Math.floor(Math.random() * 26)]}${letras[Math.floor(Math.random() * 26)]}-${Math.floor(1000 + Math.random() * 9000)}`;

      return {
        id: i + 1,
        placa,
        tipo,
        motorista,
        status,
        latitude: baseLatCuritiba + latVariation,
        longitude: baseLngCuritiba + lngVariation,
        velocidade,
        ultimaAtualizacao: new Date(Date.now() - Math.random() * 300000), // últimos 5 min
        destino,
      };
    });

    setVehicles(mockVehicles);

    // Simular atualização em tempo real a cada 5 segundos
    const interval = setInterval(() => {
      setVehicles(prev => prev.map(v => ({
        ...v,
        // Pequena variação na posição (simula movimento)
        latitude: v.latitude + (Math.random() - 0.5) * 0.001,
        longitude: v.longitude + (Math.random() - 0.5) * 0.001,
        // Pequena variação na velocidade
        velocidade: v.status === "em_viagem" 
          ? Math.max(0, v.velocidade + (Math.random() - 0.5) * 5)
          : v.velocidade,
        ultimaAtualizacao: new Date(),
      })));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Atualizar mapa quando veículos mudarem
  useEffect(() => {
    if (!mapReady || !map) return;

    // Limpar marcadores antigos
    markers.forEach(marker => marker.setMap(null));

    // Criar novos marcadores
    const newMarkers = filteredVehicles.map(vehicle => {
      const icon = {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 10,
        fillColor: getStatusColor(vehicle.status),
        fillOpacity: 1,
        strokeColor: "#ffffff",
        strokeWeight: 2,
      };

      const marker = new google.maps.Marker({
        position: { lat: vehicle.latitude, lng: vehicle.longitude },
        map: map,
        title: `${vehicle.placa} - ${vehicle.motorista}`,
        icon: icon,
      });

      marker.addListener("click", () => {
        setSelectedVehicle(vehicle);
      });

      return marker;
    });

    setMarkers(newMarkers);

    // Ajustar zoom para mostrar todos os veículos
    if (newMarkers.length > 0) {
      const bounds = new google.maps.LatLngBounds();
      filteredVehicles.forEach(vehicle => {
        bounds.extend({ lat: vehicle.latitude, lng: vehicle.longitude });
      });
      map.fitBounds(bounds);
    }
  }, [vehicles, mapReady, map, filterType, filterStatus]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "em_viagem":
        return "#10b981"; // green
      case "parado":
        return "#f59e0b"; // orange
      case "manutencao":
        return "#6b7280"; // gray
      case "alerta":
        return "#ef4444"; // red
      default:
        return "#3b82f6"; // blue
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "em_viagem":
        return <CheckCircle2 className="h-4 w-4" />;
      case "parado":
        return <Pause className="h-4 w-4" />;
      case "manutencao":
        return <Clock className="h-4 w-4" />;
      case "alerta":
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <MapPin className="h-4 w-4" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "em_viagem":
        return "Em Viagem";
      case "parado":
        return "Parado";
      case "manutencao":
        return "Manutenção";
      case "alerta":
        return "Alerta";
      default:
        return "Desconhecido";
    }
  };

  const filteredVehicles = vehicles.filter(vehicle => {
    const typeMatch = filterType === "todos" || vehicle.tipo === filterType;
    const statusMatch = filterStatus === "todos" || vehicle.status === filterStatus;
    return typeMatch && statusMatch;
  });

  const handleMapReady = (mapInstance: google.maps.Map) => {
    setMap(mapInstance);
    setMapReady(true);
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Rastreamento em Tempo Real</h1>
            <p className="text-sm text-gray-600">
              {filteredVehicles.length} veículo(s) monitorado(s)
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.location.reload()}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Atualizar
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => (window.location.href = "/admin")}
            >
              Voltar ao Admin
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <div className="w-80 bg-white border-r overflow-y-auto">
          <div className="p-4 space-y-4">
            {/* Filtros */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  Filtros
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-gray-600 block mb-1">
                    Tipo de Veículo
                  </label>
                  <select
                    className="w-full h-9 px-3 rounded-md border border-border bg-white text-sm"
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value as any)}
                  >
                    <option value="todos">Todos</option>
                    <option value="onibus">Ônibus</option>
                    <option value="van">Van</option>
                    <option value="carro">Carro</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 block mb-1">
                    Status
                  </label>
                  <select
                    className="w-full h-9 px-3 rounded-md border border-border bg-white text-sm"
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value as any)}
                  >
                    <option value="todos">Todos</option>
                    <option value="em_viagem">Em Viagem</option>
                    <option value="parado">Parado</option>
                    <option value="manutencao">Manutenção</option>
                    <option value="alerta">Alerta</option>
                  </select>
                </div>
              </CardContent>
            </Card>

            {/* Lista de Veículos */}
            <div className="space-y-2">
              {filteredVehicles.map((vehicle) => (
                <Card
                  key={vehicle.id}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    selectedVehicle?.id === vehicle.id
                      ? "ring-2 ring-blue-500"
                      : ""
                  }`}
                  onClick={() => setSelectedVehicle(vehicle)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-bold text-sm">{vehicle.placa}</p>
                        <p className="text-xs text-gray-600">{vehicle.motorista}</p>
                      </div>
                      <div
                        className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium`}
                        style={{
                          backgroundColor: `${getStatusColor(vehicle.status)}20`,
                          color: getStatusColor(vehicle.status),
                        }}
                      >
                        {getStatusIcon(vehicle.status)}
                        {getStatusLabel(vehicle.status)}
                      </div>
                    </div>
                    <div className="space-y-1 text-xs text-gray-600">
                      <div className="flex items-center gap-2">
                        <Gauge className="h-3 w-3" />
                        <span>{vehicle.velocidade} km/h</span>
                      </div>
                      {vehicle.destino && (
                        <div className="flex items-center gap-2">
                          <Navigation className="h-3 w-3" />
                          <span>{vehicle.destino}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <Clock className="h-3 w-3" />
                        <span>
                          Atualizado há{" "}
                          {Math.floor(
                            (Date.now() - vehicle.ultimaAtualizacao.getTime()) / 1000
                          )}
                          s
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* Mapa */}
        <div className="flex-1 relative">
          <MapView
            onMapReady={handleMapReady}
            initialCenter={{ lat: -25.4284, lng: -49.2733 }}
            initialZoom={12}
            className="w-full h-full"
          />

          {/* Info do Veículo Selecionado */}
          {selectedVehicle && (
            <Card className="absolute top-4 right-4 w-80 shadow-xl">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center justify-between">
                  <span>{selectedVehicle.placa}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedVehicle(null)}
                  >
                    ✕
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-xs text-gray-600">Motorista</p>
                    <p className="font-medium">{selectedVehicle.motorista}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Tipo</p>
                    <p className="font-medium capitalize">{selectedVehicle.tipo}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Velocidade</p>
                    <p className="font-medium">{selectedVehicle.velocidade} km/h</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Status</p>
                    <p className="font-medium">{getStatusLabel(selectedVehicle.status)}</p>
                  </div>
                  {selectedVehicle.destino && (
                    <div className="col-span-2">
                      <p className="text-xs text-gray-600">Destino</p>
                      <p className="font-medium">{selectedVehicle.destino}</p>
                    </div>
                  )}
                </div>
                <div className="pt-3 border-t">
                  <Button className="w-full" size="sm">
                    Ver Histórico de Rotas
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
