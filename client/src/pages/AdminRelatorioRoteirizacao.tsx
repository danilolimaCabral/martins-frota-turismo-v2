import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { ArrowLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  Download,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Fuel,
  Clock,
  Users,
  MapPin,
  AlertCircle,
  CheckCircle,
  Filter,
} from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface RotaData {
  data: string;
  rota: string;
  distancia: number;
  tempo: number;
  combustivel: number;
  custo: number;
  colaboradores: number;
  velocidade_media: number;
  status: "concluida" | "em_progresso" | "cancelada";
}

interface ResumoMetricas {
  distancia_total: number;
  tempo_total: number;
  combustivel_total: number;
  custo_total: number;
  rotas_concluidas: number;
  colaboradores_transportados: number;
  velocidade_media: number;
  economia_potencial: number;
}

// Dados de exemplo
const rotasExemplo: RotaData[] = [
  {
    data: "2025-01-10",
    rota: "Centro → Bairro Alto → Zona Norte",
    distancia: 25.5,
    tempo: 45,
    combustivel: 3.2,
    custo: 17.6,
    colaboradores: 30,
    velocidade_media: 34,
    status: "concluida",
  },
  {
    data: "2025-01-11",
    rota: "Zona Norte → Bairro Alto → Centro",
    distancia: 24.8,
    tempo: 42,
    combustivel: 3.1,
    custo: 17.05,
    colaboradores: 28,
    velocidade_media: 35.4,
    status: "concluida",
  },
  {
    data: "2025-01-12",
    rota: "Centro → Zona Leste → Bairro Baixo",
    distancia: 32.1,
    tempo: 58,
    combustivel: 4.0,
    custo: 22.0,
    colaboradores: 35,
    velocidade_media: 33.1,
    status: "concluida",
  },
  {
    data: "2025-01-13",
    rota: "Bairro Baixo → Centro → Zona Oeste",
    distancia: 28.3,
    tempo: 51,
    combustivel: 3.5,
    custo: 19.25,
    colaboradores: 32,
    velocidade_media: 33.3,
    status: "concluida",
  },
  {
    data: "2025-01-14",
    rota: "Zona Oeste → Bairro Alto → Centro",
    distancia: 26.9,
    tempo: 48,
    combustivel: 3.4,
    custo: 18.7,
    colaboradores: 29,
    velocidade_media: 33.6,
    status: "em_progresso",
  },
];

