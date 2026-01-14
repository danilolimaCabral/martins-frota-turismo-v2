import React, { useState } from "react";
import { MapPin, Truck, Navigation, Fuel, AlertCircle , ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";
import { Map } from "@/components/Map";

interface Veiculo {
  id: string;
  placa: string;
  modelo: string;
  motorista: string;
  latitude: number;
  longitude: number;
  velocidade: number;
  combustivel: number;
  status: "ativo" | "parado" | "manutencao" | "offline";
  rota?: string;
}

export default function AdminRastreamento() {
  const [, setLocation] = useLocation();
  const [veiculos] = useState<Veiculo[]>([
    {
      id: "1",
      placa: "MRT-001",
      modelo: "Van Mercedes Sprinter",
      motorista: "João Silva",
      latitude: -25.4284,
      longitude: -49.2733,
      velocidade: 65,
      combustivel: 85,
      status: "ativo",
      rota: "Curitiba → São Paulo",
    },
    {
      id: "2",
      placa: "MRT-002",
      modelo: "Ônibus Marcopolo",
      motorista: "Carlos Santos",
      latitude: -25.4200,
      longitude: -49.2800,
      velocidade: 0,
      combustivel: 45,
      status: "parado",
      rota: "Aguardando saída",
    },
    {
      id: "3",
      placa: "MRT-003",
      modelo: "Van Hyundai H350",
      motorista: "Pedro Costa",
      latitude: -25.4350,
      longitude: -49.2650,
      velocidade: 45,
      combustivel: 60,
      status: "ativo",
      rota: "Curitiba → Cascavel",
    },
  ]);

  const [selectedVeiculo, setSelectedVeiculo] = useState<Veiculo | null>(veiculos[0]);
  const [filtroStatus, setFiltroStatus] = useState<string>("todos");

  const veiculosFiltrados = filtroStatus === "todos" 
    ? veiculos 
    : veiculos.filter(v => v.status === filtroStatus);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ativo": return "bg-green-100 text-green-800";
      case "parado": return "bg-yellow-100 text-yellow-800";
      case "manutencao": return "bg-red-100 text-red-800";
      case "offline": return "bg-gray-100 text-gray-800";
      default: return "bg-blue-100 text-blue-800";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "ativo": return "Em Movimento";
      case "parado": return "Parado";
      case "manutencao": return "Manutenção";
      case "offline": return "Sem Sinal";
      default: return "Desconhecido";
    }
  };

  return (
    <div className="space-y-6">
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

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Rastreamento de Frota</h1>
          <p className="text-slate-600 mt-1">Localização em tempo real de todos os veículos</p>
        </div>
        <div className="flex gap-2">
          {["todos", "ativo", "parado", "offline"].map((status) => (
            <button
              key={status}
              onClick={() => setFiltroStatus(status)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filtroStatus === status
                  ? "bg-orange-500 text-white"
                  : "bg-slate-200 text-slate-700 hover:bg-slate-300"
              }`}
            >
              {status === "todos" ? "Todos" : getStatusLabel(status)}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg border border-slate-200 overflow-hidden h-[500px]">
            <Map onMapReady={(map) => {
              if (selectedVeiculo) {
                map.setCenter({
                  lat: selectedVeiculo.latitude,
                  lng: selectedVeiculo.longitude,
                });
                map.setZoom(12);
              }
            }} />
          </div>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-4 h-[500px] overflow-y-auto">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Veículos ({veiculosFiltrados.length})</h2>
          <div className="space-y-3">
            {veiculosFiltrados.map((veiculo) => (
              <button
                key={veiculo.id}
                onClick={() => setSelectedVeiculo(veiculo)}
                className={`w-full p-3 rounded-lg border-2 transition-all text-left ${
                  selectedVeiculo?.id === veiculo.id
                    ? "border-orange-500 bg-orange-50"
                    : "border-slate-200 hover:border-slate-300"
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-semibold text-slate-900">{veiculo.placa}</p>
                    <p className="text-xs text-slate-500">{veiculo.modelo}</p>
                  </div>
                  <span className={`text-xs font-bold px-2 py-1 rounded ${getStatusColor(veiculo.status)}`}>
                    {getStatusLabel(veiculo.status)}
                  </span>
                </div>
                <p className="text-xs text-slate-600 mb-2">Motorista: {veiculo.motorista}</p>
                <div className="flex gap-2 text-xs">
                  <span className="flex items-center gap-1 text-slate-600">
                    <Navigation className="w-3 h-3" />
                    {veiculo.velocidade} km/h
                  </span>
                  <span className="flex items-center gap-1 text-slate-600">
                    <Fuel className="w-3 h-3" />
                    {veiculo.combustivel}%
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {selectedVeiculo && (
        <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg border border-orange-200 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg p-4">
              <p className="text-xs text-slate-600 mb-1">Placa</p>
              <p className="text-2xl font-bold text-slate-900">{selectedVeiculo.placa}</p>
              <p className="text-xs text-slate-500 mt-2">{selectedVeiculo.modelo}</p>
            </div>

            <div className="bg-white rounded-lg p-4">
              <p className="text-xs text-slate-600 mb-1">Localização</p>
              <p className="text-sm font-semibold text-slate-900 flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                {selectedVeiculo.latitude.toFixed(4)}, {selectedVeiculo.longitude.toFixed(4)}
              </p>
              <p className="text-xs text-slate-500 mt-2">{selectedVeiculo.rota}</p>
            </div>

            <div className="bg-white rounded-lg p-4">
              <p className="text-xs text-slate-600 mb-1">Velocidade</p>
              <p className="text-2xl font-bold text-slate-900">{selectedVeiculo.velocidade}</p>
              <p className="text-xs text-slate-500 mt-2">km/h</p>
            </div>

            <div className="bg-white rounded-lg p-4">
              <p className="text-xs text-slate-600 mb-1">Combustível</p>
              <div className="w-full bg-slate-200 rounded-full h-2 mb-2">
                <div
                  className={`h-2 rounded-full transition-all ${
                    selectedVeiculo.combustivel > 50
                      ? "bg-green-500"
                      : selectedVeiculo.combustivel > 25
                      ? "bg-yellow-500"
                      : "bg-red-500"
                  }`}
                  style={{ width: `${selectedVeiculo.combustivel}%` }}
                />
              </div>
              <p className="text-xs text-slate-500">{selectedVeiculo.combustivel}%</p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-500" />
          Alertas da Frota
        </h2>
        <div className="space-y-3">
          {veiculos
            .filter(v => v.combustivel < 30 || v.status === "offline")
            .map((veiculo) => (
              <div key={veiculo.id} className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-slate-900">
                    {veiculo.placa} - {veiculo.modelo}
                  </p>
                  {veiculo.combustivel < 30 && (
                    <p className="text-sm text-red-700">Combustível baixo: {veiculo.combustivel}%</p>
                  )}
                  {veiculo.status === "offline" && (
                    <p className="text-sm text-red-700">Sem sinal de GPS</p>
                  )}
                </div>
              </div>
            ))}
          {veiculos.filter(v => v.combustivel < 30 || v.status === "offline").length === 0 && (
            <p className="text-slate-600">Nenhum alerta no momento</p>
          )}
        </div>
      </div>
    </div>
  );
}
