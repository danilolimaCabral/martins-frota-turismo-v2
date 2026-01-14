import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ArrowLeft,
  TrendingDown,
  TrendingUp,
  Clock,
  MapPin,
  Zap,
  Download,
  Trash2,
  Eye,
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface RouteVersion {
  id: number;
  versionNumber: number;
  totalDistance: number;
  estimatedTime: number;
  savings: number;
  savingsPercentage: number;
  changeDescription: string;
  createdAt: string;
}

export default function AdminRotasOtimizadasHistorico() {
  const [, navigate] = useLocation();
  const [selectedRouteId, setSelectedRouteId] = useState<number | null>(null);
  const [versions, setVersions] = useState<RouteVersion[]>([]);

  // Dados de exemplo para demonstração
  const mockVersions: RouteVersion[] = [
    {
      id: 1,
      versionNumber: 1,
      totalDistance: 150.5,
      estimatedTime: 4.5,
      savings: 0,
      savingsPercentage: 0,
      changeDescription: "Rota inicial",
      createdAt: "2025-01-10 10:00",
    },
    {
      id: 2,
      versionNumber: 2,
      totalDistance: 135.2,
      estimatedTime: 4.0,
      savings: 15.3,
      savingsPercentage: 10.1,
      changeDescription: "Otimização com Nearest Neighbor",
      createdAt: "2025-01-10 11:30",
    },
    {
      id: 3,
      versionNumber: 3,
      totalDistance: 128.8,
      estimatedTime: 3.8,
      savings: 21.7,
      savingsPercentage: 14.4,
      changeDescription: "Otimização com 2-opt",
      createdAt: "2025-01-10 13:00",
    },
  ];

  const handleLoadVersions = (routeId: number) => {
    setSelectedRouteId(routeId);
    setVersions(mockVersions);
    toast.success("Histórico de versões carregado!");
  };

  const handleDeleteVersion = (versionId: number) => {
    setVersions(versions.filter((v) => v.id !== versionId));
    toast.success("Versão deletada!");
  };

  const handleExportComparison = () => {
    if (versions.length === 0) {
      toast.error("Nenhuma versão para exportar");
      return;
    }

    const headers = [
      "Versão",
      "Distância (km)",
      "Tempo (h)",
      "Economia (km)",
      "Economia (%)",
      "Descrição",
      "Data",
    ];
    const rows = versions.map((v) => [
      v.versionNumber,
      v.totalDistance.toFixed(2),
      v.estimatedTime.toFixed(2),
      v.savings.toFixed(2),
      v.savingsPercentage.toFixed(2),
      v.changeDescription,
      v.createdAt,
    ]);

    const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `historico-rotas-${selectedRouteId}.csv`;
    a.click();

    toast.success("Comparação exportada em CSV!");
  };

  // Preparar dados para gráfico
  const chartData = versions.map((v) => ({
    versao: `v${v.versionNumber}`,
    distancia: v.totalDistance,
    tempo: v.estimatedTime * 60, // converter para minutos
    economia: v.savings,
  }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/admin")}
            className="hover:bg-white"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              📊 Histórico de Rotas Otimizadas
            </h1>
            <p className="text-gray-600">
              Visualize e compare versões de rotas otimizadas
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar - Seleção de Rota */}
        <div className="lg:col-span-1">
          <Card className="bg-white shadow-lg">
            <CardHeader className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-t-lg">
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Rotas Disponíveis
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              {[
                { id: 1, nome: "Rota Teste", versoes: 3 },
                { id: 2, nome: "Rota com Endereços", versoes: 2 },
                { id: 3, nome: "Rota Status", versoes: 1 },
              ].map((rota) => (
                <button
                  key={rota.id}
                  onClick={() => handleLoadVersions(rota.id)}
                  className={`w-full text-left p-3 rounded-lg transition ${
                    selectedRouteId === rota.id
                      ? "bg-blue-100 border-2 border-blue-500"
                      : "bg-gray-50 hover:bg-gray-100 border-2 border-gray-200"
                  }`}
                >
                  <div className="font-semibold text-gray-900">{rota.nome}</div>
                  <div className="text-sm text-gray-600">
                    {rota.versoes} versões
                  </div>
                </button>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Conteúdo Principal */}
        <div className="lg:col-span-3 space-y-6">
          {selectedRouteId ? (
            <>
              {/* KPIs */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-white shadow-lg">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-600 text-sm">Distância Atual</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {versions.length > 0
                            ? versions[versions.length - 1].totalDistance.toFixed(
                                1
                              )
                            : "0"}
                          km
                        </p>
                      </div>
                      <MapPin className="w-8 h-8 text-blue-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white shadow-lg">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-600 text-sm">Economia Total</p>
                        <p className="text-2xl font-bold text-green-600">
                          {versions.length > 0
                            ? versions[versions.length - 1].savings.toFixed(1)
                            : "0"}
                          km
                        </p>
                      </div>
                      <TrendingDown className="w-8 h-8 text-green-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white shadow-lg">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-600 text-sm">% Economia</p>
                        <p className="text-2xl font-bold text-green-600">
                          {versions.length > 0
                            ? versions[versions.length - 1].savingsPercentage.toFixed(
                                1
                              )
                            : "0"}
                          %
                        </p>
                      </div>
                      <Zap className="w-8 h-8 text-yellow-500" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Gráficos */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="bg-white shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingDown className="w-5 h-5 text-blue-600" />
                      Evolução da Distância
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="versao" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="distancia"
                          stroke="#3b82f6"
                          name="Distância (km)"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card className="bg-white shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-green-600" />
                      Economia Acumulada
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="versao" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="economia" fill="#10b981" name="Economia (km)" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>

              {/* Tabela de Versões */}
              <Card className="bg-white shadow-lg">
                <CardHeader className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-t-lg">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="w-5 h-5" />
                      Histórico de Versões
                    </CardTitle>
                    <Button
                      onClick={handleExportComparison}
                      className="bg-white text-blue-600 hover:bg-gray-100"
                      size="sm"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Exportar CSV
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-100 border-b-2 border-gray-300">
                        <tr>
                          <th className="text-left p-3 font-semibold">Versão</th>
                          <th className="text-left p-3 font-semibold">
                            Distância
                          </th>
                          <th className="text-left p-3 font-semibold">Tempo</th>
                          <th className="text-left p-3 font-semibold">Economia</th>
                          <th className="text-left p-3 font-semibold">%</th>
                          <th className="text-left p-3 font-semibold">
                            Descrição
                          </th>
                          <th className="text-left p-3 font-semibold">Data</th>
                          <th className="text-center p-3 font-semibold">Ações</th>
                        </tr>
                      </thead>
                      <tbody>
                        {versions.map((version) => (
                          <tr
                            key={version.id}
                            className="border-b border-gray-200 hover:bg-gray-50"
                          >
                            <td className="p-3 font-semibold text-blue-600">
                              v{version.versionNumber}
                            </td>
                            <td className="p-3">{version.totalDistance.toFixed(2)} km</td>
                            <td className="p-3">{version.estimatedTime.toFixed(2)}h</td>
                            <td className="p-3 text-green-600 font-semibold">
                              {version.savings.toFixed(2)} km
                            </td>
                            <td className="p-3 text-green-600 font-semibold">
                              {version.savingsPercentage.toFixed(2)}%
                            </td>
                            <td className="p-3 text-gray-700">
                              {version.changeDescription}
                            </td>
                            <td className="p-3 text-gray-600">
                              {version.createdAt}
                            </td>
                            <td className="p-3 flex gap-2 justify-center">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-blue-600 hover:bg-blue-100"
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-600 hover:bg-red-100"
                                onClick={() => handleDeleteVersion(version.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card className="bg-white shadow-lg">
              <CardContent className="p-12 text-center">
                <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">
                  Selecione uma rota para visualizar o histórico de versões
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
