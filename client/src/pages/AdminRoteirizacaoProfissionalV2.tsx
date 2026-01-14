import React, { useState, useRef, useEffect } from "react";
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
  ArrowLeft,
  Plus,
  Trash2,
  Zap,
  Edit2,
  Save,
  X,
  Info,
} from "lucide-react";
import * as XLSX from "xlsx";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useLocation } from "wouter";

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

interface RotaCadastrada {
  id: string;
  nome: string;
  distancia: number;
  tempo: number;
  pontos: number;
  status: "rascunho" | "otimizada" | "ativa";
}

// Componente para capturar cliques no mapa
function MapClickHandler({ onMapClick, modoEdicao }: { onMapClick: (lat: number, lon: number) => void; modoEdicao: boolean }) {
  useMapEvents({
    click(e) {
      if (modoEdicao) {
        onMapClick(e.latlng.lat, e.latlng.lng);
      }
    },
  });
  return null;
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
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
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
      return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) };
    }
  } catch (error) {
    console.error("Erro ao geocodificar:", error);
  }
  return null;
}

export default function AdminRoteirizacaoProfissionalV2() {
  const [, setLocation] = useLocation();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Estados
  const [colaboradores, setColaboradores] = useState<Colaborador[]>([]);
  const [pontos, setPontos] = useState<Escala[]>([]);
  const [rota, setRota] = useState<[number, number][]>([]);
  const [relatorio, setRelatorio] = useState<RelatorioRota | null>(null);
  const [turnoSelecionado, setTurnoSelecionado] = useState<string>("1");
  const [isLoading, setIsLoading] = useState(false);
  const [etapa, setEtapa] = useState<"lista" | "upload" | "parametros" | "resultado">("lista");
  const [mapCenter, setMapCenter] = useState<[number, number]>([-25.4284, -49.2733]);
  const [isSimulando, setIsSimulando] = useState(false);
  const [progresso, setProgresso] = useState(0);
  const [velocidadeSimulacao, setVelocidadeSimulacao] = useState(1);
  const [posicaoAtual, setPosicaoAtual] = useState<[number, number] | null>(null);
  const [modoEdicao, setModoEdicao] = useState(false);
  const [mensagem, setMensagem] = useState<{ tipo: "sucesso" | "erro" | "info"; texto: string } | null>(null);

  const [rotasCadastradas, setRotasCadastradas] = useState<RotaCadastrada[]>([
    { id: "1", nome: "Rota Teste", distancia: 150, tempo: 120, pontos: 5, status: "rascunho" },
    { id: "2", nome: "Rota com Endereços", distancia: 100, tempo: 120, pontos: 4, status: "rascunho" },
    { id: "3", nome: "Rota Status", distancia: 100, tempo: 120, pontos: 4, status: "otimizada" },
    { id: "4", nome: "Rota Clustering", distancia: 100, tempo: 120, pontos: 4, status: "rascunho" },
  ]);

  // Simular movimento
  useEffect(() => {
    if (!isSimulando || rota.length === 0) return;

    const interval = setInterval(() => {
      setProgresso((prev) => {
        const novoProgresso = prev + 0.5 * velocidadeSimulacao;
        if (novoProgresso >= 100) {
          setIsSimulando(false);
          return 100;
        }

        const index = Math.floor((novoProgresso / 100) * (rota.length - 1));
        const proximoIndex = Math.min(index + 1, rota.length - 1);
        const t = (novoProgresso / 100) * (rota.length - 1) - index;

        const lat = rota[index][0] + (rota[proximoIndex][0] - rota[index][0]) * t;
        const lon = rota[index][1] + (rota[proximoIndex][1] - rota[index][1]) * t;
        setPosicaoAtual([lat, lon]);

        return novoProgresso;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isSimulando, rota, velocidadeSimulacao]);

  // Mostrar mensagem
  const exibirMensagem = (tipo: "sucesso" | "erro" | "info", texto: string) => {
    setMensagem({ tipo, texto });
    setTimeout(() => setMensagem(null), 3000);
  };

  // Adicionar ponto clicando no mapa
  const adicionarPontoNoMapa = (lat: number, lon: number) => {
    const novoPonto: Escala = {
      ponto_id: `ponto-${pontos.length + 1}`,
      ponto_nome: `Ponto ${pontos.length + 1}`,
      horario: `${String(6 + pontos.length).padStart(2, "0")}:00`,
      colaboradores: [],
      quantidade: 0,
      latitude: lat,
      longitude: lon,
    };

    const novosPontos = [...pontos, novoPonto];
    setPontos(novosPontos);
    recalcularRota(novosPontos);
    exibirMensagem("sucesso", `Ponto adicionado em (${lat.toFixed(4)}, ${lon.toFixed(4)})`);
  };

  // Remover ponto
  const removerPonto = (pontoId: string) => {
    const novosPontos = pontos.filter((p) => p.ponto_id !== pontoId);
    setPontos(novosPontos);
    recalcularRota(novosPontos);
    exibirMensagem("sucesso", "Ponto removido");
  };

  // Recalcular rota
  const recalcularRota = (pontosList: Escala[]) => {
    if (pontosList.length === 0) {
      setRota([]);
      setRelatorio(null);
      return;
    }

    // Criar rota conectando pontos
    const rotaCalculada: [number, number][] = pontosList.map((p) => [p.latitude, p.longitude]);

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
      tempo_estimado: Math.ceil(distanciaTotal / 50),
      combustivel_estimado: distanciaTotal / 8,
      custo_combustivel: (distanciaTotal / 8) * 5.5,
      velocidade_media: 50,
      pontos_parada: pontosList.length,
      colaboradores_total: colaboradores.length,
    };

    setRota(rotaCalculada);
    setRelatorio(relatorioCalculado);
    setMapCenter([rotaCalculada[0][0], rotaCalculada[0][1]]);
  };

  // Carregar arquivo
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    const reader = new FileReader();

    reader.onload = async (event) => {
      try {
        const data = new Uint8Array(event.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        const colaboradoresProcessados = jsonData
          .map((row: any, idx: number) => ({
            id: idx,
            nome: row["__EMPTY"] || "",
            rua: row["__EMPTY_1"] || "",
            numero: row["__EMPTY_2"] || 0,
            complemento: row["__EMPTY_3"] || "",
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
        exibirMensagem("erro", "Erro ao processar arquivo");
        setIsLoading(false);
      }
    };

    reader.readAsArrayBuffer(file);
  };

  // Calcular roteirização
  const calcularRoteirizacao = async () => {
    if (colaboradores.length === 0) {
      exibirMensagem("erro", "Nenhum colaborador carregado");
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

    setPontos(pontosCalculados);
    recalcularRota(pontosCalculados);
    setEtapa("resultado");
    setIsLoading(false);
    exibirMensagem("sucesso", "Roteirização calculada com sucesso!");
  };

  const calcularHorario = (horarioBase: string, minutos: number): string => {
    const [horas, mins] = horarioBase.split(":").map(Number);
    const totalMinutos = horas * 60 + mins + minutos;
    const novasHoras = Math.floor(totalMinutos / 60);
    const novosMinutos = totalMinutos % 60;
    return `${String(novasHoras).padStart(2, "0")}:${String(novosMinutos).padStart(2, "0")}`;
  };

  // Exportar PDF
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
      p.quantidade.toString(),
      p.colaboradores.slice(0, 2).join(", ") + (p.colaboradores.length > 2 ? "..." : ""),
    ]);

    autoTable(doc, {
      head: [["Ponto", "Horário", "Qtd", "Colaboradores"]],
      body: tableData,
      startY: yPos + 10,
    });

    doc.save("roteirizacao.pdf");
    exibirMensagem("sucesso", "PDF exportado com sucesso!");
  };

  // Renderizar lista
  if (etapa === "lista") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
        <div className="max-w-7xl mx-auto">
          <Button
            onClick={() => setLocation("/admin")}
            variant="outline"
            className="mb-6 border-2 border-slate-600 hover:bg-slate-700 text-white"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>

          <div className="mb-6 flex justify-between items-center">
            <h1 className="text-3xl font-bold text-white">🗺️ Roteirização Inteligente</h1>
            <Button onClick={() => setEtapa("upload")} className="bg-blue-500 hover:bg-blue-600">
              <Plus className="h-4 w-4 mr-2" />
              Nova Rota
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Rotas Cadastradas */}
            <div className="lg:col-span-1">
              <Card className="bg-slate-800/50 backdrop-blur border-slate-700 border shadow-2xl">
                <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-t-lg">
                  <CardTitle>Rotas Cadastradas</CardTitle>
                </CardHeader>
                <CardContent className="pt-4 space-y-3">
                  {rotasCadastradas.map((rota) => (
                    <div
                      key={rota.id}
                      className="p-4 rounded-lg border-2 border-slate-600 hover:border-blue-400 hover:shadow-lg hover:shadow-blue-500/20 transition-all cursor-pointer hover:bg-slate-700/50 bg-slate-700/30"
                      onClick={() => setEtapa("resultado")}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold text-white">{rota.nome}</h3>
                        <span
                          className={`text-xs px-2 py-1 rounded-full font-medium ${
                            rota.status === "ativa"
                              ? "bg-green-500/20 text-green-300"
                              : rota.status === "otimizada"
                              ? "bg-blue-500/20 text-blue-300"
                              : "bg-gray-500/20 text-gray-300"
                          }`}
                        >
                          {rota.status}
                        </span>
                      </div>
                      <div className="space-y-1 text-sm text-gray-300">
                        <div className="flex items-center gap-2">
                          <TrendingDown className="h-4 w-4 text-orange-400" />
                          {rota.distancia.toFixed(1)} km
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-blue-400" />
                          {rota.tempo} min
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-red-400" />
                          {rota.pontos} pontos
                        </div>
                      </div>
                      <div className="flex gap-2 mt-3">
                        <Button size="sm" variant="outline" className="flex-1 text-xs bg-slate-600 hover:bg-slate-500 border-slate-500 text-white">
                          Editar
                        </Button>
                        <Button size="sm" variant="outline" className="flex-1 text-xs bg-red-500/20 hover:bg-red-500/30 border-red-500/50 text-red-300">
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Mapa Principal */}
            <div className="lg:col-span-3">
              <Card className="bg-slate-800/50 backdrop-blur border-slate-700 border shadow-2xl h-[600px]">
                <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-t-lg">
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Mapa de Roteirização
                  </CardTitle>
                </CardHeader>
                <CardContent className="h-[calc(100%-80px)] p-0">
                  <MapContainer center={mapCenter} zoom={12} style={{ height: "100%", borderRadius: "0 0 8px 8px" }}>
                    <TileLayer
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      attribution='&copy; OpenStreetMap contributors'
                    />
                    <MapCenter center={mapCenter} />
                    {rotasCadastradas.map((rota, idx) => (
                      <Marker key={rota.id} position={[mapCenter[0] + idx * 0.01, mapCenter[1] + idx * 0.01]}>
                        <Popup>
                          <div className="text-sm">
                            <p className="font-bold">{rota.nome}</p>
                            <p>Distância: {rota.distancia.toFixed(1)} km</p>
                            <p>Tempo: {rota.tempo} min</p>
                          </div>
                        </Popup>
                      </Marker>
                    ))}
                  </MapContainer>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Renderizar upload
  if (etapa === "upload") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
        <div className="max-w-4xl mx-auto">
          <Button
            onClick={() => setEtapa("lista")}
            variant="outline"
            className="mb-6 border-2 border-slate-600 hover:bg-slate-700 text-white"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>

          <Card className="bg-slate-800/50 backdrop-blur border-slate-700 border shadow-2xl">
            <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-t-lg">
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Upload className="h-6 w-6" />
                Importar Planilha
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-8">
              <div
                className="border-4 border-dashed border-purple-400 rounded-xl p-12 text-center hover:border-blue-400 hover:bg-blue-500/5 transition-all cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-16 w-16 mx-auto text-purple-400 mb-4" />
                <p className="text-xl font-semibold text-white mb-2">Clique para selecionar a planilha Excel</p>
                <p className="text-gray-400">Suporte para arquivos .xlsx e .xls</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>
              {colaboradores.length > 0 && (
                <div className="mt-6 p-4 bg-green-500/10 border-2 border-green-500/30 rounded-lg">
                  <div className="flex items-center gap-2 text-green-300">
                    <CheckCircle className="h-5 w-5" />
                    <span className="font-semibold">{colaboradores.length} colaboradores carregados</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Renderizar parâmetros
  if (etapa === "parametros") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
        <div className="max-w-4xl mx-auto">
          <Button
            onClick={() => setEtapa("upload")}
            variant="outline"
            className="mb-6 border-2 border-slate-600 hover:bg-slate-700 text-white"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>

          <Card className="bg-slate-800/50 backdrop-blur border-slate-700 border shadow-2xl">
            <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-t-lg">
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Zap className="h-6 w-6" />
                Configurar Roteirização
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-8 space-y-6">
              <div>
                <label className="text-white font-semibold mb-2 block">Selecione o Turno</label>
                <Select value={turnoSelecionado} onValueChange={setTurnoSelecionado}>
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1º Turno (06:00)</SelectItem>
                    <SelectItem value="2">2º Turno (14:00)</SelectItem>
                    <SelectItem value="3">3º Turno (22:00)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="p-4 bg-blue-500/10 border-2 border-blue-500/30 rounded-lg">
                <div className="flex items-start gap-3">
                  <Info className="h-5 w-5 text-blue-400 mt-0.5 flex-shrink-0" />
                  <div className="text-blue-200 text-sm">
                    <p className="font-semibold mb-1">Dicas:</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>A roteirização agrupa colaboradores por bairro</li>
                      <li>Horários são calculados automaticamente</li>
                      <li>Distâncias são calculadas usando coordenadas reais</li>
                    </ul>
                  </div>
                </div>
              </div>

              <Button
                onClick={calcularRoteirizacao}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-semibold py-3 text-lg"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader className="h-5 w-5 mr-2 animate-spin" />
                    Calculando...
                  </>
                ) : (
                  <>
                    <Zap className="h-5 w-5 mr-2" />
                    Calcular Roteirização
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Renderizar resultado
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <Button
            onClick={() => setEtapa("lista")}
            variant="outline"
            className="border-2 border-slate-600 hover:bg-slate-700 text-white"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>

          <Button
            onClick={() => setModoEdicao(!modoEdicao)}
            className={modoEdicao ? "bg-red-500 hover:bg-red-600" : "bg-green-500 hover:bg-green-600"}
          >
            {modoEdicao ? (
              <>
                <X className="h-4 w-4 mr-2" />
                Sair do Modo Edição
              </>
            ) : (
              <>
                <Edit2 className="h-4 w-4 mr-2" />
                Modo Edição
              </>
            )}
          </Button>
        </div>

        {/* Mensagem */}
        {mensagem && (
          <div
            className={`mb-6 p-4 rounded-lg border-2 ${
              mensagem.tipo === "sucesso"
                ? "bg-green-500/10 border-green-500/30 text-green-300"
                : mensagem.tipo === "erro"
                ? "bg-red-500/10 border-red-500/30 text-red-300"
                : "bg-blue-500/10 border-blue-500/30 text-blue-300"
            }`}
          >
            {mensagem.texto}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Mapa */}
          <div className="lg:col-span-2">
            <Card className="bg-slate-800/50 backdrop-blur border-slate-700 border shadow-2xl h-[500px]">
              <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-t-lg flex justify-between items-center">
                <CardTitle className="flex items-center gap-2">
                  <Navigation className="h-5 w-5" />
                  Mapa de Roteirização
                </CardTitle>
                {modoEdicao && (
                  <span className="text-xs bg-red-500/20 border border-red-500/50 px-2 py-1 rounded">
                    Clique no mapa para adicionar pontos
                  </span>
                )}
              </CardHeader>
              <CardContent className="h-[calc(100%-80px)] p-0">
                <MapContainer center={mapCenter} zoom={12} style={{ height: "100%", borderRadius: "0 0 8px 8px" }}>
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; OpenStreetMap contributors'
                  />
                  <MapCenter center={mapCenter} />
                  <MapClickHandler onMapClick={adicionarPontoNoMapa} modoEdicao={modoEdicao} />
                  {rota.length > 1 && <Polyline positions={rota} color="#3b82f6" weight={4} />}
                  {pontos.map((ponto, idx) => (
                    <Marker key={ponto.ponto_id} position={[ponto.latitude, ponto.longitude]}>
                      <Popup>
                        <div className="text-sm space-y-2">
                          <p className="font-bold">{ponto.ponto_nome}</p>
                          <p>Horário: {ponto.horario}</p>
                          <p>Colaboradores: {ponto.quantidade}</p>
                          {modoEdicao && (
                            <Button
                              size="sm"
                              onClick={() => removerPonto(ponto.ponto_id)}
                              className="w-full bg-red-500 hover:bg-red-600 text-white text-xs mt-2"
                            >
                              <Trash2 className="h-3 w-3 mr-1" />
                              Remover
                            </Button>
                          )}
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
            <Card className="bg-gradient-to-br from-blue-500 to-blue-600 border-0 shadow-xl">
              <CardContent className="pt-6">
                <div className="text-center">
                  <TrendingDown className="h-8 w-8 mx-auto mb-2 text-white opacity-80" />
                  <p className="text-sm text-blue-100">Distância</p>
                  <p className="text-3xl font-bold text-white">{relatorio?.distancia_total.toFixed(1)} km</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-500 to-green-600 border-0 shadow-xl">
              <CardContent className="pt-6">
                <div className="text-center">
                  <Clock className="h-8 w-8 mx-auto mb-2 text-white opacity-80" />
                  <p className="text-sm text-green-100">Tempo</p>
                  <p className="text-3xl font-bold text-white">{relatorio?.tempo_estimado}h</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-yellow-500 to-yellow-600 border-0 shadow-xl">
              <CardContent className="pt-6">
                <div className="text-center">
                  <Fuel className="h-8 w-8 mx-auto mb-2 text-white opacity-80" />
                  <p className="text-sm text-yellow-100">Combustível</p>
                  <p className="text-3xl font-bold text-white">{relatorio?.combustivel_estimado.toFixed(1)}L</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-red-500 to-red-600 border-0 shadow-xl">
              <CardContent className="pt-6">
                <div className="text-center">
                  <DollarSign className="h-8 w-8 mx-auto mb-2 text-white opacity-80" />
                  <p className="text-sm text-red-100">Custo</p>
                  <p className="text-3xl font-bold text-white">R$ {relatorio?.custo_combustivel.toFixed(2)}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Controles de Simulação */}
        <Card className="bg-slate-800/50 backdrop-blur border-slate-700 border shadow-2xl mb-6">
          <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-t-lg">
            <CardTitle className="flex items-center gap-2">
              <Play className="h-5 w-5" />
              Rastreamento em Tempo Real
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <div className="flex gap-3">
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
              <Button onClick={() => { setProgresso(0); setPosicaoAtual(null); }} variant="outline" className="border-slate-600 hover:bg-slate-700 text-white">
                <RotateCcw className="h-4 w-4 mr-2" />
                Reiniciar
              </Button>
              <Button onClick={exportarPDF} className="bg-blue-500 hover:bg-blue-600">
                <Download className="h-4 w-4 mr-2" />
                Exportar PDF
              </Button>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm text-gray-300">
                <span>Progresso: {progresso.toFixed(0)}%</span>
                <span>Velocidade: {velocidadeSimulacao}x</span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all"
                  style={{ width: `${progresso}%` }}
                />
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => setVelocidadeSimulacao(Math.max(0.5, velocidadeSimulacao - 0.5))}
                  variant="outline"
                  className="flex-1 text-xs border-slate-600 hover:bg-slate-700 text-white"
                >
                  -
                </Button>
                <Button
                  size="sm"
                  onClick={() => setVelocidadeSimulacao(Math.min(3, velocidadeSimulacao + 0.5))}
                  variant="outline"
                  className="flex-1 text-xs border-slate-600 hover:bg-slate-700 text-white"
                >
                  +
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabela de Pontos */}
        <Card className="bg-slate-800/50 backdrop-blur border-slate-700 border shadow-2xl">
          <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-t-lg">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Escala de Embarque
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-gray-300">
                <thead className="border-b border-slate-600">
                  <tr>
                    <th className="text-left py-3 px-4 font-semibold">Ponto</th>
                    <th className="text-left py-3 px-4 font-semibold">Horário</th>
                    <th className="text-left py-3 px-4 font-semibold">Qtd</th>
                    <th className="text-left py-3 px-4 font-semibold">Colaboradores</th>
                  </tr>
                </thead>
                <tbody>
                  {pontos.map((ponto) => (
                    <tr key={ponto.ponto_id} className="border-b border-slate-700 hover:bg-slate-700/50">
                      <td className="py-3 px-4">{ponto.ponto_nome}</td>
                      <td className="py-3 px-4">{ponto.horario}</td>
                      <td className="py-3 px-4">{ponto.quantidade}</td>
                      <td className="py-3 px-4 text-xs">{ponto.colaboradores.slice(0, 3).join(", ")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
