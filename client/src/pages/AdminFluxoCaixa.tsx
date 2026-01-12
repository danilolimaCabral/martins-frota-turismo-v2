import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { TrendingUp, TrendingDown, Wallet, BarChart3 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend);

export default function AdminFluxoCaixa() {
  const [dataInicio, setDataInicio] = useState(
    new Date(new Date().getFullYear(), 0, 1).toISOString().split("T")[0]
  );
  const [dataFim, setDataFim] = useState(
    new Date().toISOString().split("T")[0]
  );

  const { data: fluxoData } = trpc.fluxoCaixa.getSummary.useQuery(
    { dataInicio, dataFim },
    { enabled: !!dataInicio && !!dataFim }
  );

  const { data: monthlyData } = trpc.fluxoCaixa.dadosMensais.useQuery(
    { ano: new Date().getFullYear() },
    { enabled: true }
  );

  const { data: entradas } = trpc.fluxoCaixa.detalhesEntradas.useQuery(
    { dataInicio, dataFim },
    { enabled: !!dataInicio && !!dataFim }
  );

  const { data: saidas } = trpc.fluxoCaixa.detalhesSaidas.useQuery(
    { dataInicio, dataFim },
    { enabled: !!dataInicio && !!dataFim }
  );

  // Preparar dados para gráfico de linha
  const lineChartData = {
    labels: monthlyData?.map(m => {
      const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
      return monthNames[m.mes - 1];
    }) || [],
    datasets: [
      {
        label: 'Entradas',
        data: monthlyData?.map(m => m.entradas) || [],
        borderColor: '#22c55e',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        tension: 0.4,
        fill: true,
      },
      {
        label: 'Saídas',
        data: monthlyData?.map(m => m.saidas) || [],
        borderColor: '#ef4444',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        tension: 0.4,
        fill: true,
      },
      {
        label: 'Saldo',
        data: monthlyData?.map(m => m.saldo) || [],
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        fill: true,
      },
    ],
  };

  // Preparar dados para gráfico de barras
  const barChartData = {
    labels: monthlyData?.map(m => {
      const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
      return monthNames[m.mes - 1];
    }) || [],
    datasets: [
      {
        label: 'Entradas',
        data: monthlyData?.map(m => m.entradas) || [],
        backgroundColor: '#22c55e',
      },
      {
        label: 'Saídas',
        data: monthlyData?.map(m => m.saidas) || [],
        backgroundColor: '#ef4444',
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg">
            <Wallet className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900">Fluxo de Caixa</h1>
        </div>
        <p className="text-slate-600">Análise de entradas e saídas de caixa</p>
      </div>

      <div className="mb-6 flex flex-col md:flex-row gap-3">
        <div className="flex-1">
          <label className="block text-sm font-medium text-slate-700 mb-2">Data Início</label>
          <Input
            type="date"
            value={dataInicio}
            onChange={(e) => setDataInicio(e.target.value)}
          />
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium text-slate-700 mb-2">Data Fim</label>
          <Input
            type="date"
            value={dataFim}
            onChange={(e) => setDataFim(e.target.value)}
          />
        </div>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600">Entradas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-green-600">
                  R$ {(fluxoData?.entradas || 0).toLocaleString("pt-BR", { maximumFractionDigits: 2 })}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600">Saídas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-red-600">
                  R$ {(fluxoData?.saidas || 0).toLocaleString("pt-BR", { maximumFractionDigits: 2 })}
                </p>
              </div>
              <div className="p-3 bg-red-100 rounded-lg">
                <TrendingDown className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600">Saldo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-2xl font-bold ${(fluxoData?.saldo || 0) >= 0 ? "text-blue-600" : "text-red-600"}`}>
                  R$ {(fluxoData?.saldo || 0).toLocaleString("pt-BR", { maximumFractionDigits: 2 })}
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Wallet className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600">Período</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-600">
                  {new Date(dataInicio).toLocaleDateString("pt-BR")} a {new Date(dataFim).toLocaleDateString("pt-BR")}
                </p>
              </div>
              <div className="p-3 bg-slate-100 rounded-lg">
                <BarChart3 className="h-6 w-6 text-slate-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Fluxo Mensal (Linha)</CardTitle>
          </CardHeader>
          <CardContent>
            <div style={{ height: '300px' }}>
              <Line data={lineChartData} options={chartOptions} />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Entradas vs Saídas (Barras)</CardTitle>
          </CardHeader>
          <CardContent>
            <div style={{ height: '300px' }}>
              <Bar data={barChartData} options={chartOptions} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabelas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Entradas do Período</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-100">
                  <tr>
                    <th className="px-4 py-2 text-left">Descrição</th>
                    <th className="px-4 py-2 text-right">Valor</th>
                  </tr>
                </thead>
                <tbody>
                  {entradas && entradas.length > 0 ? (
                    entradas.map((e: any, idx: number) => (
                      <tr key={idx} className="border-b hover:bg-slate-50">
                        <td className="px-4 py-2">{e.descricao}</td>
                        <td className="px-4 py-2 text-right text-green-600 font-semibold">
                          R$ {parseFloat(e.valor).toLocaleString("pt-BR", { maximumFractionDigits: 2 })}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={2} className="px-4 py-8 text-center text-slate-500">
                        Nenhuma entrada encontrada
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Saídas do Período</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-100">
                  <tr>
                    <th className="px-4 py-2 text-left">Descrição</th>
                    <th className="px-4 py-2 text-right">Valor</th>
                  </tr>
                </thead>
                <tbody>
                  {saidas && saidas.length > 0 ? (
                    saidas.map((s: any, idx: number) => (
                      <tr key={idx} className="border-b hover:bg-slate-50">
                        <td className="px-4 py-2">{s.descricao}</td>
                        <td className="px-4 py-2 text-right text-red-600 font-semibold">
                          R$ {parseFloat(s.valor).toLocaleString("pt-BR", { maximumFractionDigits: 2 })}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={2} className="px-4 py-8 text-center text-slate-500">
                        Nenhuma saída encontrada
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
