import { Link } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
} from "lucide-react";

const menuModules = [
  {
    title: "RH - Recursos Humanos",
    description: "Gestão de funcionários, folha e documentos",
    icon: Users,
    color: "bg-blue-100",
    items: [
      { label: "Funcionários", path: "/admin/funcionarios", icon: Users },
      { label: "Folha Pagamento", path: "/admin/folhapagamento", icon: FileText },
      { label: "Lançamentos RH", path: "/admin/lancamentosrh", icon: Zap },
      { label: "Férias", path: "/admin/ferias", icon: Calendar },
      { label: "CNAB", path: "/admin/cnab", icon: FileText },
      { label: "Avisos Documentos", path: "/admin/avisosdocumentos", icon: AlertCircle },
      { label: "Relatórios RH", path: "/admin/relatoriosrh", icon: BarChart3 },
    ],
  },
  {
    title: "Financeiro",
    description: "Contas, fluxo de caixa e relatórios",
    icon: DollarSign,
    color: "bg-green-100",
    items: [
      { label: "Contas a Pagar", path: "/admin/financeiro", icon: DollarSign },
      { label: "Conciliação Bancária", path: "/admin/conciliacao", icon: DollarSign },
      { label: "Fluxo de Caixa", path: "/admin/fluxocaixa", icon: BarChart3 },
      { label: "DRE", path: "/admin/dre", icon: FileText },
      { label: "Métodos Pagamento", path: "/admin/metodospagamento", icon: Wallet },
      { label: "Relatório Financeiro", path: "/admin/relatoriofinanceiro", icon: BarChart3 },
    ],
  },
  {
    title: "Roteirização",
    description: "Otimização de rotas com Google Maps",
    icon: MapPin,
    color: "bg-purple-100",
    items: [
      { label: "Roteirização", path: "/admin/roteirizacao", icon: MapPin },
      { label: "Exportação GPS", path: "/admin/exportacaogps", icon: FileText },
      { label: "Histórico Rotas", path: "/admin/historicorotas", icon: BarChart3 },
      { label: "Otimização Avançada", path: "/admin/otimizacaoavancada", icon: Zap },
    ],
  },
  {
    title: "Atendimento ao Cliente",
    description: "Tickets, chat e orçamentos",
    icon: MessageSquare,
    color: "bg-orange-100",
    items: [
      { label: "Atendimento", path: "/admin/atendimento", icon: MessageSquare },
      { label: "Chatbot IA", path: "/admin/chatbotia", icon: Zap },
      { label: "Gestão Tickets", path: "/admin/gestaotickets", icon: CheckSquare },
      { label: "Orçamentos", path: "/admin/orcamentos", icon: FileText },
      { label: "Integração Interna", path: "/admin/integracaointerna", icon: Shield },
      { label: "NPS", path: "/admin/nps", icon: BarChart3 },
    ],
  },
  {
    title: "Agenda de Compromissos",
    description: "Calendário e eventos",
    icon: Calendar,
    color: "bg-red-100",
    items: [
      { label: "Agenda", path: "/admin/agenda", icon: Calendar },
      { label: "Calendário Avançado", path: "/admin/calendarioavancado", icon: Calendar },
      { label: "Detalhes Evento", path: "/admin/detalhesevento", icon: FileText },
      { label: "Notificações", path: "/admin/notificacoes", icon: AlertCircle },
      { label: "Relatórios Agenda", path: "/admin/relatoriosagenda", icon: BarChart3 },
    ],
  },
  {
    title: "Administrativo",
    description: "Configurações e ferramentas",
    icon: Settings,
    color: "bg-gray-100",
    items: [
      { label: "Checklist", path: "/admin/checklist", icon: CheckSquare },
      { label: "Manutenção", path: "/admin/manutencao", icon: Wrench },
      { label: "Rastreamento", path: "/admin/rastreamento", icon: Eye },
      { label: "Integrações", path: "/admin/integracoes", icon: Shield },
      { label: "Configurações", path: "/admin/configuracoesgerais", icon: Settings },
      { label: "Backup", path: "/admin/backuprestore", icon: Database },
    ],
  },
];

export function AdminMenu() {
  return (
    <div className="space-y-8 p-6">
      <div>
        <h1 className="text-4xl font-bold">Painel Administrativo</h1>
        <p className="text-gray-600 mt-2">Acesse todos os módulos do sistema</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {menuModules.map((module) => (
          <Card key={module.title} className="hover:shadow-lg transition-shadow">
            <CardHeader className={`${module.color} rounded-t-lg`}>
              <div className="flex items-center gap-3">
                <module.icon className="w-6 h-6" />
                <div>
                  <CardTitle>{module.title}</CardTitle>
                  <CardDescription className="text-sm">{module.description}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-2">
                {module.items.map((item) => (
                  <Link key={item.path} href={item.path}>
                    <Button variant="ghost" className="w-full justify-start text-left">
                      <item.icon className="w-4 h-4 mr-2" />
                      {item.label}
                    </Button>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
