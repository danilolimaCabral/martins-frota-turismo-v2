/**
 * Página de Administração de GPS
 * Gerencia provedores de rastreamento e sincronização
 */

import { useState } from 'react';
import { useLocation } from "wouter";
import { ArrowLeft } from "lucide-react";
import { useQuery, useMutation } from '@tanstack/react-query';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, CheckCircle, Clock, Trash2, Plus, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

export function AdminGPS() {
  const [, navigate] = useLocation();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    id: '',
    type: '',
    name: '',
    apiKey: '',
    apiUrl: '',
    syncInterval: 30,
  });

  // Queries
  const { data: supportedProviders } = trpc.gps.getSupportedProviders.useQuery();
  const { data: providers, refetch: refetchProviders } = trpc.gps.listProviders.useQuery();
  const { data: syncStatus } = trpc.gps.getSyncStatus.useQuery();

  // Mutations
  const createProviderMutation = trpc.gps.createProvider.useMutation({
    onSuccess: () => {
      toast.success('Provedor criado com sucesso!');
      setIsDialogOpen(false);
      setFormData({
        id: '',
        type: '',
        name: '',
        apiKey: '',
        apiUrl: '',
        syncInterval: 30,
      });
      refetchProviders();
    },
    onError: (error) => {
      toast.error(`Erro ao criar provedor: ${error.message}`);
    },
  });

  const syncNowMutation = trpc.gps.syncNow.useMutation({
    onSuccess: (result) => {
      toast.success(
        `Sincronização concluída: ${result.vehiclesUpdated} veículos, ${result.alertsGenerated} alertas`
      );
      refetchProviders();
    },
    onError: (error) => {
      toast.error(`Erro na sincronização: ${error.message}`);
    },
  });

  const deleteProviderMutation = trpc.gps.deleteProvider.useMutation({
    onSuccess: () => {
      toast.success('Provedor deletado com sucesso!');
      refetchProviders();
    },
    onError: (error) => {
      toast.error(`Erro ao deletar provedor: ${error.message}`);
    },
  });

  const handleCreateProvider = async () => {
    if (!formData.id || !formData.type || !formData.name || !formData.apiKey || !formData.apiUrl) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    await createProviderMutation.mutateAsync({
      id: formData.id,
      type: formData.type as any,
      name: formData.name,
      apiKey: formData.apiKey,
      apiUrl: formData.apiUrl,
      syncInterval: formData.syncInterval,
    });
  };

  const handleSyncNow = (providerId: string) => {
    syncNowMutation.mutate({ providerId });
  };

  const handleDeleteProvider = (providerId: string) => {
    if (confirm('Tem certeza que deseja deletar este provedor?')) {
      deleteProviderMutation.mutate({ providerId });
    }
  };

  const getSyncStatusForProvider = (providerId: string) => {
    return syncStatus?.find((s) => s.providerId === providerId);
  };

  return (
    <div className="space-y-6">
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

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Integração de GPS</h1>
          <p className="text-muted-foreground mt-2">
            Gerencie provedores de rastreamento e sincronização de dados
          </p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          Novo Provedor
        </Button>
      </div>

      <Tabs defaultValue="providers" className="space-y-4">
        <TabsList>
          <TabsTrigger value="providers">Provedores Configurados</TabsTrigger>
          <TabsTrigger value="supported">Provedores Suportados</TabsTrigger>
          <TabsTrigger value="status">Status de Sincronização</TabsTrigger>
        </TabsList>

        {/* Provedores Configurados */}
        <TabsContent value="providers" className="space-y-4">
          {providers && providers.length > 0 ? (
            <div className="grid gap-4">
              {providers.map((provider) => {
                const status = getSyncStatusForProvider(provider.id);
                return (
                  <Card key={provider.id}>
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle>{provider.name}</CardTitle>
                          <CardDescription>
                            {provider.type} • Intervalo: {provider.syncInterval}s
                          </CardDescription>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleSyncNow(provider.id)}
                            disabled={syncNowMutation.isPending}
                          >
                            <RefreshCw className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDeleteProvider(provider.id)}
                            disabled={deleteProviderMutation.isPending}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">API URL:</span>
                          <p className="font-mono text-xs break-all">{provider.apiUrl}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Status:</span>
                          <p className="flex items-center gap-2 mt-1">
                            {provider.enabled ? (
                              <>
                                <CheckCircle className="w-4 h-4 text-green-600" />
                                <span>Ativo</span>
                              </>
                            ) : (
                              <>
                                <AlertCircle className="w-4 h-4 text-yellow-600" />
                                <span>Inativo</span>
                              </>
                            )}
                          </p>
                        </div>
                      </div>
                      {status && (
                        <div className="text-xs text-muted-foreground">
                          {status.isSyncing ? (
                            <p className="flex items-center gap-2">
                              <Clock className="w-3 h-3 animate-spin" />
                              Sincronizando...
                            </p>
                          ) : (
                            <p>
                              Última sincronização:{' '}
                              {provider.lastSync
                                ? new Date(provider.lastSync).toLocaleString()
                                : 'Nunca'}
                            </p>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card>
              <CardContent className="pt-6 text-center">
                <AlertCircle className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-muted-foreground">Nenhum provedor configurado</p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => setIsDialogOpen(true)}
                >
                  Configurar Primeiro Provedor
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Provedores Suportados */}
        <TabsContent value="supported" className="space-y-4">
          {supportedProviders && supportedProviders.length > 0 ? (
            <div className="grid gap-4">
              {supportedProviders.map((provider) => (
                <Card key={provider.type}>
                  <CardHeader>
                    <CardTitle>{provider.name}</CardTitle>
                    <CardDescription>{provider.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm">
                      <p className="text-muted-foreground">
                        <strong>Tipo:</strong> {provider.type}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-muted-foreground">Carregando provedores suportados...</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Status de Sincronização */}
        <TabsContent value="status" className="space-y-4">
          {syncStatus && syncStatus.length > 0 ? (
            <div className="grid gap-4">
              {syncStatus.map((status) => (
                <Card key={status.providerId}>
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-semibold">{status.providerId}</p>
                        <p className="text-sm text-muted-foreground">
                          {status.isRunning ? 'Sincronização ativa' : 'Sincronização inativa'}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        {status.isSyncing && (
                          <div className="flex items-center gap-2 text-sm">
                            <Clock className="w-4 h-4 animate-spin" />
                            <span>Sincronizando...</span>
                          </div>
                        )}
                        {status.isRunning && !status.isSyncing && (
                          <div className="flex items-center gap-2 text-sm text-green-600">
                            <CheckCircle className="w-4 h-4" />
                            <span>Ativo</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-muted-foreground">Nenhuma sincronização em andamento</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Dialog para criar novo provedor */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo Provedor de GPS</DialogTitle>
            <DialogDescription>
              Configure um novo provedor de rastreamento GPS
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="id">ID do Provedor</Label>
              <Input
                id="id"
                placeholder="ex: onixsat-1"
                value={formData.id}
                onChange={(e) => setFormData({ ...formData, id: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="type">Tipo de Provedor</Label>
              <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                <SelectTrigger id="type">
                  <SelectValue placeholder="Selecione um provedor" />
                </SelectTrigger>
                <SelectContent>
                  {supportedProviders?.map((provider) => (
                    <SelectItem key={provider.type} value={provider.type}>
                      {provider.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="name">Nome do Provedor</Label>
              <Input
                id="name"
                placeholder="ex: Onixsat - Frota Principal"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="apiUrl">URL da API</Label>
              <Input
                id="apiUrl"
                placeholder="ex: https://api.onixsat.com.br"
                value={formData.apiUrl}
                onChange={(e) => setFormData({ ...formData, apiUrl: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="apiKey">API Key</Label>
              <Input
                id="apiKey"
                type="password"
                placeholder="Sua API Key"
                value={formData.apiKey}
                onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="syncInterval">Intervalo de Sincronização (segundos)</Label>
              <Input
                id="syncInterval"
                type="number"
                min="5"
                value={formData.syncInterval}
                onChange={(e) => setFormData({ ...formData, syncInterval: parseInt(e.target.value) })}
              />
            </div>

            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button
                onClick={handleCreateProvider}
                disabled={createProviderMutation.isPending}
              >
                {createProviderMutation.isPending ? 'Criando...' : 'Criar Provedor'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
