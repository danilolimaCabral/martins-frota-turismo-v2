import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Users,
  DollarSign,
  Wrench,
  Truck,
  AlertCircle,
  MapPin,
  TrendingUp,
  Clock,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface UserData {
  id: number;
  username: string;
  name: string;
  role: string;
}

export function DashboardPersonalizado() {
  const [, setLocation] = useLocation();
  const [user, setUser] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [greeting, setGreeting] = useState("Bem-vindo");

  useEffect(() => {
    // Carregar dados do usuário do localStorage
    const userData = localStorage.getItem("martins_user_data");
    if (!userData) {
      setLocation("/login");
      return;
    }

    try {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);

      // Determinar saudação baseada na hora do dia
      const hour = new Date().getHours();
      if (hour >= 5 && hour < 12) {
        setGreeting("Bom dia");
      } else if (hour >= 12 && hour < 18) {
        setGreeting("Boa tarde");
      } else {
        setGreeting("Boa noite");
      }
    } catch (error) {
      setLocation("/login");
    } finally {
      setIsLoading(false);
    }
  }, [setLocation]);

  const handleLogout = () => {
    localStorage.removeItem("martins_user_data");
    setLocation("/login");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="text-white text-lg">Carregando...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // Dashboard para Diretor
  if (user.role === "diretor") {
    return <DashboardDiretor user={user} greeting={greeting} onLogout={handleLogout} />;
  }

  // Dashboard para Financeiro
  if (user.role === "financeiro") {
    return <DashboardFinanceiro user={user} greeting={greeting} onLogout={handleLogout} />;
  }

  // Dashboard para Manutenção
  if (user.role === "manutencao") {
    return <DashboardManutencao user={user} greeting={greeting} onLogout={handleLogout} />;
  }

  // Dashboard para RH
  if (user.role === "rh") {
    return <DashboardRH user={user} greeting={greeting} onLogout={handleLogout} />;
  }

  // Dashboard padrão
  return <DashboardPadrao user={user} greeting={greeting} onLogout={handleLogout} />;
}

