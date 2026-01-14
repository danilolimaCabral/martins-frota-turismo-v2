import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MapView } from "@/components/Map";
import {
  TrendingDown,
  Zap,
  MapPin,
  Fuel,
  DollarSign,
  AlertCircle,
  CheckCircle,
  ArrowRight,
  BarChart3,
  Lightbulb,
  Navigation,
  ArrowLeft,
} from "lucide-react";
import { toast } from "sonner";

interface Ponto {
  id: number;
  nome: string;
  latitude: number;
  longitude: number;
  passageiros: number;
}

interface Rota {
  pontos: Ponto[];
  distancia: number;
  tempo: number;
  combustivel: number;
  custo: number;
}

interface Economia {
  distancia: number;
  combustivel: number;
  custo: number;
  percentual: number;
}

interface Dica {
  id: number;
  titulo: string;
  descricao: string;
  economia: number;
  impacto: "alto" | "medio" | "baixo";
  acao: string;
}

const PONTOS_EXEMPLO: Ponto[] = [
  { id: 1, nome: "Saída - Garagem", latitude: -23.5505, longitude: -46.6333, passageiros: 0 },
  { id: 2, nome: "Av. Paulista, 1000", latitude: -23.5614, longitude: -46.6560, passageiros: 5 },
  { id: 3, nome: "Rua Augusta, 2000", latitude: -23.5505, longitude: -46.6560, passageiros: 3 },
  { id: 4, nome: "Av. Brasil, 3000", latitude: -23.5405, longitude: -46.6200, passageiros: 4 },
  { id: 5, nome: "Rua Consolação, 1500", latitude: -23.5505, longitude: -46.6400, passageiros: 2 },
  { id: 6, nome: "Destino Final", latitude: -23.5505, longitude: -46.6333, passageiros: 0 },
];

const DICAS_ECONOMIA: Dica[] = [
  {
    id: 1,
    titulo: "Consolidar Pontos Próximos",
    descricao: "Agrupar embarques em um raio de 500m economiza até 2km por rota",
    economia: 45.50,
    impacto: "alto",
    acao: "Combinar pontos 2 e 3 em um único ponto de parada",
  },
  {
    id: 2,
    titulo: "Evitar Horários de Pico",
    descricao: "Sair 15 minutos mais cedo reduz tempo em 20% e combustível em 15%",
    economia: 32.80,
    impacto: "alto",
    acao: "Ajustar horário de saída para 07:45 em vez de 08:00",
  },
  {
    id: 3,
    titulo: "Manutenção Preventiva",
    descricao: "Calibragem de pneus economiza 3% de combustível",
    economia: 18.90,
    impacto: "medio",
    acao: "Agendar revisão de pneus para próxima semana",
  },
  {
    id: 4,
    titulo: "Velocidade Constante",
    descricao: "Manter 60km/h economiza mais que variar entre 40 e 80km/h",
    economia: 25.30,
    impacto: "medio",
    acao: "Treinar motorista para dirigir com velocidade constante",
  },
  {
    id: 5,
    titulo: "Reduzir Peso",
    descricao: "Remover 100kg economiza 2% de combustível",
    economia: 12.60,
    impacto: "baixo",
    acao: "Revisar carga desnecessária no veículo",
  },
];

// Função para calcular distância entre dois pontos (Haversine)
const calcularDistancia = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
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

// Calcular rota original (ordem dos pontos)
const calcularRotaOriginal = (pontos: Ponto[]): Rota => {
  let distancia = 0;
  for (let i = 0; i < pontos.length - 1; i++) {
    distancia += calcularDistancia(
      pontos[i].latitude,
      pontos[i].longitude,
      pontos[i + 1].latitude,
      pontos[i + 1].longitude
    );
  }

  const tempo = Math.ceil(distancia / 40 + pontos.length * 3); // 40km/h média + 3 min por parada
  const combustivel = distancia / 6; // Consumo médio 6km/l
  const custo = combustivel * 6.5; // R$ 6,50 por litro

  return { pontos, distancia, tempo, combustivel, custo };
};

// Otimizar rota usando algoritmo simples (nearest neighbor)
const otimizarRota = (pontos: Ponto[]): Rota => {
  const [inicio, ...resto] = pontos;
  const otimizada = [inicio];
  let atual = inicio;

  const naoVisitados = [...resto];
  while (naoVisitados.length > 0) {
    let proximoIdx = 0;
    let menorDistancia = Infinity;

    naoVisitados.forEach((ponto, idx) => {
      const dist = calcularDistancia(
        atual.latitude,
        atual.longitude,
        ponto.latitude,
        ponto.longitude
      );
      if (dist < menorDistancia) {
        menorDistancia = dist;
        proximoIdx = idx;
      }
    });

    const proximo = naoVisitados[proximoIdx];
    otimizada.push(proximo);
    atual = proximo;
    naoVisitados.splice(proximoIdx, 1);
  }

  let distancia = 0;
  for (let i = 0; i < otimizada.length - 1; i++) {
    distancia += calcularDistancia(
      otimizada[i].latitude,
      otimizada[i].longitude,
      otimizada[i + 1].latitude,
      otimizada[i + 1].longitude
    );
  }

  const tempo = Math.ceil(distancia / 40 + otimizada.length * 3);
  const combustivel = distancia / 6;
  const custo = combustivel * 6.5;

  return { pontos: otimizada, distancia, tempo, combustivel, custo };
};

