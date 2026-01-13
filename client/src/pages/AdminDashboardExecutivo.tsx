import React, { useMemo } from 'react';
import { trpc } from '@/lib/trpc';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer } from '@/components/ChartContainer';
import {
  TrendingUp,
  DollarSign,
  Truck,
  AlertCircle,
  Users,
  Fuel,
  Wrench,
  Calendar,
} from 'lucide-react';

// Dados simulados para demonstração
const generateMockData = () => {
  const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'];
  
  return {
    receita: {
      labels: months,
      datasets: [
        {
          label: 'Receita Mensal (R$)',
          data: [45000, 52000, 48500, 61000, 58000, 65000],
          borderColor: '#FF6B35',
          backgroundColor: 'rgba(255, 107, 53, 0.1)',
          borderWidth: 2,
          fill: true,
          tension: 0.4,
          pointRadius: 5,
          pointBackgroundColor: '#FF6B35',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
        },
      ],
    },
    custos: {
      labels: ['Combustível', 'Manutenção', 'Pessoal', 'Seguros', 'Outros'],
      datasets: [
        {
          label: 'Custos Mensais (R$)',
          data: [28000, 12000, 35000, 8000, 5000],
          backgroundColor: [
            '#FF6B35',
            '#F7931E',
            '#FDB913',
            '#C1272D',
            '#662D91',
          ],
          borderColor: '#fff',
          borderWidth: 2,
        },
      ],
    },
    frota: {
      labels: ['Ativo', 'Manutenção', 'Inativo'],
      datasets: [
        {
          data: [42, 4, 2],
          backgroundColor: ['#4CAF50', '#FF9800', '#F44336'],
          borderColor: '#fff',
          borderWidth: 2,
        },
      ],
    },
    ocupacao: {
      labels: months,
      datasets: [
        {
          label: 'Taxa de Ocupação (%)',
          data: [78, 82, 75, 88, 85, 90],
          borderColor: '#4CAF50',
          backgroundColor: 'rgba(76, 175, 80, 0.1)',
          borderWidth: 2,
          fill: true,
          tension: 0.4,
          pointRadius: 5,
          pointBackgroundColor: '#4CAF50',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
        },
      ],
    },
    despesas: {
      labels: ['Combustível', 'Manutenção', 'Pessoal', 'Seguros', 'Outros'],
      datasets: [
        {
          data: [35, 15, 30, 12, 8],
          backgroundColor: [
            '#FF6B35',
            '#F7931E',
            '#FDB913',
            '#C1272D',
            '#662D91',
          ],
          borderColor: '#fff',
          borderWidth: 2,
        },
      ],
    },
  };
};

const KPICard: React.FC<{
  title: string;
  value: string;
  change: string;
  icon: React.ReactNode;
  color: string;
}> = ({ title, value, change, icon, color }) => (
  <Card>
    <CardContent className="pt-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          <p className={`text-xs mt-2 ${change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
            {change}
          </p>
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          {icon}
        </div>
      </div>
    </CardContent>
  </Card>
);

