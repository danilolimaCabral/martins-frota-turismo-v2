import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { TrendingUp, TrendingDown, Calendar, Users, Fuel, DollarSign, Brain, Zap , ArrowLeft } from "lucide-react";
import { toast } from "sonner";

interface RotaHistorico {
  id: number;
  data: string;
  nome: string;
  distancia: number;
  tempo: number;
  combustivel: number;
  custo: number;
  passageiros: number;
  motorista: string;
  veiculo: string;
  status: "concluida" | "cancelada" | "atrasada";
  economia: number;
}

interface Padrao {
  id: number;
  titulo: string;
  descricao: string;
  frequencia: number;
  economia_potencial: number;
  confianca: number;
}

const HISTORICO_ROTAS: RotaHistorico[] = [
  {
    id: 1,
    data: "2024-01-14",
    nome: "Fretamento Empresa XYZ",
    distancia: 45.8,
    tempo: 150,
    combustivel: 7.63,
    custo: 49.6,
    passageiros: 12,
    motorista: "João Silva",
    veiculo: "Van Executiva 01",
    status: "concluida",
    economia: 0,
  },
  {
    id: 2,
    data: "2024-01-13",
    nome: "Fretamento Empresa ABC",
    distancia: 52.3,
    tempo: 165,
    combustivel: 8.72,
    custo: 56.7,
    passageiros: 15,
    motorista: "Maria Santos",
    veiculo: "Ônibus Turismo 02",
    status: "concluida",
    economia: 2.3,
  },
  {
    id: 3,
    data: "2024-01-12",
    nome: "Fretamento Empresa XYZ",
    distancia: 43.2,
    tempo: 140,
    combustivel: 7.2,
    custo: 46.8,
    passageiros: 11,
    motorista: "João Silva",
    veiculo: "Van Executiva 01",
    status: "concluida",
    economia: 3.1,
  },
  {
    id: 4,
    data: "2024-01-11",
    nome: "Fretamento Empresa DEF",
    distancia: 38.5,
    tempo: 125,
    combustivel: 6.42,
    custo: 41.7,
    passageiros: 9,
    motorista: "Carlos Oliveira",
    veiculo: "Van Executiva 03",
    status: "concluida",
    economia: 1.8,
  },
  {
    id: 5,
    data: "2024-01-10",
    nome: "Fretamento Empresa XYZ",
    distancia: 44.1,
    tempo: 148,
    combustivel: 7.35,
    custo: 47.8,
    passageiros: 12,
    motorista: "João Silva",
    veiculo: "Van Executiva 01",
    status: "concluida",
    economia: 2.5,
  },
];

const PADROES_APRENDIZADOS: Padrao[] = [
  {
    id: 1,
    titulo: "Rota XYZ é mais eficiente às 7:30",
    descricao: "Saídas às 7:30 economizam 8% de combustível comparado a 8:00",
    frequencia: 5,
    economia_potencial: 125.6,
    confianca: 92,
  },
  {
    id: 2,
    titulo: "João Silva otimiza melhor que média",
    descricao: "Motorista João economiza 5% a mais em combustível",
    frequencia: 8,
    economia_potencial: 89.3,
    confianca: 88,
  },
  {
    id: 3,
    titulo: "Terças são dias mais lentos",
    descricao: "Terças têm 12% mais trânsito, considere rotas alternativas",
    frequencia: 4,
    economia_potencial: 156.2,
    confianca: 85,
  },
  {
    id: 4,
    titulo: "Van Executiva 01 é mais econômica",
    descricao: "Van 01 consome 3% menos combustível que média da frota",
    frequencia: 6,
    economia_potencial: 98.7,
    confianca: 90,
  },
];

const DADOS_TENDENCIA = [
  { data: "Jan 10", distancia: 45.8, combustivel: 7.63, custo: 49.6 },
  { data: "Jan 11", distancia: 38.5, combustivel: 6.42, custo: 41.7 },
  { data: "Jan 12", distancia: 43.2, combustivel: 7.2, custo: 46.8 },
  { data: "Jan 13", distancia: 52.3, combustivel: 8.72, custo: 56.7 },
  { data: "Jan 14", distancia: 45.8, combustivel: 7.63, custo: 49.6 },
];

