import { useState, useEffect } from "react";
import { trpc } from "../lib/trpc";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { toast } from "sonner";
import { RefreshCw, CheckCircle, AlertCircle, Clock, Zap } from "lucide-react";

export default function AdminCTASmartSync() {
  const [syncDialogOpen, setSyncDialogOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncResult, setLastSyncResult] = useState<any>(null);

  const syncMutation = trpc.ctaSmart.sincronizarAbastecimentos.useMutation({
    onSuccess: (data) => {
      setLastSyncResult(data);
      if (data.sucesso) {
        toast.success(data.mensagem);
      } else {
        toast.error(data.mensagem);
      }
      setIsSyncing(false);
    },
    onError: (error) => {
      toast.error("Erro ao sincronizar: " + error.message);
      setIsSyncing(false);
    },
  });

  const statusQuery = trpc.ctaSmart.statusSincronizacao.useQuery();

  const handleSync = async () => {
    setIsSyncing(true);
    setSyncDialogOpen(true);
    await syncMutation.mutateAsync();
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Sincronização CTA Smart
          </h1>
          <p className="text-gray-600 mt-1">
            Gerencie a sincronização de abastecimentos com a API CTA Smart
          </p>
        </div>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Status */}
        <Card className="p-6 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-green-700">Status</p>
              <p className="text-2xl font-bold text-green-900 mt-2">Ativo</p>
              <p className="text-xs text-green-600 mt-1">
                Sincronização automática ativa
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
        </Card>

        {/* Intervalo */}
        <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-blue-700">Intervalo</p>
              <p className="text-2xl font-bold text-blue-900 mt-2">5 min</p>
              <p className="text-xs text-blue-600 mt-1">
                Entre sincronizações
              </p>
            </div>
            <Clock className="w-8 h-8 text-blue-600" />
          </div>
        </Card>

        {/* Última Sincronização */}
        <Card className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-purple-700">
                Última Sincronização
              </p>
              <p className="text-2xl font-bold text-purple-900 mt-2">
                {lastSyncResult
                  ? new Date().toLocaleTimeString("pt-BR")
                  : "Nunca"}
              </p>
              <p className="text-xs text-purple-600 mt-1">
                {lastSyncResult && lastSyncResult.sucesso
                  ? "Sucesso"
                  : "Pendente"}
              </p>
            </div>
            <Zap className="w-8 h-8 text-purple-600" />
          </div>
        </Card>
      </div>

      {/* Resultado da Última Sincronização */}
      {lastSyncResult && (
        <Card className="p-6 border-l-4 border-l-blue-500">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 mb-3">
                Resultado da Última Sincronização
              </h3>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Total Processado</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {lastSyncResult.total || 0}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Sucesso</p>
                  <p className="text-2xl font-bold text-green-600">
                    {lastSyncResult.sucesso || 0}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Erros</p>
                  <p className="text-2xl font-bold text-red-600">
                    {lastSyncResult.erro || 0}
                  </p>
                </div>
              </div>
              <p className="text-sm text-gray-700 mt-4 p-3 bg-gray-50 rounded">
                {lastSyncResult.mensagem}
              </p>
            </div>
            {lastSyncResult.sucesso ? (
              <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 ml-4" />
            ) : (
              <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 ml-4" />
            )}
          </div>
        </Card>
      )}

      {/* Ações */}
      <div className="flex gap-3">
        <Button
          onClick={handleSync}
          disabled={isSyncing}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          {isSyncing ? "Sincronizando..." : "Sincronizar Agora"}
        </Button>
      </div>

      {/* Informações */}
      <Card className="p-6 bg-blue-50 border-blue-200">
        <h3 className="font-semibold text-gray-900 mb-3">Informações</h3>
        <ul className="space-y-2 text-sm text-gray-700">
          <li>
            • A sincronização ocorre automaticamente a cada 5 minutos
          </li>
          <li>
            • Você pode forçar uma sincronização manual clicando no botão acima
          </li>
          <li>
            • Os abastecimentos são importados automaticamente para o sistema
          </li>
          <li>
            • Duplicatas são detectadas e ignoradas automaticamente
          </li>
          <li>
            • O status de cada abastecimento é informado ao CTA Smart
          </li>
        </ul>
      </Card>

      {/* Dialog de Sincronização */}
      <Dialog open={syncDialogOpen} onOpenChange={setSyncDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sincronizando com CTA Smart...</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center py-8">
            <RefreshCw className="w-12 h-12 text-blue-600 animate-spin mb-4" />
            <p className="text-gray-600 text-center">
              Buscando abastecimentos da API CTA Smart e importando para o
              sistema...
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
