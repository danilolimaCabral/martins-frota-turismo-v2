import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
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
    <div className="min-h-screen bg-slate-100 flex flex-col lg:flex-row">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 lg:hidden">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-2">
            <img src="/logo-martins.webp" alt="Martins" className="h-8 w-auto" />
            <h1 className="font-bold text-slate-900">Martins Admin</h1>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>
      </header>

      {/* Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 w-72 bg-gradient-to-b from-blue-600 to-blue-700 text-white z-30 transform transition-transform duration-300
          lg:static lg:translate-x-0 lg:h-screen
          ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
          overflow-y-auto
        `}
      >
        {/* Sidebar Header */}
        <div className="p-6 border-b border-blue-500/30 hidden lg:block">
          <div className="flex items-center gap-3">
            <img src="/logo-martins.webp" alt="Martins" className="h-10 w-auto" />
            <div>
              <h2 className="font-bold text-lg">Martins</h2>
              <p className="text-xs text-blue-100">Gestão de Frotas</p>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-blue-500/30">
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-blue-200" />
            <input
              type="text"
              placeholder="Buscar módulo..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-3 py-2 bg-blue-500/20 text-white placeholder-blue-200 rounded-lg border border-blue-500/30 focus:border-blue-400 focus:outline-none"
            />
          </div>
        </div>

        {/* Menu Items */}
        <nav className="p-4 space-y-6">
          {Object.entries(groupedMenuItems).map(([category, items]) => (
            <div key={category}>
              <h3 className="text-xs font-semibold text-blue-100 uppercase tracking-wider mb-3 px-3">
                {categoryLabels[category] || category}
              </h3>
              <div className="space-y-2">
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
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-colors ${
                        isActive
                          ? "bg-blue-500/30 text-white"
                          : "text-blue-100 hover:bg-blue-500/20"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="w-5 h-5" />
                        <span className="font-medium">{item.label}</span>
                      </div>
                      {item.badge && (
                        <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* User Profile */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-blue-500/30 bg-blue-700/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">
                  {user?.name?.charAt(0) || "U"}
                </span>
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold truncate">{user?.name || "Usuário"}</p>
                <p className="text-xs text-blue-100 truncate">{user?.email || "user@martins.com"}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              className="text-blue-100 hover:text-white hover:bg-blue-500/20"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {/* Top Bar */}
        <div className="bg-white border-b border-slate-200 p-4 md:p-6 hidden lg:flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Painel Administrativo</h1>
            <p className="text-sm text-slate-500">Bem-vindo ao sistema de gestão Martins</p>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon">
              <Bell className="w-5 h-5" />
            </Button>
            <Button variant="outline" size="icon">
              <Settings className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-4 md:p-6 overflow-auto">
          {currentPage === "/admin" ? (
            <div className="space-y-6">
              {/* Dashboard Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { title: "Veículos Ativos", value: "5", icon: Bus, color: "bg-blue-50 text-blue-600" },
                  { title: "Motoristas", value: "8", icon: Users, color: "bg-green-50 text-green-600" },
                  { title: "Alertas", value: "2", icon: AlertTriangle, color: "bg-red-50 text-red-600" },
                  { title: "Receita Mês", value: "R$ 45k", icon: TrendingUp, color: "bg-purple-50 text-purple-600" },
                ].map((card, i) => {
                  const Icon = card.icon;
                  return (
                    <div key={i} className="bg-white rounded-lg p-6 border border-slate-200 hover:shadow-lg transition-shadow">
                      <div className={`w-12 h-12 rounded-lg ${card.color} flex items-center justify-center mb-4`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <p className="text-sm text-slate-600 mb-1">{card.title}</p>
                      <p className="text-3xl font-bold text-slate-900">{card.value}</p>
                    </div>
                  );
                })}
              </div>

              {/* Welcome Message */}
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-8 text-white">
                <h2 className="text-2xl font-bold mb-2">Bem-vindo, {user?.name || "Usuário"}!</h2>
                <p className="text-blue-100">
                  Selecione um módulo no menu lateral para começar a gerenciar sua frota.
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg p-8 text-center">
              <p className="text-slate-600 text-lg">
                Página em desenvolvimento: <strong>{currentPage}</strong>
              </p>
            </div>
          )}
        </div>
      </main>

      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
}
