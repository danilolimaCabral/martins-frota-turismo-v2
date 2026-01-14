import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLocation } from "wouter";
import {
  ArrowLeft,
  Droplet,
  DollarSign,
  TrendingUp,
  Database,
  RefreshCw,
  Download,
  Filter,
  AlertCircle,
} from "lucide-react";
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

interface KPIs {
  totalLitros: number;
  totalCusto: number;
  precoMedio: number;
  totalRegistros: number;
}

interface Abastecimento {
  id: number;
  veiculo: string;
  data: string;
  km: number;
  litros: number;
  valorLitro: number;
  valorTotal: number;
  tipoCombustivel: string;
  posto: string;
  cidade: string;
}

interface ResumoVeiculo {
  veiculoId: number;
  placa: string;
  totalLitros: number;
  totalCusto: number;
  totalRegistros: number;
}

interface EstatisticaCombustivel {
  tipoCombustivel: string;
  totalLitros: number;
  totalCusto: number;
  precoMedio: number;
  totalRegistros: number;
}

export default function AdminControleAbastecimento() {
  const [, navigate] = useLocation();
  const [kpis, setKpis] = useState<KPIs>({
    totalLitros: 0,
    totalCusto: 0,
    precoMedio: 0,
    totalRegistros: 0,
  });
  const [abastecimentos, setAbastecimentos] = useState<Abastecimento[]>([]);
  const [resumoVeiculos, setResumoVeiculos] = useState<ResumoVeiculo[]>([]);
  const [estatisticas, setEstatisticas] = useState<EstatisticaCombustivel[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [filtroVeiculo, setFiltroVeiculo] = useState("");
  const [filtroCombustivel, setFiltroCombustivel] = useState("");
  const [statusSincronizacao, setStatusSincronizacao] = useState("");

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    setCarregando(true);
    try {
      // Simular dados até que a API esteja integrada
      const dadosSimulados = {
        kpis: {
          totalLitros: 1250.5,
          totalCusto: 6890.25,
          precoMedio: 5.51,
          totalRegistros: 45,
        },
        abastecimentos: [
          {
            id: 1,
            veiculo: "MVT-001",
            data: "2025-01-14",
            km: 45230,
            litros: 50,
            valorLitro: 5.49,
            valorTotal: 274.50,
            tipoCombustivel: "diesel",
            posto: "BR Distribuidora",
            cidade: "Curitiba",
          },
          {
            id: 2,
            veiculo: "MVT-002",
            data: "2025-01-13",
            km: 32150,
            litros: 45,
            valorLitro: 5.52,
            valorTotal: 248.40,
            tipoCombustivel: "diesel",
            posto: "Ipiranga",
            cidade: "Curitiba",
          },
          {
            id: 3,
            veiculo: "MVT-003",
            data: "2025-01-12",
            km: 28900,
            litros: 40,
            valorLitro: 5.48,
            valorTotal: 219.20,
            tipoCombustivel: "diesel",
            posto: "Shell",
            cidade: "São Paulo",
          },
        ],
        resumoVeiculos: [
          {
            veiculoId: 1,
            placa: "MVT-001",
            totalLitros: 450,
            totalCusto: 2475.50,
            totalRegistros: 15,
          },
          {
            veiculoId: 2,
            placa: "MVT-002",
            totalLitros: 380,
            totalCusto: 2090.40,
            totalRegistros: 12,
          },
          {
            veiculoId: 3,
            placa: "MVT-003",
            totalLitros: 420,
            totalCusto: 2324.35,
            totalRegistros: 18,
          },
        ],
        estatisticas: [
          {
            tipoCombustivel: "diesel",
            totalLitros: 1250.5,
            totalCusto: 6890.25,
            precoMedio: 5.51,
            totalRegistros: 45,
          },
        ],
      };

      setKpis(dadosSimulados.kpis);
      setAbastecimentos(dadosSimulados.abastecimentos);
      setResumoVeiculos(dadosSimulados.resumoVeiculos);
      setEstatisticas(dadosSimulados.estatisticas);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      setCarregando(false);
    }
  };

  const sincronizarCTASmart = async () => {
    setStatusSincronizacao("Sincronizando com CTA Smart...");
    try {
      // Aqui virá a chamada real à API
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setStatusSincronizacao("✅ Sincronização concluída com sucesso!");
      setTimeout(() => setStatusSincronizacao(""), 3000);
      carregarDados();
    } catch (error) {
      setStatusSincronizacao("❌ Erro na sincronização");
      setTimeout(() => setStatusSincronizacao(""), 3000);
    }
  };

  const exportarCSV = () => {
    const csv = [
      ["Veículo", "Data", "KM", "Litros", "Valor/L", "Valor Total", "Combustível", "Posto", "Cidade"],
      ...abastecimentos.map((a) => [
        a.veiculo,
        a.data,
        a.km,
        a.litros,
        a.valorLitro.toFixed(2),
        a.valorTotal.toFixed(2),
        a.tipoCombustivel,
        a.posto,
        a.cidade,
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `controle-abastecimento-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  };

  const CORES = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-4 md:p-8">
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
          <p className="text-gray-300">Gerencie o abastecimento da frota com integração CTA Smart</p>
        </div>

        {/* Status de Sincronização */}
        {statusSincronizacao && (
          <div className="mb-6 p-4 bg-blue-900/50 border border-blue-500 rounded-lg text-white flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            {statusSincronizacao}
          </div>
        )}

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="bg-gradient-to-br from-blue-900 to-blue-800 border-blue-700">
            <CardContent className="pt-6">
              <div className="text-center">
                <Droplet className="h-8 w-8 text-blue-300 mx-auto mb-2" />
                <p className="text-sm text-blue-200">Total de Litros</p>
                <p className="text-3xl font-bold text-white">{kpis.totalLitros.toFixed(1)}</p>
                <p className="text-xs text-blue-300 mt-1">L</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-900 to-green-800 border-green-700">
            <CardContent className="pt-6">
              <div className="text-center">
                <DollarSign className="h-8 w-8 text-green-300 mx-auto mb-2" />
                <p className="text-sm text-green-200">Custo Total</p>
                <p className="text-3xl font-bold text-white">R$ {kpis.totalCusto.toFixed(2)}</p>
                <p className="text-xs text-green-300 mt-1">Reais</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-900 to-yellow-800 border-yellow-700">
            <CardContent className="pt-6">
              <div className="text-center">
                <TrendingUp className="h-8 w-8 text-yellow-300 mx-auto mb-2" />
                <p className="text-sm text-yellow-200">Preço Médio</p>
                <p className="text-3xl font-bold text-white">R$ {kpis.precoMedio.toFixed(2)}</p>
                <p className="text-xs text-yellow-300 mt-1">Por litro</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-900 to-purple-800 border-purple-700">
            <CardContent className="pt-6">
              <div className="text-center">
                <Database className="h-8 w-8 text-purple-300 mx-auto mb-2" />
                <p className="text-sm text-purple-200">Registros</p>
                <p className="text-3xl font-bold text-white">{kpis.totalRegistros}</p>
                <p className="text-xs text-purple-300 mt-1">Abastecimentos</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Ações */}
        <div className="flex gap-3 mb-8 flex-wrap">
          <Button
            onClick={sincronizarCTASmart}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Sincronizar CTA Smart
          </Button>
          <Button onClick={exportarCSV} variant="outline" className="border-slate-600 text-white">
            <Download className="h-4 w-4 mr-2" />
            Exportar CSV
          </Button>
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Gráfico: Consumo por Veículo */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <BarChart className="h-5 w-5 text-blue-400" />
                Consumo por Veículo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={resumoVeiculos}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                  <XAxis dataKey="placa" stroke="#cbd5e1" />
                  <YAxis stroke="#cbd5e1" />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #475569" }}
                    labelStyle={{ color: "#fff" }}
                  />
                  <Bar dataKey="totalLitros" fill="#3b82f6" name="Litros" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Gráfico: Custo por Veículo */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <LineChart className="h-5 w-5 text-green-400" />
                Custo por Veículo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={resumoVeiculos}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                  <XAxis dataKey="placa" stroke="#cbd5e1" />
                  <YAxis stroke="#cbd5e1" />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #475569" }}
                    labelStyle={{ color: "#fff" }}
                  />
                  <Line type="monotone" dataKey="totalCusto" stroke="#10b981" name="Custo (R$)" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Tabela de Abastecimentos */}
        <Card className="bg-slate-800 border-slate-700 mb-8">
          <CardHeader>
            <CardTitle className="text-white">Últimos Abastecimentos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-gray-300">
                <thead className="border-b border-slate-600">
                  <tr>
                    <th className="text-left py-3 px-4 font-semibold">Veículo</th>
                    <th className="text-left py-3 px-4 font-semibold">Data</th>
                    <th className="text-left py-3 px-4 font-semibold">KM</th>
                    <th className="text-left py-3 px-4 font-semibold">Litros</th>
                    <th className="text-left py-3 px-4 font-semibold">Valor/L</th>
                    <th className="text-left py-3 px-4 font-semibold">Total</th>
                    <th className="text-left py-3 px-4 font-semibold">Combustível</th>
                    <th className="text-left py-3 px-4 font-semibold">Posto</th>
                  </tr>
                </thead>
                <tbody>
                  {abastecimentos.map((a) => (
                    <tr key={a.id} className="border-b border-slate-700 hover:bg-slate-700/50">
                      <td className="py-3 px-4 font-medium text-white">{a.veiculo}</td>
                      <td className="py-3 px-4">{new Date(a.data).toLocaleDateString("pt-BR")}</td>
                      <td className="py-3 px-4">{a.km.toLocaleString()}</td>
                      <td className="py-3 px-4">{a.litros.toFixed(1)} L</td>
                      <td className="py-3 px-4">R$ {a.valorLitro.toFixed(2)}</td>
                      <td className="py-3 px-4 font-semibold text-green-400">
                        R$ {a.valorTotal.toFixed(2)}
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-1 bg-blue-900 text-blue-300 rounded text-xs">
                          {a.tipoCombustivel}
                        </span>
                      </td>
                      <td className="py-3 px-4">{a.posto}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Resumo por Veículo */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Resumo por Veículo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {resumoVeiculos.map((v) => (
                <div
                  key={v.veiculoId}
                  className="p-4 bg-slate-700 rounded-lg border border-slate-600 hover:border-blue-500 transition"
                >
                  <p className="text-white font-bold text-lg mb-3">{v.placa}</p>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-300">Litros:</span>
                      <span className="text-blue-300 font-semibold">{v.totalLitros.toFixed(1)} L</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Custo:</span>
                      <span className="text-green-300 font-semibold">R$ {v.totalCusto.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Registros:</span>
                      <span className="text-purple-300 font-semibold">{v.totalRegistros}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
