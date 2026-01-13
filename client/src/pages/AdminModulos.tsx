/**
 * Página de Apresentação de Módulos
 * Exibe todos os módulos do sistema de forma moderna e organizada
 */

import { useState, useMemo } from 'react';
import { useLocation } from 'wouter';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Bus,
  Users,
  DollarSign,
  Calendar,
  MapPin,
  FileText,
  Wrench,
  Bell,
  Settings,
  BarChart3,
  Clock,
  CheckCircle2,
  AlertCircle,
  Search,
  Grid3x3,
  List,
  Zap,
  TrendingUp,
  Shield,
  Database,
  Smartphone,
  BookOpen,
  Briefcase,
  Route,
  Fuel,
  AlertTriangle,
  FileBarChart,
  Users2,
  CreditCard,
  Inbox,
  Eye,
  Download,
  Upload,
  Layers,
  GitBranch,
  Lock,
} from 'lucide-react';

interface ModuleItem {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  category: string;
  status: 'active' | 'beta' | 'coming' | 'maintenance';
  path: string;
  features: string[];
  color: string;
}

const modules: ModuleItem[] = [
  // Frota
  {
    id: 'veiculos',
    name: 'Veículos',
    description: 'Gerenciar frota de veículos',
    icon: Bus,
    category: 'Frota',
    status: 'active',
    path: '/admin/veiculos',
    features: ['Cadastro', 'Rastreamento', 'Manutenção'],
    color: 'from-blue-500 to-blue-600',
  },
  {
    id: 'motoristas',
    name: 'Motoristas',
    description: 'Gerenciar motoristas e documentos',
    icon: Users,
    category: 'Frota',
    status: 'active',
    path: '/admin/motoristas',
    features: ['Cadastro', 'Documentos', 'Histórico'],
    color: 'from-green-500 to-green-600',
  },
  {
    id: 'manutencao',
    name: 'Manutenção',
    description: 'Controle de manutenção de veículos',
    icon: Wrench,
    category: 'Frota',
    status: 'active',
    path: '/admin/manutencao',
    features: ['Agendamento', 'Histórico', 'Custos'],
    color: 'from-orange-500 to-orange-600',
  },
  {
    id: 'rastreamento',
    name: 'Rastreamento GPS',
    description: 'Monitoramento em tempo real',
    icon: MapPin,
    category: 'Frota',
    status: 'active',
    path: '/admin/rastreamento',
    features: ['GPS Real-time', 'Alertas', 'Histórico'],
    color: 'from-red-500 to-red-600',
  },
  {
    id: 'abastecimento',
    name: 'Abastecimento',
    description: 'Controle de combustível',
    icon: Fuel,
    category: 'Frota',
    status: 'active',
    path: '/admin/abastecimento',
    features: ['Registro', 'Análise', 'Custos'],
    color: 'from-yellow-500 to-yellow-600',
  },

  // RH
  {
    id: 'funcionarios',
    name: 'Funcionários',
    description: 'Gerenciar equipe',
    icon: Users2,
    category: 'RH',
    status: 'active',
    path: '/admin/funcionarios',
    features: ['Cadastro', 'Documentos', 'Contatos'],
    color: 'from-purple-500 to-purple-600',
  },
  {
    id: 'folha',
    name: 'Folha de Pagamento',
    description: 'Processamento de folha',
    icon: DollarSign,
    category: 'RH',
    status: 'active',
    path: '/admin/folha',
    features: ['Cálculo', 'Descontos', 'Exportação'],
    color: 'from-emerald-500 to-emerald-600',
  },
  {
    id: 'ponto',
    name: 'Controle de Ponto',
    description: 'Registro de ponto eletrônico',
    icon: Clock,
    category: 'RH',
    status: 'active',
    path: '/admin/ponto',
    features: ['Registro', 'Relatório', 'Integração'],
    color: 'from-cyan-500 to-cyan-600',
  },
  {
    id: 'ferias',
    name: 'Férias',
    description: 'Gerenciar períodos de férias',
    icon: Calendar,
    category: 'RH',
    status: 'active',
    path: '/admin/ferias',
    features: ['Agendamento', 'Cálculo', 'Aprovação'],
    color: 'from-pink-500 to-pink-600',
  },
  {
    id: 'lancamentos-rh',
    name: 'Lançamentos RH',
    description: 'Registrar eventos de RH',
    icon: FileBarChart,
    category: 'RH',
    status: 'active',
    path: '/admin/lancamentos-rh',
    features: ['Eventos', 'Histórico', 'Relatórios'],
    color: 'from-indigo-500 to-indigo-600',
  },
  {
    id: 'alertas',
    name: 'Alertas Documentos',
    description: 'Monitorar vencimentos',
    icon: AlertTriangle,
    category: 'RH',
    status: 'active',
    path: '/admin/alertas',
    features: ['Notificações', 'Vencimentos', 'Relatórios'],
    color: 'from-red-500 to-red-600',
  },

  // Financeiro
  {
    id: 'financeiro',
    name: 'Financeiro',
    description: 'Gestão financeira completa',
    icon: DollarSign,
    category: 'Financeiro',
    status: 'active',
    path: '/admin/financeiro',
    features: ['Receitas', 'Despesas', 'Relatórios'],
    color: 'from-green-500 to-green-600',
  },
  {
    id: 'despesas',
    name: 'Despesas',
    description: 'Registrar e controlar despesas',
    icon: CreditCard,
    category: 'Financeiro',
    status: 'active',
    path: '/admin/despesas',
    features: ['Registro', 'Categorias', 'Análise'],
    color: 'from-orange-500 to-orange-600',
  },
  {
    id: 'fluxo-caixa',
    name: 'Fluxo de Caixa',
    description: 'Análise de fluxo financeiro',
    icon: TrendingUp,
    category: 'Financeiro',
    status: 'active',
    path: '/admin/fluxo-caixa',
    features: ['Projeção', 'Análise', 'Gráficos'],
    color: 'from-blue-500 to-blue-600',
  },
  {
    id: 'dre',
    name: 'DRE',
    description: 'Demonstrativo de Resultado',
    icon: BarChart3,
    category: 'Financeiro',
    status: 'active',
    path: '/admin/dre',
    features: ['Cálculo', 'Análise', 'Exportação'],
    color: 'from-purple-500 to-purple-600',
  },
  {
    id: 'metodos-pagamento',
    name: 'Métodos de Pagamento',
    description: 'Configurar formas de pagamento',
    icon: CreditCard,
    category: 'Financeiro',
    status: 'active',
    path: '/admin/metodos-pagamento',
    features: ['Cadastro', 'Integração', 'Teste'],
    color: 'from-emerald-500 to-emerald-600',
  },

  // Agenda
  {
    id: 'agenda',
    name: 'Agenda',
    description: 'Agendamento de viagens',
    icon: Calendar,
    category: 'Agenda',
    status: 'active',
    path: '/admin/agenda',
    features: ['Eventos', 'Lembretes', 'Integração'],
    color: 'from-blue-500 to-blue-600',
  },
  {
    id: 'viagens',
    name: 'Viagens',
    description: 'Gerenciar viagens e trajetos',
    icon: Route,
    category: 'Agenda',
    status: 'active',
    path: '/admin/viagens',
    features: ['Cadastro', 'Rastreamento', 'Análise'],
    color: 'from-cyan-500 to-cyan-600',
  },
  {
    id: 'roteirizacao',
    name: 'Roteirização',
    description: 'Otimização de rotas',
    icon: MapPin,
    category: 'Agenda',
    status: 'active',
    path: '/admin/roteirizacao',
    features: ['Otimização', 'Análise', 'Exportação'],
    color: 'from-green-500 to-green-600',
  },
  {
    id: 'calendario-avancado',
    name: 'Calendário Avançado',
    description: 'Calendário com recursos avançados',
    icon: Calendar,
    category: 'Agenda',
    status: 'beta',
    path: '/admin/calendario-avancado',
    features: ['Eventos', 'Sincronização', 'Compartilhamento'],
    color: 'from-orange-500 to-orange-600',
  },

  // Relatórios
  {
    id: 'relatorios',
    name: 'Relatórios',
    description: 'Gerar relatórios personalizados',
    icon: FileText,
    category: 'Relatórios',
    status: 'active',
    path: '/admin/relatorios',
    features: ['Templates', 'Exportação', 'Agendamento'],
    color: 'from-purple-500 to-purple-600',
  },
  {
    id: 'relatorios-rh',
    name: 'Relatórios RH',
    description: 'Relatórios de recursos humanos',
    icon: FileBarChart,
    category: 'Relatórios',
    status: 'active',
    path: '/admin/relatorios-rh',
    features: ['Folha', 'Férias', 'Documentos'],
    color: 'from-pink-500 to-pink-600',
  },
  {
    id: 'relatorios-agenda',
    name: 'Relatórios Agenda',
    description: 'Análise de viagens e rotas',
    icon: BarChart3,
    category: 'Relatórios',
    status: 'active',
    path: '/admin/relatorios-agenda',
    features: ['Viagens', 'Rotas', 'Custos'],
    color: 'from-blue-500 to-blue-600',
  },

  // Sistema
  {
    id: 'usuarios',
    name: 'Usuários',
    description: 'Gerenciar usuários do sistema',
    icon: Users,
    category: 'Sistema',
    status: 'active',
    path: '/admin/usuarios',
    features: ['Cadastro', 'Permissões', 'Auditoria'],
    color: 'from-slate-500 to-slate-600',
  },
  {
    id: 'auditoria',
    name: 'Auditoria',
    description: 'Log de atividades do sistema',
    icon: Shield,
    category: 'Sistema',
    status: 'active',
    path: '/admin/auditoria',
    features: ['Logs', 'Filtros', 'Exportação'],
    color: 'from-red-500 to-red-600',
  },
  {
    id: 'notificacoes',
    name: 'Notificações',
    description: 'Sistema de alertas e notificações',
    icon: Bell,
    category: 'Sistema',
    status: 'active',
    path: '/admin/notificacoes',
    features: ['Alertas', 'Email', 'SMS'],
    color: 'from-orange-500 to-orange-600',
  },
  {
    id: 'configuracoes',
    name: 'Configurações',
    description: 'Configurações gerais do sistema',
    icon: Settings,
    category: 'Sistema',
    status: 'active',
    path: '/admin/configuracoes',
    features: ['Módulos', 'Temas', 'Backup'],
    color: 'from-gray-500 to-gray-600',
  },
  {
    id: 'backup-restore',
    name: 'Backup & Restore',
    description: 'Backup e restauração de dados',
    icon: Database,
    category: 'Sistema',
    status: 'active',
    path: '/admin/backup-restore',
    features: ['Backup', 'Restauração', 'Agendamento'],
    color: 'from-blue-500 to-blue-600',
  },
  {
    id: 'integracoes',
    name: 'Integrações',
    description: 'Gerenciar integrações externas',
    icon: Zap,
    category: 'Sistema',
    status: 'active',
    path: '/admin/integracoes',
    features: ['APIs', 'Webhooks', 'Sincronização'],
    color: 'from-yellow-500 to-yellow-600',
  },
  {
    id: 'integracao-interna',
    name: 'Integração Interna',
    description: 'Integração entre módulos',
    icon: GitBranch,
    category: 'Sistema',
    status: 'beta',
    path: '/admin/integracao-interna',
    features: ['Sincronização', 'Eventos', 'Webhooks'],
    color: 'from-purple-500 to-purple-600',
  },
];

