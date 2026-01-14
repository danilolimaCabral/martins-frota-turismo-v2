import { useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle, Clock, XCircle , ArrowLeft } from "lucide-react";

export default function AdminAlertas() {
  const [, setLocation] = useLocation();
  const { data: alertas, refetch } = trpc.alertas.list.useQuery();
  const { data: stats } = trpc.alertas.getStats.useQuery();

  const marcarRenovadoMutation = trpc.alertas.marcarRenovado.useMutation({
    onSuccess: () => {
      alert("Documento renovado!");
      refetch();
    },
  });

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: any; icon: any; label: string }> = {
      pendente: { variant: "secondary", icon: Clock, label: "Pendente" },
      alertado: { variant: "destructive", icon: AlertTriangle, label: "Alertado" },
      renovado: { variant: "default", icon: CheckCircle, label: "Renovado" },
      vencido: { variant: "destructive", icon: XCircle, label: "Vencido" },
    };
    const config = variants[status] || variants.pendente;
    const Icon = config.icon;
    return (
      <Badge variant={config.variant as any}>
        <Icon className="h-3 w-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  const getDiasRestantes = (dataVencimento: string) => {
    const hoje = new Date();
    const vencimento = new Date(dataVencimento);
    const diff = Math.ceil((vencimento.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
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

      <div>
        <h1 className="text-3xl font-bold">Alertas de Documentos</h1>
        <p className="text-muted-foreground">Controle de vencimento de documentos</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.pendentes || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Alertados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats?.alertados || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Vencidos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats?.vencidos || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Próximos 30 dias</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats?.proximosVencimentos || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Alertas */}
      <Card>
        <CardHeader>
          <CardTitle>Alertas ({alertas?.length || 0})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {alertas?.map((alerta) => {
              const diasRestantes = getDiasRestantes(alerta.dataVencimento ? String(alerta.dataVencimento) : new Date().toISOString());
              return (
                <div
                  key={alerta.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold">{alerta.funcionarioNome}</span>
                      <span className="text-sm text-muted-foreground">
                        • {alerta.tipoDocumento.toUpperCase()}
                      </span>
                      {getStatusBadge(alerta.status)}
                    </div>
                    <p className="text-sm">{alerta.descricao}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                      <span>Vencimento: {alerta.dataVencimento ? new Date(alerta.dataVencimento).toLocaleDateString("pt-BR") : "N/A"}</span>
                      {diasRestantes >= 0 ? (
                        <span className={diasRestantes <= 30 ? "text-orange-600 font-semibold" : ""}>
                          {diasRestantes} dias restantes
                        </span>
                      ) : (
                        <span className="text-red-600 font-semibold">
                          Vencido há {Math.abs(diasRestantes)} dias
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {alerta.status !== "renovado" && (
                      <Button
                        size="sm"
                        onClick={() => {
                          const novaData = prompt("Nova data de vencimento (AAAA-MM-DD):");
                          if (novaData) {
                            marcarRenovadoMutation.mutate({
                              id: alerta.id,
                              novaDataVencimento: novaData,
                            });
                          }
                        }}
                      >
                        Renovar
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
