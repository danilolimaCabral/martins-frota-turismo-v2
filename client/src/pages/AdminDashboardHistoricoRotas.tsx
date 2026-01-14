import { useState } from "react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, TrendingUp, TrendingDown } from "lucide-react";
import { useLocation } from "wouter";

interface Rota {
  id: number;
  nome: string;
  data: string;
  distanciaOriginal: number;
  distanciaOtimizada: number;
  economia: number;
  percentualEconomia: number;
  algoritmo: string;
  combustivelEconomizado: number;
}

// Dados simulados
const rotasHistorico: Rota[] = [
  {
    id: 1,
    nome: "Rota Centro",
    data: "2024-01-15",
    distanciaOriginal: 24.42,
    distanciaOtimizada: 5.09,
    economia: 19.33,
    percentualEconomia: 79.1,
    algoritmo: "Nearest Neighbor",
    combustivelEconomizado: 3.87
  },
  {
    id: 2,
    nome: "Rota Sul",
    data: "2024-01-16",
    distanciaOriginal: 18.5,
    distanciaOtimizada: 4.2,
    economia: 14.3,
    percentualEconomia: 77.3,
    algoritmo: "Genetic",
    combustivelEconomizado: 2.86
  },
  {
    id: 3,
    nome: "Rota Norte",
    data: "2024-01-17",
    distanciaOriginal: 22.0,
    distanciaOtimizada: 4.8,
    economia: 17.2,
    percentualEconomia: 78.2,
    algoritmo: "Nearest Neighbor",
    combustivelEconomizado: 3.44
  },
  {
    id: 4,
    nome: "Rota Leste",
    data: "2024-01-18",
    distanciaOriginal: 20.5,
    distanciaOtimizada: 4.5,
    economia: 16.0,
    percentualEconomia: 78.0,
    algoritmo: "2-opt",
    combustivelEconomizado: 3.2
  },
  {
    id: 5,
    nome: "Rota Oeste",
    data: "2024-01-19",
    distanciaOriginal: 25.0,
    distanciaOtimizada: 4.9,
    economia: 20.1,
    percentualEconomia: 80.4,
    algoritmo: "Genetic",
    combustivelEconomizado: 4.02
  }
];

const COLORS = ['#FF6B35', '#004E89', '#1B998B', '#F7DC6F', '#BB4430'];