export default function AdminRoteirizacaoTOP() {
  const [, setLocation] = useLocation();
  const [rotaOriginal, setRotaOriginal] = useState<Rota | null>(null);
  const [rotaOtimizada, setRotaOtimizada] = useState<Rota | null>(null);
  const [economia, setEconomia] = useState<Economia | null>(null);
  const [mapInstance, setMapInstance] = useState<google.maps.Map | null>(null);
  const [mostrarOtimizada, setMostrarOtimizada] = useState(false);

  useEffect(() => {
    const original = calcularRotaOriginal(PONTOS_EXEMPLO);
    const otimizada = otimizarRota(PONTOS_EXEMPLO);

    setRotaOriginal(original);
    setRotaOtimizada(otimizada);

    const econ: Economia = {
      distancia: original.distancia - otimizada.distancia,
      combustivel: original.combustivel - otimizada.combustivel,
      custo: original.custo - otimizada.custo,
      percentual: ((original.distancia - otimizada.distancia) / original.distancia) * 100,
    };

    setEconomia(econ);
  }, []);

  useEffect(() => {
    if (!mapInstance) return;

    const rota = mostrarOtimizada ? rotaOtimizada : rotaOriginal;
    if (!rota) return;

    // Limpar mapa
    const markers = (window as any).rotaMarkers || [];
    markers.forEach((m: any) => m.setMap(null));

    // Desenhar pontos
    const novoMarkers: any[] = [];
    rota.pontos.forEach((ponto, idx) => {
      const marker = new google.maps.Marker({
        position: { lat: ponto.latitude, lng: ponto.longitude },
        map: mapInstance,
        title: ponto.nome,
        label: String(idx + 1),
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: idx === 0 ? "#22c55e" : idx === rota.pontos.length - 1 ? "#ef4444" : "#4f46e5",
          fillOpacity: 1,
          strokeColor: "#fff",
          strokeWeight: 2,
        },
      });
      novoMarkers.push(marker);
    });

    // Desenhar polyline
    const coordenadas = rota.pontos.map((p) => ({
      lat: p.latitude,
      lng: p.longitude,
    }));

    const polyline = new google.maps.Polyline({
      path: coordenadas,
      geodesic: true,
      strokeColor: mostrarOtimizada ? "#10b981" : "#4f46e5",
      strokeOpacity: 0.7,
      strokeWeight: 3,
      map: mapInstance,
    });

    // Centralizar mapa
    const bounds = new google.maps.LatLngBounds();
    coordenadas.forEach((coord) => bounds.extend(coord));
    mapInstance.fitBounds(bounds);

    (window as any).rotaMarkers = novoMarkers;
  }, [mapInstance, mostrarOtimizada, rotaOriginal, rotaOtimizada]);

  const handleOtimizar = () => {
    if (rotaOtimizada && economia) {
      setMostrarOtimizada(true);
      toast.success(
        `Rota otimizada! Economize ${economia.distancia.toFixed(2)}km e R$ ${economia.custo.toFixed(2)}`
      );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-8">
      {/* Botão Voltar */}
      <div className="mb-6 flex items-center gap-2">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-orange-600 hover:bg-orange-700 text-white transition-colors font-medium"
        >
          <ArrowLeft size={20} />
          <span>Voltar</span>
        </button>
      </div>

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-gradient-to-br from-green-500 to-green-600 rounded-lg">
            <Zap className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900">Roteirização TOP</h1>
        </div>
        <p className="text-slate-600">Otimização inteligente com dicas de economia</p>
      </div>

      {/* KPIs de Economia */}
      {economia && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-green-900">Economia de Distância</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-700">{economia.distancia.toFixed(2)} km</div>
              <p className="text-xs text-green-600 mt-1">{economia.percentual.toFixed(1)}% de redução</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-blue-900">Economia de Combustível</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-700">{economia.combustivel.toFixed(2)} L</div>
              <p className="text-xs text-blue-600 mt-1">Litros economizados</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-emerald-900">Economia Financeira</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-700">R$ {economia.custo.toFixed(2)}</div>
              <p className="text-xs text-emerald-600 mt-1">Por rota</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-purple-900">Economia Anual</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-700">
                R$ {(economia.custo * 250).toFixed(0)}
              </div>
              <p className="text-xs text-purple-600 mt-1">250 rotas/ano</p>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="mapa" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="mapa">Mapa</TabsTrigger>
          <TabsTrigger value="comparacao">Comparação</TabsTrigger>
          <TabsTrigger value="dicas">Dicas de Economia</TabsTrigger>
        </TabsList>

        {/* Mapa */}
        <TabsContent value="mapa">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>
                {mostrarOtimizada ? "Rota Otimizada" : "Rota Original"}
              </CardTitle>
              <div className="flex gap-2">
                <Button
                  variant={!mostrarOtimizada ? "default" : "outline"}
                  onClick={() => setMostrarOtimizada(false)}
                  size="sm"
                >
                  Original
                </Button>
                <Button
                  variant={mostrarOtimizada ? "default" : "outline"}
                  onClick={() => setMostrarOtimizada(true)}
                  size="sm"
                >
                  Otimizada
                </Button>
                <Button onClick={handleOtimizar} size="sm" className="gap-2 bg-green-600 hover:bg-green-700">
                  <Zap className="h-4 w-4" />
                  Otimizar
                </Button>
              </div>
            </CardHeader>
            <CardContent className="h-96">
              <MapView onMapReady={setMapInstance} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Comparação */}
        <TabsContent value="comparacao">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Rota Original */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-red-500" />
                  Rota Original
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {rotaOriginal && (
                  <>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-600">Distância Total</span>
                        <span className="font-semibold text-slate-900">
                          {rotaOriginal.distancia.toFixed(2)} km
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-600">Tempo Estimado</span>
                        <span className="font-semibold text-slate-900">
                          {rotaOriginal.tempo} min
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-600">Combustível</span>
                        <span className="font-semibold text-slate-900">
                          {rotaOriginal.combustivel.toFixed(2)} L
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-600">Custo</span>
                        <span className="font-semibold text-slate-900">
                          R$ {rotaOriginal.custo.toFixed(2)}
                        </span>
                      </div>
                    </div>

                    <div className="pt-4 border-t">
                      <h4 className="font-semibold text-slate-900 mb-2">Sequência de Pontos</h4>
                      <div className="space-y-1">
                        {rotaOriginal.pontos.map((ponto, idx) => (
                          <div key={ponto.id} className="flex items-center gap-2 text-sm">
                            <span className="font-semibold text-slate-600">{idx + 1}.</span>
                            <span className="text-slate-700">{ponto.nome}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Rota Otimizada */}
            <Card className="border-green-200 bg-green-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-900">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  Rota Otimizada
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {rotaOtimizada && economia && (
                  <>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-600">Distância Total</span>
                        <div className="text-right">
                          <span className="font-semibold text-green-700">
                            {rotaOtimizada.distancia.toFixed(2)} km
                          </span>
                          <span className="text-xs text-green-600 ml-2">
                            -{economia.distancia.toFixed(2)} km
                          </span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-600">Tempo Estimado</span>
                        <div className="text-right">
                          <span className="font-semibold text-green-700">
                            {rotaOtimizada.tempo} min
                          </span>
                          <span className="text-xs text-green-600 ml-2">
                            -{rotaOriginal!.tempo - rotaOtimizada.tempo} min
                          </span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-600">Combustível</span>
                        <div className="text-right">
                          <span className="font-semibold text-green-700">
                            {rotaOtimizada.combustivel.toFixed(2)} L
                          </span>
                          <span className="text-xs text-green-600 ml-2">
                            -{economia.combustivel.toFixed(2)} L
                          </span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-600">Custo</span>
                        <div className="text-right">
                          <span className="font-semibold text-green-700">
                            R$ {rotaOtimizada.custo.toFixed(2)}
                          </span>
                          <span className="text-xs text-green-600 ml-2">
                            -R$ {economia.custo.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 border-t">
                      <h4 className="font-semibold text-slate-900 mb-2">Sequência de Pontos</h4>
                      <div className="space-y-1">
                        {rotaOtimizada.pontos.map((ponto, idx) => (
                          <div key={ponto.id} className="flex items-center gap-2 text-sm">
                            <span className="font-semibold text-green-600">{idx + 1}.</span>
                            <span className="text-slate-700">{ponto.nome}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Dicas de Economia */}
        <TabsContent value="dicas">
          <div className="space-y-4">
            {DICAS_ECONOMIA.map((dica) => (
              <Card key={dica.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Lightbulb className="h-5 w-5 text-yellow-500" />
                        <h3 className="font-semibold text-slate-900">{dica.titulo}</h3>
                        <Badge
                          variant="outline"
                          className={
                            dica.impacto === "alto"
                              ? "bg-red-100 text-red-800"
                              : dica.impacto === "medio"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-blue-100 text-blue-800"
                          }
                        >
                          Impacto {dica.impacto}
                        </Badge>
                      </div>
                      <p className="text-slate-600 text-sm mb-3">{dica.descricao}</p>
                      <p className="text-xs text-slate-500 mb-3">
                        <strong>Ação:</strong> {dica.acao}
                      </p>
                      <div className="flex items-center gap-2 text-sm font-semibold text-green-700">
                        <TrendingDown className="h-4 w-4" />
                        Economia: R$ {dica.economia.toFixed(2)} por rota
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      Aplicar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
