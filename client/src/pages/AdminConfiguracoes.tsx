/**
 * Página de Configurações do Sistema
 * Gerencia módulos, preferências e configurações gerais
 */

import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  Settings,
  Save,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Database,
  Shield,
  Bell,
  Palette,
  LogOut,
} from 'lucide-react';
import { toast } from 'sonner';
import { ModuleControl, Module } from '@/components/ModuleControl';

export function AdminConfiguracoes() {
  const [, setLocation] = useLocation();
  const [user, setUser] = useState<any>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('modulos');

  useEffect(() => {
    const userData = localStorage.getItem('martins_user_data');
    if (!userData) {
      setLocation('/login');
      return;
    }
    setUser(JSON.parse(userData));

    // Carregar módulos salvos
    const savedModules = localStorage.getItem('martins_modules_config');
    if (savedModules) {
      setModules(JSON.parse(savedModules));
    }
  }, [setLocation]);

  const handleModuleToggle = (moduleId: string, enabled: boolean) => {
    setModules((prev) =>
      prev.map((m) => (m.id === moduleId ? { ...m, enabled } : m))
    );
  };

  const handleSaveModules = async () => {
    setIsSaving(true);
    try {
      // Simular salvamento
      await new Promise((resolve) => setTimeout(resolve, 1000));
      localStorage.setItem('martins_modules_config', JSON.stringify(modules));
      toast.success('Configuração de módulos salva com sucesso!');
    } catch (error) {
      toast.error('Erro ao salvar configuração de módulos');
    } finally {
      setIsSaving(false);
    }
  };

  const handleRestoreDefaults = () => {
    if (confirm('Tem certeza que deseja restaurar as configurações padrão?')) {
      localStorage.removeItem('martins_modules_config');
      window.location.reload();
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Configurações do Sistema</h1>
              <p className="text-slate-600 mt-2">
                Gerencie módulos, preferências e configurações gerais da plataforma
              </p>
            </div>
            <Badge variant="outline" className="w-fit">
              Versão 1.0.0
            </Badge>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 gap-2 md:gap-0">
            <TabsTrigger value="modulos" className="gap-2">
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Módulos</span>
            </TabsTrigger>
            <TabsTrigger value="aparencia" className="gap-2">
              <Palette className="w-4 h-4" />
              <span className="hidden sm:inline">Aparência</span>
            </TabsTrigger>
            <TabsTrigger value="notificacoes" className="gap-2">
              <Bell className="w-4 h-4" />
              <span className="hidden sm:inline">Notificações</span>
            </TabsTrigger>
            <TabsTrigger value="seguranca" className="gap-2">
              <Shield className="w-4 h-4" />
              <span className="hidden sm:inline">Segurança</span>
            </TabsTrigger>
            <TabsTrigger value="dados" className="gap-2">
              <Database className="w-4 h-4" />
              <span className="hidden sm:inline">Dados</span>
            </TabsTrigger>
          </TabsList>

          {/* Tab: Módulos */}
          <TabsContent value="modulos" className="space-y-6">
            <ModuleControl
              modules={modules}
              onModuleToggle={handleModuleToggle}
              onSaveChanges={handleSaveModules}
              isSaving={isSaving}
            />
          </TabsContent>

          {/* Tab: Aparência */}
          <TabsContent value="aparencia" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Tema e Aparência</CardTitle>
                <CardDescription>
                  Customize a aparência da interface do sistema
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="border-2 border-blue-500 cursor-pointer">
                    <CardContent className="pt-6">
                      <div className="w-full h-32 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg mb-3" />
                      <p className="font-semibold text-sm">Tema Azul (Padrão)</p>
                      <Badge className="mt-2">Ativo</Badge>
                    </CardContent>
                  </Card>
                  <Card className="border border-slate-200 cursor-pointer hover:border-slate-300">
                    <CardContent className="pt-6">
                      <div className="w-full h-32 bg-gradient-to-br from-slate-600 to-slate-700 rounded-lg mb-3" />
                      <p className="font-semibold text-sm">Tema Escuro</p>
                    </CardContent>
                  </Card>
                  <Card className="border border-slate-200 cursor-pointer hover:border-slate-300">
                    <CardContent className="pt-6">
                      <div className="w-full h-32 bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-lg mb-3" />
                      <p className="font-semibold text-sm">Tema Verde</p>
                    </CardContent>
                  </Card>
                </div>
                <div className="pt-4 border-t">
                  <Button>Salvar Preferências</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab: Notificações */}
          <TabsContent value="notificacoes" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Preferências de Notificações</CardTitle>
                <CardDescription>
                  Configure como você deseja receber notificações
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-semibold text-sm">Alertas Críticos</p>
                      <p className="text-xs text-slate-600">Receba notificações de problemas urgentes</p>
                    </div>
                    <input type="checkbox" defaultChecked className="w-5 h-5" />
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-semibold text-sm">Relatórios Diários</p>
                      <p className="text-xs text-slate-600">Resumo diário do sistema</p>
                    </div>
                    <input type="checkbox" defaultChecked className="w-5 h-5" />
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-semibold text-sm">Atualizações do Sistema</p>
                      <p className="text-xs text-slate-600">Notificações de atualizações disponíveis</p>
                    </div>
                    <input type="checkbox" className="w-5 h-5" />
                  </div>
                </div>
                <div className="pt-4 border-t">
                  <Button>Salvar Preferências</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab: Segurança */}
          <TabsContent value="seguranca" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Configurações de Segurança</CardTitle>
                <CardDescription>
                  Gerencie segurança e permissões do sistema
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-sm">Autenticação de Dois Fatores</p>
                      <p className="text-xs text-slate-600">Ativada para sua conta</p>
                    </div>
                  </div>
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="font-semibold text-sm mb-2">Alterar Senha</p>
                    <Button variant="outline" size="sm">
                      Alterar Senha
                    </Button>
                  </div>
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
                    <p className="font-semibold text-sm mb-2">Sessões Ativas</p>
                    <p className="text-xs text-slate-600 mb-3">Você tem 2 sessões ativas</p>
                    <Button variant="outline" size="sm">
                      Gerenciar Sessões
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab: Dados */}
          <TabsContent value="dados" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Gerenciamento de Dados</CardTitle>
                <CardDescription>
                  Backup, restauração e limpeza de dados
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="font-semibold text-sm">Fazer Backup</p>
                        <p className="text-xs text-slate-600">Último backup: 2 horas atrás</p>
                      </div>
                      <Button variant="outline" size="sm">
                        Fazer Backup Agora
                      </Button>
                    </div>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="font-semibold text-sm">Restaurar Backup</p>
                        <p className="text-xs text-slate-600">Restaurar dados de um backup anterior</p>
                      </div>
                      <Button variant="outline" size="sm">
                        Restaurar
                      </Button>
                    </div>
                  </div>
                  <div className="p-4 border border-red-200 bg-red-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-sm text-red-900">Limpar Dados Antigos</p>
                        <p className="text-xs text-red-700">
                          Remover dados com mais de 1 ano
                        </p>
                      </div>
                      <Button variant="destructive" size="sm">
                        Limpar
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t flex flex-col sm:flex-row gap-3 justify-between">
          <Button
            variant="outline"
            onClick={handleRestoreDefaults}
            className="gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Restaurar Padrão
          </Button>
          <div className="flex gap-3">
            <Button variant="outline">Cancelar</Button>
            <Button className="gap-2">
              <Save className="w-4 h-4" />
              Salvar Alterações
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
