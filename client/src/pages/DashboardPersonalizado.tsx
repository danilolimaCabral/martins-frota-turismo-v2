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

interface Vehicle {
  id: string;
  name: string;
  type: string;
  lat: number;
  lng: number;
  status: string;
  driver: string;
}

export function DashboardPersonalizado() {
  const [, setLocation] = useLocation();
  const [user, setUser] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [greeting, setGreeting] = useState("Bem-vindo");

  useEffect(() => {
    const userData = localStorage.getItem("martins_user_data");
    if (!userData) {
      setLocation("/login");
      return;
    }

    try {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);

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

  if (user.role === "diretor") {
    return <DashboardDiretor user={user} greeting={greeting} onLogout={handleLogout} />;
  }

  if (user.role === "financeiro") {
    return <DashboardFinanceiro user={user} greeting={greeting} onLogout={handleLogout} />;
  }

  if (user.role === "manutencao") {
    return <DashboardManutencao user={user} greeting={greeting} onLogout={handleLogout} />;
  }

  if (user.role === "rh") {
    return <DashboardRH user={user} greeting={greeting} onLogout={handleLogout} />;
  }

  return <DashboardPadrao user={user} greeting={greeting} onLogout={handleLogout} />;
}

// ==================== DASHBOARD DIRETOR ====================
function DashboardDiretor({ user, greeting, onLogout }: { user: UserData; greeting: string; onLogout: () => void }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
      <div className="max-w-7xl mx-auto">
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
  const [selectedVehicle, setSelectedVehicle] = useState<string | null>(null);

  const vehicles: Vehicle[] = [
    { id: "VAN001", name: "Van Executiva 01", type: "Van", lat: -23.5505, lng: -46.6333, status: "Em Rota", driver: "João Silva" },
    { id: "VAN002", name: "Van Executiva 02", type: "Van", lat: -23.5615, lng: -46.6560, status: "Em Rota", driver: "Maria Santos" },
    { id: "ONIBUS001", name: "Ônibus Turismo 01", type: "Ônibus", lat: -23.5405, lng: -46.6200, status: "Parado", driver: "Carlos Oliveira" },
    { id: "ONIBUS002", name: "Ônibus Turismo 02", type: "Ônibus", lat: -23.5705, lng: -46.6450, status: "Em Rota", driver: "Pedro Costa" },
    { id: "VAN003", name: "Van Executiva 03", type: "Van", lat: -23.5305, lng: -46.6100, status: "Manutenção", driver: "Ana Lima" },
  ];

  const emRota = vehicles.filter(v => v.status === "Em Rota").length;
  const parados = vehicles.filter(v => v.status !== "Em Rota").length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex">
      {/* Menu Lateral */}
      <div className="w-80 bg-slate-800/50 border-r border-white/10 overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-white">Veículos</h2>
            <Button onClick={onLogout} variant="outline" size="sm" className="gap-1">
              <LogOut className="h-3 w-3" />
              Sair
            </Button>
          </div>

          {/* Resumo Rápido */}
          <div className="space-y-2 mb-6">
            <div className="bg-blue-500/20 border border-blue-500/30 p-3 rounded-lg">
              <p className="text-white/60 text-xs">Total de Veículos</p>
              <p className="text-2xl font-bold text-blue-400">{vehicles.length}</p>
            </div>
            <div className="bg-green-500/20 border border-green-500/30 p-3 rounded-lg">
              <p className="text-white/60 text-xs">Em Rota</p>
              <p className="text-2xl font-bold text-green-400">{emRota}</p>
            </div>
            <div className="bg-orange-500/20 border border-orange-500/30 p-3 rounded-lg">
              <p className="text-white/60 text-xs">Parados/Manutenção</p>
              <p className="text-2xl font-bold text-orange-400">{parados}</p>
            </div>
          </div>

          {/* Divisão */}
          <div className="w-full h-px bg-white/10 mb-6" />

          {/* Lista de Veículos */}
          <div className="space-y-2">
            {vehicles.map((vehicle) => (
              <button
                key={vehicle.id}
                onClick={() => setSelectedVehicle(vehicle.id)}
                className={`w-full text-left p-3 rounded-lg border transition-all ${
                  selectedVehicle === vehicle.id
                    ? "bg-indigo-500/30 border-indigo-500/50"
                    : "bg-slate-700/30 border-white/10 hover:border-white/20"
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="text-white font-semibold text-sm">{vehicle.name}</p>
                    <p className="text-white/60 text-xs">{vehicle.driver}</p>
                  </div>
                  <span className={`text-xs font-bold px-2 py-1 rounded ${
                    vehicle.status === "Em Rota"
                      ? "bg-green-500/30 text-green-400"
                      : vehicle.status === "Parado"
                      ? "bg-blue-500/30 text-blue-400"
                      : "bg-orange-500/30 text-orange-400"
                  }`}>
                    {vehicle.status}
                  </span>
                </div>
                <div className="text-xs text-white/40">
                  <p>📋 {vehicle.type}</p>
                  <p>📍 {vehicle.lat.toFixed(4)}, {vehicle.lng.toFixed(4)}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Conteúdo Principal */}
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">
                {greeting}, <span className="text-indigo-400">{user.name}</span>
              </h1>
              <p className="text-white/60">Rastreamento em Tempo Real</p>
            </div>
          </div>

          {/* Mapa de Rastreamento */}
          <Card className="bg-white/5 border-white/10 mb-8">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <MapPin className="h-5 w-5 text-indigo-400" />
                Mapa de Rastreamento GPS
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg h-96 flex items-center justify-center border border-white/10 relative overflow-hidden">
                {/* Mapa simulado com pontos de veículos */}
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 800 600%22><defs><pattern id=%22grid%22 width=%2240%22 height=%2240%22 patternUnits=%22userSpaceOnUse%22><path d=%22M 40 0 L 0 0 0 40%22 fill=%22none%22 stroke=%22rgba(255,255,255,0.05)%22 stroke-width=%221%22/></pattern></defs><rect width=%22800%22 height=%22600%22 fill=%22%23334155%22/><rect width=%22800%22 height=%22600%22 fill=%22url(%23grid)%22/></svg>')] opacity-30" />
                
                {/* Pontos de veículos */}
                {vehicles.map((vehicle, idx) => (
                  <div
                    key={vehicle.id}
                    className="absolute w-8 h-8 rounded-full flex items-center justify-center cursor-pointer transition-transform hover:scale-125"
                    style={{
                      left: `${20 + (vehicle.lng + 46.65) * 100}px`,
                      top: `${100 + (23.6 - vehicle.lat) * 100}px`,
                      backgroundColor: vehicle.status === "Em Rota" ? "rgb(34, 197, 94)" : vehicle.status === "Parado" ? "rgb(59, 130, 246)" : "rgb(249, 115, 22)",
                    }}
                    title={vehicle.name}
                  >
                    <div className="w-6 h-6 rounded-full border-2 border-white" />
                  </div>
                ))}

                {/* Legenda */}
                <div className="absolute bottom-4 left-4 bg-slate-900/80 p-4 rounded-lg border border-white/10">
                  <p className="text-white text-sm font-semibold mb-2">Legenda</p>
                  <div className="space-y-1 text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-green-500" />
                      <span className="text-white/60">Em Rota</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-blue-500" />
                      <span className="text-white/60">Parado</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-orange-500" />
                      <span className="text-white/60">Manutenção</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Detalhes do Veículo Selecionado */}
          {selectedVehicle && (
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Detalhes do Veículo</CardTitle>
              </CardHeader>
              <CardContent>
                {vehicles.find(v => v.id === selectedVehicle) && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-white/60 text-sm">Veículo</p>
                      <p className="text-white font-bold">{vehicles.find(v => v.id === selectedVehicle)?.name}</p>
                    </div>
                    <div>
                      <p className="text-white/60 text-sm">Motorista</p>
                      <p className="text-white font-bold">{vehicles.find(v => v.id === selectedVehicle)?.driver}</p>
                    </div>
                    <div>
                      <p className="text-white/60 text-sm">Status</p>
                      <p className="text-white font-bold">{vehicles.find(v => v.id === selectedVehicle)?.status}</p>
                    </div>
                    <div>
                      <p className="text-white/60 text-sm">Tipo</p>
                      <p className="text-white font-bold">{vehicles.find(v => v.id === selectedVehicle)?.type}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
