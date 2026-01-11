import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { MapPin, Calendar, Users, Car, DollarSign, Mail, Phone, Building, Trash2, Eye } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";

type Orcamento = {
  id: number;
  origem: string;
  destino: string;
  dataIda: string;
  passageiros: number;
  tipoVeiculo: string | null;
  custoEstimado: string | null;
  nome: string | null;
  email: string | null;
  telefone: string | null;
  empresa: string | null;
  mensagem: string | null;
  status: "pendente" | "em_analise" | "aprovado" | "recusado";
  createdAt: string;
};

export default function AdminOrcamentos() {
  const { user, loading } = useAuth();
  const [statusFilter, setStatusFilter] = useState<string>("todos");
  const [selectedOrcamento, setSelectedOrcamento] = useState<Orcamento | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Queries
  const { data: orcamentos, isLoading, refetch } = trpc.orcamento.list.useQuery({
    status: statusFilter === "todos" ? undefined : statusFilter as any,
    limit: 100,
    offset: 0,
  });

  // Mutations
  const updateStatus = trpc.orcamento.updateStatus.useMutation({
    onSuccess: () => {
      toast.success("Status atualizado com sucesso!");
      refetch();
    },
    onError: () => {
      toast.error("Erro ao atualizar status");
    },
  });

  const deleteOrcamento = trpc.orcamento.delete.useMutation({
    onSuccess: () => {
      toast.success("Orçamento deletado com sucesso!");
      refetch();
      setDialogOpen(false);
    },
    onError: () => {
      toast.error("Erro ao deletar orçamento");
    },
  });

  // Auth check
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    window.location.href = getLoginUrl();
    return null;
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline", label: string }> = {
      pendente: { variant: "outline", label: "Pendente" },
      em_analise: { variant: "secondary", label: "Em Análise" },
      aprovado: { variant: "default", label: "Aprovado" },
      recusado: { variant: "destructive", label: "Recusado" },
    };
    const config = variants[status] || variants.pendente;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const handleViewDetails = (orcamento: Orcamento) => {
    setSelectedOrcamento(orcamento);
    setDialogOpen(true);
  };

  const handleStatusChange = async (id: number, newStatus: string) => {
    await updateStatus.mutateAsync({
      id,
      status: newStatus as any,
    });
  };

  const handleDelete = async (id: number) => {
    if (confirm("Tem certeza que deseja deletar este orçamento?")) {
      await deleteOrcamento.mutateAsync({ id });
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-3xl font-bold">Gerenciar Orçamentos</CardTitle>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filtrar por status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="pendente">Pendente</SelectItem>
                <SelectItem value="em_analise">Em Análise</SelectItem>
                <SelectItem value="aprovado">Aprovado</SelectItem>
                <SelectItem value="recusado">Recusado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Carregando orçamentos...</p>
            </div>
          ) : !orcamentos || orcamentos.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">Nenhum orçamento encontrado</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Origem → Destino</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Passageiros</TableHead>
                    <TableHead>Contato</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orcamentos.map((orc: Orcamento) => (
                    <TableRow key={orc.id}>
                      <TableCell className="font-medium">#{orc.id}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">
                            {orc.origem} → {orc.destino}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">
                            {new Date(orc.dataIda).toLocaleDateString("pt-BR")}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{orc.passageiros}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {orc.nome && <div className="font-medium">{orc.nome}</div>}
                          {orc.email && <div className="text-muted-foreground">{orc.email}</div>}
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(orc.status)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleViewDetails(orc)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Select
                            value={orc.status}
                            onValueChange={(value) => handleStatusChange(orc.id, value)}
                          >
                            <SelectTrigger className="w-32 h-8">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pendente">Pendente</SelectItem>
                              <SelectItem value="em_analise">Em Análise</SelectItem>
                              <SelectItem value="aprovado">Aprovado</SelectItem>
                              <SelectItem value="recusado">Recusado</SelectItem>
                            </SelectContent>
                          </Select>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDelete(orc.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog de Detalhes */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalhes do Orçamento #{selectedOrcamento?.id}</DialogTitle>
            <DialogDescription>
              Informações completas da solicitação
            </DialogDescription>
          </DialogHeader>
          {selectedOrcamento && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Rota
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    <strong>Origem:</strong> {selectedOrcamento.origem}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    <strong>Destino:</strong> {selectedOrcamento.destino}
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Data e Passageiros
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    <strong>Data:</strong>{" "}
                    {new Date(selectedOrcamento.dataIda).toLocaleDateString("pt-BR")}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    <strong>Passageiros:</strong> {selectedOrcamento.passageiros}
                  </p>
                </div>
              </div>

              {selectedOrcamento.tipoVeiculo && (
                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Car className="h-4 w-4" />
                    Veículo Sugerido
                  </h4>
                  <p className="text-sm text-muted-foreground">{selectedOrcamento.tipoVeiculo}</p>
                </div>
              )}

              {selectedOrcamento.custoEstimado && (
                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Custo Estimado
                  </h4>
                  <p className="text-sm text-muted-foreground">{selectedOrcamento.custoEstimado}</p>
                </div>
              )}

              <div className="border-t pt-4">
                <h4 className="font-semibold mb-2">Informações de Contato</h4>
                <div className="space-y-2">
                  {selectedOrcamento.nome && (
                    <p className="text-sm">
                      <strong>Nome:</strong> {selectedOrcamento.nome}
                    </p>
                  )}
                  {selectedOrcamento.email && (
                    <p className="text-sm flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      {selectedOrcamento.email}
                    </p>
                  )}
                  {selectedOrcamento.telefone && (
                    <p className="text-sm flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      {selectedOrcamento.telefone}
                    </p>
                  )}
                  {selectedOrcamento.empresa && (
                    <p className="text-sm flex items-center gap-2">
                      <Building className="h-4 w-4" />
                      {selectedOrcamento.empresa}
                    </p>
                  )}
                </div>
              </div>

              {selectedOrcamento.mensagem && (
                <div className="border-t pt-4">
                  <h4 className="font-semibold mb-2">Mensagem</h4>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {selectedOrcamento.mensagem}
                  </p>
                </div>
              )}

              <div className="border-t pt-4">
                <p className="text-xs text-muted-foreground">
                  Criado em: {new Date(selectedOrcamento.createdAt).toLocaleString("pt-BR")}
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
