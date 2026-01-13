import { useEffect, useRef } from "react";
import Chart from "chart.js/auto";
import { TrendingUp, BarChart3, PieChart as PieChartIcon } from "lucide-react";

interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    borderColor?: string;
    backgroundColor?: string | string[];
    fill?: boolean;
    tension?: number;
    borderWidth?: number;
  }[];
}

export function DashboardCharts() {
  const revenueChartRef = useRef<HTMLCanvasElement>(null);
  const costsChartRef = useRef<HTMLCanvasElement>(null);
  const utilizationChartRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    // Gráfico de Receita Mensal
    if (revenueChartRef.current) {
      const ctx = revenueChartRef.current.getContext("2d");
      if (ctx) {
        new Chart(ctx, {
          type: "line",
          data: {
            labels: ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun"],
            datasets: [
              {
                label: "Receita (R$ mil)",
                data: [32, 38, 35, 42, 45, 48],
                borderColor: "#3b82f6",
                backgroundColor: "rgba(59, 130, 246, 0.1)",
                fill: true,
                tension: 0.4,
                borderWidth: 3,
                pointBackgroundColor: "#3b82f6",
                pointBorderColor: "#fff",
                pointBorderWidth: 2,
                pointRadius: 5,
                pointHoverRadius: 7,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
              legend: {
                display: true,
                position: "top" as const,
                labels: {
                  usePointStyle: true,
                  padding: 15,
                  font: { size: 12, weight: "600" },
                  color: "#64748b",
                },
              },
              tooltip: {
                backgroundColor: "rgba(0, 0, 0, 0.8)",
                padding: 12,
                titleFont: { size: 13, weight: "bold" },
                bodyFont: { size: 12 },
                borderColor: "#3b82f6",
                borderWidth: 1,
              },
            },
            scales: {
              y: {
                beginAtZero: true,
                max: 50,
                grid: {
                  color: "rgba(100, 116, 139, 0.1)",
                  drawBorder: false,
                },
                ticks: {
                  color: "#64748b",
                  font: { size: 11 },
                  callback: function (value) {
                    return "R$ " + value + "k";
                  },
                },
              },
              x: {
                grid: { display: false },
                ticks: {
                  color: "#64748b",
                  font: { size: 11 },
                },
              },
            },
          },
        });
      }
    }

    // Gráfico de Custos Operacionais
    if (costsChartRef.current) {
      const ctx = costsChartRef.current.getContext("2d");
      if (ctx) {
        new Chart(ctx, {
          type: "bar",
          data: {
            labels: ["Combustível", "Manutenção", "Pessoal", "Seguro", "Outros"],
            datasets: [
              {
                label: "Custos (R$ mil)",
                data: [35, 18, 28, 12, 7],
                backgroundColor: [
                  "#f97316",
                  "#ef4444",
                  "#8b5cf6",
                  "#06b6d4",
                  "#14b8a6",
                ],
                borderRadius: 8,
                borderSkipped: false,
              },
            ],
          },
          options: {
            indexAxis: "y" as const,
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
              legend: {
                display: true,
                position: "top" as const,
                labels: {
                  usePointStyle: true,
                  padding: 15,
                  font: { size: 12, weight: "600" },
                  color: "#64748b",
                },
              },
              tooltip: {
                backgroundColor: "rgba(0, 0, 0, 0.8)",
                padding: 12,
                titleFont: { size: 13, weight: "bold" },
                bodyFont: { size: 12 },
                callbacks: {
                  label: function (context) {
                    return "R$ " + context.parsed.x + "k";
                  },
                },
              },
            },
            scales: {
              x: {
                beginAtZero: true,
                max: 40,
                grid: {
                  color: "rgba(100, 116, 139, 0.1)",
                  drawBorder: false,
                },
                ticks: {
                  color: "#64748b",
                  font: { size: 11 },
                  callback: function (value) {
                    return "R$ " + value + "k";
                  },
                },
              },
              y: {
                grid: { display: false },
                ticks: {
                  color: "#64748b",
                  font: { size: 11 },
                },
              },
            },
          },
        });
      }
    }

    // Gráfico de Utilização de Frota
    if (utilizationChartRef.current) {
      const ctx = utilizationChartRef.current.getContext("2d");
      if (ctx) {
        new Chart(ctx, {
          type: "doughnut",
          data: {
            labels: ["Ativa", "Manutenção", "Parada", "Reserva"],
            datasets: [
              {
                data: [42, 3, 2, 1],
                backgroundColor: [
                  "#10b981",
                  "#f97316",
                  "#ef4444",
                  "#94a3b8",
                ],
                borderColor: "#fff",
                borderWidth: 2,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
              legend: {
                display: true,
                position: "bottom" as const,
                labels: {
                  usePointStyle: true,
                  padding: 15,
                  font: { size: 12, weight: "600" },
                  color: "#64748b",
                },
              },
              tooltip: {
                backgroundColor: "rgba(0, 0, 0, 0.8)",
                padding: 12,
                titleFont: { size: 13, weight: "bold" },
                bodyFont: { size: 12 },
                callbacks: {
                  label: function (context) {
                    const total = context.dataset.data.reduce(
                      (a: number, b: number) => a + b,
                      0
                    );
                    const percentage = (
                      ((context.parsed as number) / total) *
                      100
                    ).toFixed(1);
                    return (
                      context.label +
                      ": " +
                      context.parsed +
                      " (" +
                      percentage +
                      "%)"
                    );
                  },
                },
              },
            },
          },
        });
      }
    }
  }, []);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-900">Análise Visual</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Receita Mensal */}
        <div className="bg-white rounded-xl p-6 border border-slate-200/50 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-blue-500" />
            <h3 className="font-semibold text-slate-900">Receita Mensal</h3>
          </div>
          <p className="text-xs text-slate-500 mb-4">
            Tendência de receita dos últimos 6 meses
          </p>
          <div className="relative h-64">
            <canvas ref={revenueChartRef}></canvas>
          </div>
        </div>

        {/* Custos Operacionais */}
        <div className="bg-white rounded-xl p-6 border border-slate-200/50 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-5 h-5 text-orange-500" />
            <h3 className="font-semibold text-slate-900">Custos Operacionais</h3>
          </div>
          <p className="text-xs text-slate-500 mb-4">
            Distribuição de custos por categoria
          </p>
          <div className="relative h-64">
            <canvas ref={costsChartRef}></canvas>
          </div>
        </div>
      </div>

      {/* Utilização de Frota */}
      <div className="bg-white rounded-xl p-6 border border-slate-200/50 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center gap-2 mb-4">
          <PieChartIcon className="w-5 h-5 text-green-500" />
          <h3 className="font-semibold text-slate-900">Utilização de Frota</h3>
        </div>
        <p className="text-xs text-slate-500 mb-4">
          Status atual dos 48 veículos da frota
        </p>
        <div className="relative h-64 flex items-center justify-center">
          <canvas ref={utilizationChartRef}></canvas>
        </div>
      </div>

      {/* Legenda de Cálculos */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <h4 className="font-semibold text-slate-900 mb-2">📊 Legenda de Cálculos</h4>
        <ul className="text-sm text-slate-700 space-y-1">
          <li>
            <strong>Receita Mensal:</strong> Soma de todas as viagens realizadas no mês
          </li>
          <li>
            <strong>Custos Operacionais:</strong> Combustível, manutenção, pessoal, seguro e outros
          </li>
          <li>
            <strong>Utilização de Frota:</strong> Percentual de veículos em cada status operacional
          </li>
        </ul>
      </div>
    </div>
  );
}