export default function AdminRelatorioRoteirizacao() {
  const [, navigate] = useLocation();
  const [rotas, setRotas] = useState<RotaData[]>(rotasExemplo);
  const [filtroStatus, setFiltroStatus] = useState<string>("todos");
  const [dataInicio, setDataInicio] = useState("2025-01-10");
  const [dataFim, setDataFim] = useState("2025-01-14");

  // Calcular métricas
  const rotasFiltradas = rotas.filter((r) => {
    if (filtroStatus !== "todos" && r.status !== filtroStatus) return false;
    return r.data >= dataInicio && r.data <= dataFim;
  });

  const metricas: ResumoMetricas = {
    distancia_total: rotasFiltradas.reduce((acc, r) => acc + r.distancia, 0),
    tempo_total: rotasFiltradas.reduce((acc, r) => acc + r.tempo, 0),
    combustivel_total: rotasFiltradas.reduce((acc, r) => acc + r.combustivel, 0),
    custo_total: rotasFiltradas.reduce((acc, r) => acc + r.custo, 0),
    rotas_concluidas: rotasFiltradas.filter((r) => r.status === "concluida").length,
    colaboradores_transportados: rotasFiltradas.reduce((acc, r) => acc + r.colaboradores, 0),
    velocidade_media: rotasFiltradas.length > 0
      ? rotasFiltradas.reduce((acc, r) => acc + r.velocidade_media, 0) / rotasFiltradas.length
      : 0,
    economia_potencial: rotasFiltradas.length > 0
      ? rotasFiltradas.reduce((acc, r) => acc + r.distancia, 0) * 0.15
      : 0,
  };

  // Dados para gráficos
  const dadosDistancia = rotasFiltradas.map((r) => ({
    data: r.data.split("-")[2],
    distancia: r.distancia,
  }));

  const dadosCusto = rotasFiltradas.map((r) => ({
    data: r.data.split("-")[2],
    custo: r.custo,
  }));

  const dadosStatus = [
    { name: "Concluídas", value: rotasFiltradas.filter((r) => r.status === "concluida").length },
    { name: "Em Progresso", value: rotasFiltradas.filter((r) => r.status === "em_progresso").length },
    { name: "Canceladas", value: rotasFiltradas.filter((r) => r.status === "cancelada").length },
  ];

  const COLORS = ["#10b981", "#f59e0b", "#ef4444"];

  const exportarPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("RELATÓRIO DE ROTEIRIZAÇÃO", 20, 20);

    doc.setFontSize(10);
    doc.text(`Período: ${dataInicio} a ${dataFim}`, 20, 30);
    doc.text(`Gerado em: ${new Date().toLocaleDateString("pt-BR")}`, 20, 37);

    // Resumo de Métricas
    let yPos = 50;
    doc.setFontSize(12);
    doc.text("RESUMO DE MÉTRICAS", 20, yPos);
    yPos += 10;

    const metricsData = [
      ["Distância Total", `${metricas.distancia_total.toFixed(2)} km`],
      ["Tempo Total", `${metricas.tempo_total}h`],
      ["Combustível Gasto", `${metricas.combustivel_total.toFixed(2)} L`],
      ["Custo Total", `R$ ${metricas.custo_total.toFixed(2)}`],
      ["Rotas Concluídas", `${metricas.rotas_concluidas}`],
      ["Colaboradores Transportados", `${metricas.colaboradores_transportados}`],
      ["Velocidade Média", `${metricas.velocidade_media.toFixed(1)} km/h`],
      ["Economia Potencial", `R$ ${metricas.economia_potencial.toFixed(2)}`],
    ];

    doc.setFontSize(10);
    metricsData.forEach((item) => {
      doc.text(`${item[0]}: ${item[1]}`, 20, yPos);
      yPos += 7;
    });

    // Tabela de Rotas
    yPos += 10;
    const tableData = rotasFiltradas.map((r) => [
      r.data,
      r.rota,
      r.distancia.toFixed(2),
      r.tempo,
      r.combustivel.toFixed(2),
      r.custo.toFixed(2),
      r.colaboradores,
      r.status,
    ]);

    autoTable(doc, {
      head: [["Data", "Rota", "Distância (km)", "Tempo (min)", "Combustível (L)", "Custo (R$)", "Colaboradores", "Status"]],
      body: tableData,
      startY: yPos,
      theme: "grid",
      styles: { fontSize: 8 },
    });

    doc.save(`relatorio-roteirizacao-${new Date().toISOString().split("T")[0]}.pdf`);
  };

  const exportarCSV = () => {
    const csv = [
      ["Data", "Rota", "Distância (km)", "Tempo (min)", "Combustível (L)", "Custo (R$)", "Colaboradores", "Velocidade Média", "Status"],
      ...rotasFiltradas.map((r) => [
        r.data,
        r.rota,
        r.distancia.toFixed(2),
        r.tempo,
        r.combustivel.toFixed(2),
        r.custo.toFixed(2),
        r.colaboradores,
        r.velocidade_media.toFixed(1),
        r.status,
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `relatorio-roteirizacao-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <Button
          onClick={() => navigate("/admin/roteirizacao-profissional")}
          variant="outline"
          className="mb-6 border-2 border-slate-600 hover:bg-slate-700 text-white"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">📊 Relatório de Roteirização</h1>
          <p className="text-gray-300">Análise completa de distância, tempo, combustível e custos</p>
        </div>

        {/* Filtros */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-orange-500" />
              Filtros
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Data Início</label>
              <Input
                type="date"
                value={dataInicio}
                onChange={(e) => setDataInicio(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Data Fim</label>
              <Input
                type="date"
                value={dataFim}
                onChange={(e) => setDataFim(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Status</label>
              <select
                value={filtroStatus}
                onChange={(e) => setFiltroStatus(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm"
              >
                <option value="todos">Todos</option>
                <option value="concluida">Concluída</option>
                <option value="em_progresso">Em Progresso</option>
                <option value="cancelada">Cancelada</option>
              </select>
            </div>
            <div className="flex items-end gap-2">
              <Button onClick={exportarPDF} className="bg-red-500 hover:bg-red-600 flex-1">
                <Download className="h-4 w-4 mr-2" />
                PDF
              </Button>
              <Button onClick={exportarCSV} variant="outline" className="flex-1">
                <Download className="h-4 w-4 mr-2" />
                CSV
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <MapPin className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                <p className="text-sm text-slate-600">Distância Total</p>
                <p className="text-2xl font-bold">{metricas.distancia_total.toFixed(1)} km</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <Clock className="h-8 w-8 text-green-500 mx-auto mb-2" />
                <p className="text-sm text-slate-600">Tempo Total</p>
                <p className="text-2xl font-bold">{metricas.tempo_total}h</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <Fuel className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
                <p className="text-sm text-slate-600">Combustível</p>
                <p className="text-2xl font-bold">{metricas.combustivel_total.toFixed(1)}L</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <DollarSign className="h-8 w-8 text-red-500 mx-auto mb-2" />
                <p className="text-sm text-slate-600">Custo Total</p>
                <p className="text-2xl font-bold">R$ {metricas.custo_total.toFixed(2)}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Gráfico de Distância */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Distância por Dia</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={dadosDistancia}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="data" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="distancia" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Gráfico de Custo */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Custo por Dia</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={dadosCusto}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="data" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="custo" stroke="#ef4444" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Status das Rotas */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Status das Rotas</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={dadosStatus}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {COLORS.map((color, index) => (
                      <Cell key={`cell-${index}`} fill={color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Estatísticas */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Estatísticas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">Rotas Concluídas</span>
                <span className="font-bold text-green-600">{metricas.rotas_concluidas}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">Colaboradores</span>
                <span className="font-bold text-blue-600">{metricas.colaboradores_transportados}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">Velocidade Média</span>
                <span className="font-bold text-purple-600">{metricas.velocidade_media.toFixed(1)} km/h</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">Economia Potencial</span>
                <span className="font-bold text-orange-600">R$ {metricas.economia_potencial.toFixed(2)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Recomendações */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recomendações</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                <span>Velocidade média dentro do esperado</span>
              </div>
              <div className="flex gap-2 text-sm">
                <AlertCircle className="h-4 w-4 text-yellow-500 flex-shrink-0 mt-0.5" />
                <span>Considere otimizar rotas para reduzir combustível</span>
              </div>
              <div className="flex gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                <span>Taxa de conclusão de rotas excelente</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabela Detalhada */}
        <Card>
          <CardHeader>
            <CardTitle>Detalhamento de Rotas ({rotasFiltradas.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-3 px-4 font-semibold">Data</th>
                    <th className="text-left py-3 px-4 font-semibold">Rota</th>
                    <th className="text-right py-3 px-4 font-semibold">Distância</th>
                    <th className="text-right py-3 px-4 font-semibold">Tempo</th>
                    <th className="text-right py-3 px-4 font-semibold">Combustível</th>
                    <th className="text-right py-3 px-4 font-semibold">Custo</th>
                    <th className="text-right py-3 px-4 font-semibold">Colaboradores</th>
                    <th className="text-center py-3 px-4 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {rotasFiltradas.map((rota, idx) => (
                    <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="py-3 px-4">{rota.data}</td>
                      <td className="py-3 px-4">{rota.rota}</td>
                      <td className="text-right py-3 px-4">{rota.distancia.toFixed(2)} km</td>
                      <td className="text-right py-3 px-4">{rota.tempo} min</td>
                      <td className="text-right py-3 px-4">{rota.combustivel.toFixed(2)} L</td>
                      <td className="text-right py-3 px-4">R$ {rota.custo.toFixed(2)}</td>
                      <td className="text-right py-3 px-4">{rota.colaboradores}</td>
                      <td className="text-center py-3 px-4">
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            rota.status === "concluida"
                              ? "bg-green-100 text-green-700"
                              : rota.status === "em_progresso"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {rota.status === "concluida"
                            ? "Concluída"
                            : rota.status === "em_progresso"
                            ? "Em Progresso"
                            : "Cancelada"}
                        </span>
                      </td>
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
