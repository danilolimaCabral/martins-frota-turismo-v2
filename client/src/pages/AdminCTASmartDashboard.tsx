import React, { useState, useEffect } from "react";
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
  Fuel,
  Truck,
  Users,
  Calendar,
  MapPin,
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

interface AbastecimentoRow {
  id: string;
  data: string;
  hora: string;
  placa: string;
  motorista: string;
  combustivel: string;
  litros: number;
  valor: number;
  odometro: number;
  posto: string;
  cidade: string;
}

interface VeiculoRow {
  placa: string;
  marca: string;
  modelo: string;
  ano: number;
  totalLitros: number;
  totalGasto: number;
  consumoMedio: number;
  ultimoAbastecimento: string;
}

interface MotoristasRow {
  id: string;
  nome: string;
  placa: string;
  totalAbastecimentos: number;
  totalLitros: number;
  consumoMedio: number;
  ultimaData: string;
}

export default function AdminCTASmartDashboard() {
  const [, navigate] = useLocation();
  const [token, setToken] = useState("8Uj0tAO8TJ");
  const [dias, setDias] = useState(30);
  const [syncStatus, setSyncStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [syncMessage, setSyncMessage] = useState("");
  const [abastecimentos, setAbastecimentos] = useState<AbastecimentoRow[]>([]);
  const [veiculos, setVeiculos] = useState<VeiculoRow[]>([]);
  const [motoristas, setMotoristas] = useState<MotoristasRow[]>([]);
  const [kpis, setKpis] = useState<any>(null);

  // Queries tRPC
  const abastecimentosQuery = trpc.ctaSmart.listar.useQuery(
    { token, dias, placa: "", combustivel: "" },
    { enabled: !!token }
  );

  const resumoPorVeiculoQuery = trpc.ctaSmart.resumoPorVeiculo.useQuery(
    { token, dias },
    { enabled: !!token }
  );

  const kpisQuery = trpc.ctaSmart.obterKPIs.useQuery(
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
      abastecimentosQuery.refetch();
      resumoPorVeiculoQuery.refetch();
      kpisQuery.refetch();
    },
    onError: (error) => {
      setSyncStatus("error");
      setSyncMessage(error.message || "Erro ao sincronizar");
      setTimeout(() => setSyncStatus("idle"), 3000);
    },
  });

  // Processar dados quando chegam
  useEffect(() => {
    if (abastecimentosQuery.data?.abastecimentos) {
      const dados = abastecimentosQuery.data.abastecimentos.map((item: any, idx: number) => ({
        id: `${idx}`,
        data: new Date(item.data).toLocaleDateString("pt-BR"),
        hora: new Date(item.data).toLocaleTimeString("pt-BR"),
        placa: item.placa || "N/A",
        motorista: item.motorista || "N/A",
        combustivel: item.combustivel || "N/A",
        litros: item.litros || 0,
        valor: item.valor || 0,
        odometro: item.odometro || 0,
        posto: item.posto || "N/A",
        cidade: item.cidade || "N/A",
      }));
      setAbastecimentos(dados);
    }
  }, [abastecimentosQuery.data]);

  // Processar resumo por veículo
  useEffect(() => {
    if (resumoPorVeiculoQuery.data?.resumo) {
      const dados = resumoPorVeiculoQuery.data.resumo.map((item: any) => ({
        placa: item.placa || "N/A",
        marca: "Volvo",
        modelo: "FH 540",
        ano: 2022,
        totalLitros: item.totalLitros || 0,
        totalGasto: item.totalGasto || 0,
        consumoMedio: item.consumoMedio || 0,
        ultimoAbastecimento: new Date(item.ultimoAbastecimento).toLocaleDateString("pt-BR"),
      }));
      setVeiculos(dados);
    }
  }, [resumoPorVeiculoQuery.data]);

  // Processar motoristas
  useEffect(() => {
    if (abastecimentosQuery.data?.abastecimentos) {
      const motoristasMap = new Map<string, any>();
      
      abastecimentosQuery.data.abastecimentos.forEach((item: any) => {
        const motorista = item.motorista || "N/A";
        if (!motoristasMap.has(motorista)) {
          motoristasMap.set(motorista, {
            nome: motorista,
            placa: item.placa || "N/A",
            totalAbastecimentos: 0,
            totalLitros: 0,
            consumoMedio: 0,
            ultimaData: new Date().toLocaleDateString("pt-BR"),
          });
        }
        const data = motoristasMap.get(motorista);
        data.totalAbastecimentos += 1;
        data.totalLitros += item.litros || 0;
        data.ultimaData = new Date(item.data).toLocaleDateString("pt-BR");
      });

      const motoristasArray = Array.from(motoristasMap.values()).map((m: any, idx: number) => ({
        id: `${idx}`,
        ...m,
        consumoMedio: m.totalLitros / Math.max(m.totalAbastecimentos, 1),
      }));
      setMotoristas(motoristasArray);
    }
  }, [abastecimentosQuery.data]);

  // Processar KPIs
  useEffect(() => {
    if (kpisQuery.data) {
      setKpis(kpisQuery.data);
    }
  }, [kpisQuery.data]);

  const handleSincronizar = () => {
    setSyncStatus("loading");
    sincronizarMutation.mutate({ token, dias });
  };

  const exportarCSV = () => {
    if (abastecimentos.length === 0) return;

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

    const rows = abastecimentos.map((a) => [
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

  const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <Button
            onClick={() => navigate("/admin")}
            variant="outline"
            className="border-2 border-slate-600 hover:bg-slate-700 text-white"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <h1 className="text-3xl font-bold text-white">⛽ Dashboard CTA Smart</h1>
          <Button
            onClick={handleSincronizar}
            disabled={syncStatus === "loading"}
            className="bg-blue-500 hover:bg-blue-600"
          >
            {syncStatus === "loading" ? (
              <>
                <Loader className="h-4 w-4 mr-2 animate-spin" />
                Sincronizando...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Sincronizar
              </>
            )}
          </Button>
        </div>

        {/* Status Message */}
        {syncStatus !== "idle" && (
          <div
            className={`mb-6 p-4 rounded-lg border-2 ${
              syncStatus === "success"
                ? "bg-green-500/10 border-green-500/30 text-green-300"
                : syncStatus === "error"
                ? "bg-red-500/10 border-red-500/30 text-red-300"
                : "bg-blue-500/10 border-blue-500/30 text-blue-300"
            }`}
          >
            {syncStatus === "success" && <CheckCircle className="h-5 w-5 inline mr-2" />}
            {syncStatus === "error" && <AlertCircle className="h-5 w-5 inline mr-2" />}
            {syncStatus === "loading" && <Loader className="h-5 w-5 inline mr-2 animate-spin" />}
            {syncMessage}
          </div>
        )}

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 border-0 shadow-xl">
            <CardContent className="pt-6">
              <div className="text-center">
                <Droplet className="h-8 w-8 mx-auto mb-2 text-white opacity-80" />
                <p className="text-sm text-blue-100">Total Litros</p>
                <p className="text-3xl font-bold text-white">{kpis?.totalLitros?.toFixed(1) || "0"} L</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-green-600 border-0 shadow-xl">
            <CardContent className="pt-6">
              <div className="text-center">
                <DollarSign className="h-8 w-8 mx-auto mb-2 text-white opacity-80" />
                <p className="text-sm text-green-100">Custo Total</p>
                <p className="text-3xl font-bold text-white">R$ {kpis?.custoTotal?.toFixed(2) || "0"}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-500 to-yellow-600 border-0 shadow-xl">
            <CardContent className="pt-6">
              <div className="text-center">
                <TrendingDown className="h-8 w-8 mx-auto mb-2 text-white opacity-80" />
                <p className="text-sm text-yellow-100">Preço Médio</p>
                <p className="text-3xl font-bold text-white">R$ {kpis?.precoMedio?.toFixed(2) || "0"}/L</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 border-0 shadow-xl">
            <CardContent className="pt-6">
              <div className="text-center">
                <Zap className="h-8 w-8 mx-auto mb-2 text-white opacity-80" />
                <p className="text-sm text-purple-100">Registros</p>
                <p className="text-3xl font-bold text-white">{kpis?.totalRegistros || "0"}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Gráfico de Combustível */}
          <Card className="bg-slate-800/50 backdrop-blur border-slate-700 border shadow-2xl">
            <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-t-lg">
              <CardTitle className="flex items-center gap-2">
                <Fuel className="h-5 w-5" />
                Consumo por Combustível
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={kpis?.porCombustivel || []}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value.toFixed(1)}L`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="totalLitros"
                  >
                    {(kpis?.porCombustivel || []).map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `${value.toFixed(2)}L`} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Gráfico de Custo */}
          <Card className="bg-slate-800/50 backdrop-blur border-slate-700 border shadow-2xl">
            <CardHeader className="bg-gradient-to-r from-green-500 to-blue-600 text-white rounded-t-lg">
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Custo por Combustível
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={kpis?.porCombustivel || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                  <XAxis dataKey="combustivel" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #475569" }}
                    formatter={(value) => `R$ ${value.toFixed(2)}`}
                  />
                  <Bar dataKey="totalGasto" fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Tabelas */}
        <div className="space-y-6">
          {/* Tabela de Abastecimentos */}
          <Card className="bg-slate-800/50 backdrop-blur border-slate-700 border shadow-2xl">
            <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-t-lg flex justify-between items-center">
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Abastecimentos Recentes
              </CardTitle>
              <Button
                size="sm"
                onClick={exportarCSV}
                className="bg-blue-500 hover:bg-blue-600"
              >
                <Download className="h-4 w-4 mr-2" />
                Exportar CSV
              </Button>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-gray-300">
                  <thead className="border-b border-slate-600">
                    <tr>
                      <th className="text-left py-3 px-4 font-semibold">Data</th>
                      <th className="text-left py-3 px-4 font-semibold">Hora</th>
                      <th className="text-left py-3 px-4 font-semibold">Placa</th>
                      <th className="text-left py-3 px-4 font-semibold">Motorista</th>
                      <th className="text-left py-3 px-4 font-semibold">Combustível</th>
                      <th className="text-right py-3 px-4 font-semibold">Litros</th>
                      <th className="text-right py-3 px-4 font-semibold">Valor</th>
                      <th className="text-left py-3 px-4 font-semibold">Posto</th>
                    </tr>
                  </thead>
                  <tbody>
                    {abastecimentos.slice(0, 20).map((item) => (
                      <tr key={item.id} className="border-b border-slate-700 hover:bg-slate-700/50">
                        <td className="py-3 px-4">{item.data}</td>
                        <td className="py-3 px-4">{item.hora}</td>
                        <td className="py-3 px-4 font-semibold text-blue-400">{item.placa}</td>
                        <td className="py-3 px-4">{item.motorista}</td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-500/20 text-yellow-300">
                            {item.combustivel}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">{item.litros.toFixed(2)} L</td>
                        <td className="py-3 px-4 text-right text-green-400">R$ {item.valor.toFixed(2)}</td>
                        <td className="py-3 px-4 text-xs">{item.posto}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {abastecimentos.length === 0 && (
                <div className="text-center py-8 text-gray-400">
                  <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>Nenhum abastecimento encontrado. Clique em "Sincronizar" para trazer dados.</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Tabela de Veículos */}
          <Card className="bg-slate-800/50 backdrop-blur border-slate-700 border shadow-2xl">
            <CardHeader className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-t-lg">
              <CardTitle className="flex items-center gap-2">
                <Truck className="h-5 w-5" />
                Resumo por Veículo
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-gray-300">
                  <thead className="border-b border-slate-600">
                    <tr>
                      <th className="text-left py-3 px-4 font-semibold">Placa</th>
                      <th className="text-left py-3 px-4 font-semibold">Marca/Modelo</th>
                      <th className="text-right py-3 px-4 font-semibold">Total Litros</th>
                      <th className="text-right py-3 px-4 font-semibold">Total Gasto</th>
                      <th className="text-right py-3 px-4 font-semibold">Consumo Médio</th>
                      <th className="text-left py-3 px-4 font-semibold">Último Abastecimento</th>
                    </tr>
                  </thead>
                  <tbody>
                    {veiculos.map((veiculo) => (
                      <tr key={veiculo.placa} className="border-b border-slate-700 hover:bg-slate-700/50">
                        <td className="py-3 px-4 font-semibold text-blue-400">{veiculo.placa}</td>
                        <td className="py-3 px-4">{veiculo.marca} {veiculo.modelo}</td>
                        <td className="py-3 px-4 text-right">{veiculo.totalLitros.toFixed(2)} L</td>
                        <td className="py-3 px-4 text-right text-green-400">R$ {veiculo.totalGasto.toFixed(2)}</td>
                        <td className="py-3 px-4 text-right">{veiculo.consumoMedio.toFixed(2)} L/abast</td>
                        <td className="py-3 px-4">{veiculo.ultimoAbastecimento}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {veiculos.length === 0 && (
                <div className="text-center py-8 text-gray-400">
                  <Truck className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>Nenhum veículo encontrado.</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Tabela de Motoristas */}
          <Card className="bg-slate-800/50 backdrop-blur border-slate-700 border shadow-2xl">
            <CardHeader className="bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-t-lg">
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Resumo por Motorista
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-gray-300">
                  <thead className="border-b border-slate-600">
                    <tr>
                      <th className="text-left py-3 px-4 font-semibold">Motorista</th>
                      <th className="text-left py-3 px-4 font-semibold">Placa</th>
                      <th className="text-right py-3 px-4 font-semibold">Abastecimentos</th>
                      <th className="text-right py-3 px-4 font-semibold">Total Litros</th>
                      <th className="text-right py-3 px-4 font-semibold">Consumo Médio</th>
                      <th className="text-left py-3 px-4 font-semibold">Última Data</th>
                    </tr>
                  </thead>
                  <tbody>
                    {motoristas.map((motorista) => (
                      <tr key={motorista.id} className="border-b border-slate-700 hover:bg-slate-700/50">
                        <td className="py-3 px-4 font-semibold">{motorista.nome}</td>
                        <td className="py-3 px-4 text-blue-400">{motorista.placa}</td>
                        <td className="py-3 px-4 text-right">{motorista.totalAbastecimentos}</td>
                        <td className="py-3 px-4 text-right">{motorista.totalLitros.toFixed(2)} L</td>
                        <td className="py-3 px-4 text-right">{motorista.consumoMedio.toFixed(2)} L/abast</td>
                        <td className="py-3 px-4">{motorista.ultimaData}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {motoristas.length === 0 && (
                <div className="text-center py-8 text-gray-400">
                  <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>Nenhum motorista encontrado.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
