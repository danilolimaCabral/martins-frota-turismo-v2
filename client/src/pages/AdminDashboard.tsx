import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import {
  Users,
  DollarSign,
  MapPin,
  MessageSquare,
  Calendar,
  Settings,
  Truck,
  Home,
  LogOut,
  Menu,
  X,
  ChevronRight,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";

const sidebarItems = [
  { id: "home", icon: Home, label: "Home", path: "/" },
  { id: "rh", icon: Users, label: "RH", color: "hover:bg-blue-50 hover:text-blue-600" },
  { id: "financeiro", icon: DollarSign, label: "Financeiro", color: "hover:bg-green-50 hover:text-green-600" },
  { id: "rotas", icon: MapPin, label: "Rotas", color: "hover:bg-purple-50 hover:text-purple-600" },
  { id: "atendimento", icon: MessageSquare, label: "Atendimento", color: "hover:bg-orange-50 hover:text-orange-600" },
  { id: "agenda", icon: Calendar, label: "Agenda", color: "hover:bg-red-50 hover:text-red-600" },
  { id: "veiculos", icon: Truck, label: "Veículos", color: "hover:bg-indigo-50 hover:text-indigo-600" },
  { id: "admin", icon: Settings, label: "Admin", color: "hover:bg-gray-50 hover:text-gray-600" },
];

const modules = [
  {
    id: "rh",
    title: "RH",
    description: "Gestão de Recursos Humanos",
    icon: Users,
    color: "from-blue-500 to-blue-600",
    bgColor: "bg-blue-50",
    textColor: "text-blue-600",
    borderColor: "border-blue-200",
    items: [
      { label: "Funcionários", path: "/admin/funcionarios", icon: Users },
      { label: "Folha Pagamento", path: "/admin/folhapagamento", icon: DollarSign },
      { label: "Lançamentos", path: "/admin/lancamentosrh", icon: ChevronRight },
      { label: "Férias", path: "/admin/ferias", icon: Calendar },
      { label: "CNAB", path: "/admin/cnab", icon: ChevronRight },
      { label: "CNAB240", path: "/admin/cnab240", icon: ChevronRight },
    ],
  },
  {
    id: "financeiro",
    title: "Financeiro",
    description: "Gestão Financeira",
    icon: DollarSign,
    color: "from-green-500 to-green-600",
    bgColor: "bg-green-50",
    textColor: "text-green-600",
    borderColor: "border-green-200",
    items: [
      { label: "Contas a Pagar", path: "/admin/financeiro", icon: DollarSign },
      { label: "Conciliação", path: "/admin/conciliacao", icon: ChevronRight },
      { label: "Fluxo de Caixa", path: "/admin/fluxocaixa", icon: ChevronRight },
      { label: "DRE", path: "/admin/dre", icon: ChevronRight },
      { label: "Relatórios", path: "/admin/relatoriofinanceiro", icon: ChevronRight },
    ],
  },
  {
    id: "rotas",
    title: "Roteirização",
    description: "Otimização de Rotas",
    icon: MapPin,
    color: "from-purple-500 to-purple-600",
    bgColor: "bg-purple-50",
    textColor: "text-purple-600",
    borderColor: "border-purple-200",
    items: [
      { label: "Roteirização", path: "/admin/roteirizacao", icon: MapPin },
      { label: "Exportação GPS", path: "/admin/exportacaogps", icon: ChevronRight },
      { label: "Histórico", path: "/admin/historicorotas", icon: ChevronRight },
      { label: "Otimização", path: "/admin/otimizacaoavancada", icon: ChevronRight },
    ],
  },
  {
    id: "atendimento",
    title: "Atendimento",
    description: "Gestão de Clientes",
    icon: MessageSquare,
    color: "from-orange-500 to-orange-600",
    bgColor: "bg-orange-50",
    textColor: "text-orange-600",
    borderColor: "border-orange-200",
    items: [
      { label: "Atendimento", path: "/admin/atendimento", icon: MessageSquare },
      { label: "Chatbot IA", path: "/admin/chatbotia", icon: ChevronRight },
      { label: "Gestão Tickets", path: "/admin/gestaotickets", icon: ChevronRight },
      { label: "Orçamentos", path: "/admin/orcamentos", icon: ChevronRight },
      { label: "NPS", path: "/admin/nps", icon: ChevronRight },
    ],
  },
  {
    id: "agenda",
    title: "Agenda",
    description: "Calendário e Eventos",
    icon: Calendar,
    color: "from-red-500 to-red-600",
    bgColor: "bg-red-50",
    textColor: "text-red-600",
    borderColor: "border-red-200",
    items: [
      { label: "Agenda", path: "/admin/agenda", icon: Calendar },
      { label: "Calendário", path: "/admin/calendarioavancado", icon: ChevronRight },
      { label: "Notificações", path: "/admin/notificacoes", icon: ChevronRight },
      { label: "Relatórios", path: "/admin/relatoriosagenda", icon: ChevronRight },
    ],
  },
  {
    id: "veiculos",
    title: "Veículos",
    description: "Gestão de Frota",
    icon: Truck,
    color: "from-indigo-500 to-indigo-600",
    bgColor: "bg-indigo-50",
    textColor: "text-indigo-600",
    borderColor: "border-indigo-200",
    items: [
      { label: "Frota", path: "/admin/veiculos", icon: Truck },
      { label: "Manutenção", path: "/admin/manutencao", icon: ChevronRight },
      { label: "Rastreamento", path: "/admin/rastreamento", icon: ChevronRight },
      { label: "Documentos", path: "/admin/documentos", icon: ChevronRight },
    ],
  },
  {
    id: "admin",
    title: "Administração",
    description: "Configurações do Sistema",
    icon: Settings,
    color: "from-gray-500 to-gray-600",
    bgColor: "bg-gray-50",
    textColor: "text-gray-600",
    borderColor: "border-gray-200",
    items: [
      { label: "Usuários", path: "/admin/usuarios", icon: Users },
      { label: "Auditoria", path: "/admin/auditoria", icon: ChevronRight },
      { label: "Backup", path: "/admin/backup", icon: ChevronRight },
      { label: "Configurações", path: "/admin/configuracoes", icon: Settings },
    ],
  },
];

export function AdminDashboard() {
  const [, navigate] = useLocation();
  const [, setLocation] = useLocation();
  const [selectedModule, setSelectedModule] = useState<string | null>(null);

  const handleNavigate = (path: string) => {
    setLocation(path);
  };

  const currentModule = modules.find((m) => m.id === selectedModule);

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Botão Voltar */}
      <div className="mb-6 flex items-center gap-2">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-orange-600 hover:bg-orange-700 text-white transition-colors font-medium"
        >
          <ArrowLeft size={20} />
          <span>Voltar</span>
        </button>
      </div>

      {/* Sidebar Vertical */}
      <div className="w-24 bg-gradient-to-b from-slate-800 to-slate-900 border-r border-white/10 flex flex-col items-center py-6 gap-4 shadow-2xl">
        {/* Logo e Nome da Empresa */}
        <div className="w-full px-2 text-center">
          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg p-3 mb-3 shadow-lg">
            <div className="h-12 w-12 mx-auto flex items-center justify-center text-white font-bold text-lg">
              MV
            </div>
          </div>
          <p className="text-white text-xs font-bold tracking-tight">Martins</p>
          <p className="text-orange-400 text-xs font-semibold">Turismo</p>
        </div>

        {/* Divider */}
        <div className="w-12 h-px bg-white/10 mb-4" />

        {/* Sidebar Icons */}
        <div className="flex flex-col gap-1 w-full px-2">
          {sidebarItems.slice(1).map((item) => {
            const Icon = item.icon;
            const isSelected = selectedModule === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setSelectedModule(isSelected ? null : item.id)}
                className={`w-full p-3 rounded-lg transition-all flex items-center justify-center ${
                  isSelected
                    ? "bg-white/20 text-white shadow-lg"
                    : "text-white/60 hover:text-white hover:bg-white/10"
                }`}
                title={item.label}
              >
                <Icon className="h-5 w-5" />
              </button>
            );
          })}
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Divider */}
        <div className="w-12 h-px bg-white/10 mb-4" />

        {/* Logout */}
        <button
          onClick={() => handleNavigate("/")}
          className="w-full p-3 rounded-lg hover:bg-white/10 transition-colors text-white/60 hover:text-white"
          title="Logout"
        >
          <LogOut className="h-5 w-5 mx-auto" />
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          {currentModule ? (
            // Module Details
            <div className="animate-in fade-in duration-300">
              {/* Header */}
              <div className="mb-8">
                <button
                  onClick={() => setSelectedModule(null)}
                  className="inline-flex items-center gap-2 text-white/60 hover:text-white mb-6 transition-colors"
                >
                  <X className="h-4 w-4" />
                  Voltar
                </button>

                <div className={`bg-gradient-to-r ${currentModule.color} rounded-lg p-6 text-white shadow-xl mb-8`}>
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-white/20 rounded-lg">
                      {currentModule.icon && <currentModule.icon className="h-8 w-8" />}
                    </div>
                    <div>
                      <h1 className="text-3xl font-bold">{currentModule.title}</h1>
                      <p className="text-white/80">{currentModule.description}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Module Links Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {currentModule.items.map((item) => {
                  const ItemIcon = item.icon;
                  return (
                    <button
                      key={item.path}
                      onClick={() => handleNavigate(item.path)}
                      className={`p-5 rounded-lg border transition-all hover:shadow-lg hover:scale-105 ${currentModule.bgColor} ${currentModule.borderColor} border-2 group`}
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div className={`p-2 rounded-lg ${currentModule.bgColor}`}>
                          <ItemIcon className={`h-5 w-5 ${currentModule.textColor}`} />
                        </div>
                        <ArrowRight className={`h-4 w-4 ${currentModule.textColor} opacity-0 group-hover:opacity-100 transition-opacity`} />
                      </div>
                      <p className="font-semibold text-slate-900 text-left">{item.label}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            // Main Grid View
            <div className="animate-in fade-in duration-300">
              <div className="mb-12">
                <h1 className="text-4xl font-bold text-white mb-2">
                  Painel Administrativo
                </h1>
                <p className="text-white/60 text-lg">
                  Selecione um módulo para gerenciar sua operação
                </p>
              </div>

              {/* Modules Grid 2x4 */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {modules.map((module) => {
                  const Icon = module.icon;
                  return (
                    <button
                      key={module.id}
                      onClick={() => setSelectedModule(module.id)}
                      className={`group relative overflow-hidden rounded-xl border border-white/10 hover:border-white/20 transition-all hover:shadow-2xl hover:scale-105 ${module.bgColor}`}
                    >
                      {/* Gradient Overlay */}
                      <div className={`absolute inset-0 bg-gradient-to-br ${module.color} opacity-0 group-hover:opacity-10 transition-opacity`} />

                      {/* Content */}
                      <div className="relative p-6 text-center">
                        <div className={`inline-flex p-3 rounded-lg ${module.bgColor} mb-4 group-hover:scale-110 transition-transform`}>
                          <Icon className={`h-8 w-8 ${module.textColor}`} />
                        </div>
                        <h3 className="font-bold text-slate-900 text-lg mb-1">
                          {module.title}
                        </h3>
                        <p className="text-sm text-slate-600 mb-4">
                          {module.description}
                        </p>
                        <div className="flex items-center justify-center gap-2 text-sm font-medium">
                          <span className={module.textColor}>Acessar</span>
                          <ChevronRight className={`h-4 w-4 ${module.textColor} group-hover:translate-x-1 transition-transform`} />
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
