import { useState } from "react";
import { useLocalAuth } from "@/hooks/useLocalAuth";
import { Redirect } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LayoutDashboard,
  Bus,
  Users,
  Receipt,
  Fuel,
  Wrench,
  Calendar,
  DollarSign,
  TrendingUp,
  TrendingDown,
  LogOut,
  User,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Clock,
  MapPin,
} from "lucide-react";
import { toast } from "sonner";

export default function Admin() {
  const { user, logout } = useLocalAuth();
  const [activeTab, setActiveTab] = useState<
    "dashboard" | "veiculos" | "motoristas" | "despesas" | "manutencao" | "relatorios"
  >("dashboard");

  // Redirecionar se não estiver autenticado
  if (!user) {
    return <Redirect to="/login" />;
  }

  // Verificar se é admin
  if (user.role !== "admin") {
    return <Redirect to="/funcionario" />;
  }

  const handleLogout = () => {
    logout();
    toast.success("Logout realizado com sucesso!");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-gradient-to-b from-blue-700 to-blue-900 text-white shadow-2xl z-40">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center">
              <User className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-bold text-lg">{user.name}</h3>
              <p className="text-xs text-blue-200">Administrador</p>
            </div>
          </div>

          <nav className="space-y-2">
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                activeTab === "dashboard"
                  ? "bg-white text-blue-700 shadow-lg"
                  : "hover:bg-white/10"
              }`}
            >
              <LayoutDashboard className="h-5 w-5" />
              <span className="font-medium">Dashboard</span>
            </button>

            <button
              onClick={() => setActiveTab("veiculos")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                activeTab === "veiculos"
                  ? "bg-white text-blue-700 shadow-lg"
                  : "hover:bg-white/10"
              }`}
            >
              <Bus className="h-5 w-5" />
              <span className="font-medium">Veículos</span>
            </button>

            <button
              onClick={() => setActiveTab("motoristas")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                activeTab === "motoristas"
                  ? "bg-white text-blue-700 shadow-lg"
                  : "hover:bg-white/10"
              }`}
            >
              <Users className="h-5 w-5" />
              <span className="font-medium">Motoristas</span>
            </button>

            <button
              onClick={() => setActiveTab("despesas")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                activeTab === "despesas"
                  ? "bg-white text-blue-700 shadow-lg"
                  : "hover:bg-white/10"
              }`}
            >
              <Receipt className="h-5 w-5" />
              <span className="font-medium">Despesas</span>
            </button>

            <button
              onClick={() => setActiveTab("manutencao")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                activeTab === "manutencao"
                  ? "bg-white text-blue-700 shadow-lg"
                  : "hover:bg-white/10"
              }`}
            >
              <Wrench className="h-5 w-5" />
              <span className="font-medium">Manutenção</span>
            </button>

            <button
              onClick={() => setActiveTab("relatorios")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                activeTab === "relatorios"
                  ? "bg-white text-blue-700 shadow-lg"
                  : "hover:bg-white/10"
              }`}
            >
              <FileText className="h-5 w-5" />
              <span className="font-medium">Relatórios</span>
            </button>
          </nav>

          <div className="absolute bottom-6 left-6 right-6">
            <Button
              onClick={handleLogout}
              variant="outline"
              className="w-full bg-white/10 border-white/30 text-white hover:bg-white/20"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                Dashboard Administrativo
              </h1>
              <p className="text-gray-600">
                Visão completa da gestão de frotas e operações
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => window.location.href = '/admin/veiculos'}
                className="bg-gradient-to-r from-orange-500 to-orange-600 hover:shadow-xl"
              >
                <Bus className="h-4 w-4 mr-2" />
                Gestão de Veículos
              </Button>
              <Button
                onClick={() => window.location.href = '/rastreamento'}
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:shadow-xl"
              >
                <MapPin className="h-4 w-4 mr-2" />
                Ver Rastreamento
              </Button>
            </div>
          </div>

          {/* Dashboard */}
          {activeTab === "dashboard" && (
            <div className="space-y-6">
              {/* KPIs */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-xl">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-blue-100 text-sm mb-1">Veículos Ativos</p>
                        <h3 className="text-4xl font-bold">12</h3>
                        <p className="text-xs text-blue-200 mt-1">de 15 total</p>
                      </div>
                      <Bus className="h-12 w-12 text-blue-200" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0 shadow-xl">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-green-100 text-sm mb-1">Receita Mensal</p>
                        <h3 className="text-4xl font-bold">R$ 85k</h3>
                        <div className="flex items-center gap-1 mt-1">
                          <TrendingUp className="h-3 w-3" />
                          <span className="text-xs text-green-200">+12% vs mês anterior</span>
                        </div>
                      </div>
                      <DollarSign className="h-12 w-12 text-green-200" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0 shadow-xl">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-orange-100 text-sm mb-1">Despesas Mês</p>
                        <h3 className="text-4xl font-bold">R$ 32k</h3>
                        <div className="flex items-center gap-1 mt-1">
                          <TrendingDown className="h-3 w-3" />
                          <span className="text-xs text-orange-200">-5% vs mês anterior</span>
                        </div>
                      </div>
                      <Receipt className="h-12 w-12 text-orange-200" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-xl">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-purple-100 text-sm mb-1">Motoristas</p>
                        <h3 className="text-4xl font-bold">18</h3>
                        <p className="text-xs text-purple-200 mt-1">ativos</p>
                      </div>
                      <Users className="h-12 w-12 text-purple-200" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Alertas e Manutenções */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-orange-500" />
                      Alertas Importantes
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg border border-red-200">
                        <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0" />
                        <div className="flex-1">
                          <p className="font-medium text-sm">Van ABC-1234 - IPVA Vencido</p>
                          <p className="text-xs text-gray-600">Vencimento: 15/12/2025</p>
                        </div>
                        <Button size="sm" variant="outline">Ver</Button>
                      </div>

                      <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                        <Clock className="h-5 w-5 text-yellow-600 flex-shrink-0" />
                        <div className="flex-1">
                          <p className="font-medium text-sm">Ônibus XYZ-5678 - Manutenção Preventiva</p>
                          <p className="text-xs text-gray-600">Agendada para: 20/01/2026</p>
                        </div>
                        <Button size="sm" variant="outline">Ver</Button>
                      </div>

                      <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg border border-orange-200">
                        <Fuel className="h-5 w-5 text-orange-500 flex-shrink-0" />
                        <div className="flex-1">
                          <p className="font-medium text-sm">Consumo elevado - Van DEF-9012</p>
                          <p className="text-xs text-gray-600">+25% acima da média</p>
                        </div>
                        <Button size="sm" variant="outline">Ver</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-blue-500" />
                      Próximas Manutenções
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                        <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                          <Wrench className="h-6 w-6 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-sm">Troca de óleo - Van ABC-1234</p>
                          <p className="text-xs text-gray-600">18/01/2026 • 08:00</p>
                        </div>
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                      </div>

                      <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                        <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                          <Wrench className="h-6 w-6 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-sm">Revisão completa - Ônibus XYZ-5678</p>
                          <p className="text-xs text-gray-600">20/01/2026 • 14:00</p>
                        </div>
                        <Clock className="h-5 w-5 text-orange-500" />
                      </div>

                      <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                        <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                          <Wrench className="h-6 w-6 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-sm">Alinhamento - Van DEF-9012</p>
                          <p className="text-xs text-gray-600">22/01/2026 • 10:00</p>
                        </div>
                        <Clock className="h-5 w-5 text-orange-500" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Despesas Pendentes */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Receipt className="h-5 w-5 text-orange-500" />
                    Despesas Pendentes de Aprovação
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium">Alimentação - João Silva</p>
                        <p className="text-sm text-gray-600">Viagem Curitiba → Florianópolis • 10/01/2026</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg">R$ 85,00</p>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" className="bg-green-600 hover:bg-green-700">
                          Aprovar
                        </Button>
                        <Button size="sm" variant="outline" className="text-red-600">
                          Rejeitar
                        </Button>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium">Pedágio - Maria Santos</p>
                        <p className="text-sm text-gray-600">Viagem Curitiba → São Paulo • 09/01/2026</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg">R$ 142,50</p>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" className="bg-green-600 hover:bg-green-700">
                          Aprovar
                        </Button>
                        <Button size="sm" variant="outline" className="text-red-600">
                          Rejeitar
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Outras abas (placeholder) */}
          {activeTab !== "dashboard" && (
            <Card>
              <CardContent className="p-12 text-center">
                <div className="text-gray-400 mb-4">
                  <FileText className="h-16 w-16 mx-auto" />
                </div>
                <h3 className="text-xl font-bold text-gray-700 mb-2">
                  Seção em Desenvolvimento
                </h3>
                <p className="text-gray-600">
                  Esta funcionalidade está sendo implementada.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
