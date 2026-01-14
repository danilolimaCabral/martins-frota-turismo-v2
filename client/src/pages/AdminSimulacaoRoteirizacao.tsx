import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { MapView } from "@/components/Map";
import {
  Play,
  Pause,
  RotateCcw,
  MapPin,
  Clock,
  Navigation,
  Users,
  CheckCircle,
  AlertCircle,
  Zap,
  ArrowLeft,
} from "lucide-react";
import { toast } from "sonner";

interface Ponto {
  id: number;
  nome: string;
  latitude: number;
  longitude: number;
  passageiros: number;
  status: "pendente" | "visitado" | "atual";
  horario_esperado: string;
  horario_real?: string;
}

interface SimulacaoState {
  isPlaying: boolean;
  progresso: number;
  pontoAtual: number;
  velocidade: number;
  distanciaPercorrida: number;
  tempoDecorrido: number;
  passageirosAbordo: number;
}

const PONTOS_ROTA: Ponto[] = [
  {
    id: 1,
    nome: "Ponto de Saída",
    latitude: -23.5505,
    longitude: -46.6333,
    passageiros: 0,
    status: "atual",
    horario_esperado: "08:00",
  },
  {
    id: 2,
    nome: "Av. Paulista, 1000",
    latitude: -23.5614,
    longitude: -46.6560,
    passageiros: 5,
    status: "pendente",
    horario_esperado: "08:15",
  },
  {
    id: 3,
    nome: "Rua Augusta, 2000",
    latitude: -23.5505,
    longitude: -46.6560,
    passageiros: 3,
    status: "pendente",
    horario_esperado: "08:30",
  },
  {
    id: 4,
    nome: "Av. Brasil, 3000",
    latitude: -23.5405,
    longitude: -46.6200,
    passageiros: 4,
    status: "pendente",
    horario_esperado: "08:50",
  },
  {
    id: 5,
    nome: "Destino Final",
    latitude: -23.5505,
    longitude: -46.6333,
    passageiros: 0,
    status: "pendente",
    horario_esperado: "09:30",
  },
];

