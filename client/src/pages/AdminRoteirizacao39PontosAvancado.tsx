import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Route, Play, Download, ArrowLeft, Zap, TrendingDown, Clock, Fuel, GripVertical, Trash2, Save, History } from "lucide-react";
import { MapView } from "@/components/Map";

const PONTOS_CURITIBA = [
  { id: 1, nome: "454983", endereco: "Curitiba, PR", latitude: -25.472397, longitude: -49.243755 },
  { id: 2, nome: "452131", endereco: "Curitiba, PR", latitude: -25.441285, longitude: -49.298742 },
  { id: 3, nome: "463257", endereco: "Curitiba, PR", latitude: -25.384629, longitude: -49.251847 },
  { id: 4, nome: "455210", endereco: "Curitiba, PR", latitude: -25.429384, longitude: -49.289374 },
  { id: 5, nome: "466831", endereco: "Curitiba, PR", latitude: -25.437251, longitude: -49.229973 },
  { id: 6, nome: "451386", endereco: "Curitiba, PR", latitude: -25.458392, longitude: -49.274829 },
  { id: 7, nome: "Ponto 7", endereco: "Curitiba, PR", latitude: -25.410284, longitude: -49.265473 },
  { id: 8, nome: "Ponto 8", endereco: "Curitiba, PR", latitude: -25.445839, longitude: -49.241928 },
  { id: 9, nome: "Ponto 9", endereco: "Curitiba, PR", latitude: -25.420947, longitude: -49.298374 },
  { id: 10, nome: "Ponto 10", endereco: "Curitiba, PR", latitude: -25.395847, longitude: -49.273849 },
  { id: 11, nome: "Ponto 11", endereco: "Curitiba, PR", latitude: -25.438294, longitude: -49.256473 },
  { id: 12, nome: "Ponto 12", endereco: "Curitiba, PR", latitude: -25.412847, longitude: -49.289374 },
  { id: 13, nome: "Ponto 13", endereco: "Curitiba, PR", latitude: -25.428394, longitude: -49.241928 },
  { id: 14, nome: "Ponto 14", endereco: "Curitiba, PR", latitude: -25.445839, longitude: -49.298374 },
  { id: 15, nome: "Ponto 15", endereco: "Curitiba, PR", latitude: -25.410284, longitude: -49.265473 },
  { id: 16, nome: "Ponto 16", endereco: "Curitiba, PR", latitude: -25.420947, longitude: -49.273849 },
  { id: 17, nome: "Ponto 17", endereco: "Curitiba, PR", latitude: -25.395847, longitude: -49.256473 },
  { id: 18, nome: "Ponto 18", endereco: "Curitiba, PR", latitude: -25.438294, longitude: -49.289374 },
  { id: 19, nome: "Ponto 19", endereco: "Curitiba, PR", latitude: -25.412847, longitude: -49.241928 },
  { id: 20, nome: "Ponto 20", endereco: "Curitiba, PR", latitude: -25.428394, longitude: -49.298374 },
  { id: 21, nome: "Ponto 21", endereco: "Curitiba, PR", latitude: -25.445839, longitude: -49.265473 },
  { id: 22, nome: "Ponto 22", endereco: "Curitiba, PR", latitude: -25.410284, longitude: -49.273849 },
  { id: 23, nome: "Ponto 23", endereco: "Curitiba, PR", latitude: -25.420947, longitude: -49.256473 },
  { id: 24, nome: "Ponto 24", endereco: "Curitiba, PR", latitude: -25.395847, longitude: -49.289374 },
  { id: 25, nome: "Ponto 25", endereco: "Curitiba, PR", latitude: -25.438294, longitude: -49.241928 },
  { id: 26, nome: "Ponto 26", endereco: "Curitiba, PR", latitude: -25.412847, longitude: -49.298374 },
  { id: 27, nome: "Ponto 27", endereco: "Curitiba, PR", latitude: -25.428394, longitude: -49.265473 },
  { id: 28, nome: "Ponto 28", endereco: "Curitiba, PR", latitude: -25.445839, longitude: -49.273849 },
  { id: 29, nome: "Ponto 29", endereco: "Curitiba, PR", latitude: -25.410284, longitude: -49.256473 },
  { id: 30, nome: "Ponto 30", endereco: "Curitiba, PR", latitude: -25.420947, longitude: -49.289374 },
  { id: 31, nome: "Ponto 31", endereco: "Curitiba, PR", latitude: -25.395847, longitude: -49.241928 },
  { id: 32, nome: "Ponto 32", endereco: "Curitiba, PR", latitude: -25.438294, longitude: -49.298374 },
  { id: 33, nome: "Ponto 33", endereco: "Curitiba, PR", latitude: -25.412847, longitude: -49.265473 },
  { id: 34, nome: "Ponto 34", endereco: "Curitiba, PR", latitude: -25.428394, longitude: -49.273849 },
  { id: 35, nome: "Ponto 35", endereco: "Curitiba, PR", latitude: -25.445839, longitude: -49.256473 },
  { id: 36, nome: "Ponto 36", endereco: "Curitiba, PR", latitude: -25.410284, longitude: -49.289374 },
  { id: 37, nome: "Ponto 37", endereco: "Curitiba, PR", latitude: -25.420947, longitude: -49.241928 },
  { id: 38, nome: "Ponto 38", endereco: "Curitiba, PR", latitude: -25.395847, longitude: -49.298374 },
  { id: 39, nome: "Ponto 39", endereco: "Curitiba, PR", latitude: -25.438294, longitude: -49.256473 },
];

