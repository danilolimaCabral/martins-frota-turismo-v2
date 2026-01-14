import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  Play,
  Pause,
  RotateCcw,
  TrendingDown,
  Fuel,
  DollarSign,
} from "lucide-react";
import * as XLSX from "xlsx";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// Corrigir ícones do Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

interface Colaborador {
  id: number;
  nome: string;
  rua: string;
  numero: number;
  complemento?: string;
  cep: string;
  bairro: string;
  cidade: string;
  turno: number;
  horario: string;
  endereco_completo?: string;
  latitude?: number;
  longitude?: number;
}

interface PontoEmbarque {
  id: string;
  nome: string;
  latitude: number;
  longitude: number;
  colaboradores: Colaborador[];
  horario_embarque: string;
  distancia_media: number;
}

interface Escala {
  ponto_id: string;
  ponto_nome: string;
  horario: string;
  colaboradores: string[];
  quantidade: number;
  latitude: number;
  longitude: number;
}

interface RelatorioRota {
  distancia_total: number;
  tempo_estimado: number;
  combustivel_estimado: number;
  custo_combustivel: number;
  velocidade_media: number;
  pontos_parada: number;
  colaboradores_total: number;
}

// Componente para centralizar mapa
function MapCenter({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, 12);
  }, [center, map]);
  return null;
}

// Calcular distância usando Haversine
function calcularDistancia(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
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
}

// Geocodificar endereço
async function geocodificarEndereco(endereco: string): Promise<{ lat: number; lon: number } | null> {
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
}