const DADOS_MOTORISTAS = [
  { nome: "João Silva", economia: 8.5, rotas: 12 },
  { nome: "Maria Santos", economia: 6.2, rotas: 8 },
  { nome: "Carlos Oliveira", economia: 4.8, rotas: 6 },
  { nome: "Ana Lima", economia: 7.1, rotas: 10 },
];

const CORES_PADROES = ["#ef4444", "#f97316", "#eab308", "#22c55e", "#06b6d4"];

export default function AdminHistoricoRotas() {
  const [, setLocation] = useLocation();
  const [filtroMotorista, setFiltroMotorista] = useState<string | null>(null);
  const [filtroVeiculo, setFiltroVeiculo] = useState<string | null>(null);

  const rotasFiltradas = HISTORICO_ROTAS.filter((rota) => {
    if (filtroMotorista && rota.motorista !== filtroMotorista) return false;
    if (filtroVeiculo && rota.veiculo !== filtroVeiculo) return false;
    return true;
  });

  const totalDistancia = rotasFiltradas.reduce((acc, r) => acc + r.distancia, 0);
  const totalCombustivel = rotasFiltradas.reduce((acc, r) => acc + r.combustivel, 0);
  const totalCusto = rotasFiltradas.reduce((acc, r) => acc + r.custo, 0);
  const totalEconomia = rotasFiltradas.reduce((acc, r) => acc + r.economia, 0);

  const motoristas = [...new Set(HISTORICO_ROTAS.map((r) => r.motorista))];
  const veiculos = [...new Set(HISTORICO_ROTAS.map((r) => r.veiculo))];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-8">
      {/* Botão Voltar */}
      <div className="mb-6 flex items-center gap-2">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-orange-600 hover:bg-orange-700 text-white transition-colors font-medium"
        >
          <ArrowLeft size={20} />
          <span>Voltar</span>
        </button>
      </div>

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg">
            <Calendar className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900">Histórico de Rotas</h1>
        </div>
        <p className="text-slate-600">Análise de desempenho e padrões de aprendizado</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Total de Distância</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{totalDistancia.toFixed(1)} km</div>
            <p className="text-xs text-slate-500 mt-1">{rotasFiltradas.length} rotas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Combustível Usado</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{totalCombustivel.toFixed(2)} L</div>
            <p className="text-xs text-slate-500 mt-1">Consumo médio: {(totalDistancia / totalCombustivel).toFixed(1)} km/l</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Custo Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">R$ {totalCusto.toFixed(2)}</div>
            <p className="text-xs text-slate-500 mt-1">Custo médio: R$ {(totalCusto / rotasFiltradas.length).toFixed(2)}</p>
          </CardContent>
        </Card>

        <Card className="bg-green-50 border-green-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-900">Economia Acumulada</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-700">R$ {totalEconomia.toFixed(2)}</div>
            <p className="text-xs text-green-600 mt-1">Otimizações aplicadas</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="tendencias" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="tendencias">Tendências</TabsTrigger>
          <TabsTrigger value="padroes">Padrões IA</TabsTrigger>
          <TabsTrigger value="historico">Histórico</TabsTrigger>
        </TabsList>

        {/* Tendências */}
        <TabsContent value="tendencias" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Tendência de Distância e Custo</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={DADOS_TENDENCIA}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="data" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Line yAxisId="left" type="monotone" dataKey="distancia" stroke="#4f46e5" name="Distância (km)" />
                    <Line yAxisId="right" type="monotone" dataKey="custo" stroke="#ef4444" name="Custo (R$)" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Desempenho por Motorista</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={DADOS_MOTORISTAS}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="nome" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="economia" fill="#22c55e" name="Economia (%)" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Padrões IA */}
        <TabsContent value="padroes" className="space-y-4">
          <Card className="bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-purple-600" />
                <CardTitle>Padrões Aprendidos pela IA</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="text-slate-700">
              <p className="text-sm mb-4">
                O sistema analisou {HISTORICO_ROTAS.length} rotas e identificou {PADROES_APRENDIZADOS.length} padrões com potencial de otimização.
              </p>
            </CardContent>
          </Card>

          <div className="space-y-4">
            {PADROES_APRENDIZADOS.map((padrao, idx) => (
              <Card key={padrao.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: CORES_PADROES[idx % CORES_PADROES.length] }}
                        />
                        <h3 className="font-semibold text-slate-900">{padrao.titulo}</h3>
                      </div>
                      <p className="text-sm text-slate-600 mb-3">{padrao.descricao}</p>

                      <div className="flex flex-wrap gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <span className="text-slate-600">Frequência:</span>
                          <Badge variant="outline">{padrao.frequencia} ocorrências</Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-slate-600">Confiança:</span>
                          <div className="flex items-center gap-1">
                            <div className="w-24 h-2 bg-slate-200 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-yellow-400 to-green-500"
                                style={{ width: `${padrao.confianca}%` }}
                              />
                            </div>
                            <span className="font-semibold">{padrao.confianca}%</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-green-700 font-semibold">
                          <TrendingDown className="h-4 w-4" />
                          R$ {padrao.economia_potencial.toFixed(2)}/mês
                        </div>
                      </div>
                    </div>
                    <Button size="sm" className="gap-2 bg-purple-600 hover:bg-purple-700">
                      <Zap className="h-4 w-4" />
                      Aplicar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Histórico */}
        <TabsContent value="historico" className="space-y-4">
          {/* Filtros */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant={filtroMotorista === null ? "default" : "outline"}
              onClick={() => setFiltroMotorista(null)}
              size="sm"
            >
              Todos os Motoristas
            </Button>
            {motoristas.map((motorista) => (
              <Button
                key={motorista}
                variant={filtroMotorista === motorista ? "default" : "outline"}
                onClick={() => setFiltroMotorista(motorista)}
                size="sm"
              >
                {motorista}
              </Button>
            ))}
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              variant={filtroVeiculo === null ? "default" : "outline"}
              onClick={() => setFiltroVeiculo(null)}
              size="sm"
            >
              Todos os Veículos
            </Button>
            {veiculos.map((veiculo) => (
              <Button
                key={veiculo}
                variant={filtroVeiculo === veiculo ? "default" : "outline"}
                onClick={() => setFiltroVeiculo(veiculo)}
                size="sm"
              >
                {veiculo}
              </Button>
            ))}
          </div>

          {/* Tabela */}
          <Card>
            <CardContent className="pt-6">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b">
                    <tr>
                      <th className="text-left py-2 px-4 font-semibold text-slate-900">Data</th>
                      <th className="text-left py-2 px-4 font-semibold text-slate-900">Rota</th>
                      <th className="text-left py-2 px-4 font-semibold text-slate-900">Motorista</th>
                      <th className="text-left py-2 px-4 font-semibold text-slate-900">Veículo</th>
                      <th className="text-right py-2 px-4 font-semibold text-slate-900">Distância</th>
                      <th className="text-right py-2 px-4 font-semibold text-slate-900">Combustível</th>
                      <th className="text-right py-2 px-4 font-semibold text-slate-900">Custo</th>
                      <th className="text-right py-2 px-4 font-semibold text-slate-900">Economia</th>
                      <th className="text-center py-2 px-4 font-semibold text-slate-900">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rotasFiltradas.map((rota) => (
                      <tr key={rota.id} className="border-b hover:bg-slate-50">
                        <td className="py-3 px-4 text-slate-700">{rota.data}</td>
                        <td className="py-3 px-4 text-slate-700">{rota.nome}</td>
                        <td className="py-3 px-4 text-slate-700">{rota.motorista}</td>
                        <td className="py-3 px-4 text-slate-700">{rota.veiculo}</td>
                        <td className="py-3 px-4 text-right text-slate-700">{rota.distancia.toFixed(1)} km</td>
                        <td className="py-3 px-4 text-right text-slate-700">{rota.combustivel.toFixed(2)} L</td>
                        <td className="py-3 px-4 text-right text-slate-700">R$ {rota.custo.toFixed(2)}</td>
                        <td className="py-3 px-4 text-right font-semibold text-green-700">
                          {rota.economia > 0 ? `+R$ ${rota.economia.toFixed(2)}` : "-"}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <Badge
                            className={
                              rota.status === "concluida"
                                ? "bg-green-100 text-green-800"
                                : rota.status === "atrasada"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-red-100 text-red-800"
                            }
                          >
                            {rota.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
