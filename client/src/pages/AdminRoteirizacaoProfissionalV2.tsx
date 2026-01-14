import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Upload,
  MapPin,
  Clock,
  Users,
  AlertCircle,
  CheckCircle,
  Loader,
  Navigation,
  Download,
  Plus,
  Trash2,
  ArrowLeft,
  Map,
  FileUp,
} from "lucide-react";
import * as XLSX from "xlsx";
import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useLocation } from "wouter";
import { toast } from "sonner";

// Corrigir ícones do Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

interface Ponto {
  id: string;
  nome: string;
  endereco: string;
  latitude: number;
  longitude: number;
  horario: string;
  colaboradores: string[];
}

interface Rota {
  id: string;
  nome: string;
  pontos: Ponto[];
  distancia: number;
  tempo: number;
  status: "rascunho" | "otimizada" | "ativa";
}

export default function AdminRoteirizacaoProfissionalV2() {
  const [, navigate] = useLocation();
  const [rotas, setRotas] = useState<Rota[]>([
    {
      id: "1",
      nome: "Rota Teste",
      pontos: [
        {
          id: "p1",
          nome: "Ponto 1",
          endereco: "Rua A, 100",
          latitude: -25.4284,
          longitude: -49.2733,
          horario: "08:00",
          colaboradores: ["João", "Maria"],
        },
        {
          id: "p2",
          nome: "Ponto 2",
          endereco: "Rua B, 200",
          latitude: -25.4384,
          longitude: -49.2633,
          horario: "09:00",
          colaboradores: ["Pedro"],
        },
      ],
      distancia: 1.5,
      tempo: 120,
      status: "rascunho",
    },
  ]);

  const [rotaSelecionada, setRotaSelecionada] = useState<Rota | null>(rotas[0]);
  const [modoEdicao, setModoEdicao] = useState(false);
  const [novosPontos, setNovosPontos] = useState<Ponto[]>([]);

  // Calcular distância entre dois pontos (Haversine)
  const calcularDistancia = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Raio da Terra em km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Importar Excel
  const handleImportarExcel = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: "binary" });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        // Processar dados do Excel
        const pontos: Ponto[] = jsonData.map((row: any, idx: number) => ({
          id: `p${idx}`,
          nome: row["Ponto"] || `Ponto ${idx + 1}`,
          endereco: `${row["Rua"] || ""}, ${row["Número"] || ""}`,
          latitude: parseFloat(row["Latitude"]) || -25.4284,
          longitude: parseFloat(row["Longitude"]) || -49.2733,
          horario: row["Horário"] || "08:00",
          colaboradores: (row["Colaboradores"] || "").split(",").map((s: string) => s.trim()),
        }));

        setNovosPontos(pontos);
        toast.success(`${pontos.length} pontos importados com sucesso!`);
      } catch (error) {
        toast.error("Erro ao importar Excel");
        console.error(error);
      }
    };
    reader.readAsBinaryString(file);
  };

  // Criar nova rota
  const criarNovaRota = () => {
    if (novosPontos.length === 0) {
      toast.error("Importe uma planilha primeiro!");
      return;
    }

    // Calcular distância total
    let distanciaTotal = 0;
    for (let i = 0; i < novosPontos.length - 1; i++) {
      distanciaTotal += calcularDistancia(
        novosPontos[i].latitude,
        novosPontos[i].longitude,
        novosPontos[i + 1].latitude,
        novosPontos[i + 1].longitude
      );
    }

    const novaRota: Rota = {
      id: `rota_${Date.now()}`,
      nome: `Rota ${new Date().toLocaleDateString()}`,
      pontos: novosPontos,
      distancia: distanciaTotal,
      tempo: Math.round((distanciaTotal / 60) * 60), // Estimativa: 60 km/h
      status: "rascunho",
    };

    setRotas([...rotas, novaRota]);
    setRotaSelecionada(novaRota);
    setNovosPontos([]);
    toast.success("Rota criada com sucesso!");
  };

  // Remover ponto
  const removerPonto = (pontoId: string) => {
    if (!rotaSelecionada) return;
    const novosPontosAtualizados = rotaSelecionada.pontos.filter((p) => p.id !== pontoId);
    setRotaSelecionada({
      ...rotaSelecionada,
      pontos: novosPontosAtualizados,
    });
  };

  // Exportar PDF
  const exportarPDF = () => {
    if (!rotaSelecionada) return;

    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Relatório de Roteirização", 10, 10);

    doc.setFontSize(12);
    doc.text(`Rota: ${rotaSelecionada.nome}`, 10, 20);
    doc.text(`Status: ${rotaSelecionada.status}`, 10, 30);
    doc.text(`Distância Total: ${rotaSelecionada.distancia.toFixed(2)} km`, 10, 40);
    doc.text(`Tempo Estimado: ${rotaSelecionada.tempo} minutos`, 10, 50);

    // Tabela de pontos
    const tableData = rotaSelecionada.pontos.map((p) => [
      p.nome,
      p.endereco,
      p.horario,
      p.colaboradores.join(", "),
      p.colaboradores.length,
    ]);

    autoTable(doc, {
      head: [["Ponto", "Endereço", "Horário", "Colaboradores", "Qtd"]],
      body: tableData,
      startY: 60,
    });

    doc.save(`rota_${rotaSelecionada.nome}.pdf`);
    toast.success("PDF exportado com sucesso!");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/admin")}
            className="p-2 hover:bg-white rounded-lg transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">🗺️ Roteirização Inteligente</h1>
            <p className="text-gray-600">Otimize rotas de fretamento com pontos de embarque</p>
          </div>
        </div>
        <Button onClick={criarNovaRota} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Nova Rota
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar - Rotas Cadastradas */}
        <div className="lg:col-span-1">
          <Card className="bg-white shadow-lg">
            <CardHeader className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-t-lg">
              <CardTitle className="flex items-center gap-2">
                <Navigation className="w-5 h-5" />
                Rotas Cadastradas
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              {rotas.map((rota) => (
                <button
                  key={rota.id}
                  onClick={() => setRotaSelecionada(rota)}
                  className={`w-full text-left p-3 rounded-lg border-2 transition ${
                    rotaSelecionada?.id === rota.id
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-blue-300"
                  }`}
                >
                  <p className="font-semibold text-gray-900">{rota.nome}</p>
                  <div className="text-xs text-gray-600 mt-1 space-y-1">
                    <p>📍 {rota.pontos.length} pontos</p>
                    <p>🛣️ {rota.distancia.toFixed(2)} km</p>
                    <p>⏱️ {rota.tempo} min</p>
                  </div>
                  <span
                    className={`inline-block mt-2 px-2 py-1 text-xs rounded font-semibold ${
                      rota.status === "ativa"
                        ? "bg-green-100 text-green-700"
                        : rota.status === "otimizada"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {rota.status}
                  </span>
                </button>
              ))}

              {/* Importar Excel */}
              <div className="mt-6 pt-6 border-t">
                <label className="block">
                  <input
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    onChange={handleImportarExcel}
                    className="hidden"
                  />
                  <div className="flex items-center justify-center gap-2 p-3 border-2 border-dashed border-blue-300 rounded-lg bg-blue-50 hover:bg-blue-100 cursor-pointer transition">
                    <FileUp className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-semibold text-blue-600">Importar Excel</span>
                  </div>
                </label>
              </div>

              {novosPontos.length > 0 && (
                <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="text-sm font-semibold text-amber-900">
                    {novosPontos.length} pontos prontos para criar rota
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Main Content - Mapa e Detalhes */}
        <div className="lg:col-span-3 space-y-6">
          {rotaSelecionada ? (
            <>
              {/* Mapa */}
              <Card className="bg-white shadow-lg overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-green-500 to-green-600 text-white">
                  <CardTitle className="flex items-center gap-2">
                    <Map className="w-5 h-5" />
                    Mapa da Rota
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="h-96 w-full">
                    <MapContainer
                      center={[
                        rotaSelecionada.pontos[0]?.latitude || -25.4284,
                        rotaSelecionada.pontos[0]?.longitude || -49.2733,
                      ]}
                      zoom={13}
                      style={{ height: "100%", width: "100%" }}
                    >
                      <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; OpenStreetMap contributors'
                      />

                      {/* Marcadores */}
                      {rotaSelecionada.pontos.map((ponto, idx) => (
                        <Marker
                          key={ponto.id}
                          position={[ponto.latitude, ponto.longitude]}
                          icon={
                            idx === 0
                              ? new L.Icon({
                                  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
                                  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
                                  iconSize: [25, 41],
                                  iconAnchor: [12, 41],
                                })
                              : new L.Icon({
                                  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
                                  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
                                  iconSize: [20, 32],
                                  iconAnchor: [10, 32],
                              })
                          }
                        >
                          <Popup>
                            <div className="text-sm">
                              <p className="font-bold">{ponto.nome}</p>
                              <p>{ponto.endereco}</p>
                              <p>⏰ {ponto.horario}</p>
                              <p>👥 {ponto.colaboradores.length} pessoas</p>
                            </div>
                          </Popup>
                        </Marker>
                      ))}

                      {/* Linhas conectando pontos */}
                      {rotaSelecionada.pontos.length > 1 && (
                        <Polyline
                          positions={rotaSelecionada.pontos.map((p) => [p.latitude, p.longitude])}
                          color="blue"
                          weight={3}
                          opacity={0.7}
                        />
                      )}
                    </MapContainer>
                  </div>
                </CardContent>
              </Card>

              {/* KPIs */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-blue-700 font-semibold">Distância</p>
                        <p className="text-2xl font-bold text-blue-900">{rotaSelecionada.distancia.toFixed(2)} km</p>
                      </div>
                      <Navigation className="w-8 h-8 text-blue-600 opacity-50" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-green-700 font-semibold">Tempo</p>
                        <p className="text-2xl font-bold text-green-900">{rotaSelecionada.tempo} min</p>
                      </div>
                      <Clock className="w-8 h-8 text-green-600 opacity-50" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-purple-700 font-semibold">Pontos</p>
                        <p className="text-2xl font-bold text-purple-900">{rotaSelecionada.pontos.length}</p>
                      </div>
                      <MapPin className="w-8 h-8 text-purple-600 opacity-50" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-orange-700 font-semibold">Pessoas</p>
                        <p className="text-2xl font-bold text-orange-900">
                          {rotaSelecionada.pontos.reduce((sum, p) => sum + p.colaboradores.length, 0)}
                        </p>
                      </div>
                      <Users className="w-8 h-8 text-orange-600 opacity-50" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Tabela de Pontos */}
              <Card className="bg-white shadow-lg">
                <CardHeader className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white">
                  <CardTitle>Escala de Embarque</CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-100 border-b">
                        <tr>
                          <th className="text-left p-3 font-semibold">Ponto</th>
                          <th className="text-left p-3 font-semibold">Endereço</th>
                          <th className="text-left p-3 font-semibold">Horário</th>
                          <th className="text-left p-3 font-semibold">Colaboradores</th>
                          <th className="text-left p-3 font-semibold">Qtd</th>
                          <th className="text-left p-3 font-semibold">Ações</th>
                        </tr>
                      </thead>
                      <tbody>
                        {rotaSelecionada.pontos.map((ponto) => (
                          <tr key={ponto.id} className="border-b hover:bg-gray-50">
                            <td className="p-3 font-semibold">{ponto.nome}</td>
                            <td className="p-3">{ponto.endereco}</td>
                            <td className="p-3">{ponto.horario}</td>
                            <td className="p-3">{ponto.colaboradores.join(", ")}</td>
                            <td className="p-3 font-semibold">{ponto.colaboradores.length}</td>
                            <td className="p-3">
                              <button
                                onClick={() => removerPonto(ponto.id)}
                                className="p-2 hover:bg-red-100 text-red-600 rounded transition"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>

              {/* Botões de Ação */}
              <div className="flex gap-3">
                <Button onClick={exportarPDF} className="bg-green-600 hover:bg-green-700">
                  <Download className="w-4 h-4 mr-2" />
                  Exportar PDF
                </Button>
              </div>
            </>
          ) : (
            <Card className="bg-white shadow-lg">
              <CardContent className="p-12 text-center">
                <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Selecione uma rota ou importe uma planilha para começar</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
