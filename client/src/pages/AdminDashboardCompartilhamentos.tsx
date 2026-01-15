import { useState, useEffect } from "react";
import { useRoute } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, BarChart3, Share2, Eye, Mouse, Clock, TrendingUp } from "lucide-react";
import { trpc } from "@/lib/trpc";
import DashboardLayout from "@/components/DashboardLayout";

interface ShareStats {
  totalShares: number;
  totalViews: number;
  totalClicks: number;
  averageResponseTime: number;
  acceptanceRate: number;
  byPlatform: {
    [key: string]: {
      count: number;
      views: number;
      clicks: number;
    };
  };
}

export default function AdminDashboardCompartilhamentos() {
  const [, params] = useRoute("/admin/dashboard-compartilhamentos/:routeId");
  const routeId = params?.routeId ? parseInt(params.routeId) : null;
  const [stats, setStats] = useState<ShareStats | null>(null);
  const [loading, setLoading] = useState(true);

  const { data: shareStats } = trpc.routeSharing.getShareStats.useQuery(
    routeId || 0,
    { enabled: !!routeId }
  );

  const { data: shares } = trpc.routeSharing.listShares.useQuery(
    routeId || 0,
    { enabled: !!routeId }
  );

  useEffect(() => {
    if (shareStats) {
      setStats(shareStats);
      setLoading(false);
    }
  }, [shareStats]);

  if (!routeId) {
    return (
      <DashboardLayout>
        <div className="p-6">
          <p className="text-red-500">Rota não encontrada</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => window.history.back()}
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Dashboard de Compartilhamentos
              </h1>
              <p className="text-gray-600">Análise de rotas compartilhadas</p>
            </div>
          </div>
          <BarChart3 className="w-8 h-8 text-orange-500" />
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Total Compartilhamentos */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Total de Compartilhamentos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">
                  {stats.totalShares}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Rotas compartilhadas
                </p>
              </CardContent>
            </Card>

            {/* Total Visualizações */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  Visualizações
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {stats.totalViews}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Vezes visualizado
                </p>
              </CardContent>
            </Card>

            {/* Total Cliques */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                  <Mouse className="w-4 h-4" />
                  Cliques
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {stats.totalClicks}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Links clicados
                </p>
              </CardContent>
            </Card>

            {/* Taxa de Aceitação */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Taxa de Aceitação
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">
                  {stats.acceptanceRate}%
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Motoristas aceitaram
                </p>
              </CardContent>
            </Card>

            {/* Tempo Médio de Resposta */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Tempo Médio
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">
                  {stats.averageResponseTime}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Minutos até resposta
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Compartilhamentos por Plataforma */}
        {stats && Object.keys(stats.byPlatform).length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Share2 className="w-5 h-5 text-orange-500" />
                Compartilhamentos por Plataforma
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(stats.byPlatform).map(
                  ([platform, data]: [string, any]) => (
                    <div
                      key={platform}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="capitalize">
                            {platform === "qrcode"
                              ? "QR Code"
                              : platform === "direct_link"
                              ? "Link Direto"
                              : platform.charAt(0).toUpperCase() +
                                platform.slice(1)}
                          </Badge>
                          <span className="text-sm font-medium text-gray-900">
                            {data.count} compartilhamento
                            {data.count !== 1 ? "s" : ""}
                          </span>
                        </div>
                        <div className="flex gap-6 mt-2 text-xs text-gray-600">
                          <span>
                            <Eye className="w-3 h-3 inline mr-1" />
                            {data.views} visualizações
                          </span>
                          <span>
                            <Mouse className="w-3 h-3 inline mr-1" />
                            {data.clicks} cliques
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-gray-900">
                          {data.count}
                        </div>
                      </div>
                    </div>
                  )
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Lista de Compartilhamentos */}
        {shares && shares.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Compartilhamentos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">
                        Plataforma
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">
                        Visualizações
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">
                        Cliques
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">
                        Status
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">
                        Data
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {shares.map((share: any) => (
                      <tr key={share.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <Badge variant="outline" className="capitalize">
                            {share.platform === "qrcode"
                              ? "QR Code"
                              : share.platform === "direct_link"
                              ? "Link Direto"
                              : share.platform.charAt(0).toUpperCase() +
                                share.platform.slice(1)}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-gray-900 font-medium">
                          {share.viewCount || 0}
                        </td>
                        <td className="py-3 px-4 text-gray-900 font-medium">
                          {share.clickCount || 0}
                        </td>
                        <td className="py-3 px-4">
                          {share.driverAccepted ? (
                            <Badge className="bg-green-100 text-green-800">
                              Aceito
                            </Badge>
                          ) : (
                            <Badge className="bg-yellow-100 text-yellow-800">
                              Pendente
                            </Badge>
                          )}
                        </td>
                        <td className="py-3 px-4 text-gray-600 text-xs">
                          {new Date(share.createdAt).toLocaleDateString(
                            "pt-BR"
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Empty State */}
        {shares && shares.length === 0 && (
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <Share2 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 font-medium">
                  Nenhum compartilhamento ainda
                </p>
                <p className="text-gray-400 text-sm mt-1">
                  Comece a compartilhar rotas para ver as estatísticas aqui
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
