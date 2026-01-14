import { useState } from "react";
import { useLocation } from "wouter";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
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
  DollarSign,
  TrendingUp,
  Users,
  FileText,
  Download,
  Mail,
  ArrowLeft,
} from "lucide-react";

export default function AdminDashboardFolha() {
  const [, setLocation] = useLocation();

  // Dados de exemplo - em produção viriam da API
  const dadosReceita = [
    { mes: "Jan", receita: 45000, despesas: 28000 },
    { mes: "Fev", receita: 52000, despesas: 31000 },
    { mes: "Mar", receita: 48000, despesas: 29000 },
    { mes: "Abr", receita: 61000, despesas: 35000 },
    { mes: "Mai", receita: 55000, despesas: 32000 },
    { mes: "Jun", receita: 67000, despesas: 38000 },
  ];

  const dadosCustos = [
    { categoria: "Salários", valor: 45000 },
    { categoria: "INSS", valor: 5400 },
    { categoria: "FGTS", valor: 3600 },
    { categoria: "Vale Transporte", valor: 2100 },
    { categoria: "Vale Alimentação", valor: 1800 },
  ];

  const dadosStatusFolha = [
    { name: "Aberta", value: 2, fill: "#fbbf24" },
    { name: "Processando", value: 1, fill: "#3b82f6" },
    { name: "Fechada", value: 8, fill: "#10b981" },
    { name: "Paga", value: 5, fill: "#8b5cf6" },
  ];

  const dadosFuncionarios = [
    { mes: "Jan", ativo: 42, ferias: 2, afastado: 1 },
    { mes: "Fev", ativo: 41, ferias: 3, afastado: 1 },
    { mes: "Mar", ativo: 42, ferias: 2, afastado: 1 },
    { mes: "Abr", ativo: 43, ferias: 1, afastado: 1 },
    { mes: "Mai", ativo: 42, ferias: 2, afastado: 1 },
    { mes: "Jun", ativo: 44, ferias: 1, afastado: 0 },
  ];

  const kpis = [
    {
      titulo: "Folhas Processadas",
      valor: "16",
      subtitulo: "Este semestre",
      icon: FileText,
      cor: "bg-blue-50 text-blue-700",
    },
    {
      titulo: "Funcionários Ativos",
      valor: "44",
      subtitulo: "Mês atual",
      icon: Users,
      cor: "bg-green-50 text-green-700",
    },
    {
      titulo: "Custo Total de Pessoal",
      valor: "R$ 57.900",
      subtitulo: "Junho 2026",
      icon: DollarSign,
      cor: "bg-purple-50 text-purple-700",
    },
    {
      titulo: "Crescimento YoY",
      valor: "+12.5%",
      subtitulo: "Comparado a junho 2025",
      icon: TrendingUp,
      cor: "bg-orange-50 text-orange-700",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Botão Voltar */}
      <div className="mb-6 flex items-center gap-2">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
        >
          <ArrowLeft size={20} />
          <span>Voltar</span>
        </button>
      </div>

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Dashboard de Folha de Pagamento
          </h1>
          <p className="text-gray-600">
            Análise consolidada de custos, funcionários e processamento de folhas
          </p>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {kpis.map((kpi, idx) => {
            const Icon = kpi.icon;
            return (
              <Card key={idx} className="border-0 shadow-sm">
                <CardContent className="pt-6">
                  <div className={`p-3 rounded-lg ${kpi.cor} w-fit mb-4`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-sm font-medium text-gray-600 mb-1">
                    {kpi.titulo}
                  </h3>
                  <p className="text-2xl font-bold text-gray-900 mb-1">
                    {kpi.valor}
                  </p>
                  <p className="text-xs text-gray-500">{kpi.subtitulo}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Receita vs Despesas */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle>Receita vs Despesas</CardTitle>
              <CardDescription>
                Últimos 6 meses - Comparativo financeiro
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={dadosReceita}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="mes" />
                  <YAxis />
                  <Tooltip formatter={(value) => `R$ ${value.toLocaleString()}`} />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="receita"
                    stroke="#10b981"
                    strokeWidth={2}
                    name="Receita"
                  />
                  <Line
                    type="monotone"
                    dataKey="despesas"
                    stroke="#ef4444"
                    strokeWidth={2}
                    name="Despesas"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Composição de Custos */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle>Composição de Custos</CardTitle>
              <CardDescription>
                Breakdown de custos de pessoal - Junho 2026
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={dadosCustos}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="categoria" angle={-45} textAnchor="end" height={80} />
                  <YAxis />
                  <Tooltip formatter={(value) => `R$ ${value.toLocaleString()}`} />
                  <Bar dataKey="valor" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Status das Folhas */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle>Status das Folhas</CardTitle>
              <CardDescription>
                Distribuição de folhas por status - Semestre
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={dadosStatusFolha}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {dadosStatusFolha.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Funcionários por Status */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle>Funcionários por Status</CardTitle>
              <CardDescription>
                Evolução de pessoal - Últimos 6 meses
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={dadosFuncionarios}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="mes" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="ativo"
                    stroke="#10b981"
                    strokeWidth={2}
                    name="Ativo"
                  />
                  <Line
                    type="monotone"
                    dataKey="ferias"
                    stroke="#fbbf24"
                    strokeWidth={2}
                    name="Férias"
                  />
                  <Line
                    type="monotone"
                    dataKey="afastado"
                    stroke="#ef4444"
                    strokeWidth={2}
                    name="Afastado"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Ações Rápidas */}
        <Card className="border-0 shadow-sm mb-8">
          <CardHeader>
            <CardTitle>Ações Rápidas</CardTitle>
            <CardDescription>
              Operações comuns de folha de pagamento
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Button
                variant="outline"
                className="h-auto flex flex-col items-center justify-center py-6"
                onClick={() => setLocation("/admin/folha")}
              >
                <FileText className="h-6 w-6 mb-2" />
                <span className="text-sm font-medium">Nova Folha</span>
              </Button>
              <Button
                variant="outline"
                className="h-auto flex flex-col items-center justify-center py-6"
                onClick={() => setLocation("/admin/folha")}
              >
                <Download className="h-6 w-6 mb-2" />
                <span className="text-sm font-medium">Gerar CNAB 240</span>
              </Button>
              <Button
                variant="outline"
                className="h-auto flex flex-col items-center justify-center py-6"
                onClick={() => setLocation("/admin/folha")}
              >
                <Mail className="h-6 w-6 mb-2" />
                <span className="text-sm font-medium">Enviar Holerites</span>
              </Button>
              <Button
                variant="outline"
                className="h-auto flex flex-col items-center justify-center py-6"
                onClick={() => setLocation("/admin/relatorios")}
              >
                <FileText className="h-6 w-6 mb-2" />
                <span className="text-sm font-medium">Relatórios</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Resumo Executivo */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle>Resumo Executivo</CardTitle>
            <CardDescription>
              Indicadores-chave de desempenho - Junho 2026
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-4 border-b">
                <span className="text-gray-600">Custo Médio por Funcionário</span>
                <span className="font-bold text-lg">R$ 1.316,00</span>
              </div>
              <div className="flex justify-between items-center pb-4 border-b">
                <span className="text-gray-600">Encargos Sociais (INSS + FGTS)</span>
                <span className="font-bold text-lg">R$ 9.000,00</span>
              </div>
              <div className="flex justify-between items-center pb-4 border-b">
                <span className="text-gray-600">Benefícios (Vale + Alimentação)</span>
                <span className="font-bold text-lg">R$ 3.900,00</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 font-medium">Custo Total de Pessoal</span>
                <span className="font-bold text-xl text-green-600">R$ 57.900,00</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