export default function AdminSimulacaoRoteirizacao() {
  const [, setLocation] = useLocation();
  const [pontos, setPontos] = useState<Ponto[]>(PONTOS_ROTA);
  const [simulacao, setSimulacao] = useState<SimulacaoState>({
    isPlaying: false,
    progresso: 0,
    pontoAtual: 0,
    velocidade: 1,
    distanciaPercorrida: 0,
    tempoDecorrido: 0,
    passageirosAbordo: 0,
  });
  const [mapInstance, setMapInstance] = useState<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const polylineRef = useRef<google.maps.Polyline | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Simular movimento do veículo
  useEffect(() => {
    if (!simulacao.isPlaying) return;

    const interval = setInterval(() => {
      setSimulacao((prev) => {
        let novoProgresso = prev.progresso + 0.5 * prev.velocidade;
        let novoPontoAtual = prev.pontoAtual;
        let novoPassageiros = prev.passageirosAbordo;

        // Verificar se chegou em um ponto
        if (novoProgresso >= (novoPontoAtual + 1) * 20) {
          novoPontoAtual = Math.min(novoPontoAtual + 1, pontos.length - 1);
          
          // Atualizar status do ponto
          setPontos((prevPontos) =>
            prevPontos.map((p, idx) => {
              if (idx === novoPontoAtual) {
                return {
                  ...p,
                  status: "atual" as const,
                  horario_real: new Date().toLocaleTimeString("pt-BR", {
                    hour: "2-digit",
                    minute: "2-digit",
                  }),
                };
              } else if (idx < novoPontoAtual) {
                return { ...p, status: "visitado" as const };
              }
              return p;
            })
          );

          // Atualizar passageiros
          novoPassageiros += pontos[novoPontoAtual].passageiros;
          toast.success(`Chegou em ${pontos[novoPontoAtual].nome}! ${pontos[novoPontoAtual].passageiros} passageiros embarcados.`);
        }

        // Parar quando chegar no final
        if (novoProgresso >= 100) {
          novoProgresso = 100;
          return {
            ...prev,
            progresso: novoProgresso,
            isPlaying: false,
            tempoDecorrido: prev.tempoDecorrido + 1,
          };
        }

        return {
          ...prev,
          progresso: novoProgresso,
          pontoAtual: novoPontoAtual,
          passageirosAbordo: novoPassageiros,
          distanciaPercorrida: (novoProgresso / 100) * 15.5,
          tempoDecorrido: prev.tempoDecorrido + 1,
        };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [simulacao.isPlaying, simulacao.velocidade, pontos]);

  // Atualizar mapa
  useEffect(() => {
    if (!mapInstance) return;

    // Limpar marcadores antigos
    markersRef.current.forEach((marker) => marker.setMap(null));
    markersRef.current = [];

    // Desenhar pontos
    pontos.forEach((ponto, idx) => {
      const iconColor =
        ponto.status === "atual"
          ? "#ef4444"
          : ponto.status === "visitado"
          ? "#22c55e"
          : "#94a3b8";

      const marker = new google.maps.Marker({
        position: { lat: ponto.latitude, lng: ponto.longitude },
        map: mapInstance,
        title: ponto.nome,
        label: String(idx + 1),
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: iconColor,
          fillOpacity: 1,
          strokeColor: "#fff",
          strokeWeight: 2,
        },
      });

      markersRef.current.push(marker);
    });

    // Desenhar polyline da rota
    const coordenadas = pontos.map((p) => ({
      lat: p.latitude,
      lng: p.longitude,
    }));

    if (polylineRef.current) {
      polylineRef.current.setMap(null);
    }

    polylineRef.current = new google.maps.Polyline({
      path: coordenadas,
      geodesic: true,
      strokeColor: "#4f46e5",
      strokeOpacity: 0.7,
      strokeWeight: 3,
      map: mapInstance,
    });

    // Centralizar mapa
    const bounds = new google.maps.LatLngBounds();
    coordenadas.forEach((coord) => bounds.extend(coord));
    mapInstance.fitBounds(bounds);
  }, [mapInstance, pontos]);

  const handlePlay = () => {
    setSimulacao((prev) => ({ ...prev, isPlaying: !prev.isPlaying }));
  };

  const handleReset = () => {
    setSimulacao({
      isPlaying: false,
      progresso: 0,
      pontoAtual: 0,
      velocidade: 1,
      distanciaPercorrida: 0,
      tempoDecorrido: 0,
      passageirosAbordo: 0,
    });
    setPontos(PONTOS_ROTA);
  };

  const tempoFormatado = `${Math.floor(simulacao.tempoDecorrido / 60)
    .toString()
    .padStart(2, "0")}:${(simulacao.tempoDecorrido % 60).toString().padStart(2, "0")}`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-8">
      {/* Botão Voltar */}
      <div className="mb-6 flex items-center gap-2">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
        >
          <ArrowLeft size={20} />
          <span>Voltar</span>
        </button>
      </div>

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-gradient-to-br from-red-500 to-red-600 rounded-lg">
            <Navigation className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900">Simulação de Roteirização</h1>
        </div>
        <p className="text-slate-600">Acompanhe em tempo real o movimento do veículo pela rota</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Mapa */}
        <Card className="lg:col-span-2 h-96 md:h-full">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Mapa da Rota</CardTitle>
          </CardHeader>
          <CardContent className="h-96">
            <MapView onMapReady={setMapInstance} />
          </CardContent>
        </Card>

        {/* Controles e Info */}
        <div className="space-y-4">
          {/* Controles */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Controles</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Button
                  onClick={handlePlay}
                  className="flex-1 gap-2"
                  variant={simulacao.isPlaying ? "destructive" : "default"}
                >
                  {simulacao.isPlaying ? (
                    <>
                      <Pause className="h-4 w-4" />
                      Pausar
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4" />
                      Iniciar
                    </>
                  )}
                </Button>
                <Button onClick={handleReset} variant="outline" className="gap-2">
                  <RotateCcw className="h-4 w-4" />
                  Reset
                </Button>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700">
                  Velocidade: {simulacao.velocidade}x
                </label>
                <Slider
                  value={[simulacao.velocidade]}
                  onValueChange={(value) =>
                    setSimulacao((prev) => ({ ...prev, velocidade: value[0] }))
                  }
                  min={0.5}
                  max={3}
                  step={0.5}
                  className="mt-2"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-slate-700">Progresso</span>
                  <span className="text-sm font-semibold text-slate-900">
                    {Math.round(simulacao.progresso)}%
                  </span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-red-500 to-orange-500 h-2 rounded-full transition-all"
                    style={{ width: `${simulacao.progresso}%` }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Informações */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Informações</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-slate-600" />
                  <span className="text-sm text-slate-600">Tempo Decorrido</span>
                </div>
                <span className="font-semibold text-slate-900">{tempoFormatado}</span>
              </div>

              <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Navigation className="h-4 w-4 text-slate-600" />
                  <span className="text-sm text-slate-600">Distância</span>
                </div>
                <span className="font-semibold text-slate-900">
                  {simulacao.distanciaPercorrida.toFixed(2)} km
                </span>
              </div>

              <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-slate-600" />
                  <span className="text-sm text-slate-600">Passageiros</span>
                </div>
                <span className="font-semibold text-slate-900">
                  {simulacao.passageirosAbordo}
                </span>
              </div>

              <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-slate-600" />
                  <span className="text-sm text-slate-600">Velocidade Média</span>
                </div>
                <span className="font-semibold text-slate-900">
                  {simulacao.tempoDecorrido > 0
                    ? ((simulacao.distanciaPercorrida / simulacao.tempoDecorrido) * 3600).toFixed(1)
                    : "0"}
                  km/h
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Ponto Atual */}
          {pontos[simulacao.pontoAtual] && (
            <Card className="bg-blue-50 border-blue-200">
              <CardHeader>
                <CardTitle className="text-lg text-blue-900">Ponto Atual</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-blue-900">
                <p className="font-semibold text-lg">
                  {pontos[simulacao.pontoAtual].nome}
                </p>
                <p className="text-sm">
                  Passageiros: {pontos[simulacao.pontoAtual].passageiros}
                </p>
                <p className="text-sm">
                  Horário esperado: {pontos[simulacao.pontoAtual].horario_esperado}
                </p>
                {pontos[simulacao.pontoAtual].horario_real && (
                  <p className="text-sm">
                    Horário real: {pontos[simulacao.pontoAtual].horario_real}
                  </p>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Tabela de Pontos */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Pontos de Parada</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {pontos.map((ponto, idx) => (
              <div
                key={ponto.id}
                className={`flex items-center justify-between p-3 rounded-lg border transition-all ${
                  ponto.status === "atual"
                    ? "bg-red-50 border-red-200"
                    : ponto.status === "visitado"
                    ? "bg-green-50 border-green-200"
                    : "bg-slate-50 border-slate-200"
                }`}
              >
                <div className="flex items-center gap-3 flex-1">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full font-semibold text-white bg-slate-600">
                    {idx + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-slate-900">{ponto.nome}</p>
                    <p className="text-xs text-slate-600">
                      {ponto.passageiros} passageiros
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-xs text-slate-600">Esperado</p>
                    <p className="font-semibold text-slate-900">
                      {ponto.horario_esperado}
                    </p>
                  </div>

                  {ponto.horario_real && (
                    <div className="text-right">
                      <p className="text-xs text-slate-600">Real</p>
                      <p className="font-semibold text-slate-900">
                        {ponto.horario_real}
                      </p>
                    </div>
                  )}

                  <Badge
                    className={
                      ponto.status === "atual"
                        ? "bg-red-500"
                        : ponto.status === "visitado"
                        ? "bg-green-500"
                        : "bg-slate-400"
                    }
                  >
                    {ponto.status === "atual"
                      ? "Atual"
                      : ponto.status === "visitado"
                      ? "Visitado"
                      : "Pendente"}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
