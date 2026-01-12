import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Users,
  DollarSign,
  MapPin,
  MessageSquare,
  Calendar,
  Settings,
  FileText,
  AlertCircle,
  Truck,
  Zap,
  CheckSquare,
  Wrench,
  Eye,
  BarChart3,
  Database,
  Shield,
  Wallet,
  ChevronDown,
  ChevronRight,
  X,
  Home,
  Fuel,
  ClipboardList,
  TrendingUp,
  Package,
  Clock,
  Lock,
  Eye as EyeIcon,
} from "lucide-react";

interface MenuItem {
  label: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface MenuModule {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgColor: string;
  borderColor: string;
  items: MenuItem[];
}

const menuModules: MenuModule[] = [
  {
    title: "Dashboard",
    description: "Visão geral do sistema",
    icon: Home,
    color: "from-blue-500 to-blue-600",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
    items: [
      { label: "Dashboard Principal", path: "/admin", icon: Home },
      { label: "Dashboard Personalizado", path: "/admin/dashboardpersonalizado", icon: BarChart3 },
    ],
  },
  {
    title: "Frota & Rastreamento",
    description: "Gestão de veículos e rastreamento",
    icon: Truck,
    color: "from-orange-500 to-red-600",
    bgColor: "bg-orange-50",
    borderColor: "border-orange-200",
    items: [
      { label: "Veículos", path: "/admin/veiculos", icon: Truck },
      { label: "Monitoramento", path: "/monitoramento", icon: Eye },
      { label: "Rastreamento", path: "/rastreamento", icon: MapPin },
      { label: "Manutenção", path: "/admin/manutencao", icon: Wrench },
      { label: "Abastecimento", path: "/admin/abastecimento", icon: Fuel },
      { label: "Checklist", path: "/admin/checklist", icon: CheckSquare },
    ],
  },
  {
    title: "RH - Recursos Humanos",
    description: "Gestão de funcionários e folha",
    icon: Users,
    color: "from-purple-500 to-pink-600",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-200",
    items: [
      { label: "Motoristas", path: "/admin/motoristas", icon: Users },
      { label: "Funcionários", path: "/admin/funcionarios", icon: Users },
      { label: "Folha Pagamento", path: "/admin/folhapagamento", icon: FileText },
      { label: "Férias", path: "/admin/ferias", icon: Calendar },
      { label: "Ponto Eletrônico", path: "/admin/ponto", icon: Clock },
      { label: "Documentos RH", path: "/admin/documentosrh", icon: FileText },
      { label: "Avisos Documentos", path: "/admin/avisosdocumentos", icon: AlertCircle },
    ],
  },
  {
    title: "Operações",
    description: "Viagens, roteirizacao e agenda",
    icon: MapPin,
    color: "from-green-500 to-teal-600",
    bgColor: "bg-green-50",
    borderColor: "border-green-200",
    items: [
      { label: "Viagens", path: "/admin/viagens", icon: Truck },
      { label: "Agenda", path: "/admin/agenda", icon: Calendar },
      { label: "Roteirização", path: "/admin/roteirizacao", icon: MapPin },
      { label: "Calendário Avançado", path: "/admin/calendarioavancado", icon: Calendar },
    ],
  },
  {
    title: "Financeiro",
    description: "Contas, fluxo de caixa e DRE",
    icon: DollarSign,
    color: "from-emerald-500 to-green-600",
    bgColor: "bg-emerald-50",
    borderColor: "border-emerald-200",
    items: [
      { label: "Despesas", path: "/admin/despesas", icon: DollarSign },
      { label: "Financeiro", path: "/admin/financeiro", icon: Wallet },
      { label: "Fluxo de Caixa", path: "/admin/fluxocaixa", icon: TrendingUp },
      { label: "DRE", path: "/admin/dre", icon: BarChart3 },
      { label: "CNAB", path: "/admin/cnab", icon: FileText },
      { label: "Conciliação", path: "/admin/conciliacao", icon: CheckSquare },
    ],
  },
  {
    title: "Atendimento",
    description: "Clientes, orçamentos e tickets",
    icon: MessageSquare,
    color: "from-cyan-500 to-blue-600",
    bgColor: "bg-cyan-50",
    borderColor: "border-cyan-200",
    items: [
      { label: "Atendimento", path: "/admin/atendimento", icon: MessageSquare },
      { label: "Orçamentos", path: "/admin/orcamentos", icon: FileText },
      { label: "Gestão Tickets", path: "/admin/gestaotickets", icon: CheckSquare },
      { label: "Chatbot IA", path: "/admin/chatbotia", icon: Zap },
    ],
  },
  {
    title: "Relatórios & Análise",
    description: "Dados, gráficos e insights",
    icon: BarChart3,
    color: "from-indigo-500 to-purple-600",
    bgColor: "bg-indigo-50",
    borderColor: "border-indigo-200",
    items: [
      { label: "Relatórios", path: "/admin/relatorios", icon: BarChart3 },
      { label: "Análise Rotatividade", path: "/admin/analiserotatividade", icon: TrendingUp },
      { label: "Importar Dados", path: "/admin/importar", icon: Package },
    ],
  },
  {
    title: "Administração",
    description: "Sistema, segurança e backup",
    icon: Settings,
    color: "from-slate-500 to-gray-600",
    bgColor: "bg-slate-50",
    borderColor: "border-slate-200",
    items: [
      { label: "Usuários", path: "/admin/usuarios", icon: Lock },
      { label: "Perfil", path: "/admin/perfil", icon: Users },
      { label: "Auditoria", path: "/admin/auditoria", icon: Shield },
      { label: "Backup & Restore", path: "/admin/backuprestore", icon: Database },
      { label: "Configurações", path: "/admin/configuracoes", icon: Settings },
    ],
  },
];

export function AdminMenu() {
  const [, setLocation] = useLocation();
  const [expandedModule, setExpandedModule] = useState<string | null>("Dashboard");
  const [isOpen, setIsOpen] = useState(window.innerWidth > 768);

  const handleNavigation = (path: string) => {
    setLocation(path);
  };

  return (
    <div className={`fixed left-0 top-0 h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white transition-all duration-300 z-40 ${isOpen ? "w-80 md:w-80" : "w-20"} overflow-y-auto border-r border-slate-700 shadow-2xl md:relative md:z-auto`}>
      {/* Header */}
      <div className="sticky top-0 bg-gradient-to-r from-orange-500 to-red-600 p-3 md:p-4 flex items-center justify-between z-50">
        {isOpen && (
          <div className="hidden md:block">
            <h1 className="text-2xl font-bold">MV</h1>
            <p className="text-xs opacity-90">Martins Turismo</p>
          </div>
        )}
        {isOpen && (
          <div className="md:hidden">
            <h1 className="text-lg font-bold">MV</h1>
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsOpen(!isOpen)}
          className="text-white hover:bg-white/20"
        >
          {isOpen ? <X className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
        </Button>
      </div>

      {/* Menu Items */}
      <div className="p-3 space-y-2">
        {menuModules.map((module) => (
          <div key={module.title} className="space-y-1">
            {/* Module Header */}
            <button
              onClick={() =>
                setExpandedModule(expandedModule === module.title ? null : module.title)
              }
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
                expandedModule === module.title
                  ? `bg-gradient-to-r ${module.color} text-white shadow-lg`
                  : "hover:bg-slate-700/50 text-slate-300"
              }`}
            >
              <div className={`p-2 rounded-lg ${expandedModule === module.title ? "bg-white/20" : "bg-slate-700/50 group-hover:bg-slate-600/50"}`}>
                <module.icon className="h-5 w-5" />
              </div>

              {isOpen && (
                <>
                  <div className="flex-1 text-left">
                    <p className="font-semibold text-sm">{module.title}</p>
                    {expandedModule === module.title && (
                      <p className="text-xs opacity-75">{module.description}</p>
                    )}
                  </div>
                  <ChevronDown
                    className={`h-4 w-4 transition-transform ${
                      expandedModule === module.title ? "rotate-180" : ""
                    }`}
                  />
                </>
              )}
            </button>

            {/* Submenu Items */}
            {isOpen && expandedModule === module.title && (
              <div className="ml-2 space-y-1 border-l-2 border-slate-700 pl-2">
                {module.items.map((item) => (
                  <button
                    key={item.path}
                    onClick={() => handleNavigation(item.path)}
                    className="w-full flex items-center gap-2 px-4 py-2 rounded-lg text-sm text-slate-300 hover:text-white hover:bg-slate-700/50 transition-all duration-150 group"
                  >
                    <item.icon className="h-4 w-4 text-slate-400 group-hover:text-orange-400" />
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="sticky bottom-0 bg-slate-900/80 backdrop-blur border-t border-slate-700 p-4">
        {isOpen && (
          <div className="text-xs text-slate-400 space-y-2">
            <p className="font-semibold text-slate-300">Sistema MV Turismo</p>
            <p>v1.0.0</p>
          </div>
        )}
      </div>
    </div>
  );
}
