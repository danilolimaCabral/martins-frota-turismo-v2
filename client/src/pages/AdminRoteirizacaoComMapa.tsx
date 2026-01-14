import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
  Zap,
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

export default function AdminRoteirizacaoComMapa() {
  const [, navigate] = useLocation();
  const [pontos, setPontos] = useState<Ponto[]>([]);
  const [rotas, setRotas] = useState<Rota[]>([]);
  const [rotaSelecionada, setRotaSelecionada] = useState<Rota | null>(null);
  const [carregando, setCarregando] = useState(false);
  const [geocodificando, setGeocodificando] = useState(false);

  // Calcular distância usando Haversine
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

  // Geocodificar endereço
  const geocodificarEndereco = async (endereco: string): Promise<{ lat: number; lon: number } | null> => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(endereco)}`
      );
      const data = await response.json();
      if (data.length > 0) {
        return {
          lat: parseFloat(data[0].lat),
          lon: parseFloat(data[0].lon),
        };
      }
    } catch (error) {
      console.error("Erro ao geocodificar:", error);
    }
    return null;
  };

  // Importar Excel
  const handleImportarExcel = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setCarregando(true);
    setGeocodificando(true);

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const data = e.target?.result;
          const workbook = XLSX.read(data, { type: "binary" });
          const worksheet = workbook.Sheets[workbook.SheetNames[0]];
          const jsonData = XLSX.utils.sheet_to_json(worksheet);

          // Processar dados e geocodificar
          const pontosProcesados: Ponto[] = [];

          for (let idx = 0; idx < jsonData.length; idx++) {
            const row: any = jsonData[idx];
            const endereco = `${row["Rua"] || ""}, ${row["Número"] || ""}, Curitiba, PR`;

            // Tentar geocodificar
            let coords = { lat: -25.4284, lon: -49.2733 }; // Padrão Curitiba

            if (row["Latitude"] && row["Longitude"]) {
              coords = {
                lat: parseFloat(row["Latitude"]),
                lon: parseFloat(row["Longitude"]),
              };
            } else {
              // Geocodificar automaticamente
              const resultado = await geocodificarEndereco(endereco);
              if (resultado) {
                coords = { lat: resultado.lat, lon: resultado.lon };
              }
            }

            pontosProcesados.push({
              id: `p${idx}`,
              nome: row["Ponto"] || row["Colaborador"] || `Ponto ${idx + 1}`,
              endereco: endereco,
              latitude: coords.lat,
              longitude: coords.lon,
              horario: row["Horário"] || "08:00",
              colaboradores: (row["Colaboradores"] || "").split(",").map((s: string) => s.trim()),
            });

            // Delay para não sobrecarregar a API
            if (idx % 5 === 0) {
              await new Promise((resolve) => setTimeout(resolve, 1000));
            }
          }

          setPontos(pontosProcesados);
          toast.success(`✅ ${pontosProcesados.length} pontos importados e geocodificados!`);

          // Criar rota automaticamente
          if (pontosProcesados.length > 0) {
            let distanciaTotal = 0;
            for (let i = 0; i < pontosProcesados.length - 1; i++) {
              distanciaTotal += calcularDistancia(
                pontosProcesados[i].latitude,
                pontosProcesados[i].longitude,
                pontosProcesados[i + 1].latitude,
                pontosProcesados[i + 1].longitude
              );
            }

            const novaRota: Rota = {
              id: `rota_${Date.now()}`,
              nome: `Rota ${new Date().toLocaleDateString()}`,
              pontos: pontosProcesados,
              distancia: distanciaTotal,
              tempo: Math.round((distanciaTotal / 60) * 60),
              status: "rascunho",
            };

            setRotas([...rotas, novaRota]);
            setRotaSelecionada(novaRota);
          }
        } catch (error) {
          toast.error("❌ Erro ao processar Excel");
          console.error(error);
        }
      };
      reader.readAsBinaryString(file);
    } finally {
      setCarregando(false);
      setGeocodificando(false);
    }
  };

  // Exportar para PDF
  const exportarPDF = () => {
    if (!rotaSelecionada) return;

    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Relatório de Roteirização", 10, 10);

    doc.setFontSize(10);
    doc.text(`Rota: ${rotaSelecionada.nome}`, 10, 20);
    doc.text(`Distância Total: ${rotaSelecionada.distancia.toFixed(2)} km`, 10, 27);
    doc.text(`Tempo Estimado: ${rotaSelecionada.tempo} minutos`, 10, 34);
    doc.text(`Pontos: ${rotaSelecionada.pontos.length}`, 10, 41);

    const tableData = rotaSelecionada.pontos.map((p, idx) => [
      idx + 1,
      p.nome,
      p.endereco,
      p.horario,
      p.colaboradores.join(", "),
    ]);

    autoTable(doc, {
      head: [["#", "Ponto", "Endereço", "Horário", "Colaboradores"]],
      body: tableData,
      startY: 50,
    });

    doc.save(`rota_${rotaSelecionada.nome}.pdf`);
    toast.success("✅ PDF exportado!");
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
            <h1 className="text-3xl font-bold text-gray-900">🗺️ Roteirização com Mapa</h1>
            <p className="text-gray-600">Importe planilha e veja o mapa em tempo real</p>
          </div>
        </div>
      </div>

      {/* Área de Upload */}
      <Card className="mb-6 bg-white shadow-lg">
        <CardHeader className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
          <CardTitle className="flex items-center gap-2">
            <FileUp className="w-5 h-5" />
            Importar Planilha com Endereços
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <label className="block cursor-pointer">
            <input
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleImportarExcel}
              disabled={carregando}
              className="hidden"
            />
            <div className="flex items-center justify-center gap-3 p-8 border-2 border-dashed border-orange-300 rounded-lg bg-orange-50 hover:bg-orange-100 transition">
              {carregando ? (
                <>
                  <Loader className="w-6 h-6 text-orange-600 animate-spin" />
                  <div>
                    <p className="font-semibold text-orange-900">
                      {geocodificando ? "Geocodificando endereços..." : "Processando..."}
                    </p>
                    <p className="text-sm text-orange-700">Aguarde, isso pode levar alguns segundos</p>
                  </div>
                </>
              ) : (
                <>
                  <FileUp className="w-6 h-6 text-orange-600" />
                  <div>
                    <p className="font-semibold text-orange-900">Clique para importar ou arraste um arquivo</p>
                    <p className="text-sm text-orange-700">Aceita .xlsx, .xls ou .csv com colunas: Rua, Número, Horário, Colaboradores</p>
                  </div>
                </>
              )}
            </div>
          </label>
        </CardContent>
      </Card>

      {/* Mapa e Detalhes */}
      {rotaSelecionada && (
        <div className="space-y-6">
          {/* Mapa */}
          <Card className="bg-white shadow-lg overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-green-500 to-green-600 text-white">
              <CardTitle className="flex items-center gap-2">
                <Map className="w-5 h-5" />
                Mapa da Rota ({rotaSelecionada.pontos.length} pontos)
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
                              className: "marker-start",
                            })
                          : idx === rotaSelecionada.pontos.length - 1
                          ? new L.Icon({
                              iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
                              shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
                              iconSize: [25, 41],
                              iconAnchor: [12, 41],
                              className: "marker-end",
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
                          <p className="font-bold">#{idx + 1} - {ponto.nome}</p>
                          <p className="text-xs text-gray-600">{ponto.endereco}</p>
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
                      color="#ff6b35"
                      weight={3}
                      opacity={0.8}
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
                      {rotaSelecionada.pontos.reduce((acc, p) => acc + p.colaboradores.length, 0)}
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
            <CardContent className="p-6">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-100 border-b-2">
                    <tr>
                      <th className="text-left p-3 font-semibold">#</th>
                      <th className="text-left p-3 font-semibold">Ponto</th>
                      <th className="text-left p-3 font-semibold">Endereço</th>
                      <th className="text-left p-3 font-semibold">Horário</th>
                      <th className="text-left p-3 font-semibold">Colaboradores</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rotaSelecionada.pontos.map((ponto, idx) => (
                      <tr key={ponto.id} className="border-b hover:bg-gray-50">
                        <td className="p-3 font-semibold text-orange-600">{idx + 1}</td>
                        <td className="p-3">{ponto.nome}</td>
                        <td className="p-3 text-gray-600">{ponto.endereco}</td>
                        <td className="p-3 font-semibold">{ponto.horario}</td>
                        <td className="p-3">{ponto.colaboradores.join(", ")}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Botões de Ação */}
          <div className="flex gap-4 justify-end">
            <Button
              onClick={exportarPDF}
              className="bg-red-600 hover:bg-red-700 text-white flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Exportar PDF
            </Button>
          </div>
        </div>
      )}

      {/* Mensagem quando não há rota */}
      {!rotaSelecionada && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-8 text-center">
            <MapPin className="w-12 h-12 text-blue-600 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-semibold text-blue-900">Importe uma planilha para começar</p>
            <p className="text-blue-700 mt-2">Clique no botão acima para importar um arquivo Excel com os endereços</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
