import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Play,
  Pause,
  RotateCcw,
  MapPin,
  Clock,
  Gauge,
  AlertTriangle,
  CheckCircle,
  Radio,
  Zap,
  Droplet,
  Smartphone,
  Eye,
  EyeOff,
} from "lucide-react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap, Circle } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

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
  latitude: number;
  longitude: number;
  horario: string;
  colaboradores: number;
}

interface DadosRastreamento {
  timestamp: number;
  latitude: number;
  longitude: number;
  velocidade: number;
  distancia_percorrida: number;
  combustivel_gasto: number;
  temperatura_motor: number;
  rpm: number;
  bateria: number;
  sinal_gps: number;
}

// Componente para centralizar mapa
function MapCenter({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, 13);
  }, [center, map]);
  return null;
}

// Gerar dados de rastreamento simulados
function gerarDadosRastreamento(
  inicio: [number, number],
  fim: [number, number],
  progresso: number
): DadosRastreamento {
  const lat = inicio[0] + (fim[0] - inicio[0]) * (progresso / 100);
  const lon = inicio[1] + (fim[1] - inicio[1]) * (progresso / 100);
  
  return {
    timestamp: Date.now(),
    latitude: lat,
    longitude: lon,
    velocidade: 45 + Math.sin(progresso / 10) * 15,
    distancia_percorrida: progresso * 0.5,
    combustivel_gasto: progresso * 0.04,
    temperatura_motor: 85 + Math.sin(progresso / 20) * 5,
    rpm: 2000 + Math.sin(progresso / 15) * 500,
    bateria: 100 - progresso * 0.3,
    sinal_gps: 85 + Math.random() * 15,
  };
}