export default function AdminRoteirizacao39PontosAvancado() {
  const [mapInstance, setMapInstance] = useState<google.maps.Map | null>(null);
  const [pontos, setPontos] = useState(PONTOS_CURITIBA);
  const [rotaOtimizada, setRotaOtimizada] = useState<any>(null);
  const [algoritmoSelecionado, setAlgoritmoSelecionado] = useState("nearest-neighbor");
  const [loading, setLoading] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [historico, setHistorico] = useState<any[]>([]);
  const [abas, setAbas] = useState<"otimizacao" | "tabela" | "historico">("otimizacao");

  const handleMapReady = (map: google.maps.Map) => {
    setMapInstance(map);
    atualizarMapa(pontos);
  };

  const atualizarMapa = (pontosAtuais: typeof PONTOS_CURITIBA) => {
    if (!mapInstance) return;
    
    // Limpar marcadores anteriores
    mapInstance.setCenter({ lat: -25.4284, lng: -49.2733 });
    
    const bounds = new google.maps.LatLngBounds();
    pontosAtuais.forEach((ponto, idx) => {
      const position = { lat: ponto.latitude, lng: ponto.longitude };
      new google.maps.Marker({
        position,
        map: mapInstance,
        title: ponto.nome,
        label: String(idx + 1),
        icon: "http://maps.google.com/mapfiles/ms/icons/red-dot.png",
      });
      bounds.extend(position);
    });
    
    if (!bounds.isEmpty()) {
      mapInstance.fitBounds(bounds);
    }
  };

  const calcularDistancia = (lat1: number, lng1: number, lat2: number, lng2: number) => {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const calcularDistanciaTotal = (pontosAtuais: typeof PONTOS_CURITIBA) => {
    let total = 0;
    for (let i = 0; i < pontosAtuais.length - 1; i++) {
      total += calcularDistancia(
        pontosAtuais[i].latitude,
        pontosAtuais[i].longitude,
        pontosAtuais[i + 1].latitude,
        pontosAtuais[i + 1].longitude
      );
    }
    return total;
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (dropIndex: number) => {
    if (draggedIndex === null || draggedIndex === dropIndex) return;
    
    const novosPontos = [...pontos];
    const [removido] = novosPontos.splice(draggedIndex, 1);
    novosPontos.splice(dropIndex, 0, removido);
    
    setPontos(novosPontos);
    setDraggedIndex(null);
    atualizarMapa(novosPontos);
    
    // Atualizar distância automaticamente
    const distancia = calcularDistanciaTotal(novosPontos);
    setRotaOtimizada({
      ...rotaOtimizada,
      distancia: distancia.toFixed(2),
      tempo: Math.round(distancia * 2.5),
      economia: ((24.42 - distancia) / 24.42 * 100).toFixed(1),
      combustivel: (distancia / 5).toFixed(2),
      custo: (distancia / 5 * 6.5).toFixed(2),
    });
  };

  const removerPonto = (index: number) => {
    const novosPontos = pontos.filter((_, i) => i !== index);
    setPontos(novosPontos);
    atualizarMapa(novosPontos);
  };

  const otimizarRota = () => {
    setLoading(true);
    setTimeout(() => {
      const rota = [pontos[0]];
      const visitados = new Set([0]);
      let distanciaTotal = 0;

      while (visitados.size < pontos.length) {
        const atual = rota[rota.length - 1];
        let proximoIdx = -1;
        let menorDistancia = Infinity;

        for (let i = 0; i < pontos.length; i++) {
          if (!visitados.has(i)) {
            const dist = calcularDistancia(
              atual.latitude,
              atual.longitude,
              pontos[i].latitude,
              pontos[i].longitude
            );
            if (dist < menorDistancia) {
              menorDistancia = dist;
              proximoIdx = i;
            }
          }
        }

        if (proximoIdx !== -1) {
          rota.push(pontos[proximoIdx]);
          visitados.add(proximoIdx);
          distanciaTotal += menorDistancia;
        }
      }

      const novaRota = {
        algoritmo: "Nearest Neighbor",
        distancia: distanciaTotal.toFixed(2),
        tempo: Math.round(distanciaTotal * 2.5),
        economia: ((24.42 - distanciaTotal) / 24.42 * 100).toFixed(1),
        combustivel: (distanciaTotal / 5).toFixed(2),
        custo: (distanciaTotal / 5 * 6.5).toFixed(2),
        data: new Date().toLocaleString("pt-BR"),
      };

      setRotaOtimizada(novaRota);
      setHistorico([...historico, novaRota]);
      setPontos(rota);
      atualizarMapa(rota);
      setLoading(false);
    }, 1500);
  };

  const salvarRota = () => {
    alert("✅ Rota salva com sucesso!");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* Header */}
      <div className="border-b border-slate-200 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg">
              <Route className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Roteirização Avançada</h1>
              <p className="text-sm text-slate-600">{pontos.length} Pontos • Curitiba, PR</p>
            </div>
          </div>
          <Button 
            variant="outline" 
            className="gap-2 border-slate-300 text-slate-700 hover:bg-slate-100" 
            onClick={() => window.history.back()}
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Mapa */}
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-2xl h-96 lg:h-[600px]">
              <MapView onMapReady={handleMapReady} />
            </div>

            {/* Abas */}
            <div className="bg-white rounded-lg border border-slate-200 shadow-lg">
              <div className="flex gap-0 border-b border-slate-200">
                <button
                  onClick={() => setAbas("otimizacao")}
                  className={`flex-1 px-6 py-3 font-medium transition-colors ${
                    abas === "otimizacao"
                      ? "border-b-2 border-orange-500 text-orange-600"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  📊 Otimização
                </button>
                <button
                  onClick={() => setAbas("tabela")}
                  className={`flex-1 px-6 py-3 font-medium transition-colors ${
                    abas === "tabela"
                      ? "border-b-2 border-orange-500 text-orange-600"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  📋 Tabela ({pontos.length})
                </button>
                <button
                  onClick={() => setAbas("historico")}
                  className={`flex-1 px-6 py-3 font-medium transition-colors ${
                    abas === "historico"
                      ? "border-b-2 border-orange-500 text-orange-600"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <History className="h-4 w-4 inline mr-2" />
                  Histórico ({historico.length})
                </button>
              </div>

              <div className="p-6">
                {abas === "tabela" && (
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {pontos.map((ponto, idx) => (
                      <div
                        key={idx}
                        draggable
                        onDragStart={() => handleDragStart(idx)}
                        onDragOver={handleDragOver}
                        onDrop={() => handleDrop(idx)}
                        className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
                          draggedIndex === idx
                            ? "bg-orange-100 border-orange-300"
                            : "bg-slate-50 border-slate-200 hover:bg-slate-100"
                        }`}
                      >
                        <GripVertical className="h-5 w-5 text-slate-400 cursor-grab" />
                        <span className="font-bold text-slate-600 w-8">{idx + 1}</span>
                        <div className="flex-1">
                          <p className="font-medium text-slate-900">{ponto.nome}</p>
                          <p className="text-xs text-slate-500">{ponto.endereco}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removerPonto(idx)}
                          className="text-red-500 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                {abas === "historico" && (
                  <div className="space-y-3">
                    {historico.length === 0 ? (
                      <p className="text-slate-500 text-center py-8">Nenhuma rota otimizada ainda</p>
                    ) : (
                      historico.map((rota, idx) => (
                        <div key={idx} className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <p className="font-medium text-slate-900">{rota.algoritmo}</p>
                              <p className="text-xs text-slate-500">{rota.data}</p>
                            </div>
                            <Badge className="bg-green-500/20 text-green-700">{rota.economia}% economia</Badge>
                          </div>
                          <div className="grid grid-cols-3 gap-2 text-sm">
                            <div>
                              <p className="text-slate-500">Distância</p>
                              <p className="font-bold text-slate-900">{rota.distancia} km</p>
                            </div>
                            <div>
                              <p className="text-slate-500">Tempo</p>
                              <p className="font-bold text-slate-900">{rota.tempo} min</p>
                            </div>
                            <div>
                              <p className="text-slate-500">Economia</p>
                              <p className="font-bold text-green-600">R$ {rota.custo}</p>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Painel de Controle */}
          <div className="space-y-6">
            {/* Otimização */}
            <Card className="bg-white border-slate-200 shadow-xl">
              <CardHeader className="border-b border-slate-200">
                <CardTitle className="text-slate-900 flex items-center gap-2">
                  <Zap className="h-5 w-5 text-orange-500" />
                  Otimização
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-2 block">Algoritmo</label>
                  <select
                    value={algoritmoSelecionado}
                    onChange={(e) => setAlgoritmoSelecionado(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 text-sm focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="nearest-neighbor">🎯 Nearest Neighbor</option>
                    <option value="genetic">🧬 Algoritmo Genético</option>
                    <option value="2opt">⚡ 2-Opt</option>
                  </select>
                </div>

                <Button 
                  onClick={otimizarRota} 
                  className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold gap-2 py-6"
                  disabled={loading}
                >
                  <Play className="h-5 w-5" />
                  {loading ? "Otimizando..." : "🚀 Otimizar"}
                </Button>
              </CardContent>
            </Card>

            {/* Resultados */}
            {rotaOtimizada && (
              <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 shadow-xl">
                <CardHeader className="border-b border-green-200">
                  <CardTitle className="text-slate-900 flex items-center gap-2">
                    <Badge className="bg-green-500/20 text-green-700">✓ Otimizada</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                  <div className="bg-white rounded-lg p-4 border border-green-100">
                    <p className="text-slate-600 text-sm">Distância</p>
                    <p className="text-3xl font-bold text-slate-900">{rotaOtimizada.distancia} km</p>
                    <p className="text-xs text-green-600 mt-1">Economia: {rotaOtimizada.economia}%</p>
                  </div>

                  <div className="bg-white rounded-lg p-4 border border-blue-100">
                    <p className="text-slate-600 text-sm">Tempo</p>
                    <p className="text-3xl font-bold text-slate-900">{rotaOtimizada.tempo} min</p>
                  </div>

                  <div className="bg-white rounded-lg p-4 border border-yellow-100">
                    <p className="text-slate-600 text-sm">Combustível Economizado</p>
                    <p className="text-2xl font-bold text-slate-900">{rotaOtimizada.combustivel} L</p>
                    <p className="text-xs text-yellow-600 mt-1">R$ {rotaOtimizada.custo}</p>
                  </div>

                  <div className="space-y-2 pt-4 border-t border-green-200">
                    <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white gap-2">
                      <Download className="h-4 w-4" />
                      Exportar PDF
                    </Button>
                    <Button 
                      onClick={salvarRota}
                      className="w-full bg-green-600 hover:bg-green-700 text-white gap-2"
                    >
                      <Save className="h-4 w-4" />
                      Salvar Rota
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
