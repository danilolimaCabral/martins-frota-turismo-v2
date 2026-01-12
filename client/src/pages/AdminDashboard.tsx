import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import {
  Users,
  DollarSign,
  MapPin,
  MessageSquare,
  Calendar,
  Settings,
  Zap,
  ArrowRight,
} from "lucide-react";

const modules = [
  {
    id: "rh",
    title: "RH - Recursos Humanos",
    description: "Gestão de funcionários, folha de pagamento e documentos",
    icon: Users,
    color: "from-blue-500 to-blue-600",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
    hoverColor: "hover:shadow-blue-200",
    stats: [
      { label: "Funcionários", value: "25" },
      { label: "Folhas Processadas", value: "12" },
    ],
    links: [
      { label: "Funcionários", path: "/admin/funcionarios" },
      { label: "Folha Pagamento", path: "/admin/folhapagamento" },
      { label: "Lançamentos", path: "/admin/lancamentosrh" },
      { label: "Férias", path: "/admin/ferias" },
      { label: "CNAB", path: "/admin/cnab" },
    ],
  },
  {
    id: "financeiro",
    title: "Financeiro",
    description: "Contas a pagar, receber e fluxo de caixa",
    icon: DollarSign,
    color: "from-green-500 to-green-600",
    bgColor: "bg-green-50",
    borderColor: "border-green-200",
    hoverColor: "hover:shadow-green-200",
    stats: [
      { label: "Contas Pendentes", value: "8" },
      { label: "Saldo Mês", value: "R$ 45.2K" },
    ],
    links: [
      { label: "Contas a Pagar", path: "/admin/financeiro" },
      { label: "Conciliação", path: "/admin/conciliacao" },
      { label: "Fluxo de Caixa", path: "/admin/fluxocaixa" },
      { label: "DRE", path: "/admin/dre" },
      { label: "Relatórios", path: "/admin/relatoriofinanceiro" },
    ],
  },
  {
    id: "rotas",
    title: "Roteirização",
    description: "Otimização de rotas com Google Maps",
    icon: MapPin,
    color: "from-purple-500 to-purple-600",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-200",
    hoverColor: "hover:shadow-purple-200",
    stats: [
      { label: "Rotas Ativas", value: "5" },
      { label: "Distância Média", value: "45 km" },
    ],
    links: [
      { label: "Roteirização", path: "/admin/roteirizacao" },
      { label: "Exportação GPS", path: "/admin/exportacaogps" },
      { label: "Histórico", path: "/admin/historicorotas" },
      { label: "Otimização", path: "/admin/otimizacaoavancada" },
    ],
  },
  {
    id: "atendimento",
    title: "Atendimento",
    description: "Tickets, chat e orçamentos de clientes",
    icon: MessageSquare,
    color: "from-orange-500 to-orange-600",
    bgColor: "bg-orange-50",
    borderColor: "border-orange-200",
    hoverColor: "hover:shadow-orange-200",
    stats: [
      { label: "Tickets Abertos", value: "12" },
      { label: "Satisfação", value: "4.8/5" },
    ],
    links: [
      { label: "Atendimento", path: "/admin/atendimento" },
      { label: "Chatbot IA", path: "/admin/chatbotia" },
      { label: "Gestão Tickets", path: "/admin/gestaotickets" },
      { label: "Orçamentos", path: "/admin/orcamentos" },
      { label: "NPS", path: "/admin/nps" },
    ],
  },
  {
    id: "agenda",
    title: "Agenda",
    description: "Calendário de eventos e compromissos",
    icon: Calendar,
    color: "from-red-500 to-red-600",
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
    hoverColor: "hover:shadow-red-200",
    stats: [
      { label: "Eventos Mês", value: "18" },
      { label: "Ocupação", value: "85%" },
    ],
    links: [
      { label: "Agenda", path: "/admin/agenda" },
      { label: "Calendário", path: "/admin/calendarioavancado" },
      { label: "Eventos", path: "/admin/detalhesevento" },
      { label: "Notificações", path: "/admin/notificacoes" },
    ],
  },
  {
    id: "admin",
    title: "Administrativo",
    description: "Configurações, integrações e ferramentas",
    icon: Settings,
    color: "from-gray-500 to-gray-600",
    bgColor: "bg-gray-50",
    borderColor: "border-gray-200",
    hoverColor: "hover:shadow-gray-200",
    stats: [
      { label: "Sistemas", value: "5" },
      { label: "Integrações", value: "3" },
    ],
    links: [
      { label: "Checklist", path: "/admin/checklist" },
      { label: "Manutenção", path: "/admin/manutencao" },
      { label: "Rastreamento", path: "/admin/rastreamento" },
      { label: "Integrações", path: "/admin/integracoes" },
      { label: "Configurações", path: "/admin/configuracoesgerais" },
    ],
  },
];

export function AdminDashboard() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-12">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-white mb-3">
            Painel Administrativo
          </h1>
          <p className="text-xl text-gray-300">
            Acesse todos os módulos do sistema Martins Viagens e Turismo
          </p>
        </div>
      </div>

      {/* Modules Grid */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {modules.map((module) => {
          const Icon = module.icon;
          return (
            <div
              key={module.id}
              className={`${module.bgColor} rounded-2xl border-2 ${module.borderColor} overflow-hidden transition-all duration-300 ${module.hoverColor} hover:shadow-2xl hover:scale-105 cursor-pointer group`}
            >
              {/* Header com Gradient */}
              <div
                className={`bg-gradient-to-r ${module.color} p-6 text-white relative overflow-hidden`}
              >
                <div className="absolute top-0 right-0 opacity-10">
                  <Icon className="w-32 h-32" />
                </div>
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-2">
                    <Icon className="w-8 h-8" />
                    <h2 className="text-2xl font-bold">{module.title}</h2>
                  </div>
                  <p className="text-sm text-white/90">{module.description}</p>
                </div>
              </div>

              {/* Stats */}
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="grid grid-cols-2 gap-4">
                  {module.stats.map((stat, idx) => (
                    <div key={idx} className="text-center">
                      <p className="text-2xl font-bold text-gray-900">
                        {stat.value}
                      </p>
                      <p className="text-xs text-gray-600">{stat.label}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Links */}
              <div className="px-6 py-4">
                <div className="space-y-2 mb-4">
                  {module.links.map((link, idx) => (
                    <Link key={idx} href={link.path}>
                      <Button
                        variant="ghost"
                        className="w-full justify-between text-left hover:bg-gray-100 group/btn"
                      >
                        <span className="text-sm">{link.label}</span>
                        <ArrowRight className="w-4 h-4 opacity-0 group-hover/btn:opacity-100 transition-opacity" />
                      </Button>
                    </Link>
                  ))}
                </div>

                {/* CTA Button */}
                <Link href={module.links[0].path}>
                  <Button
                    className={`w-full bg-gradient-to-r ${module.color} text-white hover:shadow-lg transition-all`}
                  >
                    <Zap className="w-4 h-4 mr-2" />
                    Acessar Módulo
                  </Button>
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Stats */}
      <div className="max-w-7xl mx-auto mt-16 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <p className="text-3xl font-bold text-white">53</p>
            <p className="text-gray-300 text-sm">Páginas</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-white">6</p>
            <p className="text-gray-300 text-sm">Módulos</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-white">100%</p>
            <p className="text-gray-300 text-sm">Funcional</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-white">∞</p>
            <p className="text-gray-300 text-sm">Escalável</p>
          </div>
        </div>
      </div>
    </div>
  );
}