// ==================== DASHBOARD DIRETOR ====================
function DashboardDiretor({ user, greeting, onLogout }: { user: UserData; greeting: string; onLogout: () => void }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header com Logout */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">
              {greeting}, <span className="text-orange-400">{user.name}</span>
            </h1>
            <p className="text-white/60">Visão Geral da Operação</p>
          </div>
          <Button onClick={onLogout} variant="outline" className="gap-2">
            <LogOut className="h-4 w-4" />
            Sair
          </Button>
        </div>

        {/* Monitoramento de Bens */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 border-blue-500/30 hover:border-blue-500/50 transition">
            <CardHeader className="pb-3">
              <CardTitle className="text-white flex items-center gap-2">
                <Truck className="h-5 w-5 text-blue-400" />
                Veículos Ativos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white mb-2">47</div>
              <p className="text-white/60 text-sm">Em operação</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500/20 to-green-600/20 border-green-500/30 hover:border-green-500/50 transition">
            <CardHeader className="pb-3">
              <CardTitle className="text-white flex items-center gap-2">
                <MapPin className="h-5 w-5 text-green-400" />
                Rastreados
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white mb-2">45</div>
              <p className="text-white/60 text-sm">Com GPS ativo</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500/20 to-orange-600/20 border-orange-500/30 hover:border-orange-500/50 transition">
            <CardHeader className="pb-3">
              <CardTitle className="text-white flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-orange-400" />
                Alertas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white mb-2">3</div>
              <p className="text-white/60 text-sm">Requer atenção</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 border-purple-500/30 hover:border-purple-500/50 transition">
            <CardHeader className="pb-3">
              <CardTitle className="text-white flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-purple-400" />
                Eficiência
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white mb-2">92%</div>
              <p className="text-white/60 text-sm">Frota operacional</p>
            </CardContent>
          </Card>
        </div>

        {/* Mapa de Rastreamento */}
        <Card className="bg-white/5 border-white/10 mb-8">
          <CardHeader>
            <CardTitle className="text-white">Rastreamento em Tempo Real</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-slate-800 rounded-lg h-96 flex items-center justify-center border border-white/10">
              <div className="text-center">
                <MapPin className="h-12 w-12 text-white/40 mx-auto mb-4" />
                <p className="text-white/60">Mapa de rastreamento GPS dos veículos</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Resumo de Áreas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-green-400" />
                Financeiro
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-white/60 text-sm mb-4">Contas a Pagar: <span className="text-red-400 font-bold">R$ 45.2K</span></p>
              <p className="text-white/60 text-sm">Saldo Mês: <span className="text-green-400 font-bold">R$ 128.5K</span></p>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-400" />
                Recursos Humanos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-white/60 text-sm mb-4">Funcionários: <span className="text-blue-400 font-bold">28</span></p>
              <p className="text-white/60 text-sm">Folhas Processadas: <span className="text-blue-400 font-bold">12</span></p>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Wrench className="h-5 w-5 text-orange-400" />
                Manutenção
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-white/60 text-sm mb-4">OS Abertas: <span className="text-orange-400 font-bold">5</span></p>
              <p className="text-white/60 text-sm">Concluídas: <span className="text-green-400 font-bold">32</span></p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// ==================== DASHBOARD FINANCEIRO ====================
function DashboardFinanceiro({ user, greeting, onLogout }: { user: UserData; greeting: string; onLogout: () => void }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">
              {greeting}, <span className="text-green-400">{user.name}</span>
            </h1>
            <p className="text-white/60">Gestão Financeira</p>
          </div>
          <Button onClick={onLogout} variant="outline" className="gap-2">
            <LogOut className="h-4 w-4" />
            Sair
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-red-500/20 to-red-600/20 border-red-500/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-white">Contas a Pagar</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-400 mb-2">R$ 45.2K</div>
              <p className="text-white/60 text-sm">8 contas pendentes</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500/20 to-green-600/20 border-green-500/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-white">Contas a Receber</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-400 mb-2">R$ 128.5K</div>
              <p className="text-white/60 text-sm">12 contas em aberto</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 border-blue-500/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-white">Saldo</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-400 mb-2">R$ 83.3K</div>
              <p className="text-white/60 text-sm">Mês atual</p>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Fluxo de Caixa</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-slate-800 rounded-lg h-64 flex items-center justify-center border border-white/10">
              <p className="text-white/60">Gráfico de fluxo de caixa</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ==================== DASHBOARD MANUTENÇÃO ====================
function DashboardManutencao({ user, greeting, onLogout }: { user: UserData; greeting: string; onLogout: () => void }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">
              {greeting}, <span className="text-orange-400">{user.name}</span>
            </h1>
            <p className="text-white/60">Gestão de Manutenção</p>
          </div>
          <Button onClick={onLogout} variant="outline" className="gap-2">
            <LogOut className="h-4 w-4" />
            Sair
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-orange-500/20 to-orange-600/20 border-orange-500/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-white">OS Abertas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-400 mb-2">5</div>
              <p className="text-white/60 text-sm">Aguardando execução</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 border-blue-500/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-white">Em Execução</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-400 mb-2">8</div>
              <p className="text-white/60 text-sm">Sendo trabalhadas</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500/20 to-green-600/20 border-green-500/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-white">Concluídas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-400 mb-2">32</div>
              <p className="text-white/60 text-sm">Este mês</p>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Ordens de Serviço Recentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-slate-800 rounded">
                <span className="text-white">Troca de óleo - Veículo #001</span>
                <span className="text-orange-400 text-sm">Em andamento</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-slate-800 rounded">
                <span className="text-white">Revisão geral - Veículo #015</span>
                <span className="text-blue-400 text-sm">Agendado</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-slate-800 rounded">
                <span className="text-white">Reparo de pneu - Veículo #023</span>
                <span className="text-green-400 text-sm">Concluído</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ==================== DASHBOARD RH ====================
function DashboardRH({ user, greeting, onLogout }: { user: UserData; greeting: string; onLogout: () => void }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">
              {greeting}, <span className="text-blue-400">{user.name}</span>
            </h1>
            <p className="text-white/60">Gestão de Recursos Humanos</p>
          </div>
          <Button onClick={onLogout} variant="outline" className="gap-2">
            <LogOut className="h-4 w-4" />
            Sair
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 border-blue-500/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-white">Total de Funcionários</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-400 mb-2">28</div>
              <p className="text-white/60 text-sm">Ativos</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500/20 to-green-600/20 border-green-500/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-white">Folhas Processadas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-400 mb-2">12</div>
              <p className="text-white/60 text-sm">Ano atual</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 border-purple-500/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-white">Férias Pendentes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-400 mb-2">3</div>
              <p className="text-white/60 text-sm">Funcionários</p>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Últimas Folhas de Pagamento</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-slate-800 rounded">
                <span className="text-white">Dezembro/2025</span>
                <span className="text-green-400 text-sm">Processada</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-slate-800 rounded">
                <span className="text-white">Novembro/2025</span>
                <span className="text-green-400 text-sm">Processada</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-slate-800 rounded">
                <span className="text-white">Outubro/2025</span>
                <span className="text-green-400 text-sm">Processada</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ==================== DASHBOARD PADRÃO ====================
function DashboardPadrao({ user, greeting, onLogout }: { user: UserData; greeting: string; onLogout: () => void }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">
              {greeting}, <span className="text-indigo-400">{user.name}</span>
            </h1>
            <p className="text-white/60">Dashboard Padrão</p>
          </div>
          <Button onClick={onLogout} variant="outline" className="gap-2">
            <LogOut className="h-4 w-4" />
            Sair
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Resumo Geral</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-white/60">Veículos Ativos:</span>
                  <span className="text-white font-bold">47</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Funcionários:</span>
                  <span className="text-white font-bold">28</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Saldo Financeiro:</span>
                  <span className="text-green-400 font-bold">R$ 83.3K</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">OS Abertas:</span>
                  <span className="text-orange-400 font-bold">5</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Informações do Usuário</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-white/60 text-sm">Nome</p>
                  <p className="text-white font-bold">{user.name}</p>
                </div>
                <div>
                  <p className="text-white/60 text-sm">Usuário</p>
                  <p className="text-white font-bold">{user.username}</p>
                </div>
                <div>
                  <p className="text-white/60 text-sm">Perfil</p>
                  <p className="text-white font-bold capitalize">{user.role}</p>
                </div>
                <div>
                  <p className="text-white/60 text-sm">Hora Atual</p>
                  <p className="text-white font-bold">{new Date().toLocaleTimeString("pt-BR")}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
