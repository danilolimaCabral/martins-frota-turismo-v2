import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLocation } from "wouter";
import {
  ArrowLeft,
  Truck,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  Users,
  Package,
  BarChart3,
  Edit2,
  Save,
  X,
} from "lucide-react";
import {
  BarChart,
  Bar,
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

interface Veiculo {
  id: number;
  placa: string;
  tipo: string;
  capacidadePassageiros: number;
  capacidadeKg: number;
  capacidadeM3: number;
  passageirosAtuais: number;
  cargaAtualKg: number;
  volumeAtualM3: number;
  status: "ok" | "aviso" | "critico";
  utilizacao: number;
}

const veiculosExemplo: Veiculo[] = [
  {
    id: 1,
    placa: "MVT-001",
    tipo: "Ônibus",
    capacidadePassageiros: 50,
    capacidadeKg: 5000,
    capacidadeM3: 25,
    passageirosAtuais: 42,
    cargaAtualKg: 3800,
    volumeAtualM3: 18,
    status: "ok",
    utilizacao: 76,
  },
  {
    id: 2,
    placa: "MVT-002",
    tipo: "Van",
    capacidadePassageiros: 15,
    capacidadeKg: 2000,
    capacidadeM3: 10,
    passageirosAtuais: 14,
    cargaAtualKg: 1850,
    volumeAtualM3: 9.2,
    status: "aviso",
    utilizacao: 92,
  },
  {
    id: 3,
    placa: "MVT-003",
    tipo: "Micro-ônibus",
    capacidadePassageiros: 30,
    capacidadeKg: 3500,
    capacidadeM3: 18,
    passageirosAtuais: 31,
    cargaAtualKg: 3600,
    volumeAtualM3: 18.5,
    status: "critico",
    utilizacao: 105,
  },
];

export default function AdminCapacidadeVeiculos() {
  const [, navigate] = useLocation();
  const [veiculos, setVeiculos] = useState<Veiculo[]>(veiculosExemplo);
  const [editando, setEditando] = useState<number | null>(null);
  const [filtroStatus, setFiltroStatus] = useState("todos");

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ok":
        return "bg-green-900 border-green-700 text-green-300";
      case "aviso":
        return "bg-yellow-900 border-yellow-700 text-yellow-300";
      case "critico":
        return "bg-red-900 border-red-700 text-red-300";
      default:
        return "bg-gray-900 border-gray-700 text-gray-300";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "ok":
        return <CheckCircle className="h-5 w-5 text-green-400" />;
      case "aviso":
        return <AlertTriangle className="h-5 w-5 text-yellow-400" />;
      case "critico":
        return <AlertTriangle className="h-5 w-5 text-red-400" />;
      default:
        return null;
    }
  };

  const calcularUtilizacao = (atual: number, capacidade: number) => {
    return Math.round((atual / capacidade) * 100);
  };

  const determinarStatus = (utilizacao: number) => {
    if (utilizacao >= 100) return "critico";
    if (utilizacao >= 80) return "aviso";
    return "ok";
  };

  const atualizarVeiculo = (id: number, campo: string, valor: any) => {
    setVeiculos(
      veiculos.map((v) => {
        if (v.id === id) {
          const novoVeiculo = { ...v, [campo]: valor };
          // Recalcular status
          const utilizacao = calcularUtilizacao(
            novoVeiculo.passageirosAtuais,
            novoVeiculo.capacidadePassageiros
          );
          novoVeiculo.status = determinarStatus(utilizacao) as any;
          novoVeiculo.utilizacao = utilizacao;
          return novoVeiculo;
        }
        return v;
      })
    );
  };

  const veiculosFiltrados = veiculos.filter((v) => {
    if (filtroStatus === "todos") return true;
    return v.status === filtroStatus;
  });

  const estatisticas = {
    totalVeiculos: veiculos.length,
    ok: veiculos.filter((v) => v.status === "ok").length,
    aviso: veiculos.filter((v) => v.status === "aviso").length,
    critico: veiculos.filter((v) => v.status === "critico").length,
    utilizacaoMedia: Math.round(
      veiculos.reduce((acc, v) => acc + v.utilizacao, 0) / veiculos.length
    ),
  };

  const dadosGrafico = veiculos.map((v) => ({
    placa: v.placa,
    passageiros: v.passageirosAtuais,
    capacidade: v.capacidadePassageiros,
  }));

  const dadosPizza = [
    { name: "OK", value: estatisticas.ok, color: "#10b981" },
    { name: "Aviso", value: estatisticas.aviso, color: "#f59e0b" },
    { name: "Crítico", value: estatisticas.critico, color: "#ef4444" },
  ];

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
          <h1 className="text-4xl font-bold text-white mb-2">🚚 Capacidade de Veículos</h1>
          <p className="text-gray-300">Monitore a utilização de carga e passageiros da frota</p>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <Card className="bg-gradient-to-br from-blue-900 to-blue-800 border-blue-700">
            <CardContent className="pt-6">
              <div className="text-center">
                <Truck className="h-8 w-8 text-blue-300 mx-auto mb-2" />
                <p className="text-sm text-blue-200">Total de Veículos</p>
                <p className="text-3xl font-bold text-white">{estatisticas.totalVeiculos}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-900 to-green-800 border-green-700">
            <CardContent className="pt-6">
              <div className="text-center">
                <CheckCircle className="h-8 w-8 text-green-300 mx-auto mb-2" />
                <p className="text-sm text-green-200">OK</p>
                <p className="text-3xl font-bold text-white">{estatisticas.ok}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-900 to-yellow-800 border-yellow-700">
            <CardContent className="pt-6">
              <div className="text-center">
                <AlertTriangle className="h-8 w-8 text-yellow-300 mx-auto mb-2" />
                <p className="text-sm text-yellow-200">Aviso (80-99%)</p>
                <p className="text-3xl font-bold text-white">{estatisticas.aviso}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-900 to-red-800 border-red-700">
            <CardContent className="pt-6">
              <div className="text-center">
                <AlertTriangle className="h-8 w-8 text-red-300 mx-auto mb-2" />
                <p className="text-sm text-red-200">Crítico (100%+)</p>
                <p className="text-3xl font-bold text-white">{estatisticas.critico}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-900 to-purple-800 border-purple-700">
            <CardContent className="pt-6">
              <div className="text-center">
                <TrendingUp className="h-8 w-8 text-purple-300 mx-auto mb-2" />
                <p className="text-sm text-purple-200">Utilização Média</p>
                <p className="text-3xl font-bold text-white">{estatisticas.utilizacaoMedia}%</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Gráfico de Barras */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-blue-400" />
                Utilização de Passageiros
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={dadosGrafico}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                  <XAxis dataKey="placa" stroke="#cbd5e1" />
                  <YAxis stroke="#cbd5e1" />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #475569" }}
                    labelStyle={{ color: "#fff" }}
                  />
                  <Legend />
                  <Bar dataKey="passageiros" fill="#3b82f6" name="Atuais" />
                  <Bar dataKey="capacidade" fill="#10b981" name="Capacidade" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Gráfico de Pizza */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Package className="h-5 w-5 text-green-400" />
                Status da Frota
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={dadosPizza}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {dadosPizza.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
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
        <div className="mb-6 flex gap-3 flex-wrap">
          <Button
            onClick={() => setFiltroStatus("todos")}
            variant={filtroStatus === "todos" ? "default" : "outline"}
            className={filtroStatus === "todos" ? "bg-blue-600" : "border-slate-600 text-white"}
          >
            Todos ({veiculos.length})
          </Button>
          <Button
            onClick={() => setFiltroStatus("ok")}
            variant={filtroStatus === "ok" ? "default" : "outline"}
            className={filtroStatus === "ok" ? "bg-green-600" : "border-slate-600 text-white"}
          >
            OK ({estatisticas.ok})
          </Button>
          <Button
            onClick={() => setFiltroStatus("aviso")}
            variant={filtroStatus === "aviso" ? "default" : "outline"}
            className={filtroStatus === "aviso" ? "bg-yellow-600" : "border-slate-600 text-white"}
          >
            Aviso ({estatisticas.aviso})
          </Button>
          <Button
            onClick={() => setFiltroStatus("critico")}
            variant={filtroStatus === "critico" ? "default" : "outline"}
            className={filtroStatus === "critico" ? "bg-red-600" : "border-slate-600 text-white"}
          >
            Crítico ({estatisticas.critico})
          </Button>
        </div>

        {/* Tabela de Veículos */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Detalhes dos Veículos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-gray-300">
                <thead className="border-b border-slate-600">
                  <tr>
                    <th className="text-left py-3 px-4 font-semibold">Placa</th>
                    <th className="text-left py-3 px-4 font-semibold">Tipo</th>
                    <th className="text-left py-3 px-4 font-semibold">Passageiros</th>
                    <th className="text-left py-3 px-4 font-semibold">Carga (kg)</th>
                    <th className="text-left py-3 px-4 font-semibold">Volume (m³)</th>
                    <th className="text-left py-3 px-4 font-semibold">Utilização</th>
                    <th className="text-left py-3 px-4 font-semibold">Status</th>
                    <th className="text-left py-3 px-4 font-semibold">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {veiculosFiltrados.map((v) => (
                    <tr key={v.id} className="border-b border-slate-700 hover:bg-slate-700/50">
                      <td className="py-3 px-4 font-medium text-white">{v.placa}</td>
                      <td className="py-3 px-4">{v.tipo}</td>
                      <td className="py-3 px-4">
                        {editando === v.id ? (
                          <input
                            type="number"
                            value={v.passageirosAtuais}
                            onChange={(e) =>
                              atualizarVeiculo(v.id, "passageirosAtuais", parseInt(e.target.value))
                            }
                            className="w-16 px-2 py-1 bg-slate-700 border border-slate-600 rounded text-white"
                          />
                        ) : (
                          `${v.passageirosAtuais}/${v.capacidadePassageiros}`
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {editando === v.id ? (
                          <input
                            type="number"
                            value={v.cargaAtualKg}
                            onChange={(e) =>
                              atualizarVeiculo(v.id, "cargaAtualKg", parseInt(e.target.value))
                            }
                            className="w-20 px-2 py-1 bg-slate-700 border border-slate-600 rounded text-white"
                          />
                        ) : (
                          `${v.cargaAtualKg}/${v.capacidadeKg}`
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {editando === v.id ? (
                          <input
                            type="number"
                            step="0.1"
                            value={v.volumeAtualM3}
                            onChange={(e) =>
                              atualizarVeiculo(v.id, "volumeAtualM3", parseFloat(e.target.value))
                            }
                            className="w-20 px-2 py-1 bg-slate-700 border border-slate-600 rounded text-white"
                          />
                        ) : (
                          `${v.volumeAtualM3}/${v.capacidadeM3}`
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-24 bg-slate-700 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${
                                v.utilizacao >= 100
                                  ? "bg-red-500"
                                  : v.utilizacao >= 80
                                  ? "bg-yellow-500"
                                  : "bg-green-500"
                              }`}
                              style={{ width: `${Math.min(v.utilizacao, 100)}%` }}
                            ></div>
                          </div>
                          <span className="font-semibold">{v.utilizacao}%</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className={`flex items-center gap-2 px-2 py-1 rounded ${getStatusColor(v.status)}`}>
                          {getStatusIcon(v.status)}
                          <span className="capitalize">{v.status}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        {editando === v.id ? (
                          <div className="flex gap-2">
                            <Button
                              onClick={() => setEditando(null)}
                              size="sm"
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <Save className="h-4 w-4" />
                            </Button>
                            <Button
                              onClick={() => setEditando(null)}
                              size="sm"
                              variant="outline"
                              className="border-slate-600"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <Button
                            onClick={() => setEditando(v.id)}
                            size="sm"
                            variant="outline"
                            className="border-slate-600"
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Legenda */}
        <Card className="bg-slate-800 border-slate-700 mt-8">
          <CardHeader>
            <CardTitle className="text-white">Legenda de Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-400 mt-1" />
                <div>
                  <p className="font-semibold text-white">OK (0-79%)</p>
                  <p className="text-sm text-gray-400">Veículo com utilização normal</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-yellow-400 mt-1" />
                <div>
                  <p className="font-semibold text-white">Aviso (80-99%)</p>
                  <p className="text-sm text-gray-400">Veículo próximo da capacidade máxima</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-red-400 mt-1" />
                <div>
                  <p className="font-semibold text-white">Crítico (100%+)</p>
                  <p className="text-sm text-gray-400">Veículo acima da capacidade máxima</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