export default function AdminDashboardExecutivo() {
  const mockData = useMemo(() => generateMockData(), []);

  // Dados dos KPIs
  const kpis = [
    {
      title: 'Receita Total',
      value: 'R$ 329.500',
      change: '+12% vs mês anterior',
      icon: <DollarSign className="h-6 w-6 text-white" />,
      color: 'bg-green-500',
    },
    {
      title: 'Custos Operacionais',
      value: 'R$ 88.000',
      change: '+5% vs mês anterior',
      icon: <Fuel className="h-6 w-6 text-white" />,
      color: 'bg-orange-500',
    },
    {
      title: 'Lucro Líquido',
      value: 'R$ 241.500',
      change: '+18% vs mês anterior',
      icon: <TrendingUp className="h-6 w-6 text-white" />,
      color: 'bg-blue-500',
    },
    {
      title: 'Frota Ativa',
      value: '42/48',
      change: '87.5% de disponibilidade',
      icon: <Truck className="h-6 w-6 text-white" />,
      color: 'bg-purple-500',
    },
    {
      title: 'Taxa de Ocupação',
      value: '85%',
      change: '+7% vs mês anterior',
      icon: <Users className="h-6 w-6 text-white" />,
      color: 'bg-pink-500',
    },
    {
      title: 'Manutenções Pendentes',
      value: '4',
      change: '2 críticas, 2 normais',
      icon: <Wrench className="h-6 w-6 text-white" />,
      color: 'bg-red-500',
    },
  ];

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2 text-gray-900">
          <Calendar className="h-8 w-8 text-orange-500" />
          Dashboard Executivo
        </h1>
        <p className="text-gray-600 mt-2">
          Análise completa de performance, receitas, custos e utilização de frota
        </p>
      </div>

      {/* KPIs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {kpis.map((kpi, index) => (
          <KPICard
            key={index}
            title={kpi.title}
            value={kpi.value}
            change={kpi.change}
            icon={kpi.icon}
            color={kpi.color}
          />
        ))}
      </div>

      {/* Gráficos Principais */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Receita Mensal */}
        <ChartContainer
          type="line"
          data={mockData.receita}
          title="Receita Mensal"
          height={350}
          options={{
            plugins: {
              legend: {
                display: true,
              },
            },
            scales: {
              y: {
                beginAtZero: true,
                ticks: {
                  callback: (value) => `R$ ${(value as number).toLocaleString('pt-BR')}`,
                },
              },
            },
          }}
        />

        {/* Taxa de Ocupação */}
        <ChartContainer
          type="line"
          data={mockData.ocupacao}
          title="Taxa de Ocupação Média"
          height={350}
          options={{
            plugins: {
              legend: {
                display: true,
              },
            },
            scales: {
              y: {
                beginAtZero: true,
                max: 100,
                ticks: {
                  callback: (value) => `${value}%`,
                },
              },
            },
          }}
        />
      </div>

      {/* Custos e Despesas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Custos por Categoria */}
        <ChartContainer
          type="bar"
          data={mockData.custos}
          title="Custos Operacionais por Categoria"
          height={350}
          options={{
            indexAxis: 'y' as const,
            plugins: {
              legend: {
                display: false,
              },
            },
            scales: {
              x: {
                ticks: {
                  callback: (value) => `R$ ${(value as number).toLocaleString('pt-BR')}`,
                },
              },
            },
          }}
        />

        {/* Distribuição de Despesas */}
        <ChartContainer
          type="doughnut"
          data={mockData.despesas}
          title="Distribuição de Despesas"
          height={350}
          options={{
            plugins: {
              legend: {
                position: 'bottom' as const,
              },
            },
          }}
        />
      </div>

      {/* Status da Frota */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <ChartContainer
            type="pie"
            data={mockData.frota}
            title="Status da Frota"
            height={350}
            options={{
              plugins: {
                legend: {
                  position: 'bottom' as const,
                },
              },
            }}
          />
        </div>

        {/* Resumo Executivo */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-orange-500" />
                Resumo Executivo - Junho 2026
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-sm text-gray-600">Receita Acumulada</p>
                  <p className="text-2xl font-bold text-green-600">R$ 329.500</p>
                </div>
                <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                  <p className="text-sm text-gray-600">Custos Acumulados</p>
                  <p className="text-2xl font-bold text-red-600">R$ 88.000</p>
                </div>
              </div>

              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-gray-600">Margem de Lucro</p>
                <p className="text-2xl font-bold text-blue-600">73.3%</p>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold text-gray-900">Principais Indicadores:</h4>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    Frota em operação: 42 veículos (87.5%)
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                    Em manutenção: 4 veículos (8.3%)
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                    Inativos: 2 veículos (4.2%)
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                    Taxa média de ocupação: 85%
                  </li>
                </ul>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <p className="text-xs text-gray-600">
                  Dados atualizados em 13 de Janeiro de 2026 às 04:00 AM
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Rodapé com Informações */}
      <Card className="bg-gradient-to-r from-orange-50 to-yellow-50 border-orange-200">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <AlertCircle className="h-5 w-5 text-orange-600 mt-1 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-orange-900">Informações Importantes</h3>
              <p className="text-sm text-orange-800 mt-2">
                Este dashboard apresenta dados consolidados e simulados para demonstração. 
                Os gráficos serão atualizados em tempo real com dados do seu banco de dados 
                após a integração completa das rotas tRPC.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
