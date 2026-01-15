import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLocation } from "wouter";
import {
  ArrowLeft,
  Droplet,
  DollarSign,
  TrendingDown,
  Zap,
  Download,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Loader,
} from "lucide-react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { trpc } from "@/lib/trpc";

export default function AdminControleAbastecimentoReal() {
  const [, navigate] = useLocation();
  const [token, setToken] = useState("8Uj0tAO8TJ");
  const [dias, setDias] = useState(30);
  const [filtroPlaca, setFiltroPlaca] = useState("");
  const [filtroCombustivel, setFiltroCombustivel] = useState("");
  const [syncStatus, setSyncStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [syncMessage, setSyncMessage] = useState("");

  // Queries tRPC
  const kpisQuery = trpc.ctaSmart.obterKPIs.useQuery(
    { token, dias },
    { enabled: !!token }
  );

  const abastecimentosQuery = trpc.ctaSmart.listar.useQuery(
    { token, dias, placa: filtroPlaca, combustivel: filtroCombustivel },
    { enabled: !!token }
  );

  const resumoPorVeiculoQuery = trpc.ctaSmart.resumoPorVeiculo.useQuery(
    { token, dias },
    { enabled: !!token }
  );

  const estatisticasCombustivelQuery = trpc.ctaSmart.estatisticasPorCombustivel.useQuery(
    { token, dias },
    { enabled: !!token }
  );

  // Mutation para sincronizar
  const sincronizarMutation = trpc.ctaSmart.sincronizar.useMutation({
    onSuccess: (data) => {
      setSyncStatus("success");
      setSyncMessage(data.mensagem);
      setTimeout(() => setSyncStatus("idle"), 3000);
      // Invalidar queries
      kpisQuery.refetch();
      abastecimentosQuery.refetch();
      resumoPorVeiculoQuery.refetch();
      estatisticasCombustivelQuery.refetch();
    },
    onError: (error) => {
      setSyncStatus("error");
      setSyncMessage(error.message || "Erro ao sincronizar");
      setTimeout(() => setSyncStatus("idle"), 3000);
    },
  });

  const handleSincronizar = () => {
    setSyncStatus("loading");
    // Calcular dataInicio baseado nos dias
    const dataFim = new Date().toISOString().split('T')[0];
    const dataInicio = new Date(Date.now() - dias * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    sincronizarMutation.mutate({ token, dataInicio, dataFim });
  };

  const exportarCSV = () => {
    if (!abastecimentosQuery.data?.abastecimentos) return;

    const headers = [
      "Data",
      "Hora",
      "Placa",
      "Motorista",
      "Combustível",
      "Litros",
      "Valor",
      "Odômetro",
      "Posto",
      "Cidade",
    ];
    const rows = abastecimentosQuery.data.abastecimentos.map((a) => [
      a.data,
      a.hora,
      a.placa,
      a.motorista,
      a.combustivel,
      a.litros.toFixed(2),
      a.valor.toFixed(2),
      a.odometro,
      a.posto,
      a.cidade,
    ]);

    const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `abastecimentos-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  };

  const kpis = kpisQuery.data;
  const abastecimentos = abastecimentosQuery.data?.abastecimentos || [];
  const resumoVeiculos = resumoPorVeiculoQuery.data?.resumo || [];
  const estatisticasCombustivel = estatisticasCombustivelQuery.data?.estatisticas || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <Button
          onClick={() => navigate("/admin")}
          variant="outline"
          className="mb-6 border-2 border-slate-600 hover:bg-slate-700 text-white"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">⛽ Controle de Abastecimento</h1>
          <p className="text-gray-300">Sincronize dados reais da API CTA Smart</p>
        </div>

        {/* Status de Sincronização */}
        {syncStatus !== "idle" && (
          <Card
            className={`mb-6 border-2 ${
              syncStatus === "loading"
                ? "bg-blue-900/20 border-blue-600"
                : syncStatus === "success"
                ? "bg-green-900/20 border-green-600"
                : "bg-red-900/20 border-red-600"
            }`}
          >
            <CardContent className="pt-4 flex items-center gap-3">
              {syncStatus === "loading" && <Loader className="h-5 w-5 animate-spin text-blue-400" />}
              {syncStatus === "success" && <CheckCircle className="h-5 w-5 text-green-400" />}
              {syncStatus === "error" && <AlertCircle className="h-5 w-5 text-red-400" />}
              <span
                className={
                  syncStatus === "loading"
                    ? "text-blue-300"
                    : syncStatus === "success"
                    ? "text-green-300"
                    : "text-red-300"
                }
              >
                {syncMessage}
              </span>
            </CardContent>
          </Card>
        )}

        {/* Configuração */}
        <Card className="bg-slate-800 border-slate-700 mb-8">
          <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-t-lg">
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Configuração de Sincronização
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Token CTA Smart</label>
                <Input
                  type="password"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  className="bg-slate-700 border-slate-600 text-white"
                  placeholder="Token da API"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Dias para Sincronizar</label>
                <Input
                  type="number"
                  value={dias}
                  onChange={(e) => setDias(parseInt(e.target.value))}
                  className="bg-slate-700 border-slate-600 text-white"
                  min="1"
                  max="365"
                />
              </div>
              <div className="flex items-end">
                <Button
                  onClick={handleSincronizar}
                  disabled={syncStatus === "loading"}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${syncStatus === "loading" ? "animate-spin" : ""}`} />
                  {syncStatus === "loading" ? "Sincronizando..." : "Sincronizar CTA Smart"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* KPIs */}
        {kpis && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card className="bg-gradient-to-br from-blue-900 to-blue-800 border-blue-700">
              <CardContent className="pt-6">
                <div className="text-center">
                  <Droplet className="h-8 w-8 text-blue-300 mx-auto mb-2" />
                  <p className="text-sm text-blue-200">Total de Litros</p>
                  <p className="text-3xl font-bold text-white">{kpis.totalLitros.toFixed(0)}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-900 to-green-800 border-green-700">
              <CardContent className="pt-6">
                <div className="text-center">
                  <DollarSign className="h-8 w-8 text-green-300 mx-auto mb-2" />
                  <p className="text-sm text-green-200">Custo Total</p>
                  <p className="text-3xl font-bold text-white">R$ {kpis.custoTotal.toFixed(2)}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-900 to-purple-800 border-purple-700">
              <CardContent className="pt-6">
                <div className="text-center">
                  <TrendingDown className="h-8 w-8 text-purple-300 mx-auto mb-2" />
                  <p className="text-sm text-purple-200">Preço Médio/L</p>
                  <p className="text-3xl font-bold text-white">R$ {kpis.precoMedio.toFixed(2)}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-900 to-orange-800 border-orange-700">
              <CardContent className="pt-6">
                <div className="text-center">
                  <Zap className="h-8 w-8 text-orange-300 mx-auto mb-2" />
                  <p className="text-sm text-orange-200">Registros</p>
                  <p className="text-3xl font-bold text-white">{kpis.registros}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Consumo por Veículo */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <BarChart className="h-5 w-5 text-blue-400" />
                Consumo por Veículo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={resumoVeiculos.slice(0, 10)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                  <XAxis dataKey="placa" stroke="#cbd5e1" />
                  <YAxis stroke="#cbd5e1" />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #475569" }}
                    labelStyle={{ color: "#fff" }}
                  />
                  <Bar dataKey="litros" fill="#3b82f6" name="Litros" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Custo por Combustível */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <PieChart className="h-5 w-5 text-green-400" />
                Distribuição por Combustível
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={estatisticasCombustivel}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ combustivel, litros }) => `${combustivel}: ${litros.toFixed(0)}L`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="litros"
                  >
                    {estatisticasCombustivel.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={["#3b82f6", "#10b981", "#f59e0b", "#ef4444"][index % 4]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #475569" }}
                    labelStyle={{ color: "#fff" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Filtros */}
        <Card className="bg-slate-800 border-slate-700 mb-8">
          <CardHeader>
            <CardTitle className="text-white">Filtros</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Placa do Veículo</label>
                <Input
                  value={filtroPlaca}
                  onChange={(e) => setFiltroPlaca(e.target.value)}
                  className="bg-slate-700 border-slate-600 text-white"
                  placeholder="Ex: MVT-001"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Combustível</label>
                <Input
                  value={filtroCombustivel}
                  onChange={(e) => setFiltroCombustivel(e.target.value)}
                  className="bg-slate-700 border-slate-600 text-white"
                  placeholder="Ex: Diesel"
                />
              </div>
              <div className="flex items-end">
                <Button
                  onClick={() => exportarCSV()}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Exportar CSV
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabela de Abastecimentos */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Últimos Abastecimentos</CardTitle>
          </CardHeader>
          <CardContent>
            {abastecimentosQuery.isLoading ? (
              <div className="flex justify-center py-8">
                <Loader className="h-8 w-8 animate-spin text-blue-400" />
              </div>
            ) : abastecimentos.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <AlertCircle className="h-8 w-8 mx-auto mb-2" />
                <p>Nenhum abastecimento encontrado</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-gray-300">
                  <thead className="border-b border-slate-600">
                    <tr>
                      <th className="text-left py-3 px-4 font-semibold">Data/Hora</th>
                      <th className="text-left py-3 px-4 font-semibold">Placa</th>
                      <th className="text-left py-3 px-4 font-semibold">Motorista</th>
                      <th className="text-left py-3 px-4 font-semibold">Combustível</th>
                      <th className="text-left py-3 px-4 font-semibold">Litros</th>
                      <th className="text-left py-3 px-4 font-semibold">Valor</th>
                      <th className="text-left py-3 px-4 font-semibold">Posto</th>
                      <th className="text-left py-3 px-4 font-semibold">Cidade</th>
                    </tr>
                  </thead>
                  <tbody>
                    {abastecimentos.map((a, idx) => (
                      <tr key={idx} className="border-b border-slate-700 hover:bg-slate-700/50">
                        <td className="py-3 px-4 font-medium text-white">
                          {a.data} {a.hora}
                        </td>
                        <td className="py-3 px-4">{a.placa}</td>
                        <td className="py-3 px-4">{a.motorista}</td>
                        <td className="py-3 px-4">
                          <span className="bg-blue-500/20 text-blue-300 px-2 py-1 rounded text-xs">
                            {a.combustivel}
                          </span>
                        </td>
                        <td className="py-3 px-4">{a.litros.toFixed(2)}L</td>
                        <td className="py-3 px-4 font-semibold">R$ {a.valor.toFixed(2)}</td>
                        <td className="py-3 px-4">{a.posto}</td>
                        <td className="py-3 px-4">{a.cidade}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
