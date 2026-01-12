import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  MapPin,
  Phone,
  Clock,
  Gauge,
  AlertTriangle,
  Navigation,
  RefreshCw,
  Filter,
  LogOut,
  Fuel,
  Thermometer,
} from "lucide-react";

interface Vehicle {
  id: string;
  name: string;
  type: "Van" | "Micro-ônibus" | "Ônibus";
  placa: string;
  lat: number;
  lng: number;
  status: "Em Rota" | "Parado" | "Manutenção" | "Offline";
  driver: string;
  phone: string;
  speed: number;
  destination: string;
  lastUpdate: Date;
  fuel: number;
  temperature: number;
}

export function Rastreamento() {
  const [, setLocation] = useLocation();
  const [user, setUser] = useState<any>(null);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("todos");
  const [filterType, setFilterType] = useState<string>("todos");
  const [mapReady, setMapReady] = useState(false);
  const mapRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<Map<string, google.maps.marker.AdvancedMarkerElement>>(new Map());

  // Verificar autenticação
  useEffect(() => {
    const userData = localStorage.getItem("martins_user_data");
    if (!userData) {
      setLocation("/login");
      return;
    }
    setUser(JSON.parse(userData));
  }, [setLocation]);

  // Dados simulados de veículos
  useEffect(() => {
    const mockVehicles: Vehicle[] = [
      {
        id: "VAN001",
        name: "Van Executiva 01",
        type: "Van",
        placa: "ABC-1234",
        lat: -23.5505,
        lng: -46.6333,
        status: "Em Rota",
        driver: "João Silva",
        phone: "(11) 98765-4321",
        speed: 65,
        destination: "Av. Paulista, São Paulo",
        lastUpdate: new Date(),
        fuel: 85,
        temperature: 92,
      },
      {
        id: "VAN002",
        name: "Van Executiva 02",
        type: "Van",
        placa: "DEF-5678",
        lat: -23.5615,
        lng: -46.6560,
        status: "Em Rota",
        driver: "Maria Santos",
        phone: "(11) 98765-4322",
        speed: 45,
        destination: "Rua Augusta, São Paulo",
        lastUpdate: new Date(),
        fuel: 72,
        temperature: 88,
      },
      {
        id: "ONIBUS001",
        name: "Ônibus Turismo 01",
        type: "Ônibus",
        placa: "GHI-9012",
        lat: -23.5405,
        lng: -46.6200,
        status: "Parado",
        driver: "Carlos Oliveira",
        phone: "(11) 98765-4323",
        speed: 0,
        destination: "Terminal Rodoviário",
        lastUpdate: new Date(),
        fuel: 95,
        temperature: 85,
      },
      {
        id: "ONIBUS002",
        name: "Ônibus Turismo 02",
        type: "Ônibus",
        placa: "JKL-3456",
        lat: -23.5705,
        lng: -46.6450,
        status: "Em Rota",
        driver: "Pedro Costa",
        phone: "(11) 98765-4324",
        speed: 55,
        destination: "Guarulhos, SP",
        lastUpdate: new Date(),
        fuel: 60,
        temperature: 90,
      },
      {
        id: "MICRO001",
        name: "Micro-ônibus 01",
        type: "Micro-ônibus",
        placa: "MNO-7890",
        lat: -23.5305,
        lng: -46.6100,
        status: "Manutenção",
        driver: "Ana Lima",
        phone: "(11) 98765-4325",
        speed: 0,
        destination: "Oficina Autorizada",
        lastUpdate: new Date(),
        fuel: 30,
        temperature: 75,
      },
    ];

    setVehicles(mockVehicles);

    // Simular atualização de posição a cada 5 segundos
    const interval = setInterval(() => {
      setVehicles((prev) =>
        prev.map((v) => {
          if (v.status === "Em Rota") {
            return {
              ...v,
              lat: v.lat + (Math.random() - 0.5) * 0.01,
              lng: v.lng + (Math.random() - 0.5) * 0.01,
              speed: Math.max(0, v.speed + (Math.random() - 0.5) * 10),
              fuel: Math.max(0, v.fuel - 0.1),
              lastUpdate: new Date(),
            };
          }
          return v;
        })
      );
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Carregar Google Maps
  useEffect(() => {
    const loadMapScript = async () => {
      const API_KEY = import.meta.env.VITE_FRONTEND_FORGE_API_KEY;
      const FORGE_BASE_URL =
        import.meta.env.VITE_FRONTEND_FORGE_API_URL ||
        "https://forge.butterfly-effect.dev";
      const MAPS_PROXY_URL = `${FORGE_BASE_URL}/v1/maps/proxy`;

      const script = document.createElement("script");
      script.src = `${MAPS_PROXY_URL}/maps/api/js?key=${API_KEY}&v=weekly&libraries=marker,places,geocoding,geometry`;
      script.async = true;
      script.crossOrigin = "anonymous";
      script.onload = () => {
        initMap();
      };
      document.head.appendChild(script);
    };

    const initMap = () => {
      const mapContainer = document.getElementById("map-container");
      if (!mapContainer || !window.google) return;

      mapRef.current = new window.google.maps.Map(mapContainer, {
        zoom: 13,
        center: { lat: -23.5505, lng: -46.6333 },
        mapTypeControl: true,
        fullscreenControl: true,
        zoomControl: true,
        streetViewControl: false,
      });

      setMapReady(true);
    };

    loadMapScript();
  }, []);

  // Atualizar marcadores no mapa
  useEffect(() => {
    if (!mapReady || !mapRef.current || !window.google) return;

    const filteredVehicles = vehicles.filter((v) => {
      const statusMatch = filterStatus === "todos" || v.status === filterStatus;
      const typeMatch = filterType === "todos" || v.type === filterType;
      return statusMatch && typeMatch;
    });

    // Remover marcadores antigos
    markersRef.current.forEach((marker) => {
      marker.map = null;
    });
    markersRef.current.clear();

    // Adicionar novos marcadores
    filteredVehicles.forEach((vehicle) => {
      const color = getStatusColor(vehicle.status);
      const marker = new window.google.maps.marker.AdvancedMarkerElement({
        map: mapRef.current,
        position: { lat: vehicle.lat, lng: vehicle.lng },
        title: vehicle.name,
        content: createMarkerContent(vehicle, color),
      });

      marker.addListener("click", () => {
        setSelectedVehicle(vehicle);
      });

      markersRef.current.set(vehicle.id, marker);
    });

    // Ajustar zoom para mostrar todos os marcadores
    if (filteredVehicles.length > 0) {
      const bounds = new window.google.maps.LatLngBounds();
      filteredVehicles.forEach((v) => {
        bounds.extend({ lat: v.lat, lng: v.lng });
      });
      mapRef.current.fitBounds(bounds);
    }
  }, [vehicles, mapReady, filterStatus, filterType]);

  const getStatusColor = (status: string): string => {
    switch (status) {
      case "Em Rota":
        return "#22c55e";
      case "Parado":
        return "#3b82f6";
      case "Manutenção":
        return "#f97316";
      default:
        return "#6b7280";
    }
  };

  const createMarkerContent = (vehicle: Vehicle, color: string): HTMLElement => {
    const div = document.createElement("div");
    div.innerHTML = `
      <div style="
        width: 40px;
        height: 40px;
        background-color: ${color};
        border: 3px solid white;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
        color: white;
        font-size: 18px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        cursor: pointer;
      ">
        📍
      </div>
    `;
    return div;
  };

  const handleLogout = () => {
    localStorage.removeItem("martins_user_data");
    setLocation("/login");
  };

  const filteredVehicles = vehicles.filter((v) => {
    const statusMatch = filterStatus === "todos" || v.status === filterStatus;
    const typeMatch = filterType === "todos" || v.type === filterType;
    return statusMatch && typeMatch;
  });

  const stats = {
    total: vehicles.length,
    emRota: vehicles.filter((v) => v.status === "Em Rota").length,
    parados: vehicles.filter((v) => v.status === "Parado").length,
    manutencao: vehicles.filter((v) => v.status === "Manutenção").length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col">
      {/* Header */}
      <div className="bg-slate-800/50 border-b border-white/10 p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-white">Rastreamento em Tempo Real</h1>
            <p className="text-white/60 text-sm">Monitoramento da frota de veículos</p>
          </div>
          <Button onClick={handleLogout} variant="outline" className="gap-2">
            <LogOut className="h-4 w-4" />
            Sair
          </Button>
        </div>
      </div>

      {/* Conteúdo Principal */}
      <div className="flex-1 flex gap-4 p-4 overflow-hidden">
        {/* Painel Lateral Esquerdo */}
        <div className="w-80 bg-slate-800/50 border border-white/10 rounded-lg overflow-hidden flex flex-col">
          {/* Estatísticas */}
          <div className="p-4 border-b border-white/10 space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-blue-500/20 border border-blue-500/30 p-2 rounded text-center">
                <p className="text-white/60 text-xs">Total</p>
                <p className="text-xl font-bold text-blue-400">{stats.total}</p>
              </div>
              <div className="bg-green-500/20 border border-green-500/30 p-2 rounded text-center">
                <p className="text-white/60 text-xs">Em Rota</p>
                <p className="text-xl font-bold text-green-400">{stats.emRota}</p>
              </div>
              <div className="bg-blue-600/20 border border-blue-600/30 p-2 rounded text-center">
                <p className="text-white/60 text-xs">Parados</p>
                <p className="text-xl font-bold text-blue-300">{stats.parados}</p>
              </div>
              <div className="bg-orange-500/20 border border-orange-500/30 p-2 rounded text-center">
                <p className="text-white/60 text-xs">Manutenção</p>
                <p className="text-xl font-bold text-orange-400">{stats.manutencao}</p>
              </div>
            </div>
          </div>

          {/* Filtros */}
          <div className="p-4 border-b border-white/10 space-y-3">
            <div>
              <label className="text-white/60 text-xs font-semibold">Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full mt-1 bg-slate-700 text-white text-sm rounded px-2 py-1 border border-white/10"
              >
                <option value="todos">Todos</option>
                <option value="Em Rota">Em Rota</option>
                <option value="Parado">Parado</option>
                <option value="Manutenção">Manutenção</option>
              </select>
            </div>
            <div>
              <label className="text-white/60 text-xs font-semibold">Tipo</label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full mt-1 bg-slate-700 text-white text-sm rounded px-2 py-1 border border-white/10"
              >
                <option value="todos">Todos</option>
                <option value="Van">Van</option>
                <option value="Micro-ônibus">Micro-ônibus</option>
                <option value="Ônibus">Ônibus</option>
              </select>
            </div>
          </div>

          {/* Lista de Veículos */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-4 space-y-2">
              {filteredVehicles.map((vehicle) => (
                <button
                  key={vehicle.id}
                  onClick={() => setSelectedVehicle(vehicle)}
                  className={`w-full text-left p-3 rounded-lg border transition-all ${
                    selectedVehicle?.id === vehicle.id
                      ? "bg-indigo-500/30 border-indigo-500/50"
                      : "bg-slate-700/30 border-white/10 hover:border-white/20"
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="text-white font-semibold text-sm">{vehicle.name}</p>
                      <p className="text-white/60 text-xs">{vehicle.placa}</p>
                    </div>
                    <span
                      className={`text-xs font-bold px-2 py-1 rounded ${
                        vehicle.status === "Em Rota"
                          ? "bg-green-500/30 text-green-400"
                          : vehicle.status === "Parado"
                          ? "bg-blue-500/30 text-blue-400"
                          : "bg-orange-500/30 text-orange-400"
                      }`}
                    >
                      {vehicle.status}
                    </span>
                  </div>
                  <div className="text-xs text-white/40 space-y-1">
                    <p>👤 {vehicle.driver}</p>
                    <p>⚡ {vehicle.speed.toFixed(0)} km/h</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Mapa */}
        <div className="flex-1 bg-slate-800/50 border border-white/10 rounded-lg overflow-hidden">
          <div id="map-container" className="w-full h-full" />
        </div>

        {/* Painel Lateral Direito - Detalhes */}
        {selectedVehicle && (
          <div className="w-80 bg-slate-800/50 border border-white/10 rounded-lg overflow-hidden flex flex-col">
            <div className="p-4 border-b border-white/10">
              <h3 className="text-lg font-bold text-white">{selectedVehicle.name}</h3>
              <p className="text-white/60 text-sm">{selectedVehicle.placa}</p>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* Informações do Motorista */}
              <div className="bg-slate-700/30 border border-white/10 p-3 rounded-lg">
                <p className="text-white/60 text-xs font-semibold mb-2">Motorista</p>
                <p className="text-white font-semibold mb-2">{selectedVehicle.driver}</p>
                <Button className="w-full gap-2 text-sm" variant="outline" size="sm">
                  <Phone className="h-3 w-3" />
                  {selectedVehicle.phone}
                </Button>
              </div>

              {/* Status e Localização */}
              <div className="bg-slate-700/30 border border-white/10 p-3 rounded-lg">
                <p className="text-white/60 text-xs font-semibold mb-3">Localização</p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-indigo-400" />
                    <div>
                      <p className="text-white/60 text-xs">Coordenadas</p>
                      <p className="text-white text-sm">
                        {selectedVehicle.lat.toFixed(4)}, {selectedVehicle.lng.toFixed(4)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Navigation className="h-4 w-4 text-green-400" />
                    <div>
                      <p className="text-white/60 text-xs">Destino</p>
                      <p className="text-white text-sm">{selectedVehicle.destination}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Velocidade */}
              <div className="bg-slate-700/30 border border-white/10 p-3 rounded-lg">
                <p className="text-white/60 text-xs font-semibold mb-3">Velocidade</p>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Gauge className="h-4 w-4 text-blue-400" />
                    <span className="text-white/60 text-sm">Velocidade Atual</span>
                  </div>
                  <span className="text-white font-bold">{selectedVehicle.speed.toFixed(0)} km/h</span>
                </div>
                <div className="w-full bg-slate-600 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full"
                    style={{ width: `${Math.min(100, (selectedVehicle.speed / 120) * 100)}%` }}
                  />
                </div>
              </div>

              {/* Combustível */}
              <div className="bg-slate-700/30 border border-white/10 p-3 rounded-lg">
                <p className="text-white/60 text-xs font-semibold mb-3">Combustível</p>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Fuel className="h-4 w-4 text-yellow-400" />
                    <span className="text-white text-sm">{selectedVehicle.fuel.toFixed(0)}%</span>
                  </div>
                  <span className="text-white/60 text-xs">
                    {selectedVehicle.fuel < 20 && "⚠️ Baixo"}
                    {selectedVehicle.fuel >= 20 && selectedVehicle.fuel < 50 && "⚠️ Moderado"}
                    {selectedVehicle.fuel >= 50 && "✅ Bom"}
                  </span>
                </div>
                <div className="w-full bg-slate-600 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full ${
                      selectedVehicle.fuel < 20
                        ? "bg-red-500"
                        : selectedVehicle.fuel < 50
                        ? "bg-yellow-500"
                        : "bg-green-500"
                    }`}
                    style={{ width: `${selectedVehicle.fuel}%` }}
                  />
                </div>
              </div>

              {/* Temperatura */}
              <div className="bg-slate-700/30 border border-white/10 p-3 rounded-lg">
                <p className="text-white/60 text-xs font-semibold mb-2">Temperatura do Motor</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Thermometer className="h-4 w-4 text-red-400" />
                    <span className="text-white font-bold text-lg">{selectedVehicle.temperature}°C</span>
                  </div>
                  <span className="text-white/60 text-xs">
                    {selectedVehicle.temperature > 100 && "🔴 Quente"}
                    {selectedVehicle.temperature <= 100 && "🟢 Normal"}
                  </span>
                </div>
              </div>

              {/* Última Atualização */}
              <div className="bg-slate-700/30 border border-white/10 p-3 rounded-lg">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-white/60" />
                  <div>
                    <p className="text-white/60 text-xs">Última Atualização</p>
                    <p className="text-white text-sm">
                      {selectedVehicle.lastUpdate.toLocaleTimeString("pt-BR")}
                    </p>
                  </div>
                </div>
              </div>

              {/* Alertas */}
              {selectedVehicle.fuel < 20 && (
                <div className="bg-red-500/20 border border-red-500/30 p-3 rounded-lg flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-red-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-red-400 font-semibold text-sm">Combustível Baixo</p>
                    <p className="text-red-300 text-xs">Abasteça em breve</p>
                  </div>
                </div>
              )}

              {selectedVehicle.temperature > 100 && (
                <div className="bg-orange-500/20 border border-orange-500/30 p-3 rounded-lg flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-orange-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-orange-400 font-semibold text-sm">Motor Aquecido</p>
                    <p className="text-orange-300 text-xs">Verifique o sistema de arrefecimento</p>
                  </div>
                </div>
              )}
            </div>

            {/* Botões de Ação */}
            <div className="p-4 border-t border-white/10 space-y-2">
              <Button className="w-full gap-2" variant="outline">
                <RefreshCw className="h-4 w-4" />
                Atualizar
              </Button>
              <Button className="w-full gap-2" variant="outline">
                <Navigation className="h-4 w-4" />
                Ver Rota
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
