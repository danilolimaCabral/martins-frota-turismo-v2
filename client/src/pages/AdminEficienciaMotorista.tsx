import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  Users,
  Fuel,
  Zap,
  Download,
  Filter,
} from "lucide-react";
import { Line, Bar, Radar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  RadarController,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { toast } from "sonner";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  RadarController,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface MotoristaEficiencia {
  id: number;
  nome: string;
  placa: string;
  totalKm: number;
  totalLitros: number;
  consumoMedio: number; // km/l
  custoTotal: number;
  custoKm: number;
  viagens: number;
  velocidadeMedia: number;
  aceleracoes: number;
  frenagens: number;
  score: number; // 0-100
  tendencia: "up" | "down" | "stable";
}

export default function AdminEficienciaMotorista() {
  const [, setLocation] = useLocation();
  const [motoristas, setMotoristas] = useState<MotoristaEficiencia[]>([]);
  const [filtro, setFiltro] = useState<"consumo" | "custo" | "seguranca">("consumo");
  const [periodo, setPeriodo] = useState<"7d" | "30d" | "90d">("30d");
  const [loading, setLoading] = useState(true);

  // Dados simulados para demonstração
  useEffect(() => {
    // Simular carregamento de dados
    const dados: MotoristaEficiencia[] = [
      {
        id: 1,
        nome: "João Silva",
        placa: "ABC-1234",
        totalKm: 5420,
        totalLitros: 1850,
        consumoMedio: 2.93,
        custoTotal: 4200,
        custoKm: 0.77,
        viagens: 45,
        velocidadeMedia: 78,
        aceleracoes: 234,
        frenagens: 189,
        score: 92,
        tendencia: "up",
      },
      {
        id: 2,
        nome: "Maria Santos",
        placa: "XYZ-5678",
        totalKm: 4890,
        totalLitros: 1920,
        consumoMedio: 2.55,
        custoTotal: 4350,
        custoKm: 0.89,
        viagens: 42,
        velocidadeMedia: 82,
        aceleracoes: 312,
        frenagens: 267,
        score: 78,
        tendencia: "down",
      },
      {
        id: 3,
        nome: "Carlos Oliveira",
        placa: "DEF-9012",
        totalKm: 6100,
        totalLitros: 1750,
        consumoMedio: 3.49,
        custoTotal: 3950,
        custoKm: 0.65,
        viagens: 52,
        velocidadeMedia: 75,
        aceleracoes: 156,
        frenagens: 134,
        score: 95,
        tendencia: "up",
      },
      {
        id: 4,
        nome: "Ana Costa",
        placa: "GHI-3456",
        totalKm: 4200,
        totalLitros: 1680,
        consumoMedio: 2.5,
        custoTotal: 3800,
        custoKm: 0.9,
        viagens: 38,
        velocidadeMedia: 85,
        aceleracoes: 456,
        frenagens: 398,
        score: 65,
        tendencia: "down",
      },
      {
        id: 5,
        nome: "Roberto Ferreira",
        placa: "JKL-7890",
        totalKm: 5800,
        totalLitros: 1920,
        consumoMedio: 3.02,
        custoTotal: 4350,
        custoKm: 0.75,
        viagens: 48,
        velocidadeMedia: 79,
        aceleracoes: 267,
        frenagens: 212,
        score: 88,
        tendencia: "stable",
      },
    ];

    setTimeout(() => {
      setMotoristas(dados);
      setLoading(false);
    }, 1000);
  }, [periodo]);

  // Ordenar motoristas por filtro
  const motoristasFiltrados = [...motoristas].sort((a, b) => {
    if (filtro === "consumo") return b.consumoMedio - a.consumoMedio;
    if (filtro === "custo") return a.custoKm - b.custoKm;
    return b.score - a.score;
  });

  // Dados para gráfico de comparação de consumo
  const consumoChartData = {
    labels: motoristasFiltrados.map((m) => m.nome),
    datasets: [
      {
        label: "Consumo Médio (km/l)",
        data: motoristasFiltrados.map((m) => m.consumoMedio),
        backgroundColor: motoristasFiltrados.map((m) =>
          m.consumoMedio > 3 ? "#10b981" : m.consumoMedio > 2.5 ? "#f59e0b" : "#ef4444"
        ),
        borderRadius: 8,
      },
    ],
  };

  // Dados para gráfico de custo por km
  const custoChartData = {
    labels: motoristasFiltrados.map((m) => m.nome),
    datasets: [
      {
        label: "Custo por km (R$)",
        data: motoristasFiltrados.map((m) => m.custoKm),
        backgroundColor: motoristasFiltrados.map((m) =>
          m.custoKm < 0.7 ? "#10b981" : m.custoKm < 0.8 ? "#f59e0b" : "#ef4444"
        ),
        borderRadius: 8,
      },
    ],
  };

  // Dados para gráfico de score de eficiência
  const scoreChartData = {
    labels: motoristasFiltrados.map((m) => m.nome),
    datasets: [
      {
        label: "Score de Eficiência (0-100)",
        data: motoristasFiltrados.map((m) => m.score),
        backgroundColor: motoristasFiltrados.map((m) =>
          m.score >= 90 ? "#10b981" : m.score >= 75 ? "#f59e0b" : "#ef4444"
        ),
        borderRadius: 8,
      },
    ],
  };

  // Dados para radar de segurança
  const radarData = {
    labels: ["Consumo", "Custo", "Segurança", "Velocidade", "Eficiência"],
    datasets: motoristasFiltrados.slice(0, 3).map((m, idx) => ({
      label: m.nome,
      data: [
        Math.min(100, (m.consumoMedio / 4) * 100),
        Math.min(100, (1 - m.custoKm / 1) * 100),
        Math.min(100, 100 - (m.aceleracoes + m.frenagens) / 10),
        Math.min(100, (100 - m.velocidadeMedia) * 2),
        m.score,
      ],
      borderColor: ["#3b82f6", "#10b981", "#f59e0b"][idx],
      backgroundColor: ["rgba(59, 130, 246, 0.1)", "rgba(16, 185, 129, 0.1)", "rgba(245, 158, 11, 0.1)"][idx],
    })),
  };

  const handleExportCSV = () => {
    const csv = [
      ["Motorista", "Placa", "Total KM", "Consumo Médio", "Custo/km", "Score", "Tendência"],
      ...motoristasFiltrados.map((m) => [
        m.nome,
        m.placa,
        m.totalKm,
        m.consumoMedio.toFixed(2),
        m.custoKm.toFixed(2),
        m.score,
        m.tendencia,
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `eficiencia-motoristas-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    toast.success("Relatório exportado com sucesso!");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 lg:p-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setLocation("/admin")}
            className="hover:bg-slate-200"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Eficiência de Motoristas</h1>
            <p className="text-slate-600">Análise de consumo, custo e segurança</p>
          </div>
        </div>
        <Button onClick={handleExportCSV} className="gap-2 bg-blue-600 hover:bg-blue-700">
          <Download className="h-4 w-4" />
          Exportar CSV
        </Button>
      </div>

      {/* Filtros */}
      <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Filtrar por</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {[
                { value: "consumo", label: "Consumo (km/l)" },
                { value: "custo", label: "Custo por km" },
                { value: "seguranca", label: "Segurança" },
              ].map((opt) => (
                <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="filtro"
                    value={opt.value}
                    checked={filtro === opt.value}
                    onChange={(e) => setFiltro(e.target.value as any)}
                    className="w-4 h-4"
                  />
                  <span className="text-sm text-slate-700">{opt.label}</span>
                </label>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Período</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {[
                { value: "7d", label: "Últimos 7 dias" },
                { value: "30d", label: "Últimos 30 dias" },
                { value: "90d", label: "Últimos 90 dias" },
              ].map((opt) => (
                <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="periodo"
                    value={opt.value}
                    checked={periodo === opt.value}
                    onChange={(e) => setPeriodo(e.target.value as any)}
                    className="w-4 h-4"
                  />
                  <span className="text-sm text-slate-700">{opt.label}</span>
                </label>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">KPIs Gerais</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">Consumo Médio:</span>
                <span className="font-bold text-slate-900">
                  {(motoristas.reduce((a, b) => a + b.consumoMedio, 0) / motoristas.length).toFixed(2)} km/l
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">Custo Médio:</span>
                <span className="font-bold text-slate-900">
                  R$ {(motoristas.reduce((a, b) => a + b.custoKm, 0) / motoristas.length).toFixed(2)}/km
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">Score Médio:</span>
                <span className="font-bold text-slate-900">
                  {Math.round(motoristas.reduce((a, b) => a + b.score, 0) / motoristas.length)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Fuel className="h-5 w-5 text-blue-600" />
              Consumo Médio por Motorista
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div style={{ height: "300px" }}>
              <Bar
                data={consumoChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { legend: { display: false } },
                }}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-green-600" />
              Custo por Quilômetro
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div style={{ height: "300px" }}>
              <Bar
                data={custoChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { legend: { display: false } },
                }}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-orange-600" />
              Score de Eficiência
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div style={{ height: "300px" }}>
              <Bar
                data={scoreChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { legend: { display: false } },
                }}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-purple-600" />
              Comparação de Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div style={{ height: "300px" }}>
              <Radar
                data={radarData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    r: {
                      max: 100,
                      ticks: { stepSize: 20 },
                    },
                  },
                }}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabela de Motoristas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Ranking de Motoristas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Motorista</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Placa</th>
                  <th className="text-center py-3 px-4 font-semibold text-slate-700">Total KM</th>
                  <th className="text-center py-3 px-4 font-semibold text-slate-700">Consumo (km/l)</th>
                  <th className="text-center py-3 px-4 font-semibold text-slate-700">Custo/km</th>
                  <th className="text-center py-3 px-4 font-semibold text-slate-700">Score</th>
                  <th className="text-center py-3 px-4 font-semibold text-slate-700">Tendência</th>
                </tr>
              </thead>
              <tbody>
                {motoristasFiltrados.map((motorista, idx) => (
                  <tr key={motorista.id} className="border-b border-slate-200 hover:bg-slate-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-600">
                          {idx + 1}
                        </div>
                        <span className="font-medium text-slate-900">{motorista.nome}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-600">{motorista.placa}</td>
                    <td className="py-3 px-4 text-center text-slate-900 font-medium">{motorista.totalKm}</td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          motorista.consumoMedio > 3
                            ? "bg-green-100 text-green-700"
                            : motorista.consumoMedio > 2.5
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {motorista.consumoMedio.toFixed(2)}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          motorista.custoKm < 0.7
                            ? "bg-green-100 text-green-700"
                            : motorista.custoKm < 0.8
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        R$ {motorista.custoKm.toFixed(2)}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          motorista.score >= 90
                            ? "bg-green-100 text-green-700"
                            : motorista.score >= 75
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {motorista.score}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      {motorista.tendencia === "up" && (
                        <TrendingUp className="h-5 w-5 text-green-600 mx-auto" />
                      )}
                      {motorista.tendencia === "down" && (
                        <TrendingDown className="h-5 w-5 text-red-600 mx-auto" />
                      )}
                      {motorista.tendencia === "stable" && (
                        <div className="h-5 w-5 text-slate-400 mx-auto">—</div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Recomendações */}
      <Card className="mt-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-900">Recomendações de Treinamento</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {motoristasFiltrados
              .filter((m) => m.score < 80)
              .map((motorista) => (
                <div key={motorista.id} className="p-3 bg-white rounded-lg border border-blue-100">
                  <p className="font-semibold text-slate-900">
                    {motorista.nome} - Score: {motorista.score}
                  </p>
                  <p className="text-sm text-slate-600 mt-1">
                    {motorista.consumoMedio < 2.5
                      ? `Consumo acima da média. Recomenda-se revisão da técnica de dirigibilidade e manutenção do veículo.`
                      : motorista.custoKm > 0.85
                      ? `Custo por km elevado. Considere treinamento em eficiência de combustível.`
                      : `Score baixo em segurança. Recomenda-se treinamento em direção defensiva.`}
                  </p>
                </div>
              ))}
            {motoristasFiltrados.filter((m) => m.score < 80).length === 0 && (
              <p className="text-slate-600">Todos os motoristas estão com performance satisfatória!</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