export default function AdminRoteirizacaoProfissional() {
  const [colaboradores, setColaboradores] = useState<Colaborador[]>([]);
  const [pontos, setPontos] = useState<Escala[]>([]);
  const [rota, setRota] = useState<[number, number][]>([]);
  const [relatorio, setRelatorio] = useState<RelatorioRota | null>(null);
  const [distanciaMaxima, setDistanciaMaxima] = useState<number>(700);
  const [turnoSelecionado, setTurnoSelecionado] = useState<string>("1");
  const [isLoading, setIsLoading] = useState(false);
  const [etapa, setEtapa] = useState<"upload" | "parametros" | "resultado" | "rastreamento">("upload");
  const [mapCenter, setMapCenter] = useState<[number, number]>([-25.4284, -49.2733]);
  const [isSimulando, setIsSimulando] = useState(false);
  const [progresso, setProgresso] = useState(0);
  const [velocidadeSimulacao, setVelocidadeSimulacao] = useState(1);
  const [posicaoAtual, setPosicaoAtual] = useState<[number, number] | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Simular rastreamento
  useEffect(() => {
    if (!isSimulando || rota.length === 0) return;

    const intervalo = setInterval(() => {
      setProgresso((prev) => {
        const novoProgresso = prev + 1 * velocidadeSimulacao;
        if (novoProgresso >= 100) {
          setIsSimulando(false);
          return 100;
        }
        const indice = Math.floor((novoProgresso / 100) * (rota.length - 1));
        setPosicaoAtual(rota[indice]);
        return novoProgresso;
      });
    }, 100);

    return () => clearInterval(intervalo);
  }, [isSimulando, rota, velocidadeSimulacao]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = `${turnoSelecionado} Turno`;
        const worksheet = workbook.Sheets[sheetName];

        if (!worksheet) {
          alert(`Aba "${sheetName}" não encontrada`);
          setIsLoading(false);
          return;
        }

        const rows = XLSX.utils.sheet_to_json(worksheet) as any[];
        const colaboradoresProcessados: Colaborador[] = rows
          .map((row, idx) => ({
            id: row["__EMPTY"] || idx,
            nome: row["__EMPTY_1"] || "",
            rua: row["__EMPTY_2"] || "",
            numero: row["__EMPTY_3"] || 0,
            complemento: row["__EMPTY_4"] || "",
            cep: row["__EMPTY_5"] || "",
            bairro: row["__EMPTY_6"] || "",
            cidade: row["__EMPTY_7"] || "",
            turno: row["__EMPTY_8"] || 1,
            horario: row["__EMPTY_9"] || "",
            endereco_completo: `${row["__EMPTY_2"] || ""}, ${row["__EMPTY_3"] || ""} - ${row["__EMPTY_7"] || ""}, ${row["__EMPTY_5"] || ""}`,
          }))
          .filter((c) => c.nome && c.nome.trim() !== "");

        setColaboradores(colaboradoresProcessados);
        setEtapa("parametros");
        setIsLoading(false);
      } catch (error) {
        console.error("Erro:", error);
        alert("Erro ao processar arquivo");
        setIsLoading(false);
      }
    };

    reader.readAsArrayBuffer(file);
  };

  const calcularRoteirizacao = async () => {
    if (colaboradores.length === 0) {
      alert("Nenhum colaborador carregado");
      return;
    }

    setIsLoading(true);

    // Geocodificar
    const colaboradoresComCoordenadas = await Promise.all(
      colaboradores.map(async (colab) => {
        const coords = await geocodificarEndereco(colab.endereco_completo || "");
        return {
          ...colab,
          latitude: coords?.lat || -25.4284 + Math.random() * 0.1,
          longitude: coords?.lon || -49.2733 + Math.random() * 0.1,
        };
      })
    );

    // Agrupar por bairro
    const colaboradoresAgrupados = new Map<string, Colaborador[]>();
    colaboradoresComCoordenadas.forEach((colab) => {
      const chave = colab.bairro || colab.cidade;
      if (!colaboradoresAgrupados.has(chave)) {
        colaboradoresAgrupados.set(chave, []);
      }
      colaboradoresAgrupados.get(chave)!.push(colab);
    });

    // Criar pontos
    const horariosBase = [
      { turno: 1, inicio: "06:00", intervalo: 15 },
      { turno: 2, inicio: "14:00", intervalo: 15 },
      { turno: 3, inicio: "22:00", intervalo: 15 },
    ];

    const horarioConfig = horariosBase.find((h) => h.turno === parseInt(turnoSelecionado)) || horariosBase[0];

    const pontosCalculados: Escala[] = Array.from(colaboradoresAgrupados.entries()).map(
      ([bairro, colab], idx) => {
        const latMedia = colab.reduce((acc, c) => acc + (c.latitude || 0), 0) / colab.length;
        const lonMedia = colab.reduce((acc, c) => acc + (c.longitude || 0), 0) / colab.length;
        const horarioEmbarque = calcularHorario(horarioConfig.inicio, idx * horarioConfig.intervalo);

        return {
          ponto_id: `ponto-${idx + 1}`,
          ponto_nome: bairro.toUpperCase(),
          horario: horarioEmbarque,
          colaboradores: colab.map((c) => c.nome),
          quantidade: colab.length,
          latitude: latMedia,
          longitude: lonMedia,
        };
      }
    );

    // Calcular rota (conectar pontos)
    const rotaCalculada: [number, number][] = pontosCalculados.map((p) => [p.latitude, p.longitude]);

    // Calcular distâncias
    let distanciaTotal = 0;
    for (let i = 0; i < rotaCalculada.length - 1; i++) {
      distanciaTotal += calcularDistancia(
        rotaCalculada[i][0],
        rotaCalculada[i][1],
        rotaCalculada[i + 1][0],
        rotaCalculada[i + 1][1]
      );
    }

    // Gerar relatório
    const relatorioCalculado: RelatorioRota = {
      distancia_total: distanciaTotal,
      tempo_estimado: Math.ceil(distanciaTotal / 50), // 50 km/h média
      combustivel_estimado: distanciaTotal / 8, // 8 km/litro
      custo_combustivel: (distanciaTotal / 8) * 5.5, // R$ 5,50 por litro
      velocidade_media: 50,
      pontos_parada: pontosCalculados.length,
      colaboradores_total: colaboradores.length,
    };

    setPontos(pontosCalculados);
    setRota(rotaCalculada);
    setRelatorio(relatorioCalculado);
    setMapCenter([rotaCalculada[0][0], rotaCalculada[0][1]]);
    setEtapa("resultado");
    setIsLoading(false);
  };

  const calcularHorario = (horarioBase: string, minutos: number): string => {
    const [horas, mins] = horarioBase.split(":").map(Number);
    const totalMinutos = horas * 60 + mins + minutos;
    const novasHoras = Math.floor(totalMinutos / 60);
    const novosMinutos = totalMinutos % 60;
    return `${String(novasHoras).padStart(2, "0")}:${String(novosMinutos).padStart(2, "0")}`;
  };

  const exportarPDF = () => {
    if (!relatorio) return;

    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("RELATÓRIO DE ROTEIRIZAÇÃO", 20, 20);

    doc.setFontSize(10);
    doc.text(`Data: ${new Date().toLocaleDateString("pt-BR")}`, 20, 30);
    doc.text(`Turno: ${turnoSelecionado}º Turno`, 20, 37);

    // KPIs
    const kpis = [
      { label: "Distância Total", valor: `${relatorio.distancia_total.toFixed(2)} km` },
      { label: "Tempo Estimado", valor: `${relatorio.tempo_estimado}h` },
      { label: "Combustível", valor: `${relatorio.combustivel_estimado.toFixed(2)} L` },
      { label: "Custo Combustível", valor: `R$ ${relatorio.custo_combustivel.toFixed(2)}` },
      { label: "Pontos de Parada", valor: relatorio.pontos_parada },
      { label: "Total de Colaboradores", valor: relatorio.colaboradores_total },
    ];

    let yPos = 50;
    kpis.forEach((kpi) => {
      doc.text(`${kpi.label}: ${kpi.valor}`, 20, yPos);
      yPos += 7;
    });

    // Tabela de pontos
    const tableData = pontos.map((p) => [
      p.ponto_nome,
      p.horario,
      p.quantidade,
      p.colaboradores.join(", "),
    ]);

    autoTable(doc, {
      head: [["Ponto", "Horário", "Qtd", "Colaboradores"]],
      body: tableData,
      startY: yPos + 10,
    });

    doc.save(`roteirizacao-${new Date().toISOString().split("T")[0]}.pdf`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">🗺️ Roteirização Profissional</h1>
          <p className="text-slate-600">Sistema completo com mapa, rastreamento e relatório de distância</p>
        </div>

        {etapa === "upload" && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5 text-orange-500" />
                Passo 1: Importar Planilha
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center hover:border-orange-500 transition-colors cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-12 w-12 mx-auto text-slate-400 mb-4" />
                <p className="text-lg font-medium text-slate-900 mb-2">Clique para selecionar a planilha Excel</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>
              {colaboradores.length > 0 && (
                <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2 text-green-700">
                    <CheckCircle className="h-5 w-5" />
                    <span>{colaboradores.length} colaboradores carregados</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {etapa === "parametros" && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-orange-500" />
                Passo 2: Configurar Parâmetros
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Turno</label>
                  <Select value={turnoSelecionado} onValueChange={setTurnoSelecionado}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1º Turno (06h - 14h15)</SelectItem>
                      <SelectItem value="2">2º Turno (14h - 22h15)</SelectItem>
                      <SelectItem value="3">3º Turno (22h - 06h15)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Distância Máxima (metros)
                  </label>
                  <Input
                    type="number"
                    value={distanciaMaxima}
                    onChange={(e) => setDistanciaMaxima(Number(e.target.value))}
                    placeholder="700"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <Button onClick={() => setEtapa("upload")} variant="outline">
                  Voltar
                </Button>
                <Button
                  onClick={calcularRoteirizacao}
                  disabled={isLoading}
                  className="bg-orange-500 hover:bg-orange-600"
                >
                  {isLoading ? (
                    <>
                      <Loader className="h-4 w-4 mr-2 animate-spin" />
                      Calculando...
                    </>
                  ) : (
                    "Calcular Roteirização"
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {etapa === "resultado" && (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              {/* Mapa */}
              <div className="lg:col-span-2">
                <Card className="h-[500px]">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Navigation className="h-5 w-5 text-orange-500" />
                      Mapa de Roteirização
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="h-[calc(100%-80px)]">
                    <MapContainer center={mapCenter} zoom={12} style={{ height: "100%", borderRadius: "8px" }}>
                      <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; OpenStreetMap contributors'
                      />
                      <MapCenter center={mapCenter} />
                      {rota.length > 1 && <Polyline positions={rota} color="orange" weight={3} />}
                      {pontos.map((ponto, idx) => (
                        <Marker key={ponto.ponto_id} position={[ponto.latitude, ponto.longitude]}>
                          <Popup>
                            <div className="text-sm">
                              <p className="font-bold">{ponto.ponto_nome}</p>
                              <p>Horário: {ponto.horario}</p>
                              <p>Colaboradores: {ponto.quantidade}</p>
                            </div>
                          </Popup>
                        </Marker>
                      ))}
                      {posicaoAtual && (
                        <Marker position={posicaoAtual}>
                          <Popup>Veículo em movimento</Popup>
                        </Marker>
                      )}
                    </MapContainer>
                  </CardContent>
                </Card>
              </div>

              {/* KPIs */}
              <div className="space-y-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <TrendingDown className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                      <p className="text-sm text-slate-600">Distância</p>
                      <p className="text-2xl font-bold">{relatorio?.distancia_total.toFixed(1)} km</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <Clock className="h-8 w-8 text-green-500 mx-auto mb-2" />
                      <p className="text-sm text-slate-600">Tempo</p>
                      <p className="text-2xl font-bold">{relatorio?.tempo_estimado}h</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <Fuel className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
                      <p className="text-sm text-slate-600">Combustível</p>
                      <p className="text-2xl font-bold">{relatorio?.combustivel_estimado.toFixed(1)}L</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <DollarSign className="h-8 w-8 text-red-500 mx-auto mb-2" />
                      <p className="text-sm text-slate-600">Custo</p>
                      <p className="text-2xl font-bold">R$ {relatorio?.custo_combustivel.toFixed(2)}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Controles de Simulação */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Play className="h-5 w-5 text-orange-500" />
                  Rastreamento em Tempo Real
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-3">
                  <Button
                    onClick={() => setIsSimulando(!isSimulando)}
                    className={isSimulando ? "bg-red-500 hover:bg-red-600" : "bg-green-500 hover:bg-green-600"}
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
                  <Button onClick={() => { setProgresso(0); setPosicaoAtual(null); }} variant="outline">
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Reiniciar
                  </Button>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-slate-700 mb-2">Velocidade</label>
                    <Input
                      type="range"
                      min="0.5"
                      max="3"
                      step="0.5"
                      value={velocidadeSimulacao}
                      onChange={(e) => setVelocidadeSimulacao(Number(e.target.value))}
                    />
                  </div>
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
              </CardContent>
            </Card>

            {/* Tabela de Escala */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-orange-500" />
                  Escala de Embarque
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-200">
                        <th className="text-left py-3 px-4 font-semibold">Ponto</th>
                        <th className="text-left py-3 px-4 font-semibold">Horário</th>
                        <th className="text-left py-3 px-4 font-semibold">Qtd</th>
                        <th className="text-left py-3 px-4 font-semibold">Colaboradores</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pontos.map((item, idx) => (
                        <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50">
                          <td className="py-3 px-4 font-medium">{item.ponto_nome}</td>
                          <td className="py-3 px-4">
                            <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded text-xs">
                              {item.horario}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs">
                              {item.quantidade}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-xs">
                            <details>
                              <summary className="cursor-pointer">Ver lista</summary>
                              <div className="mt-2 space-y-1">
                                {item.colaboradores.map((nome, i) => (
                                  <div key={i}>• {nome}</div>
                                ))}
                              </div>
                            </details>
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
              <Button onClick={() => setEtapa("parametros")} variant="outline">
                Voltar
              </Button>
              <Button onClick={exportarPDF} className="bg-green-500 hover:bg-green-600">
                <Download className="h-4 w-4 mr-2" />
                Exportar PDF
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
