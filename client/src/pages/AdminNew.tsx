import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { NotificationCenter } from "@/components/NotificationCenter";
import { DashboardCharts } from "@/components/DashboardCharts";
import {
  LayoutDashboard,
  Bus,
  Users,
  DollarSign,
  Calendar,
  MapPin,
  FileText,
  Menu,
  X,
  LogOut,
  Settings,
  Bell,
  Search,
  ChevronDown,
  Home,
  Truck,
  AlertTriangle,
  TrendingUp,
  Clock,
  Fuel,
  Shield,
  Wrench,
  Receipt,
  ChevronRight,
  ArrowLeft,
} from "lucide-react";
import { toast } from "sonner";

interface MenuItem {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  path: string;
  category?: string;
  badge?: number;
}

export default function AdminNew() {
  const [, setLocation] = useLocation();
  const [user, setUser] = useState<any>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [currentPage, setCurrentPage] = useState("/admin");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const userData = localStorage.getItem("martins_user_data");
    if (!userData) {
      setLocation("/login");
      return;
    }
    setUser(JSON.parse(userData));
  }, [setLocation]);

  const handleLogout = () => {
    localStorage.removeItem("martins_user_data");
    localStorage.removeItem("martins_auth_token");
    toast.success("Logout realizado com sucesso!");
    setLocation("/login");
  };

  const menuItems: MenuItem[] = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/admin", category: "principal" },
    { icon: Bus, label: "Veículos", path: "/admin/veiculos", category: "frota", badge: 5 },
    { icon: Truck, label: "Motoristas", path: "/admin/motoristas", category: "frota" },
    { icon: Fuel, label: "Abastecimento", path: "/admin/abastecimento", category: "frota" },
    { icon: Wrench, label: "Manutenção", path: "/admin/manutencao", category: "frota" },
    { icon: Users, label: "Funcionários", path: "/admin/funcionarios", category: "rh" },
    { icon: DollarSign, label: "Folha de Pagamento", path: "/admin/folha", category: "rh" },
    { icon: Clock, label: "Controle de Ponto", path: "/admin/ponto", category: "rh" },
    { icon: Calendar, label: "Férias", path: "/admin/ferias", category: "rh" },
    { icon: DollarSign, label: "Financeiro", path: "/admin/financeiro", category: "financeiro", badge: 3 },
    { icon: Receipt, label: "Despesas", path: "/admin/despesas", category: "financeiro" },
    { icon: Calendar, label: "Agenda", path: "/admin/agenda", category: "operacional" },
    { icon: MapPin, label: "Roteirização", path: "/admin/roteirizacao", category: "operacional" },
    { icon: FileText, label: "Relatórios", path: "/admin/relatorios", category: "relatorios" },
    { icon: AlertTriangle, label: "Alertas", path: "/admin/alertas", category: "sistema", badge: 2 },
    { icon: Users, label: "Usuários", path: "/admin/usuarios", category: "sistema" },
    { icon: Shield, label: "Auditoria", path: "/admin/auditoria", category: "sistema" },
    { icon: Settings, label: "Configurações", path: "/admin/configuracoes", category: "sistema" },
  ];

  const filteredMenuItems = menuItems.filter(item =>
    item.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const groupedMenuItems = filteredMenuItems.reduce((acc, item) => {
    const category = item.category || "outro";
    if (!acc[category]) acc[category] = [];
    acc[category].push(item);
    return acc;
  }, {} as Record<string, MenuItem[]>);

  const categoryLabels: Record<string, string> = {
    principal: "Principal",
    frota: "Gestão de Frota",
    rh: "Recursos Humanos",
    financeiro: "Financeiro",
    operacional: "Operacional",
    relatorios: "Relatórios",
    sistema: "Sistema",
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 flex flex-col lg:flex-row">
      {/* Botão Voltar */}
      <div className="mb-6 flex items-center gap-2">
        <button
          onClick={() => window.history.back()}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-orange-600 hover:bg-orange-700 text-white transition-colors font-medium"
        >
          <ArrowLeft size={20} />
          <span>Voltar</span>
        </button>
      </div>

      {/* Header Mobile */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200/50 sticky top-0 z-40 lg:hidden shadow-sm">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-2">
            <img src="/images/logo-martins-onibus.png" alt="Martins" className="h-8 w-auto" />
            <h1 className="font-bold text-slate-900">Martins</h1>
          </div>
          <div className="flex items-center gap-2">
            <NotificationCenter />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="hover:bg-slate-100"
            >
              {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 w-72 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white z-30 transform transition-all duration-300
          lg:static lg:translate-x-0 lg:h-screen
          ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
          overflow-y-auto shadow-2xl
        `}
      >
        {/* Sidebar Header */}
        <div className="p-6 border-b border-slate-700/50 hidden lg:block bg-gradient-to-r from-slate-900 to-slate-800">
          <div className="flex items-center gap-3">
            <img src="/images/logo-martins-onibus.png" alt="Martins" className="h-12 w-auto" />
            <div>
              <h2 className="font-bold text-lg text-white">Martins</h2>
              <p className="text-xs text-slate-400">Gestão Inteligente</p>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-slate-700/50 bg-slate-800/50">
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar módulo..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-3 py-2 bg-slate-700/30 text-white placeholder-slate-400 rounded-lg border border-slate-600/30 focus:border-orange-500 focus:outline-none transition-colors"
            />
          </div>
        </div>

        {/* Menu Items */}
        <nav className="p-4 space-y-6">
          {Object.entries(groupedMenuItems).map(([category, items]) => (
            <div key={category}>
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 px-3">
                {categoryLabels[category] || category}
              </h3>
              <div className="space-y-1">
                {items.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentPage === item.path;
                  return (
                    <button
                      key={item.path}
                      onClick={() => {
                        setCurrentPage(item.path);
                        setLocation(item.path);
                        setIsSidebarOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-200 group ${
                        isActive
                          ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold shadow-lg shadow-orange-500/30"
                          : "text-slate-300 hover:bg-slate-700/50 hover:text-white"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="w-5 h-5" />
                        <span className="font-medium">{item.label}</span>
                      </div>
                      {item.badge && (
                        <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">
                          {item.badge}
                        </span>
                      )}
                      {isActive && <ChevronRight className="w-4 h-4 ml-auto" />}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* User Profile - Bottom */}
        <div className="mt-auto p-4 border-t border-slate-700/50 bg-gradient-to-r from-slate-800 to-slate-900">
          <div className="flex items-center justify-between gap-2 mb-4">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg">
                <span className="text-white font-bold text-sm">
                  {user?.name?.charAt(0) || "U"}
                </span>
              </div>
              <div className="min-w-0 hidden lg:block">
                <p className="text-sm font-semibold truncate text-white">{user?.name || "Usuário"}</p>
                <p className="text-xs text-slate-400 truncate">{user?.email || "user@martins.com"}</p>
              </div>
            </div>
          </div>
          <Button
            onClick={handleLogout}
            className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sair
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Content Area */}
        <div className="flex-1 overflow-auto">
          <div className="p-4 md:p-8 max-w-7xl mx-auto">
            {currentPage === "/admin" ? (
              <div className="space-y-8">
                {/* Dashboard Charts */}
                <DashboardCharts />

                {/* Dashboard Cards */}
                <div>
                  <h2 className="text-xl font-bold text-slate-900 mb-4">Resumo Executivo</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[
                      { title: "Veículos Ativos", value: "42", icon: Bus, color: "from-blue-500 to-blue-600", bgColor: "bg-blue-50" },
                      { title: "Motoristas", value: "44", icon: Users, color: "from-green-500 to-green-600", bgColor: "bg-green-50" },
                      { title: "Alertas", value: "2", icon: AlertTriangle, color: "from-red-500 to-red-600", bgColor: "bg-red-50" },
                      { title: "Receita Mês", value: "R$ 45k", icon: TrendingUp, color: "from-purple-500 to-purple-600", bgColor: "bg-purple-50" },
                    ].map((card, i) => {
                      const Icon = card.icon;
                      return (
                        <div key={i} className="bg-white rounded-xl p-6 border border-slate-200/50 hover:shadow-xl transition-all duration-300 hover:border-slate-300 group cursor-pointer">
                          <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${card.color} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
                            <Icon className="w-6 h-6 text-white" />
                          </div>
                          <p className="text-sm text-slate-600 mb-1 font-medium">{card.title}</p>
                          <p className="text-2xl font-bold text-slate-900">{card.value}</p>
                          <p className="text-xs text-slate-500 mt-2">↑ 12% vs mês anterior</p>
                        </div>
                      );
                    })}
                  </div>
                </div>


                {/* Quick Access */}
                <div>
                  <h2 className="text-xl font-bold text-slate-900 mb-4">Acesso Rápido</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[
                      { title: "Rastreamento", icon: MapPin, path: "/admin/rastreamento", color: "from-blue-500 to-cyan-500" },
                      { title: "Folha de Pagamento", icon: DollarSign, path: "/admin/folha", color: "from-green-500 to-emerald-500" },
                      { title: "Manutenção", icon: Wrench, path: "/admin/manutencao", color: "from-orange-500 to-red-500" },
                    ].map((item, i) => {
                      const Icon = item.icon;
                      return (
                        <button
                          key={i}
                          onClick={() => {
                            setCurrentPage(item.path);
                            setLocation(item.path);
                          }}
                          className="bg-white rounded-xl p-6 border border-slate-200/50 hover:shadow-xl transition-all duration-300 hover:border-slate-300 text-left group"
                        >
                          <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${item.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                            <Icon className="w-5 h-5 text-white" />
                          </div>
                          <p className="font-semibold text-slate-900 group-hover:text-slate-700">{item.title}</p>
                          <p className="text-xs text-slate-500 mt-1">Acessar módulo →</p>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl p-8 border border-slate-200/50 shadow-sm">
                <p className="text-slate-600 text-center">Carregando módulo...</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
