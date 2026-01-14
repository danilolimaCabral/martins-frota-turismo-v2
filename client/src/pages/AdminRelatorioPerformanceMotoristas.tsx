import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { ArrowLeft, TrendingUp, Award, Clock, Fuel, Star, Download } from "lucide-react";

interface Motorista {
  id: number;
  nome: string;
  placa: string;
  rotas_completas: number;
  economia_media: number;
  tempo_medio: number;
  combustivel_economizado: number;
  avaliacao: number;
  status: "ativo" | "inativo";
}

const motoristasMock: Motorista[] = [
  {
    id: 1,
    nome: "João Silva",
    placa: "ABC-1234",
    rotas_completas: 45,
    economia_media: 79.1,
    tempo_medio: 120,
    combustivel_economizado: 234.5,
    avaliacao: 4.8,
    status: "ativo",
  },
  {
    id: 2,
    nome: "Maria Santos",
    placa: "DEF-5678",
    rotas_completas: 38,
    economia_media: 75.2,
    tempo_medio: 135,
    combustivel_economizado: 198.3,
    avaliacao: 4.6,
    status: "ativo",
  },
  {
    id: 3,
    nome: "Pedro Oliveira",
    placa: "GHI-9012",
    rotas_completas: 52,
    economia_media: 82.5,
    tempo_medio: 110,
    combustivel_economizado: 267.8,
    avaliacao: 4.9,
    status: "ativo",
  },
  {
    id: 4,
    nome: "Ana Costa",
    placa: "JKL-3456",
    rotas_completas: 35,
    economia_media: 71.3,
    tempo_medio: 145,
    combustivel_economizado: 165.2,
    avaliacao: 4.4,
    status: "ativo",
  },
  {
    id: 5,
    nome: "Carlos Mendes",
    placa: "MNO-7890",
    rotas_completas: 28,
    economia_media: 68.9,
    tempo_medio: 155,
    combustivel_economizado: 142.1,
    avaliacao: 4.2,
    status: "inativo",
  },
];

const dadosEconomia = [
  { mes: "Jan", economia: 78, combustivel: 245 },
  { mes: "Fev", economia: 81, combustivel: 267 },
  { mes: "Mar", economia: 76, combustivel: 198 },
  { mes: "Abr", economia: 83, combustivel: 289 },
  { mes: "Mai", economia: 79, combustivel: 234 },
  { mes: "Jun", economia: 85, combustivel: 312 },
];

const CORES = ["#FF6B35", "#004E89", "#1B998B", "#F7B801", "#E63946"];

