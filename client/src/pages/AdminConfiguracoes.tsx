import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Switch } from "../components/ui/switch";
import { Settings, Save, AlertCircle, Bell, Lock, Palette , ArrowLeft } from "lucide-react";
import { toast } from "sonner";

export default function AdminConfiguracoes() {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("geral");
  const [isSaving, setIsSaving] = useState(false);
  const [config, setConfig] = useState({
    empresa: {
      nome: "MARTINS RS LTDA",
      nomeFantasia: "Martins Viagens e Turismo",
      email: "contato@martinsturismo.com.br",
      telefone: "(41) 99102-1445",
      endereco: "Araucária, PR",
      cnpj: "80.213.176/0001-60",
      atividade: "Transporte rodoviário coletivo de passageiros (fretamento intermunicipal)",
      dataFundacao: "1986",
      regime: "Microempresa (ME)",
    },
    notificacoes: {
      emailNotificacoes: true,
      whatsappNotificacoes: true,
      alertasVeiculos: true,
      alertasMotoristas: true,
      alertasFinanceiro: true,
      resumoDiario: true,
    },
    seguranca: {
      autenticacaoDois: false,
      sessaoTimeout: 30,
      senhaMinima: 8,
      requerirMaiuscula: true,
      requerirNumeros: true,
      requerirEspeciais: true,
    },
    sistema: {
      tema: "light",
      idioma: "pt-BR",
      formatoData: "DD/MM/YYYY",
      formatoMoeda: "R$",
      backupAutomatico: true,
      frequenciaBackup: "diaria",
    },
  });

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Simular salvamento
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success("Configurações salvas com sucesso!");
    } catch (error) {
      toast.error("Erro ao salvar configurações");
    } finally {
      setIsSaving(false);
    }
  };

  const handleConfigChange = (section: string, field: string, value: any) => {
    setConfig(prev => ({
      ...prev,
      [section]: {
        ...prev[section as keyof typeof config],
        [field]: value,
      },
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
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

      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Settings className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">Configurações</h1>
          </div>
          <p className="text-gray-600">Gerencie as configurações gerais do sistema</p>
        </div>

        {/* Informacoes da Empresa - Header */}
        <div className="bg-gradient-to-r from-slate-900 to-blue-900 rounded-lg p-6 mb-8 text-white">
          <h2 className="text-2xl font-bold mb-2">{config.empresa.nome}</h2>
          <p className="text-slate-300 mb-4">{(config.empresa as any).nomeFantasia}</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-slate-400">CNPJ</p>
              <p className="font-semibold">{config.empresa.cnpj}</p>
            </div>
            <div>
              <p className="text-slate-400">Localizacao</p>
              <p className="font-semibold">{config.empresa.endereco}</p>
            </div>
            <div>
              <p className="text-slate-400">Fundacao</p>
              <p className="font-semibold">{(config.empresa as any).dataFundacao}</p>
            </div>
            <div>
              <p className="text-slate-400">Regime</p>
              <p className="font-semibold">{(config.empresa as any).regime}</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="geral">Geral</TabsTrigger>
            <TabsTrigger value="notificacoes">Notificações</TabsTrigger>
            <TabsTrigger value="seguranca">Segurança</TabsTrigger>
            <TabsTrigger value="sistema">Sistema</TabsTrigger>
          </TabsList>

          {/* Aba Geral */}
          <TabsContent value="geral" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Informações da Empresa</CardTitle>
                <CardDescription>Dados básicos da sua empresa</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="nome">Nome da Empresa</Label>
                    <Input
                      id="nome"
                      value={config.empresa.nome}
                      onChange={(e) => handleConfigChange("empresa", "nome", e.target.value)}
                      placeholder="Nome da empresa"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cnpj">CNPJ</Label>
                    <Input
                      id="cnpj"
                      value={config.empresa.cnpj}
                      onChange={(e) => handleConfigChange("empresa", "cnpj", e.target.value)}
                      placeholder="00.000.000/0000-00"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={config.empresa.email}
                      onChange={(e) => handleConfigChange("empresa", "email", e.target.value)}
                      placeholder="contato@empresa.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="telefone">Telefone</Label>
                    <Input
                      id="telefone"
                      value={config.empresa.telefone}
                      onChange={(e) => handleConfigChange("empresa", "telefone", e.target.value)}
                      placeholder="(00) 00000-0000"
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="endereco">Endereço</Label>
                    <Input
                      id="endereco"
                      value={config.empresa.endereco}
                      onChange={(e) => handleConfigChange("empresa", "endereco", e.target.value)}
                      placeholder="Endereço completo"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Aba Notificações */}
          <TabsContent value="notificacoes" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  Preferências de Notificações
                </CardTitle>
                <CardDescription>Configure como você deseja receber notificações</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">Notificações por Email</p>
                      <p className="text-sm text-gray-600">Receba alertas por email</p>
                    </div>
                    <Switch
                      checked={config.notificacoes.emailNotificacoes}
                      onCheckedChange={(value) =>
                        handleConfigChange("notificacoes", "emailNotificacoes", value)
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">Notificações por WhatsApp</p>
                      <p className="text-sm text-gray-600">Receba alertas por WhatsApp</p>
                    </div>
                    <Switch
                      checked={config.notificacoes.whatsappNotificacoes}
                      onCheckedChange={(value) =>
                        handleConfigChange("notificacoes", "whatsappNotificacoes", value)
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">Alertas de Veículos</p>
                      <p className="text-sm text-gray-600">Alertas sobre status de veículos</p>
                    </div>
                    <Switch
                      checked={config.notificacoes.alertasVeiculos}
                      onCheckedChange={(value) =>
                        handleConfigChange("notificacoes", "alertasVeiculos", value)
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">Alertas de Motoristas</p>
                      <p className="text-sm text-gray-600">Alertas sobre motoristas</p>
                    </div>
                    <Switch
                      checked={config.notificacoes.alertasMotoristas}
                      onCheckedChange={(value) =>
                        handleConfigChange("notificacoes", "alertasMotoristas", value)
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">Alertas Financeiros</p>
                      <p className="text-sm text-gray-600">Alertas sobre movimentações financeiras</p>
                    </div>
                    <Switch
                      checked={config.notificacoes.alertasFinanceiro}
                      onCheckedChange={(value) =>
                        handleConfigChange("notificacoes", "alertasFinanceiro", value)
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">Resumo Diário</p>
                      <p className="text-sm text-gray-600">Receba resumo diário das operações</p>
                    </div>
                    <Switch
                      checked={config.notificacoes.resumoDiario}
                      onCheckedChange={(value) =>
                        handleConfigChange("notificacoes", "resumoDiario", value)
                      }
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Aba Segurança */}
          <TabsContent value="seguranca" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="w-5 h-5" />
                  Configurações de Segurança
                </CardTitle>
                <CardDescription>Proteja sua conta e dados</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">Autenticação de Dois Fatores</p>
                      <p className="text-sm text-gray-600">Adicione camada extra de segurança</p>
                    </div>
                    <Switch
                      checked={config.seguranca.autenticacaoDois}
                      onCheckedChange={(value) =>
                        handleConfigChange("seguranca", "autenticacaoDois", value)
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="timeout">Timeout de Sessão (minutos)</Label>
                    <Input
                      id="timeout"
                      type="number"
                      value={config.seguranca.sessaoTimeout}
                      onChange={(e) =>
                        handleConfigChange("seguranca", "sessaoTimeout", parseInt(e.target.value))
                      }
                      min="5"
                      max="480"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="senhaMinima">Comprimento Mínimo de Senha</Label>
                    <Input
                      id="senhaMinima"
                      type="number"
                      value={config.seguranca.senhaMinima}
                      onChange={(e) =>
                        handleConfigChange("seguranca", "senhaMinima", parseInt(e.target.value))
                      }
                      min="6"
                      max="20"
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">Exigir Letras Maiúsculas</p>
                      <p className="text-sm text-gray-600">Senhas devem conter maiúsculas</p>
                    </div>
                    <Switch
                      checked={config.seguranca.requerirMaiuscula}
                      onCheckedChange={(value) =>
                        handleConfigChange("seguranca", "requerirMaiuscula", value)
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">Exigir Números</p>
                      <p className="text-sm text-gray-600">Senhas devem conter números</p>
                    </div>
                    <Switch
                      checked={config.seguranca.requerirNumeros}
                      onCheckedChange={(value) =>
                        handleConfigChange("seguranca", "requerirNumeros", value)
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">Exigir Caracteres Especiais</p>
                      <p className="text-sm text-gray-600">Senhas devem conter !@#$%^&*</p>
                    </div>
                    <Switch
                      checked={config.seguranca.requerirEspeciais}
                      onCheckedChange={(value) =>
                        handleConfigChange("seguranca", "requerirEspeciais", value)
                      }
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Aba Sistema */}
          <TabsContent value="sistema" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="w-5 h-5" />
                  Configurações do Sistema
                </CardTitle>
                <CardDescription>Personalize a experiência do sistema</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="tema">Tema</Label>
                    <select
                      id="tema"
                      value={config.sistema.tema}
                      onChange={(e) => handleConfigChange("sistema", "tema", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    >
                      <option value="light">Claro</option>
                      <option value="dark">Escuro</option>
                      <option value="auto">Automático</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="idioma">Idioma</Label>
                    <select
                      id="idioma"
                      value={config.sistema.idioma}
                      onChange={(e) => handleConfigChange("sistema", "idioma", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    >
                      <option value="pt-BR">Português (Brasil)</option>
                      <option value="en-US">English (USA)</option>
                      <option value="es-ES">Español (España)</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="formatoData">Formato de Data</Label>
                    <select
                      id="formatoData"
                      value={config.sistema.formatoData}
                      onChange={(e) => handleConfigChange("sistema", "formatoData", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    >
                      <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                      <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                      <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="formatoMoeda">Formato de Moeda</Label>
                    <select
                      id="formatoMoeda"
                      value={config.sistema.formatoMoeda}
                      onChange={(e) => handleConfigChange("sistema", "formatoMoeda", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    >
                      <option value="R$">Real (R$)</option>
                      <option value="$">Dólar ($)</option>
                      <option value="€">Euro (€)</option>
                    </select>
                  </div>
                </div>

                <div className="border-t pt-6">
                  <h3 className="font-semibold mb-4">Backup Automático</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">Ativar Backup Automático</p>
                        <p className="text-sm text-gray-600">Faça backup automático dos dados</p>
                      </div>
                      <Switch
                        checked={config.sistema.backupAutomatico}
                        onCheckedChange={(value) =>
                          handleConfigChange("sistema", "backupAutomatico", value)
                        }
                      />
                    </div>

                    {config.sistema.backupAutomatico && (
                      <div className="space-y-2">
                        <Label htmlFor="frequenciaBackup">Frequência de Backup</Label>
                        <select
                          id="frequenciaBackup"
                          value={config.sistema.frequenciaBackup}
                          onChange={(e) =>
                            handleConfigChange("sistema", "frequenciaBackup", e.target.value)
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        >
                          <option value="horaria">A cada hora</option>
                          <option value="diaria">Diariamente</option>
                          <option value="semanal">Semanalmente</option>
                          <option value="mensal">Mensalmente</option>
                        </select>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Botão Salvar */}
        <div className="mt-8 flex justify-end gap-4">
          <Button variant="outline">Cancelar</Button>
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? "Salvando..." : "Salvar Configurações"}
          </Button>
        </div>

        {/* Info Box */}
        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg flex gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-blue-900">Dica</p>
            <p className="text-sm text-blue-800">
              As alterações serão aplicadas imediatamente após salvar. Algumas configurações podem
              exigir logout e novo login para entrar em vigor.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