export default function AdminDashboardHistoricoRotas() {
  const [, navigate] = useLocation();
  const [filtroAlgoritmo, setFiltroAlgoritmo] = useState<string>("todos");

  const rotasFiltradas = filtroAlgoritmo === "todos"
    ? rotasHistorico
    : rotasHistorico.filter(r => r.algoritmo === filtroAlgoritmo);

  // Dados para gráfico de economia ao longo do tempo
  const dadosEconomiaLongo = rotasHistorico.map(r => ({
    data: new Date(r.data).toLocaleDateString('pt-BR'),
    economia: r.economia,
    combustivel: r.combustivelEconomizado
  }));

  // Dados para gráfico de comparação por algoritmo
  const algoritmos = [...new Set(rotasHistorico.map(r => r.algoritmo))];
  const dadosAlgoritmo = algoritmos.map(alg => {
    const rotas = rotasHistorico.filter(r => r.algoritmo === alg);
    return {
      algoritmo: alg,
      economia: rotas.reduce((sum, r) => sum + r.economia, 0) / rotas.length,
      quantidade: rotas.length
    };
  });

  // Dados para gráfico de pizza (distribuição de algoritmos)
  const dadosPizza = algoritmos.map(alg => ({
    name: alg,
    value: rotasHistorico.filter(r => r.algoritmo === alg).length
  }));

  // Estatísticas gerais
  const totalEconomia = rotasHistorico.reduce((sum, r) => sum + r.economia, 0);
  const totalCombustivel = rotasHistorico.reduce((sum, r) => sum + r.combustivelEconomizado, 0);
  const mediaEconomiaPercentual = rotasHistorico.reduce((sum, r) => sum + r.percentualEconomia, 0) / rotasHistorico.length;
  const totalRotas = rotasHistorico.length;

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/")}
              className="text-orange-600 hover:bg-orange-50"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Histórico de Rotas</h1>
              <p className="text-gray-600">Análise de economia e comparação de algoritmos</p>
            </div>
          </div>
        </div>

        {/* Estatísticas Gerais */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="border-orange-200 bg-orange-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-orange-700">Total de Rotas</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-orange-700">{totalRotas}</p>
            </CardContent>
          </Card>

          <Card className="border-green-200 bg-green-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-green-700">Economia Total</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-green-700">{totalEconomia.toFixed(1)} km</p>
              <p className="text-xs text-green-600 mt-1">
                Média: {(totalEconomia / totalRotas).toFixed(2)} km/rota
              </p>
            </CardContent>
          </Card>

          <Card className="border-blue-200 bg-blue-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-blue-700">Combustível Economizado</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-blue-700">{totalCombustivel.toFixed(1)} L</p>
              <p className="text-xs text-blue-600 mt-1">
                Consumo: 5 km/L
              </p>
            </CardContent>
          </Card>

          <Card className="border-purple-200 bg-purple-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-purple-700">Economia Média</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-purple-700">{mediaEconomiaPercentual.toFixed(1)}%</p>
              <p className="text-xs text-purple-600 mt-1">
                Redução de distância
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Gráfico de Linha - Economia ao Longo do Tempo */}
          <Card>
            <CardHeader>
              <CardTitle>Economia ao Longo do Tempo</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={dadosEconomiaLongo}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="data" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="economia"
                    stroke="#FF6B35"
                    name="Economia (km)"
                    strokeWidth={2}
                  />
                  <Line
                    type="monotone"
                    dataKey="combustivel"
                    stroke="#1B998B"
                    name="Combustível (L)"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Gráfico de Pizza - Distribuição de Algoritmos */}
          <Card>
            <CardHeader>
              <CardTitle>Distribuição de Algoritmos</CardTitle>
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
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Gráfico de Barras - Comparação por Algoritmo */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Economia Média por Algoritmo</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dadosAlgoritmo}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="algoritmo" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="economia" fill="#FF6B35" name="Economia Média (km)" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Tabela de Rotas */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Detalhes das Rotas</CardTitle>
              <div className="flex gap-2">
                <Button
                  variant={filtroAlgoritmo === "todos" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFiltroAlgoritmo("todos")}
                >
                  Todos
                </Button>
                {algoritmos.map(alg => (
                  <Button
                    key={alg}
                    variant={filtroAlgoritmo === alg ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFiltroAlgoritmo(alg)}
                  >
                    {alg}
                  </Button>
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-2 text-left font-semibold">Data</th>
                    <th className="px-4 py-2 text-left font-semibold">Rota</th>
                    <th className="px-4 py-2 text-left font-semibold">Algoritmo</th>
                    <th className="px-4 py-2 text-right font-semibold">Distância Original</th>
                    <th className="px-4 py-2 text-right font-semibold">Distância Otimizada</th>
                    <th className="px-4 py-2 text-right font-semibold">Economia</th>
                    <th className="px-4 py-2 text-right font-semibold">Combustível</th>
                  </tr>
                </thead>
                <tbody>
                  {rotasFiltradas.map(rota => (
                    <tr key={rota.id} className="border-t hover:bg-gray-50">
                      <td className="px-4 py-2">{new Date(rota.data).toLocaleDateString('pt-BR')}</td>
                      <td className="px-4 py-2 font-semibold text-orange-600">{rota.nome}</td>
                      <td className="px-4 py-2">{rota.algoritmo}</td>
                      <td className="px-4 py-2 text-right">{rota.distanciaOriginal.toFixed(2)} km</td>
                      <td className="px-4 py-2 text-right">{rota.distanciaOtimizada.toFixed(2)} km</td>
                      <td className="px-4 py-2 text-right">
                        <span className="text-green-600 font-semibold">
                          {rota.economia.toFixed(2)} km ({rota.percentualEconomia.toFixed(1)}%)
                        </span>
                      </td>
                      <td className="px-4 py-2 text-right text-blue-600 font-semibold">
                        {rota.combustivelEconomizado.toFixed(2)} L
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