export default function AdminRelatorioPerformanceMotoristas() {
  const [motoristas] = useState<Motorista[]>(motoristasMock);
  const [filtroStatus, setFiltroStatus] = useState<string>("todos");

  const motoristasFiltrados = motoristas.filter(
    (m) => filtroStatus === "todos" || m.status === filtroStatus
  );

  const melhorMotorista = motoristas.reduce((prev, current) =>
    prev.economia_media > current.economia_media ? prev : current
  );

  const economiaTotal = motoristas.reduce((acc, m) => acc + m.combustivel_economizado, 0);
  const rotasTotal = motoristas.reduce((acc, m) => acc + m.rotas_completas, 0);
  const avaliacaoMedia = (motoristas.reduce((acc, m) => acc + m.avaliacao, 0) / motoristas.length).toFixed(1);

  const distribuicaoAvaliacoes = [
    { name: "⭐⭐⭐⭐⭐ (4.5+)", value: motoristas.filter((m) => m.avaliacao >= 4.5).length },
    { name: "⭐⭐⭐⭐ (4.0-4.4)", value: motoristas.filter((m) => m.avaliacao >= 4.0 && m.avaliacao < 4.5).length },
    { name: "⭐⭐⭐ (3.5-3.9)", value: motoristas.filter((m) => m.avaliacao >= 3.5 && m.avaliacao < 4.0).length },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* Header */}
      <div className="border-b border-slate-200 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Performance de Motoristas</h1>
              <p className="text-sm text-slate-600">Análise de economia, tempo e avaliações</p>
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
        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Economia Total</p>
                  <p className="text-3xl font-bold text-orange-600">{economiaTotal.toFixed(1)} L</p>
                </div>
                <Fuel className="h-8 w-8 text-orange-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Rotas Completas</p>
                  <p className="text-3xl font-bold text-blue-600">{rotasTotal}</p>
                </div>
                <Award className="h-8 w-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Avaliação Média</p>
                  <p className="text-3xl font-bold text-green-600">{avaliacaoMedia}⭐</p>
                </div>
                <Star className="h-8 w-8 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Melhor Motorista</p>
                  <p className="text-lg font-bold text-purple-600">{melhorMotorista.nome}</p>
                  <p className="text-xs text-purple-500">{melhorMotorista.economia_media.toFixed(1)}% economia</p>
                </div>
                <TrendingUp className="h-8 w-8 text-purple-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Gráfico de Economia ao Longo do Tempo */}
          <Card className="bg-white border-slate-200 shadow-lg">
            <CardHeader className="border-b border-slate-200">
              <CardTitle className="text-slate-900">Economia ao Longo do Tempo</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={dadosEconomia}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="mes" stroke="#64748b" />
                  <YAxis stroke="#64748b" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: "#f8fafc", border: "1px solid #e2e8f0" }}
                    formatter={(value) => `${value}%`}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="economia" 
                    stroke="#FF6B35" 
                    strokeWidth={2}
                    dot={{ fill: "#FF6B35", r: 4 }}
                    name="Economia (%)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Gráfico de Combustível Economizado */}
          <Card className="bg-white border-slate-200 shadow-lg">
            <CardHeader className="border-b border-slate-200">
              <CardTitle className="text-slate-900">Combustível Economizado (L)</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={dadosEconomia}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="mes" stroke="#64748b" />
                  <YAxis stroke="#64748b" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: "#f8fafc", border: "1px solid #e2e8f0" }}
                    formatter={(value) => `${value} L`}
                  />
                  <Legend />
                  <Bar 
                    dataKey="combustivel" 
                    fill="#004E89" 
                    radius={[8, 8, 0, 0]}
                    name="Combustível (L)"
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Distribuição de Avaliações e Comparação */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Distribuição de Avaliações */}
          <Card className="bg-white border-slate-200 shadow-lg">
            <CardHeader className="border-b border-slate-200">
              <CardTitle className="text-slate-900">Distribuição de Avaliações</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={distribuicaoAvaliacoes}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {CORES.map((cor, index) => (
                      <Cell key={`cell-${index}`} fill={cor} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Comparação de Economia */}
          <Card className="bg-white border-slate-200 shadow-lg lg:col-span-2">
            <CardHeader className="border-b border-slate-200">
              <CardTitle className="text-slate-900">Economia por Motorista</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart 
                  data={motoristas.sort((a, b) => b.economia_media - a.economia_media).slice(0, 5)}
                  layout="vertical"
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis type="number" stroke="#64748b" />
                  <YAxis dataKey="nome" type="category" stroke="#64748b" width={100} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: "#f8fafc", border: "1px solid #e2e8f0" }}
                    formatter={(value) => `${value}%`}
                  />
                  <Bar dataKey="economia_media" fill="#FF6B35" radius={[0, 8, 8, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Tabela de Motoristas */}
        <Card className="bg-white border-slate-200 shadow-lg">
          <CardHeader className="border-b border-slate-200 flex justify-between items-center">
            <CardTitle className="text-slate-900">Detalhes dos Motoristas</CardTitle>
            <div className="flex gap-2">
              {["todos", "ativo", "inativo"].map((status) => (
                <Button
                  key={status}
                  onClick={() => setFiltroStatus(status)}
                  variant={filtroStatus === status ? "default" : "outline"}
                  size="sm"
                >
                  {status === "todos" ? "Todos" : status === "ativo" ? "Ativos" : "Inativos"}
                </Button>
              ))}
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-slate-200 bg-slate-50">
                  <tr>
                    <th className="text-left py-3 px-4 font-semibold text-slate-900">Motorista</th>
                    <th className="text-center py-3 px-4 font-semibold text-slate-900">Rotas</th>
                    <th className="text-center py-3 px-4 font-semibold text-slate-900">Economia</th>
                    <th className="text-center py-3 px-4 font-semibold text-slate-900">Tempo Médio</th>
                    <th className="text-center py-3 px-4 font-semibold text-slate-900">Combustível</th>
                    <th className="text-center py-3 px-4 font-semibold text-slate-900">Avaliação</th>
                    <th className="text-center py-3 px-4 font-semibold text-slate-900">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {motoristasFiltrados.map((motorista) => (
                    <tr key={motorista.id} className="border-b border-slate-100 hover:bg-slate-50 transition">
                      <td className="py-4 px-4">
                        <div>
                          <p className="font-medium text-slate-900">{motorista.nome}</p>
                          <p className="text-xs text-slate-500">{motorista.placa}</p>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <Badge variant="secondary">{motorista.rotas_completas}</Badge>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className="font-bold text-orange-600">{motorista.economia_media.toFixed(1)}%</span>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Clock className="h-4 w-4 text-slate-500" />
                          {motorista.tempo_medio} min
                        </div>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Fuel className="h-4 w-4 text-blue-500" />
                          {motorista.combustivel_economizado.toFixed(1)} L
                        </div>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className="font-bold text-yellow-600">{motorista.avaliacao}⭐</span>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <Badge className={motorista.status === "ativo" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                          {motorista.status === "ativo" ? "✓ Ativo" : "⊘ Inativo"}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Botão de Exportação */}
        <div className="mt-8 flex justify-end">
          <Button className="gap-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white">
            <Download className="h-4 w-4" />
            Exportar Relatório PDF
          </Button>
        </div>
      </div>
    </div>
  );
}
