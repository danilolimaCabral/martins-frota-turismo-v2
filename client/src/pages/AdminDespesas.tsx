import { useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "../lib/trpc";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { Label } from "../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Textarea } from "../components/ui/textarea";
import { CheckCircle, X, FileText, Calendar, DollarSign, User, Filter, Image as ImageIcon , ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { useLocalAuth } from "@/hooks/useLocalAuth";

export default function AdminDespesas() {
  const [, setLocation] = useLocation();
  const { user } = useLocalAuth();
  const [selectedExpense, setSelectedExpense] = useState<any>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("pendente");

  const { data: expenses, refetch } = trpc.expense.list.useQuery();

  const approveMutation = trpc.expense.approve.useMutation({
    onSuccess: () => {
      toast.success("Despesa aprovada com sucesso!");
      refetch();
      setIsViewDialogOpen(false);
      setSelectedExpense(null);
    },
    onError: (error) => {
      toast.error(`Erro ao aprovar despesa: ${error.message}`);
    },
  });

  const rejectMutation = trpc.expense.reject.useMutation({
    onSuccess: () => {
      toast.success("Despesa recusada!");
      refetch();
      setIsRejectDialogOpen(false);
      setIsViewDialogOpen(false);
      setSelectedExpense(null);
      setRejectReason("");
    },
    onError: (error) => {
      toast.error(`Erro ao recusar despesa: ${error.message}`);
    },
  });

  const handleApprove = (expenseId: number) => {
    if (!user) return;
    approveMutation.mutate({
      id: expenseId,
      approvedBy: user.id,
    });
  };

  const handleReject = () => {
    if (!user || !selectedExpense || !rejectReason.trim()) {
      toast.error("Motivo da rejeição é obrigatório!");
      return;
    }
    rejectMutation.mutate({
      id: selectedExpense.id,
      approvedBy: user.id,
      notes: rejectReason,
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pendente":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "aprovada":
        return "bg-green-100 text-green-800 border-green-300";
      case "recusada":
        return "bg-red-100 text-red-800 border-red-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "pendente":
        return "Pendente";
      case "aprovada":
        return "Aprovada";
      case "recusada":
        return "Recusada";
      default:
        return status;
    }
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      combustivel: "Combustível",
      manutencao: "Manutenção",
      pedagio: "Pedágio",
      alimentacao: "Alimentação",
      hospedagem: "Hospedagem",
      estacionamento: "Estacionamento",
      multa: "Multa",
      outros: "Outros",
    };
    return labels[category] || category;
  };

  const filteredExpenses = expenses?.filter((expense) => {
    if (statusFilter === "all") return true;
    return expense.status === statusFilter;
  });

  const pendingCount = expenses?.filter((e) => e.status === "pendente").length || 0;
  const approvedCount = expenses?.filter((e) => e.status === "aprovada").length || 0;
  const rejectedCount = expenses?.filter((e) => e.status === "recusada").length || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      {/* Botão Voltar */}
      <div className="mb-6 flex items-center gap-2">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
        >
          <ArrowLeft size={20} />
          <span>Voltar</span>
        </button>
      </div>

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Aprovação de Despesas</h1>
          <p className="text-slate-600">Gerencie e aprove despesas lançadas pelos funcionários</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <Card className="p-4 bg-yellow-50 border-yellow-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-yellow-700 font-medium">Pendentes</p>
                <p className="text-3xl font-bold text-yellow-900">{pendingCount}</p>
              </div>
              <FileText className="h-10 w-10 text-yellow-600" />
            </div>
          </Card>

          <Card className="p-4 bg-green-50 border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-700 font-medium">Aprovadas</p>
                <p className="text-3xl font-bold text-green-900">{approvedCount}</p>
              </div>
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
          </Card>

          <Card className="p-4 bg-red-50 border-red-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-700 font-medium">Recusadas</p>
                <p className="text-3xl font-bold text-red-900">{rejectedCount}</p>
              </div>
              <X className="h-10 w-10 text-red-600" />
            </div>
          </Card>
        </div>

        {/* Filtros */}
        <Card className="p-4 mb-6">
          <div className="flex items-center gap-4">
            <Filter className="h-5 w-5 text-slate-600" />
            <Label>Filtrar por status:</Label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pendente">Pendentes</SelectItem>
                <SelectItem value="aprovada">Aprovadas</SelectItem>
                <SelectItem value="recusada">Recusadas</SelectItem>
                <SelectItem value="all">Todas</SelectItem>
              </SelectContent>
            </Select>
            <span className="text-sm text-slate-600 ml-auto">
              {filteredExpenses?.length || 0} despesa(s) encontrada(s)
            </span>
          </div>
        </Card>

        {/* Lista de Despesas */}
        <div className="grid gap-4">
          {filteredExpenses?.map((expense) => (
            <Card key={expense.id} className={`p-6 border-2 ${getStatusColor(expense.status)}`}>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-2xl font-bold text-slate-900">#{expense.id}</span>
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(expense.status)}`}>
                      {getStatusLabel(expense.status)}
                    </span>
                    <span className="px-3 py-1 rounded-full text-sm font-semibold bg-blue-100 text-blue-800">
                      {getCategoryLabel(expense.category)}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-slate-600" />
                      <span className="text-sm">
                        <strong>Descrição:</strong> {expense.description}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-slate-600" />
                      <span className="text-sm">
                        <strong>Valor:</strong> R$ {parseFloat(expense.amount).toFixed(2)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-slate-600" />
                      <span className="text-sm">
                        <strong>Data:</strong> {new Date(expense.date).toLocaleDateString("pt-BR")}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-slate-600" />
                      <span className="text-sm">
                        <strong>Funcionário ID:</strong> {expense.userId}
                      </span>
                    </div>
                  </div>

                  {expense.notes && (
                    <p className="text-sm text-slate-600 italic mb-2">"{expense.notes}"</p>
                  )}

                  {expense.receipt && (
                    <div className="flex items-center gap-2 text-sm text-blue-600">
                      <ImageIcon className="h-4 w-4" />
                      <span>Comprovante anexado</span>
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setSelectedExpense(expense);
                      setIsViewDialogOpen(true);
                    }}
                  >
                    Ver Detalhes
                  </Button>

                  {expense.status === "pendente" && (
                    <>
                      <Button
                        size="sm"
                        className="bg-green-600 hover:bg-green-700 text-white"
                        onClick={() => handleApprove(expense.id)}
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Aprovar
                      </Button>

                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600 hover:bg-red-50 border-red-300"
                        onClick={() => {
                          setSelectedExpense(expense);
                          setIsRejectDialogOpen(true);
                        }}
                      >
                        <X className="h-4 w-4 mr-1" />
                        Recusar
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </Card>
          ))}

          {(!filteredExpenses || filteredExpenses.length === 0) && (
            <Card className="p-12 text-center">
              <p className="text-slate-500 text-lg">Nenhuma despesa encontrada</p>
              <p className="text-slate-400 text-sm mt-2">
                {statusFilter === "pendente"
                  ? "Não há despesas pendentes de aprovação"
                  : "Tente ajustar os filtros"}
              </p>
            </Card>
          )}
        </div>

        {/* Dialog de Visualização */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Detalhes da Despesa #{selectedExpense?.id}</DialogTitle>
            </DialogHeader>
            {selectedExpense && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Status</Label>
                    <p className={`px-3 py-2 rounded-lg text-sm font-semibold inline-block ${getStatusColor(selectedExpense.status)}`}>
                      {getStatusLabel(selectedExpense.status)}
                    </p>
                  </div>

                  <div>
                    <Label>Categoria</Label>
                    <p className="text-sm font-medium mt-1">{getCategoryLabel(selectedExpense.category)}</p>
                  </div>

                  <div>
                    <Label>Valor</Label>
                    <p className="text-2xl font-bold text-green-600 mt-1">
                      R$ {parseFloat(selectedExpense.amount).toFixed(2)}
                    </p>
                  </div>

                  <div>
                    <Label>Data</Label>
                    <p className="text-sm font-medium mt-1">
                      {new Date(selectedExpense.date).toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                </div>

                <div>
                  <Label>Descrição</Label>
                  <p className="text-sm mt-1">{selectedExpense.description}</p>
                </div>

                {selectedExpense.notes && (
                  <div>
                    <Label>Observações</Label>
                    <p className="text-sm mt-1 italic">{selectedExpense.notes}</p>
                  </div>
                )}

                {selectedExpense.receipt && (
                  <div>
                    <Label>Comprovante</Label>
                    <div className="mt-2 p-4 bg-slate-100 rounded-lg">
                      <p className="text-sm text-blue-600">{selectedExpense.receipt}</p>
                      <p className="text-xs text-slate-500 mt-1">Clique para visualizar</p>
                    </div>
                  </div>
                )}

                {selectedExpense.status === "pendente" && (
                  <div className="flex gap-2 pt-4">
                    <Button
                      className="flex-1 bg-green-600 hover:bg-green-700"
                      onClick={() => handleApprove(selectedExpense.id)}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Aprovar Despesa
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1 text-red-600 hover:bg-red-50 border-red-300"
                      onClick={() => setIsRejectDialogOpen(true)}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Recusar Despesa
                    </Button>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Dialog de Rejeição */}
        <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Recusar Despesa</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="rejectReason">Motivo da Rejeição *</Label>
                <Textarea
                  id="rejectReason"
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Explique o motivo da rejeição..."
                  rows={4}
                  className="mt-2"
                />
              </div>

              <div className="flex gap-2">
                <Button
                  className="flex-1 bg-red-600 hover:bg-red-700"
                  onClick={handleReject}
                  disabled={!rejectReason.trim()}
                >
                  Confirmar Rejeição
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setIsRejectDialogOpen(false);
                    setRejectReason("");
                  }}
                >
                  Cancelar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
