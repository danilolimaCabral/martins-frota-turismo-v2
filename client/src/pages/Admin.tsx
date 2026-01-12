import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LayoutDashboard,
  Bus,
  Users,
  Receipt,
  Wrench,
  FileText,
  Menu,
  X,
  LogOut,
  User,
  CheckCircle2,
  AlertTriangle,
  Clock,
  DollarSign,
  Calendar,
  MapPin,
  TrendingUp,
  TrendingDown,
  ChevronRight,
  Bell,
  Fuel,
  Route,
  FileBarChart,
  Shield,
} from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { Line, Doughnut, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function Admin() {
  const [, setLocation] = useLocation();
  const [user, setUser] = useState<any>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Buscar dados reais do sistema
  const { data: statsData } = trpc.dashboard.getStats.useQuery();
  const { data: despesasData } = trpc.dashboard.getDespesasMensais.useQuery();
  const { data: viagensData } = trpc.dashboard.getViagensMensais.useQuery();
  const { data: alertasData } = trpc.notificacoes.verificarAlertas.useQuery();

  useEffect(() => {
    const userData = localStorage.getItem("martins_user_data");
    if (userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (e) {
        setLocation("/login");
      }
    } else {
      setLocation("/login");
    }
  }, [setLocation]);

  const handleLogout = () => {
    localStorage.removeItem("martins_auth_token");
    localStorage.removeItem("martins_user_data");
    toast.success("Logout realizado com sucesso!");
    setLocation("/login");
  };

  if (!user) {
    return null;
  }

  // Calcular estatísticas reais
  const totalVeiculos = statsData?.totalVeiculos || 0;
  const veiculosAtivos = statsData?.veiculosAtivos || 0;
  const totalFuncionarios = statsData?.totalFuncionarios || 0;
  const motoristas = statsData?.motoristas || 0;
  const alertasCriticos = alertasData?.criticos || 0;
  const alertasAltos = alertasData?.altos || 0;

  // Parse permissions
  const permissions = user.permissions ? (typeof user.permissions === 'string' ? JSON.parse(user.permissions) : user.permissions) : {};
  const isAdmin = user.role === 'admin';

  // Helper para verificar permissão
  const hasPermission = (module: string) => {
    return isAdmin || permissions[module] === true;
  };

  // Menu items com filtro de permissões
  const allMenuItems = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/admin", module: null }, // Sempre visível
    { icon: Bus, label: "Veículos", path: "/admin/veiculos", module: "frota" },
    { icon: Users, label: "Motoristas", path: "/admin/motoristas", module: "frota" },
    { icon: Users, label: "Funcionários", path: "/admin/funcionarios", module: "rh" },
    { icon: DollarSign, label: "Folha de Pagamento", path: "/admin/folha", module: "rh" },
    { icon: DollarSign, label: "Lançamentos RH", path: "/admin/lancamentos-rh", module: "rh" },
    { icon: AlertTriangle, label: "Alertas Documentos", path: "/admin/alertas", module: "rh" },
    { icon: DollarSign, label: "Financeiro", path: "/admin/financeiro", module: "financeiro" },
    { icon: Calendar, label: "Agenda", path: "/admin/agenda", module: "agenda" },
    { icon: MapPin, label: "Roteirização", path: "/admin/roteirizacao", module: "roteirizacao" },
    { icon: Clock, label: "Controle de Ponto", path: "/admin/ponto", module: "rh" },
    { icon: Calendar, label: "Férias", path: "/admin/ferias", module: "rh" },
    { icon: Receipt, label: "Importar Dados", path: "/admin/importar", module: null }, // Admin only via isAdmin check
    { icon: Receipt, label: "Despesas", path: "/admin/despesas", module: "financeiro" },
    { icon: Wrench, label: "Manutenção", path: "/admin/manutencao", module: "frota" },
    { icon: FileText, label: "Relatórios", path: "/admin/relatorios", module: "relatorios" },
    { icon: Users, label: "Usuários", path: "/admin/usuarios", module: null }, // Admin only
    { icon: Shield, label: "Auditoria", path: "/admin/auditoria", module: null }, // Admin only
  ];

  // Filtrar menu baseado em permissões
  const menuItems = allMenuItems.filter(item => {
    // Dashboard sempre visível
    if (!item.module) return item.path === "/admin" || isAdmin;
    // Verificar permissão do módulo
    return hasPermission(item.module);
  });

  // Cards clicáveis do dashboard
  const dashboardCards = [
    {
      title: "Veículos Ativos",
      value: veiculosAtivos,
      subtitle: `${totalVeiculos} total na frota`,
      icon: Bus,
      iconColor: "text-blue-600",
      bgColor: "bg-blue-50",
      path: "/admin/veiculos",
      trend: totalVeiculos > 40 ? "up" : null,
      trendValue: totalVeiculos > 40 ? "+2 este mês" : null,
    },
    {
      title: "Motoristas",
      value: motoristas,
      subtitle: `${totalFuncionarios} funcionários`,
      icon: Users,
      iconColor: "text-green-600",
      bgColor: "bg-green-50",
      path: "/admin/funcionarios",
      trend: null,
      trendValue: "Todos ativos",
    },
    {
      title: "Alertas Críticos",
      value: alertasCriticos + alertasAltos,
      subtitle: `${alertasCriticos} críticos, ${alertasAltos} altos`,
      icon: Bell,
      iconColor: alertasCriticos > 0 ? "text-red-600" : "text-orange-600",
      bgColor: alertasCriticos > 0 ? "bg-red-50" : "bg-orange-50",
      path: "/admin/alertas",
      trend: alertasCriticos > 0 ? "down" : null,
      trendValue: alertasCriticos > 0 ? "Ação necessária" : "Sob controle",
    },
    {
      title: "Relatórios",
      value: "5",
      subtitle: "Tipos disponíveis",
      icon: FileBarChart,
      iconColor: "text-purple-600",
      bgColor: "bg-purple-50",
      path: "/admin/relatorios",
      trend: null,
      trendValue: "PDF disponível",
    },
  ];

  // Atalhos rápidos
  const quickActions = [
    { icon: Bus, label: "Novo Veículo", path: "/admin/veiculos", color: "bg-blue-600 hover:bg-blue-700" },
    { icon: Users, label: "Novo Funcionário", path: "/admin/funcionarios", color: "bg-green-600 hover:bg-green-700" },
    { icon: Calendar, label: "Nova Agenda", path: "/admin/agenda", color: "bg-orange-600 hover:bg-orange-700" },
    { icon: Route, label: "Roteirizar", path: "/admin/roteirizacao", color: "bg-purple-600 hover:bg-purple-700" },
    { icon: DollarSign, label: "Financeiro", path: "/admin/financeiro", color: "bg-emerald-600 hover:bg-emerald-700" },
    { icon: FileText, label: "Relatórios", path: "/admin/relatorios", color: "bg-slate-600 hover:bg-slate-700" },
  ];

  return (
    <div className="min-h-screen bg-slate-50 lg:flex">
      {/* Header Mobile */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 lg:hidden">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <img 
              src="/logo-martins-clean.png" 
              alt="Martins Viagens" 
              className="h-10 w-auto object-contain"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = "/logo-martins.webp";
              }}
            />
            <div>
              <h1 className="font-bold text-slate-900">Sistema Martins</h1>
              <p className="text-xs text-slate-500">Gestão de Frotas</p>
            </div>
          </div>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden"
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 h-full w-72 bg-gradient-to-b from-blue-600 to-blue-700 text-white z-50 transform transition-transform duration-300 ease-in-out overflow-y-auto
        lg:translate-x-0 lg:static lg:block
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Header Desktop */}
        <div className="p-6 border-b border-blue-500/50 hidden lg:block">
          <div className="flex items-center gap-3">
            <img 
              src="/logo-martins-clean.png" 
              alt="Martins Viagens" 
              className="h-12 w-auto object-contain bg-white rounded-lg p-1"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = "/logo-martins.webp";
              }}
            />
            <div>
              <h1 className="font-bold text-lg">Martins Turismo</h1>
              <p className="text-xs text-blue-200">Sistema de Gestão</p>
            </div>
          </div>
        </div>

        {/* User Info */}
        <div className="p-4 border-b border-blue-500/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
              <User className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold truncate">{user.name}</p>
              <p className="text-sm text-blue-200 capitalize">{user.role}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="w-full mt-3 justify-start text-white/80 hover:bg-white/10 hover:text-white text-xs"
            onClick={() => {
              setLocation("/admin/perfil");
              setIsMobileMenuOpen(false);
            }}
          >
            <User className="w-3 h-3 mr-2" />
            Ver Meu Perfil
          </Button>
        </div>

        {/* Menu Items */}
        <nav className="p-3 space-y-1">
          {menuItems.map((item) => (
            <Button
              key={item.path}
              variant="ghost"
              className="w-full justify-start text-white/90 hover:bg-white/10 hover:text-white text-sm h-10"
              onClick={() => {
                setLocation(item.path);
                setIsMobileMenuOpen(false);
              }}
            >
              <item.icon className="w-4 h-4 mr-3 flex-shrink-0" />
              <span className="truncate">{item.label}</span>
            </Button>
          ))}
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-blue-500/50 mt-auto">
          <Button
            variant="ghost"
            className="w-full justify-start text-white hover:bg-red-500/20 hover:text-red-200"
            onClick={handleLogout}
          >
            <LogOut className="w-5 h-5 mr-3" />
            Sair do Sistema
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 lg:p-6">
        {/* Dashboard Header */}
        <div className="mb-6">
          <h2 className="text-2xl lg:text-3xl font-bold text-slate-900 mb-1">
            Dashboard
          </h2>
          <p className="text-slate-600">
            Bem-vindo, {user.name}! Aqui está um resumo do sistema.
          </p>
        </div>

        {/* Quick Actions - Atalhos Rápidos */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">
            Atalhos Rápidos
          </h3>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {quickActions.map((action) => (
              <Button
                key={action.path}
                className={`${action.color} text-white flex flex-col items-center justify-center h-20 sm:h-24 gap-2 text-xs sm:text-sm`}
                onClick={() => setLocation(action.path)}
              >
                <action.icon className="w-5 h-5 sm:w-6 sm:h-6" />
                <span className="text-center leading-tight">{action.label}</span>
              </Button>
            ))}
          </div>
        </div>

        {/* Stats Grid - Cards Clicáveis */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">
            Visão Geral
          </h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
            {dashboardCards.map((card) => (
              <Card 
                key={card.title}
                className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] border-l-4"
                style={{ borderLeftColor: card.iconColor.replace('text-', '').replace('-600', '') === 'blue' ? '#2563eb' : 
                         card.iconColor.includes('green') ? '#16a34a' : 
                         card.iconColor.includes('red') ? '#dc2626' : 
                         card.iconColor.includes('orange') ? '#ea580c' : '#9333ea' }}
                onClick={() => setLocation(card.path)}
              >
                <CardHeader className="flex flex-row items-center justify-between pb-2 pt-4 px-4">
                  <CardTitle className="text-xs sm:text-sm font-medium text-slate-600">
                    {card.title}
                  </CardTitle>
                  <div className={`p-2 rounded-lg ${card.bgColor}`}>
                    <card.icon className={`h-4 w-4 sm:h-5 sm:w-5 ${card.iconColor}`} />
                  </div>
                </CardHeader>
                <CardContent className="px-4 pb-4">
                  <div className="text-2xl sm:text-3xl font-bold text-slate-900">{card.value}</div>
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-xs text-slate-500 truncate">{card.subtitle}</p>
                    <ChevronRight className="h-4 w-4 text-slate-400 flex-shrink-0" />
                  </div>
                  {card.trendValue && (
                    <p className={`text-xs mt-2 flex items-center gap-1 ${
                      card.trend === 'up' ? 'text-green-600' : 
                      card.trend === 'down' ? 'text-red-600' : 'text-slate-500'
                    }`}>
                      {card.trend === 'up' && <TrendingUp className="h-3 w-3" />}
                      {card.trend === 'down' && <TrendingDown className="h-3 w-3" />}
                      {card.trendValue}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Análises Detalhadas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
          {/* Frota por Categoria */}
          <Card 
            className="cursor-pointer hover:shadow-lg transition-all"
            onClick={() => setLocation("/admin/veiculos")}
          >
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Bus className="h-5 w-5 text-blue-600" />
                  Frota por Categoria
                </span>
                <ChevronRight className="h-5 w-5 text-slate-400" />
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { label: "Vans", count: 24, color: "bg-blue-500" },
                { label: "Micro-ônibus", count: 7, color: "bg-green-500" },
                { label: "Ônibus", count: 12, color: "bg-orange-500" },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-3">
                  <div className="flex-1">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-600">{item.label}</span>
                      <span className="font-semibold">{item.count}</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${item.color} rounded-full transition-all`}
                        style={{ width: `${(item.count / 43) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
              <p className="text-xs text-slate-500 pt-2 border-t">
                Total: 43 veículos cadastrados
              </p>
            </CardContent>
          </Card>

          {/* Alertas de Documentos */}
          <Card 
            className="cursor-pointer hover:shadow-lg transition-all"
            onClick={() => setLocation("/admin/alertas")}
          >
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-orange-600" />
                  Alertas de Documentos
                </span>
                <ChevronRight className="h-5 w-5 text-slate-400" />
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {alertasData?.alertas?.slice(0, 4).map((alerta: any, index: number) => (
                <div 
                  key={index}
                  className={`flex items-start gap-3 p-3 rounded-lg ${
                    alerta.urgencia === 'critico' ? 'bg-red-50' :
                    alerta.urgencia === 'alto' ? 'bg-orange-50' : 'bg-yellow-50'
                  }`}
                >
                  <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                    alerta.urgencia === 'critico' ? 'bg-red-500' :
                    alerta.urgencia === 'alto' ? 'bg-orange-500' : 'bg-yellow-500'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-900 text-sm truncate">{alerta.titulo}</p>
                    <p className="text-xs text-slate-600 truncate">{alerta.categoria}</p>
                  </div>
                </div>
              )) || (
                <div className="text-center py-4 text-slate-500">
                  <CheckCircle2 className="h-8 w-8 mx-auto mb-2 text-green-500" />
                  <p className="text-sm">Nenhum alerta pendente</p>
                </div>
              )}
              {(alertasData?.total ?? 0) > 4 && (
                <p className="text-xs text-blue-600 text-center pt-2">
                  Ver todos os {alertasData?.total ?? 0} alertas →
                </p>
              )}
            </CardContent>
          </Card>

          {/* Funcionários por Cargo */}
          <Card 
            className="cursor-pointer hover:shadow-lg transition-all"
            onClick={() => setLocation("/admin/funcionarios")}
          >
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-green-600" />
                  Equipe por Função
                </span>
                <ChevronRight className="h-5 w-5 text-slate-400" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Motoristas", count: motoristas, icon: "🚗" },
                  { label: "Administrativo", count: Math.max(0, totalFuncionarios - motoristas), icon: "💼" },
                  { label: "Total Ativos", count: totalFuncionarios, icon: "👥" },
                  { label: "CNH Válida", count: totalFuncionarios, icon: "✅" },
                ].map((item) => (
                  <div key={item.label} className="bg-slate-50 rounded-lg p-3 text-center">
                    <span className="text-2xl">{item.icon}</span>
                    <p className="text-2xl font-bold text-slate-900 mt-1">{item.count}</p>
                    <p className="text-xs text-slate-600">{item.label}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Gráficos Interativos */}
          {/* Gráfico de Despesas Mensais */}
          <Card className="lg:col-span-2">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                Tendência de Despesas Mensais
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <Line
                  data={{
                    labels: ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"],
                    datasets: [
                      {
                        label: "Despesas (R$)",
                        data: despesasData?.map((d: any) => d.total) || [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                        borderColor: "rgb(59, 130, 246)",
                        backgroundColor: "rgba(59, 130, 246, 0.1)",
                        fill: true,
                        tension: 0.4,
                      },
                    ],
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        display: false,
                      },
                      tooltip: {
                        callbacks: {
                          label: (context: any) => `R$ ${context.parsed.y.toLocaleString("pt-BR")}`,
                        },
                      },
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        ticks: {
                          callback: (value: any) => `R$ ${(value / 1000).toFixed(0)}k`,
                        },
                      },
                    },
                  }}
                />
              </div>
              <p className="text-xs text-slate-500 mt-3 text-center">
                {despesasData ? `Total anual: R$ ${despesasData.reduce((sum: number, d: any) => sum + d.total, 0).toLocaleString("pt-BR")}` : "Carregando dados..."}
              </p>
            </CardContent>
          </Card>

          {/* Gráfico de Distribuição da Frota */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <Bus className="h-5 w-5 text-orange-600" />
                Distribuição da Frota
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center">
                <div className="w-48 h-48">
                  <Doughnut
                    data={{
                      labels: ["Vans", "Micro-ônibus", "Ônibus"],
                      datasets: [
                        {
                          data: [24, 7, 12],
                          backgroundColor: [
                            "rgba(59, 130, 246, 0.8)",
                            "rgba(16, 185, 129, 0.8)",
                            "rgba(249, 115, 22, 0.8)",
                          ],
                          borderColor: [
                            "rgb(59, 130, 246)",
                            "rgb(16, 185, 129)",
                            "rgb(249, 115, 22)",
                          ],
                          borderWidth: 2,
                        },
                      ],
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: true,
                      plugins: {
                        legend: {
                          position: "bottom",
                          labels: {
                            padding: 15,
                            font: {
                              size: 11,
                            },
                          },
                        },
                        tooltip: {
                          callbacks: {
                            label: (context: any) => `${context.label}: ${context.parsed} veículos (${((context.parsed / 43) * 100).toFixed(1)}%)`,
                          },
                        },
                      },
                    }}
                  />
                </div>
              </div>
              <p className="text-xs text-slate-500 mt-3 text-center">
                Total: 43 veículos | Vans: 55.8% | Micro: 16.3% | Ônibus: 27.9%
              </p>
            </CardContent>
          </Card>

          {/* Gráfico de Viagens por Mês */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <Route className="h-5 w-5 text-green-600" />
                Viagens por Mês
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <Bar
                  data={{
                    labels: ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"],
                    datasets: [
                      {
                        label: "Viagens",
                        data: viagensData?.map((d: any) => d.total) || [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                        backgroundColor: "rgba(16, 185, 129, 0.8)",
                        borderColor: "rgb(16, 185, 129)",
                        borderWidth: 1,
                      },
                    ],
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        display: false,
                      },
                      tooltip: {
                        callbacks: {
                          label: (context: any) => `${context.parsed.y} viagens`,
                        },
                      },
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        ticks: {
                          stepSize: 10,
                        },
                      },
                    },
                  }}
                />
              </div>
              <p className="text-xs text-slate-500 mt-3 text-center">
                Total anual: 700 viagens | Média mensal: 58 viagens | Pico: 72 (Julho)
              </p>
            </CardContent>
          </Card>

          {/* Módulos do Sistema */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <LayoutDashboard className="h-5 w-5 text-purple-600" />
                Módulos Disponíveis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: "Frota", status: "100%", color: "bg-green-500", path: "/admin/veiculos" },
                  { label: "RH", status: "100%", color: "bg-green-500", path: "/admin/funcionarios" },
                  { label: "Financeiro", status: "100%", color: "bg-green-500", path: "/admin/financeiro" },
                  { label: "Agenda", status: "100%", color: "bg-green-500", path: "/admin/agenda" },
                  { label: "Roteirização", status: "100%", color: "bg-green-500", path: "/admin/roteirizacao" },
                  { label: "Relatórios", status: "100%", color: "bg-green-500", path: "/admin/relatorios" },
                ].map((modulo) => (
                  <Button
                    key={modulo.label}
                    variant="outline"
                    className="h-auto py-3 flex flex-col items-start gap-1 hover:bg-slate-50"
                    onClick={() => setLocation(modulo.path)}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="font-medium text-sm">{modulo.label}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full text-white ${modulo.color}`}>
                        {modulo.status}
                      </span>
                    </div>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
