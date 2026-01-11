import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Palmtree, Plus, Calendar, CheckCircle, XCircle, Clock, Users } from "lucide-react";

const STATUS_COLORS: Record<string, string> = {
  pendente: "bg-yellow-500",
  aprovada: "bg-green-500",
  rejeitada: "bg-red-500",
  em_andamento: "bg-blue-500",
  concluida: "bg-gray-500",
};

const STATUS_LABELS: Record<string, string> = {
  pendente: "Pendente",
  aprovada: "Aprovada",
  rejeitada: "Rejeitada",
  em_andamento: "Em Andamento",
  concluida: "Concluída",
};

export default function AdminFerias() {
  const [modalNovaSolicitacao, setModalNovaSolicitacao] = useState(false);
  const [statusFiltro, setStatusFiltro] = useState<string>("");

  const { data: funcionarios } = trpc.funcionario.list.useQuery({});
  const { data: solicitacoes, refetch } = trpc.ferias.list.useQuery({
    status: (statusFiltro === "pendente" ? "solicitado" : statusFiltro === "em_andamento" ? "em_gozo" : statusFiltro === "concluida" ? "concluido" : statusFiltro) as any || undefined,
  });
  // Stats calculados localmente
  const stats = {
    totalSolicitacoes: solicitacoes?.length || 0,
    pendentes: solicitacoes?.filter((s: any) => s.status === "solicitado").length || 0,
    aprovadas: solicitacoes?.filter((s: any) => s.status === "aprovado").length || 0,
    emAndamento: solicitacoes?.filter((s: any) => s.status === "em_gozo").length || 0,
  };

  const criarMutation = trpc.ferias.solicitar.useMutation({
    onSuccess: () => {
      refetch();
      setModalNovaSolicitacao(false);
      alert("Solicitação de férias criada com sucesso!");
    },
    onError: (error: any) => {
      alert(`Erro: ${error.message}`);
    },
  });

  const aprovarMutation = trpc.ferias.aprovar.useMutation({
    onSuccess: () => {
      refetch();
      alert("Férias aprovadas!");
    },
  });

  const handleNovaSolicitacao = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const dataInicio = formData.get("dataInicio") as string;
    const dataFim = formData.get("dataFim") as string;
    const anoInicio = new Date(dataInicio).getFullYear();
    
    criarMutation.mutate({
      funcionarioId: parseInt(formData.get("funcionarioId") as string),
      periodoAquisitivoInicio: `${anoInicio - 1}-01-01`,
      periodoAquisitivoFim: `${anoInicio - 1}-12-31`,
      dataInicio,
      dataFim,
      abonoPecuniario: false,
      diasAbono: 0,
      adiantamento13: false,
      observacoes: formData.get("observacoes") as string,
    });
  };

  const calcularDias = (inicio: string | Date, fim: string | Date) => {
    const diff = new Date(fim).getTime() - new Date(inicio).getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1;
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Palmtree className="h-8 w-8" />
            Gestão de Férias
          </h1>
          <p className="text-muted-foreground">Gerencie solicitações e aprovações de férias</p>
        </div>
        <Dialog open={modalNovaSolicitacao} onOpenChange={setModalNovaSolicitacao}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Nova Solicitação
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nova Solicitação de Férias</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleNovaSolicitacao} className="space-y-4">
              <div>
                <Label>Funcionário *</Label>
                <Select name="funcionarioId" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o funcionário" />
                  </SelectTrigger>
                  <SelectContent>
                    {funcionarios?.map((f: any) => (
                      <SelectItem key={f.id} value={f.id.toString()}>
                        {f.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Data Início *</Label>
                  <Input name="dataInicio" type="date" required />
                </div>
                <div>
                  <Label>Data Fim *</Label>
                  <Input name="dataFim" type="date" required />
                </div>
              </div>
              <div>
                <Label>Observações</Label>
                <Textarea name="observacoes" placeholder="Observações opcionais..." />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setModalNovaSolicitacao(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={criarMutation.isPending}>
                  {criarMutation.isPending ? "Criando..." : "Criar Solicitação"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold">{stats?.totalSolicitacoes || 0}</div>
            <p className="text-xs text-muted-foreground">Total de Solicitações</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-yellow-600">{stats?.pendentes || 0}</div>
            <p className="text-xs text-muted-foreground">Pendentes</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-green-600">{stats?.aprovadas || 0}</div>
            <p className="text-xs text-muted-foreground">Aprovadas</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-blue-600">{stats?.emAndamento || 0}</div>
            <p className="text-xs text-muted-foreground">Em Andamento</p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex gap-4">
            <div className="w-48">
              <Label>Status</Label>
              <Select value={statusFiltro} onValueChange={setStatusFiltro}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos</SelectItem>
                  <SelectItem value="pendente">Pendente</SelectItem>
                  <SelectItem value="aprovada">Aprovada</SelectItem>
                  <SelectItem value="rejeitada">Rejeitada</SelectItem>
                  <SelectItem value="em_andamento">Em Andamento</SelectItem>
                  <SelectItem value="concluida">Concluída</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabela de Solicitações */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Solicitações de Férias
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!solicitacoes || solicitacoes.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Palmtree className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhuma solicitação encontrada</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Funcionário</TableHead>
                  <TableHead>Período</TableHead>
                  <TableHead>Dias</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Observações</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {solicitacoes.map((solicitacao: any) => (
                  <TableRow key={solicitacao.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        {solicitacao.funcionarioNome || "-"}
                      </div>
                    </TableCell>
                    <TableCell>
                      {new Date(solicitacao.dataInicio).toLocaleDateString("pt-BR")} - {new Date(solicitacao.dataFim).toLocaleDateString("pt-BR")}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {calcularDias(solicitacao.dataInicio, solicitacao.dataFim)} dias
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={STATUS_COLORS[solicitacao.status]}>
                        {STATUS_LABELS[solicitacao.status]}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {solicitacao.observacoes || "-"}
                    </TableCell>
                    <TableCell>
                      {solicitacao.status === "solicitado" && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="default"
                            className="gap-1 bg-green-600 hover:bg-green-700"
                            onClick={() => aprovarMutation.mutate({ id: solicitacao.id, aprovado: true })}
                            disabled={aprovarMutation.isPending}
                          >
                            <CheckCircle className="h-3 w-3" />
                            Aprovar
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            className="gap-1"
                            onClick={() => {
                              const motivo = prompt("Motivo da rejeição:");
                              if (motivo) {
                                aprovarMutation.mutate({ id: solicitacao.id, aprovado: false, motivoReprovacao: motivo });
                              }
                            }}
                            disabled={aprovarMutation.isPending}
                          >
                            <XCircle className="h-3 w-3" />
                            Rejeitar
                          </Button>
                        </div>
                      )}
                      {solicitacao.status !== "solicitado" && (
                        <span className="text-muted-foreground text-sm">-</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
