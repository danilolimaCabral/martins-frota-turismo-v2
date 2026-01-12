import { useEffect, useState } from "react";
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
} from "lucide-react";
import { trpc } from "@/lib/trpc";

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
    } catch (error) {
      setLocation("/login");
    } finally {
      setIsLoading(false);
    }
  }, [setLocation]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-900">
        <div className="text-white text-lg">Carregando...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // Dashboard para Diretor
  if (user.role === "diretor") {
    return <DashboardDiretor user={user} />;
  }

  // Dashboard para Financeiro
  if (user.role === "financeiro") {
    return <DashboardFinanceiro user={user} />;
  }

  // Dashboard para Manutenção
  if (user.role === "manutencao") {
    return <DashboardManutencao user={user} />;
  }

  // Dashboard para RH
  if (user.role === "rh") {
    return <DashboardRH user={user} />;
  }

  // Dashboard padrão
  return <DashboardPadrao user={user} />;
}

// ==================== DASHBOARD DIRETOR ====================
function DashboardDiretor({ user }: { user: UserData }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Bem-vindo, {user.name}
          </h1>
          <p className="text-white/60">Visão Geral da Operação</p>
        </div>

        {/* Monitoramento de Bens */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white/10 border-white/20">
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

          <Card className="bg-white/10 border-white/20">
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

          <Card className="bg-white/10 border-white/20">
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

          <Card className="bg-white/10 border-white/20">
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
        <Card className="bg-white/10 border-white/20 mb-8">
          <CardHeader>
            <CardTitle className="text-white">Rastreamento em Tempo Real</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-slate-800 rounded-lg h-96 flex items-center justify-center">
              <p className="text-white/60">Mapa de rastreamento GPS dos veículos</p>
            </div>
          </CardContent>
        </Card>

        {/* Resumo de Áreas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-white/10 border-white/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-green-400" />
                Financeiro
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-white/60 text-sm mb-4">Contas a Pagar: R$ 45.2K</p>
              <p className="text-white/60 text-sm">Saldo Mês: R$ 128.5K</p>
            </CardContent>
          </Card>

          <Card className="bg-white/10 border-white/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-400" />
                Recursos Humanos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-white/60 text-sm mb-4">Funcionários: 28</p>
              <p className="text-white/60 text-sm">Folhas Processadas: 12</p>
            </CardContent>
          </Card>

          <Card className="bg-white/10 border-white/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Wrench className="h-5 w-5 text-orange-400" />
                Manutenção
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-white/60 text-sm mb-4">OS Abertas: 5</p>
              <p className="text-white/60 text-sm">Concluídas: 32</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// ==================== DASHBOARD FINANCEIRO ====================
function DashboardFinanceiro({ user }: { user: UserData }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-2">
          Bem-vindo, {user.name}
        </h1>
        <p className="text-white/60 mb-8">Gestão Financeira</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-white/10 border-white/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-white">Contas a Pagar</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-400 mb-2">R$ 45.2K</div>
              <p className="text-white/60 text-sm">8 contas pendentes</p>
            </CardContent>
          </Card>

          <Card className="bg-white/10 border-white/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-white">Contas a Receber</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-400 mb-2">R$ 128.5K</div>
              <p className="text-white/60 text-sm">12 contas em aberto</p>
            </CardContent>
          </Card>

          <Card className="bg-white/10 border-white/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-white">Saldo</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-400 mb-2">R$ 83.3K</div>
              <p className="text-white/60 text-sm">Mês atual</p>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-white/10 border-white/20">
          <CardHeader>
            <CardTitle className="text-white">Últimas Transações</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-white/60">Tabela de transações aqui</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ==================== DASHBOARD MANUTENÇÃO ====================
function DashboardManutencao({ user }: { user: UserData }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-2">
          Bem-vindo, {user.name}
        </h1>
        <p className="text-white/60 mb-8">Gestão de Manutenção</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-white/10 border-white/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-white">OS Abertas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-400 mb-2">5</div>
              <p className="text-white/60 text-sm">Aguardando execução</p>
            </CardContent>
          </Card>

          <Card className="bg-white/10 border-white/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-white">OS Concluídas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-400 mb-2">32</div>
              <p className="text-white/60 text-sm">Este mês</p>
            </CardContent>
          </Card>

          <Card className="bg-white/10 border-white/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-white">Tempo Médio</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-400 mb-2">2.5h</div>
              <p className="text-white/60 text-sm">Por ordem</p>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-white/10 border-white/20">
          <CardHeader>
            <CardTitle className="text-white">Ordens de Serviço</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-white/60">Lista de OS aqui</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ==================== DASHBOARD RH ====================
function DashboardRH({ user }: { user: UserData }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-2">
          Bem-vindo, {user.name}
        </h1>
        <p className="text-white/60 mb-8">Recursos Humanos</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-white/10 border-white/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-white">Funcionários</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-400 mb-2">28</div>
              <p className="text-white/60 text-sm">Ativos</p>
            </CardContent>
          </Card>

          <Card className="bg-white/10 border-white/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-white">Folhas Processadas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-400 mb-2">12</div>
              <p className="text-white/60 text-sm">Este ano</p>
            </CardContent>
          </Card>

          <Card className="bg-white/10 border-white/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-white">Férias Pendentes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-400 mb-2">3</div>
              <p className="text-white/60 text-sm">Funcionários</p>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-white/10 border-white/20">
          <CardHeader>
            <CardTitle className="text-white">Funcionários</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-white/60">Lista de funcionários aqui</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ==================== DASHBOARD PADRÃO ====================
function DashboardPadrao({ user }: { user: UserData }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-2">
          Bem-vindo, {user.name}
        </h1>
        <p className="text-white/60">Dashboard Padrão</p>
      </div>
    </div>
  );
}

export default DashboardPersonalizado;
