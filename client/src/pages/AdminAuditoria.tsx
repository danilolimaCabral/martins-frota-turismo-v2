import { useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "../lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Shield,
  Search,
  Filter,
  Calendar,
  User,
  FileText,
  TrendingUp,
  Activity,
  Eye,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function AdminAuditoria() {
  const [, setLocation] = useLocation();
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    username: "",
    action: "todas",
    module: "todos",
    entity: "",
    startDate: "",
    endDate: "",
  });

  const [appliedFilters, setAppliedFilters] = useState(filters);

  const { data: logsData, isLoading } = trpc.audit.list.useQuery({
    page,
    limit: 20,
    username: appliedFilters.username || undefined,
    action: appliedFilters.action as any || undefined,
    module: appliedFilters.module || undefined,
    entity: appliedFilters.entity || undefined,
    startDate: appliedFilters.startDate || undefined,
    endDate: appliedFilters.endDate || undefined,
  });

  const { data: stats } = trpc.audit.getStats.useQuery({
    startDate: appliedFilters.startDate || undefined,
    endDate: appliedFilters.endDate || undefined,
  });

  const handleApplyFilters = () => {
    setAppliedFilters(filters);
    setPage(1);
  };

  const handleClearFilters = () => {
    const emptyFilters = {
      username: "",
      action: "",
      module: "",
      entity: "",
      startDate: "",
      endDate: "",
    };
    setFilters(emptyFilters);
    setAppliedFilters(emptyFilters);
    setPage(1);
  };

  const getActionBadge = (action: string) => {
    const variants: Record<string, { variant: any; label: string }> = {
      create: { variant: "default", label: "Criar" },
      update: { variant: "secondary", label: "Atualizar" },
      delete: { variant: "destructive", label: "Deletar" },
      login: { variant: "default", label: "Login" },
      logout: { variant: "secondary", label: "Logout" },
      approve: { variant: "default", label: "Aprovar" },
      reject: { variant: "destructive", label: "Rejeitar" },
    };

    const config = variants[action] || { variant: "secondary", label: action };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getModuleBadge = (module: string) => {
    const colors: Record<string, string> = {
      rh: "bg-blue-100 text-blue-800",
      financeiro: "bg-green-100 text-green-800",
      frota: "bg-purple-100 text-purple-800",
      agenda: "bg-yellow-100 text-yellow-800",
      roteirizacao: "bg-pink-100 text-pink-800",
      relatorios: "bg-gray-100 text-gray-800",
      auth: "bg-orange-100 text-orange-800",
    };

    return (
      <Badge className={colors[module] || "bg-gray-100 text-gray-800"}>
        {module.toUpperCase()}
      </Badge>
    );
  };

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Botão Voltar */}
      <div className="mb-6 flex items-center gap-2">
        <button
          onClick={() => window.history.back()}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-orange-600 hover:bg-orange-700 text-white transition-colors font-medium"
        >
          <ArrowLeft size={20} />
          <span>Voltar</span>
        </button>
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <Shield className="w-8 h-8 text-blue-600" />
          Logs de Auditoria
        </h1>
        <p className="text-gray-600 mt-2">
          Rastreamento completo de todas as ações realizadas no sistema
        </p>
      </div>

      {/* Estatísticas */}
      {stats && (
        <div className="grid md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Total de Logs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                <span className="text-2xl font-bold">{stats.totalLogs}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Ações Mais Comuns</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                {stats.logsByAction.slice(0, 2).map((item) => (
                  <div key={item.action} className="flex justify-between text-sm">
                    <span className="capitalize">{item.action}</span>
                    <span className="font-semibold">{item.count}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Módulos Ativos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-green-600" />
                <span className="text-2xl font-bold">{stats.logsByModule.length}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Usuário Mais Ativo</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <User className="w-5 h-5 text-purple-600" />
                <span className="text-sm font-semibold truncate">
                  {stats.topUsers[0]?.username || "N/A"}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filtros */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filtros de Pesquisa
          </CardTitle>
          <CardDescription>Refine sua busca pelos logs de auditoria</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="username">Usuário</Label>
              <Input
                id="username"
                placeholder="Nome do usuário"
                value={filters.username}
                onChange={(e) => setFilters({ ...filters, username: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="action">Ação</Label>
              <Select value={filters.action} onValueChange={(value) => setFilters({ ...filters, action: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas as ações" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas</SelectItem>
                  <SelectItem value="create">Criar</SelectItem>
                  <SelectItem value="update">Atualizar</SelectItem>
                  <SelectItem value="delete">Deletar</SelectItem>
                  <SelectItem value="login">Login</SelectItem>
                  <SelectItem value="logout">Logout</SelectItem>
                  <SelectItem value="approve">Aprovar</SelectItem>
                  <SelectItem value="reject">Rejeitar</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="module">Módulo</Label>
              <Select value={filters.module} onValueChange={(value) => setFilters({ ...filters, module: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os módulos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="rh">RH</SelectItem>
                  <SelectItem value="financeiro">Financeiro</SelectItem>
                  <SelectItem value="frota">Frota</SelectItem>
                  <SelectItem value="agenda">Agenda</SelectItem>
                  <SelectItem value="roteirizacao">Roteirização</SelectItem>
                  <SelectItem value="relatorios">Relatórios</SelectItem>
                  <SelectItem value="auth">Autenticação</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="entity">Entidade</Label>
              <Input
                id="entity"
                placeholder="Ex: funcionarios, veiculos"
                value={filters.entity}
                onChange={(e) => setFilters({ ...filters, entity: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="startDate">Data Início</Label>
              <Input
                id="startDate"
                type="date"
                value={filters.startDate}
                onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="endDate">Data Fim</Label>
              <Input
                id="endDate"
                type="date"
                value={filters.endDate}
                onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
              />
            </div>
          </div>

          <div className="flex gap-3 mt-4">
            <Button onClick={handleApplyFilters} className="bg-blue-600 hover:bg-blue-700">
              <Search className="w-4 h-4 mr-2" />
              Aplicar Filtros
            </Button>
            <Button variant="outline" onClick={handleClearFilters}>
              Limpar Filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Logs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Registros de Auditoria
          </CardTitle>
          <CardDescription>
            {logsData?.pagination.total || 0} registros encontrados
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Carregando logs...</p>
            </div>
          ) : logsData?.logs.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">Nenhum log encontrado com os filtros aplicados</p>
            </div>
          ) : (
            <>
              <div className="space-y-3">
                {logsData?.logs.map((log) => (
                  <div
                    key={log.id}
                    className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {getActionBadge(log.action)}
                          {getModuleBadge(log.module)}
                          <Badge variant="outline" className="text-xs">
                            {log.entity}
                          </Badge>
                        </div>

                        <p className="text-sm text-gray-900 font-medium mb-1">
                          {log.description}
                        </p>

                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            {log.username}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {format(new Date(log.createdAt), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                          </span>
                          {log.ipAddress && (
                            <span className="flex items-center gap-1">
                              IP: {log.ipAddress}
                            </span>
                          )}
                        </div>
                      </div>

                      <Button variant="ghost" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Paginação */}
              {logsData && logsData.pagination.totalPages > 1 && (
                <div className="flex items-center justify-between mt-6">
                  <p className="text-sm text-gray-600">
                    Página {logsData.pagination.page} de {logsData.pagination.totalPages}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page === 1}
                      onClick={() => setPage(page - 1)}
                    >
                      <ChevronLeft className="w-4 h-4 mr-1" />
                      Anterior
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page === logsData.pagination.totalPages}
                      onClick={() => setPage(page + 1)}
                    >
                      Próxima
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
