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
} from "lucide-react";
import { toast } from "sonner";

export default function Admin() {
  const [, setLocation] = useLocation();
  const [user, setUser] = useState<any>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    // Ler dados do usuário do localStorage
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

  const menuItems = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/admin" },
    { icon: Bus, label: "Veículos", path: "/admin/veiculos" },
    { icon: Users, label: "Motoristas", path: "/admin/motoristas" },
    { icon: Users, label: "Funcionários", path: "/admin/funcionarios" },
    { icon: DollarSign, label: "Folha de Pagamento", path: "/admin/folha" },
    { icon: DollarSign, label: "Lançamentos RH", path: "/admin/lancamentos-rh" },
    { icon: AlertTriangle, label: "Alertas Documentos", path: "/admin/alertas" },
    { icon: DollarSign, label: "Financeiro", path: "/admin/financeiro" },
    { icon: Calendar, label: "Agenda", path: "/admin/agenda" },
    { icon: MapPin, label: "Roteirização", path: "/admin/roteirizacao" },
    { icon: Receipt, label: "Importar Dados", path: "/admin/importar" },
    { icon: Receipt, label: "Despesas", path: "/admin/despesas" },
    { icon: Wrench, label: "Manutenção", path: "/admin/manutencao" },
    { icon: FileText, label: "Relatórios", path: "/admin/relatorios" },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header Mobile */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 lg:hidden">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <img 
              src="/logo.png" 
              alt="Martins" 
              className="h-8 w-auto"
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
        fixed top-0 left-0 h-full w-72 bg-blue-600 text-white z-50 transform transition-transform duration-300 ease-in-out
        lg:translate-x-0 lg:static lg:block
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Header Desktop */}
        <div className="p-6 border-b border-blue-500 hidden lg:block">
          <div className="flex items-center gap-3">
            <img 
              src="/logo.png" 
              alt="Martins" 
              className="h-10 w-auto"
            />
            <div>
              <h1 className="font-bold text-lg">Sistema Martins</h1>
              <p className="text-xs text-blue-200">Gestão de Frotas</p>
            </div>
          </div>
        </div>

        {/* User Info */}
        <div className="p-6 border-b border-blue-500">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center">
              <User className="w-6 h-6" />
            </div>
            <div>
              <p className="font-semibold">{user.name}</p>
              <p className="text-sm text-blue-200 capitalize">{user.role}</p>
            </div>
          </div>
        </div>

        {/* Menu Items */}
        <nav className="p-4 space-y-2">
          {menuItems.map((item) => (
            <Button
              key={item.path}
              variant="ghost"
              className="w-full justify-start text-white hover:bg-blue-500 hover:text-white"
              onClick={() => {
                setLocation(item.path);
                setIsMobileMenuOpen(false);
              }}
            >
              <item.icon className="w-5 h-5 mr-3" />
              {item.label}
            </Button>
          ))}
        </nav>

        {/* Logout Button */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-blue-500">
          <Button
            variant="ghost"
            className="w-full justify-start text-white hover:bg-red-500 hover:text-white"
            onClick={handleLogout}
          >
            <LogOut className="w-5 h-5 mr-3" />
            Sair
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:ml-72 p-4 lg:p-8">
        {/* Dashboard Header */}
        <div className="mb-8">
          <h2 className="text-2xl lg:text-3xl font-bold text-slate-900 mb-2">
            Dashboard
          </h2>
          <p className="text-slate-600">
            Bem-vindo, {user.name}! Aqui está um resumo do sistema.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">
                Veículos Ativos
              </CardTitle>
              <Bus className="h-5 w-5 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">12</div>
              <p className="text-xs text-green-600 mt-1">
                +2 este mês
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">
                Motoristas
              </CardTitle>
              <Users className="h-5 w-5 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">8</div>
              <p className="text-xs text-slate-500 mt-1">
                Todos ativos
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">
                Despesas Mês
              </CardTitle>
              <DollarSign className="h-5 w-5 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">R$ 45.2k</div>
              <p className="text-xs text-red-600 mt-1">
                +12% vs mês anterior
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">
                Manutenções
              </CardTitle>
              <Wrench className="h-5 w-5 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">3</div>
              <p className="text-xs text-orange-600 mt-1">
                Pendentes
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Alerts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
          {/* Próximas Manutenções */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-blue-600" />
                Próximas Manutenções
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                <Wrench className="h-5 w-5 text-blue-600 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-900 text-sm">Troca de óleo - Van ABC-1234</p>
                  <p className="text-xs text-slate-600 mt-1">18/01/2026 • 08:00</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                <Wrench className="h-5 w-5 text-blue-600 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-900 text-sm">Revisão completa - Ônibus XYZ-5678</p>
                  <p className="text-xs text-slate-600 mt-1">20/01/2026 • 14:00</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                <Wrench className="h-5 w-5 text-blue-600 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-900 text-sm">Alinhamento - Van DEF-9012</p>
                  <p className="text-xs text-slate-600 mt-1">22/01/2026 • 10:00</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Despesas Pendentes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-600" />
                Despesas Pendentes de Aprovação
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start justify-between gap-3 p-3 bg-orange-50 rounded-lg">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-900 text-sm">Alimentação - João Silva</p>
                  <p className="text-xs text-slate-600 mt-1">Viagem Curitiba → Florianópolis • 10/01/2026</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-slate-900">R$ 85,00</p>
                  <div className="flex gap-1 mt-2">
                    <Button size="sm" className="h-7 text-xs bg-green-600 hover:bg-green-700">
                      Aprovar
                    </Button>
                    <Button size="sm" variant="outline" className="h-7 text-xs">
                      Rejeitar
                    </Button>
                  </div>
                </div>
              </div>

              <div className="flex items-start justify-between gap-3 p-3 bg-orange-50 rounded-lg">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-900 text-sm">Pedágio - Maria Santos</p>
                  <p className="text-xs text-slate-600 mt-1">Viagem Curitiba → São Paulo • 09/01/2026</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-slate-900">R$ 142,50</p>
                  <div className="flex gap-1 mt-2">
                    <Button size="sm" className="h-7 text-xs bg-green-600 hover:bg-green-700">
                      Aprovar
                    </Button>
                    <Button size="sm" variant="outline" className="h-7 text-xs">
                      Rejeitar
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