export function AdminModulos() {
  const [, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const categories = Array.from(new Set(modules.map((m) => m.category)));

  const filteredModules = useMemo(() => {
    return modules.filter((module) => {
      const matchesSearch =
        module.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        module.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = !selectedCategory || module.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchTerm, selectedCategory]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'beta':
        return 'bg-blue-100 text-blue-800';
      case 'coming':
        return 'bg-yellow-100 text-yellow-800';
      case 'maintenance':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
            Módulos do Sistema
          </h1>
          <p className="text-slate-400 text-lg">
            Explore todos os módulos disponíveis na plataforma Martins
          </p>
        </div>

        {/* Controles */}
        <div className="mb-8 space-y-4">
          {/* Busca */}
          <div className="relative">
            <Search className="absolute left-4 top-3 w-5 h-5 text-slate-400" />
            <Input
              placeholder="Buscar módulos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 bg-slate-800 border-slate-700 text-white placeholder-slate-400 focus:border-blue-500"
            />
          </div>

          {/* Filtros e View Mode */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            {/* Categorias */}
            <div className="flex flex-wrap gap-2">
              <Button
                variant={selectedCategory === null ? 'default' : 'outline'}
                onClick={() => setSelectedCategory(null)}
                className="text-xs"
              >
                Todos ({modules.length})
              </Button>
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? 'default' : 'outline'}
                  onClick={() => setSelectedCategory(category)}
                  className="text-xs"
                >
                  {category} ({modules.filter((m) => m.category === category).length})
                </Button>
              ))}
            </div>

            {/* View Mode */}
            <div className="flex gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid3x3 className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Módulos */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredModules.map((module) => {
              const Icon = module.icon;
              return (
                <div
                  key={module.id}
                  onClick={() => setLocation(module.path)}
                  className="group cursor-pointer"
                >
                  <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 hover:border-blue-500 transition-all duration-300 h-full hover:shadow-xl hover:shadow-blue-500/10 hover:-translate-y-1">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div
                        className={`bg-gradient-to-br ${module.color} p-3 rounded-lg group-hover:scale-110 transition-transform duration-300`}
                      >
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <Badge className={getStatusColor(module.status)}>
                        {module.status === 'active'
                          ? 'Ativo'
                          : module.status === 'beta'
                          ? 'Beta'
                          : module.status === 'coming'
                          ? 'Em Breve'
                          : 'Manutenção'}
                      </Badge>
                    </div>

                    {/* Conteúdo */}
                    <h3 className="text-lg font-bold text-white mb-1">{module.name}</h3>
                    <p className="text-sm text-slate-400 mb-4">{module.description}</p>

                    {/* Features */}
                    <div className="flex flex-wrap gap-1 mb-4">
                      {module.features.slice(0, 2).map((feature) => (
                        <Badge key={feature} variant="secondary" className="text-xs">
                          {feature}
                        </Badge>
                      ))}
                      {module.features.length > 2 && (
                        <Badge variant="secondary" className="text-xs">
                          +{module.features.length - 2}
                        </Badge>
                      )}
                    </div>

                    {/* Footer */}
                    <Button
                      className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
                      onClick={(e) => {
                        e.stopPropagation();
                        setLocation(module.path);
                      }}
                    >
                      Acessar
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredModules.map((module) => {
              const Icon = module.icon;
              return (
                <div
                  key={module.id}
                  onClick={() => setLocation(module.path)}
                  className="group cursor-pointer bg-slate-800 border border-slate-700 rounded-lg p-4 hover:border-blue-500 transition-all duration-300 hover:bg-slate-700"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <div
                        className={`bg-gradient-to-br ${module.color} p-3 rounded-lg`}
                      >
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-white">{module.name}</h3>
                        <p className="text-sm text-slate-400">{module.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge className={getStatusColor(module.status)}>
                        {module.status === 'active'
                          ? 'Ativo'
                          : module.status === 'beta'
                          ? 'Beta'
                          : module.status === 'coming'
                          ? 'Em Breve'
                          : 'Manutenção'}
                      </Badge>
                      <Button
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-700"
                        onClick={(e) => {
                          e.stopPropagation();
                          setLocation(module.path);
                        }}
                      >
                        Acessar
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Empty State */}
        {filteredModules.length === 0 && (
          <div className="text-center py-12">
            <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-400 text-lg">Nenhum módulo encontrado</p>
          </div>
        )}

        {/* Resumo */}
        <div className="mt-12 pt-8 border-t border-slate-700">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-3xl font-bold text-blue-400">{modules.length}</p>
              <p className="text-slate-400 text-sm">Módulos Total</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-green-400">
                {modules.filter((m) => m.status === 'active').length}
              </p>
              <p className="text-slate-400 text-sm">Ativos</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-blue-400">
                {modules.filter((m) => m.status === 'beta').length}
              </p>
              <p className="text-slate-400 text-sm">Em Beta</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-yellow-400">
                {categories.length}
              </p>
              <p className="text-slate-400 text-sm">Categorias</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
