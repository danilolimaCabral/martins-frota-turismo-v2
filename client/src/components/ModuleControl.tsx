/**
 * Componente de Controle de Módulos
 * Permite ativar/desativar módulos do sistema administrativo
 */

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
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
} from 'lucide-react';

export interface Module {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  enabled: boolean;
  category: 'frota' | 'rh' | 'financeiro' | 'agenda' | 'relatorios' | 'sistema';
  features: string[];
  status: 'active' | 'inactive' | 'maintenance';
}

interface ModuleControlProps {
  modules: Module[];
  onModuleToggle: (moduleId: string, enabled: boolean) => void;
  onSaveChanges: () => void;
  isSaving?: boolean;
}

const defaultModules: Module[] = [
  {
    id: 'frota',
    name: 'Gestão de Frota',
    description: 'Gerenciamento de veículos, motoristas e manutenção',
    icon: Bus,
    enabled: true,
    category: 'frota',
    features: ['Veículos', 'Motoristas', 'Manutenção', 'Rastreamento GPS'],
    status: 'active',
  },
  {
    id: 'rh',
    name: 'Recursos Humanos',
    description: 'Folha de pagamento, férias, ponto e funcionários',
    icon: Users,
    enabled: true,
    category: 'rh',
    features: ['Funcionários', 'Folha de Pagamento', 'Férias', 'Controle de Ponto'],
    status: 'active',
  },
  {
    id: 'financeiro',
    name: 'Financeiro',
    description: 'Despesas, receitas, fluxo de caixa e relatórios financeiros',
    icon: DollarSign,
    enabled: true,
    category: 'financeiro',
    features: ['Despesas', 'Receitas', 'Fluxo de Caixa', 'DRE'],
    status: 'active',
  },
  {
    id: 'agenda',
    name: 'Agenda e Viagens',
    description: 'Agendamento de viagens, eventos e calendário',
    icon: Calendar,
    enabled: true,
    category: 'agenda',
    features: ['Agenda', 'Viagens', 'Eventos', 'Calendário Avançado'],
    status: 'active',
  },
  {
    id: 'roteirizacao',
    name: 'Roteirização',
    description: 'Otimização de rotas e planejamento de trajetos',
    icon: MapPin,
    enabled: true,
    category: 'agenda',
    features: ['Roteirização', 'Otimização de Rotas', 'Histórico de Rotas'],
    status: 'active',
  },
  {
    id: 'relatorios',
    name: 'Relatórios e Analytics',
    description: 'Geração de relatórios e análise de dados',
    icon: BarChart3,
    enabled: true,
    category: 'relatorios',
    features: ['Relatórios', 'Analytics', 'Exportação de Dados', 'Gráficos'],
    status: 'active',
  },
  {
    id: 'notificacoes',
    name: 'Notificações e Alertas',
    description: 'Sistema de alertas e notificações em tempo real',
    icon: Bell,
    enabled: true,
    category: 'sistema',
    features: ['Alertas', 'Notificações', 'Email', 'SMS'],
    status: 'active',
  },
  {
    id: 'configuracoes',
    name: 'Configurações do Sistema',
    description: 'Backup, restauração, auditoria e configurações gerais',
    icon: Settings,
    enabled: true,
    category: 'sistema',
    features: ['Backup', 'Auditoria', 'Usuários', 'Integrações'],
    status: 'active',
  },
];

export function ModuleControl({
  modules = defaultModules,
  onModuleToggle,
  onSaveChanges,
  isSaving = false,
}: ModuleControlProps) {
  const [localModules, setLocalModules] = useState<Module[]>(modules);
  const [hasChanges, setHasChanges] = useState(false);

  const handleToggle = (moduleId: string) => {
    const updated = localModules.map((m) =>
      m.id === moduleId ? { ...m, enabled: !m.enabled } : m
    );
    setLocalModules(updated);
    setHasChanges(true);
    onModuleToggle(moduleId, !localModules.find((m) => m.id === moduleId)?.enabled);
  };

  const handleSave = () => {
    onSaveChanges();
    setHasChanges(false);
  };

  const categories = ['frota', 'rh', 'financeiro', 'agenda', 'relatorios', 'sistema'] as const;
  const categoryLabels: Record<typeof categories[number], string> = {
    frota: 'Gestão de Frota',
    rh: 'Recursos Humanos',
    financeiro: 'Financeiro',
    agenda: 'Agenda e Viagens',
    relatorios: 'Relatórios',
    sistema: 'Sistema',
  };

  const enabledCount = localModules.filter((m) => m.enabled).length;
  const totalCount = localModules.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Controle de Módulos</h2>
          <p className="text-slate-600 text-sm mt-1">
            Ative ou desative módulos do sistema conforme necessário
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-sm">
            {enabledCount} de {totalCount} ativos
          </Badge>
          {hasChanges && (
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              {isSaving ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          )}
        </div>
      </div>

      {/* Módulos por Categoria */}
      {categories.map((category) => {
        const categoryModules = localModules.filter((m) => m.category === category);
        if (categoryModules.length === 0) return null;

        return (
          <div key={category} className="space-y-3">
            <h3 className="text-lg font-semibold text-slate-900">{categoryLabels[category]}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {categoryModules.map((module) => {
                const Icon = module.icon;
                return (
                  <Card
                    key={module.id}
                    className={`transition-all ${
                      module.enabled
                        ? 'border-blue-200 bg-blue-50/50'
                        : 'border-slate-200 bg-slate-50/50 opacity-60'
                    }`}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 flex-1">
                          <div
                            className={`p-2 rounded-lg ${
                              module.enabled ? 'bg-blue-100' : 'bg-slate-100'
                            }`}
                          >
                            <Icon
                              className={`w-5 h-5 ${
                                module.enabled ? 'text-blue-600' : 'text-slate-400'
                              }`}
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <CardTitle className="text-base">{module.name}</CardTitle>
                            <CardDescription className="text-xs mt-1">
                              {module.description}
                            </CardDescription>
                          </div>
                        </div>
                        <Switch
                          checked={module.enabled}
                          onCheckedChange={() => handleToggle(module.id)}
                          disabled={isSaving}
                          className="ml-2"
                        />
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="flex flex-wrap gap-1">
                        {module.features.map((feature) => (
                          <Badge
                            key={feature}
                            variant="secondary"
                            className="text-xs"
                          >
                            {feature}
                          </Badge>
                        ))}
                      </div>
                      <div className="mt-3 flex items-center gap-2 text-xs">
                        {module.status === 'active' ? (
                          <>
                            <CheckCircle2 className="w-3 h-3 text-green-600" />
                            <span className="text-green-600">Operacional</span>
                          </>
                        ) : module.status === 'maintenance' ? (
                          <>
                            <AlertCircle className="w-3 h-3 text-orange-600" />
                            <span className="text-orange-600">Em manutenção</span>
                          </>
                        ) : (
                          <>
                            <AlertCircle className="w-3 h-3 text-slate-400" />
                            <span className="text-slate-400">Inativo</span>
                          </>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* Footer Actions */}
      <div className="flex flex-col sm:flex-row gap-3 justify-end pt-4 border-t">
        <Button variant="outline">Restaurar Padrão</Button>
        <Button
          onClick={handleSave}
          disabled={!hasChanges || isSaving}
          className="gap-2"
        >
          <CheckCircle2 className="w-4 h-4" />
          {isSaving ? 'Salvando...' : 'Salvar Alterações'}
        </Button>
      </div>
    </div>
  );
}