export default function AdminRastreamentoRealtime() {
  const [isSimulando, setIsSimulando] = useState(false);
  const [progresso, setProgresso] = useState(0);
  const [velocidadeSimulacao, setVelocidadeSimulacao] = useState(1);
  const [posicaoAtual, setPosicaoAtual] = useState<[number, number]>([-25.4284, -49.2733]);
  const [dadosRastreamento, setDadosRastreamento] = useState<DadosRastreamento | null>(null);
  const [historico, setHistorico] = useState<DadosRastreamento[]>([]);
  const [pontos, setPontos] = useState<Ponto[]>([
    {
      id: "1",
      nome: "CENTRO",
      latitude: -25.4284,
      longitude: -49.2733,
      horario: "06:00",
      colaboradores: 12,
    },
    {
      id: "2",
      nome: "BAIRRO ALTO",
      latitude: -25.4184,
      longitude: -49.2633,
      horario: "06:15",
      colaboradores: 8,
    },
    {
      id: "3",
      nome: "ZONA NORTE",
      latitude: -25.4084,
      longitude: -49.2533,
      horario: "06:30",
      colaboradores: 10,
    },
  ]);
  const [mostrarDetalhes, setMostrarDetalhes] = useState(true);
  const [alertas, setAlertas] = useState<string[]>([]);
  const mapaRef = useRef<any>(null);

  // Simular rastreamento
  useEffect(() => {
    if (!isSimulando) return;

    const intervalo = setInterval(() => {
      setProgresso((prev) => {
        const novoProgresso = prev + 0.5 * velocidadeSimulacao;
        if (novoProgresso >= 100) {
          setIsSimulando(false);
          return 100;
        }

        // Gerar dados de rastreamento
        const inicio: [number, number] = [-25.4284, -49.2733];
        const fim: [number, number] = [-25.4084, -49.2533];
        const dados = gerarDadosRastreamento(inicio, fim, novoProgresso);

        setPosicaoAtual([dados.latitude, dados.longitude]);
        setDadosRastreamento(dados);
        setHistorico((prev) => [...prev, dados]);

        // Verificar alertas
        const novosAlertas: string[] = [];
        if (dados.temperatura_motor > 95) novosAlertas.push("⚠️ Temperatura do motor elevada");
        if (dados.rpm > 3500) novosAlertas.push("⚠️ RPM acima do recomendado");
        if (dados.bateria < 20) novosAlertas.push("🔋 Bateria baixa");
        if (dados.sinal_gps < 50) novosAlertas.push("📡 Sinal GPS fraco");

        setAlertas(novosAlertas);

        return novoProgresso;
      });
    }, 100);

    return () => clearInterval(intervalo);
  }, [isSimulando, velocidadeSimulacao]);

  const reiniciar = () => {
    setProgresso(0);
    setPosicaoAtual([-25.4284, -49.2733]);
    setDadosRastreamento(null);
    setHistorico([]);
    setAlertas([]);
  };

  const exportarDados = () => {
    const csv = [
      ["Timestamp", "Latitude", "Longitude", "Velocidade", "Distância", "Combustível", "Temperatura", "RPM", "Bateria", "Sinal GPS"],
      ...historico.map((d) => [
        new Date(d.timestamp).toLocaleString("pt-BR"),
        d.latitude.toFixed(6),
        d.longitude.toFixed(6),
        d.velocidade.toFixed(1),
        d.distancia_percorrida.toFixed(2),
        d.combustivel_gasto.toFixed(2),
        d.temperatura_motor.toFixed(1),
        d.rpm.toFixed(0),
        d.bateria.toFixed(1),
        d.sinal_gps.toFixed(1),
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `rastreamento-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">📍 Rastreamento em Tempo Real</h1>
          <p className="text-slate-600">Simulação completa com dados de telemetria e alertas</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Mapa */}
          <div className="lg:col-span-2">
            <Card className="h-[500px]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-orange-500" />
                  Mapa de Rastreamento
                </CardTitle>
              </CardHeader>
              <CardContent className="h-[calc(100%-80px)]">
                <MapContainer center={posicaoAtual} zoom={13} style={{ height: "100%", borderRadius: "8px" }}>
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; OpenStreetMap contributors'
                  />
                  <MapCenter center={posicaoAtual} />

                  {/* Pontos de parada */}
                  {pontos.map((ponto) => (
                    <Marker key={ponto.id} position={[ponto.latitude, ponto.longitude]}>
                      <Popup>
                        <div className="text-sm">
                          <p className="font-bold">{ponto.nome}</p>
                          <p>Horário: {ponto.horario}</p>
                          <p>Colaboradores: {ponto.colaboradores}</p>
                        </div>
                      </Popup>
                    </Marker>
                  ))}

                  {/* Posição atual do veículo */}
                  {historico.length > 0 && (
                    <>
                      <Polyline
                        positions={historico.map((d) => [d.latitude, d.longitude])}
                        color="orange"
                        weight={2}
                        opacity={0.7}
                      />
                      <Circle
                        center={posicaoAtual}
                        radius={100}
                        color="orange"
                        fillColor="orange"
                        fillOpacity={0.2}
                      />
                    </>
                  )}

                  <Marker position={posicaoAtual}>
                    <Popup>
                      <div className="text-sm">
                        <p className="font-bold">Veículo em movimento</p>
                        <p>Velocidade: {dadosRastreamento?.velocidade.toFixed(1)} km/h</p>
                      </div>
                    </Popup>
                  </Marker>
                </MapContainer>
              </CardContent>
            </Card>
          </div>

          {/* Controles */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Controles</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex gap-2">
                  <Button
                    onClick={() => setIsSimulando(!isSimulando)}
                    className={isSimulando ? "bg-red-500 hover:bg-red-600 flex-1" : "bg-green-500 hover:bg-green-600 flex-1"}
                  >
                    {isSimulando ? (
                      <>
                        <Pause className="h-4 w-4 mr-2" />
                        Pausar
                      </>
                    ) : (
                      <>
                        <Play className="h-4 w-4 mr-2" />
                        Iniciar
                      </>
                    )}
                  </Button>
                  <Button onClick={reiniciar} variant="outline">
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Velocidade</label>
                  <input
                    type="range"
                    min="0.5"
                    max="3"
                    step="0.5"
                    value={velocidadeSimulacao}
                    onChange={(e) => setVelocidadeSimulacao(Number(e.target.value))}
                    className="w-full"
                  />
                  <p className="text-xs text-slate-500 mt-1">{velocidadeSimulacao}x</p>
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">Progresso</span>
                    <span className="text-sm text-slate-600">{Math.round(progresso)}%</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div
                      className="bg-orange-500 h-2 rounded-full transition-all"
                      style={{ width: `${progresso}%` }}
                    ></div>
                  </div>
                </div>

                <Button onClick={exportarDados} variant="outline" className="w-full">
                  📥 Exportar CSV
                </Button>

                <Button
                  onClick={() => setMostrarDetalhes(!mostrarDetalhes)}
                  variant="outline"
                  className="w-full"
                >
                  {mostrarDetalhes ? (
                    <>
                      <EyeOff className="h-4 w-4 mr-2" />
                      Ocultar
                    </>
                  ) : (
                    <>
                      <Eye className="h-4 w-4 mr-2" />
                      Mostrar
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Alertas */}
            {alertas.length > 0 && (
              <Card className="border-red-200 bg-red-50">
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2 text-red-700">
                    <AlertTriangle className="h-4 w-4" />
                    Alertas
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {alertas.map((alerta, idx) => (
                    <div key={idx} className="text-xs text-red-700">
                      {alerta}
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Telemetria */}
        {mostrarDetalhes && dadosRastreamento && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <Gauge className="h-6 w-6 text-blue-500 mx-auto mb-2" />
                  <p className="text-xs text-slate-600">Velocidade</p>
                  <p className="text-xl font-bold">{dadosRastreamento.velocidade.toFixed(1)} km/h</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <MapPin className="h-6 w-6 text-green-500 mx-auto mb-2" />
                  <p className="text-xs text-slate-600">Distância</p>
                  <p className="text-xl font-bold">{dadosRastreamento.distancia_percorrida.toFixed(1)} km</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <Droplet className="h-6 w-6 text-yellow-500 mx-auto mb-2" />
                  <p className="text-xs text-slate-600">Combustível</p>
                  <p className="text-xl font-bold">{dadosRastreamento.combustivel_gasto.toFixed(2)} L</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <Zap className="h-6 w-6 text-red-500 mx-auto mb-2" />
                  <p className="text-xs text-slate-600">Temperatura</p>
                  <p className="text-xl font-bold">{dadosRastreamento.temperatura_motor.toFixed(0)}°C</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <Radio className="h-6 w-6 text-purple-500 mx-auto mb-2" />
                  <p className="text-xs text-slate-600">RPM</p>
                  <p className="text-xl font-bold">{(dadosRastreamento.rpm / 1000).toFixed(1)}k</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <Smartphone className="h-6 w-6 text-cyan-500 mx-auto mb-2" />
                  <p className="text-xs text-slate-600">Bateria/GPS</p>
                  <p className="text-xl font-bold">{dadosRastreamento.bateria.toFixed(0)}% / {dadosRastreamento.sinal_gps.toFixed(0)}%</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Histórico */}
        {mostrarDetalhes && historico.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-orange-500" />
                Histórico de Rastreamento ({historico.length} registros)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left py-2 px-3 font-semibold">Hora</th>
                      <th className="text-left py-2 px-3 font-semibold">Velocidade</th>
                      <th className="text-left py-2 px-3 font-semibold">Distância</th>
                      <th className="text-left py-2 px-3 font-semibold">Combustível</th>
                      <th className="text-left py-2 px-3 font-semibold">Temp.</th>
                      <th className="text-left py-2 px-3 font-semibold">RPM</th>
                      <th className="text-left py-2 px-3 font-semibold">Bateria</th>
                    </tr>
                  </thead>
                  <tbody>
                    {historico.slice(-20).map((item, idx) => (
                      <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="py-2 px-3">{new Date(item.timestamp).toLocaleTimeString("pt-BR")}</td>
                        <td className="py-2 px-3">{item.velocidade.toFixed(1)} km/h</td>
                        <td className="py-2 px-3">{item.distancia_percorrida.toFixed(1)} km</td>
                        <td className="py-2 px-3">{item.combustivel_gasto.toFixed(2)} L</td>
                        <td className="py-2 px-3">{item.temperatura_motor.toFixed(0)}°C</td>
                        <td className="py-2 px-3">{(item.rpm / 1000).toFixed(1)}k</td>
                        <td className="py-2 px-3">
                          <span className={item.bateria > 50 ? "text-green-600" : item.bateria > 20 ? "text-yellow-600" : "text-red-600"}>
                            {item.bateria.toFixed(0)}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
