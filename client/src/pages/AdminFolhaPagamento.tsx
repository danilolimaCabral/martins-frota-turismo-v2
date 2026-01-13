import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import {
  DollarSign,
  Plus,
  FileText,
  Calendar,
  CheckCircle,
  Clock,
  ArrowLeft,
  Eye,
  Lock,
  CreditCard,
  FileDown,
} from "lucide-react";
import { HoleriteViewer } from "@/components/HoleriteViewer";
import { useHoleritePDF } from "@/hooks/useHoleritePDF";

export default function AdminFolhaPagamento() {
  const [, setLocation] = useLocation();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedFolhaId, setSelectedFolhaId] = useState<number | null>(null);
  const [anoFilter, setAnoFilter] = useState(new Date().getFullYear().toString());
  const [mesFilter, setMesFilter] = useState((new Date().getMonth() + 1).toString());
  const [holeriteViewerOpen, setHoleriteViewerOpen] = useState(false);
  const [holeriteData, setHoleriteData] = useState<any>(null);
  const { gerarPDFComDados } = useHoleritePDF();

  // Form state
  const [formData, setFormData] = useState({
    mesReferencia: new Date().getMonth() + 1,
    anoReferencia: new Date().getFullYear(),
    dataPagamento: "",
    observacoes: "",
  });

  // Queries
  const { data: folhas, refetch } = trpc.folha.list.useQuery({
    ano: anoFilter ? parseInt(anoFilter) : undefined,
    mes: mesFilter ? parseInt(mesFilter) : undefined,
  });

  // Mutations
  const createMutation = trpc.folha.create.useMutation({
    onSuccess: () => {
      toast.success("Folha de pagamento criada com sucesso!");
      setIsDialogOpen(false);
      resetForm();
      refetch();
    },
    onError: (error) => {
      toast.error(`Erro: ${error.message}`);
    },
  });

  const fecharMutation = trpc.folha.fecharFolha.useMutation({
    onSuccess: (data) => {
      toast.success(`Folha fechada! Total líquido: R$ ${parseFloat(data.totalLiquido).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`);
      refetch();
    },
    onError: (error) => {
      toast.error(`Erro: ${error.message}`);
    },
  });

  const pagarMutation = trpc.folha.registrarPagamento.useMutation({
    onSuccess: () => {
      toast.success("Pagamento registrado com sucesso!");
      refetch();
    },
    onError: (error) => {
      toast.error(`Erro: ${error.message}`);
    },
  });

  const resetForm = () => {
    setFormData({
      mesReferencia: new Date().getMonth() + 1,
      anoReferencia: new Date().getFullYear(),
      dataPagamento: "",
      observacoes: "",
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  const handleFechar = (id: number) => {
    if (confirm("Tem certeza que deseja fechar esta folha de pagamento? Esta ação não pode ser desfeita.")) {
      fecharMutation.mutate({ id });
    }
  };

  const handlePagar = (id: number) => {
    const dataPagamento = prompt("Digite a data de pagamento (AAAA-MM-DD):");
    if (dataPagamento) {
      pagarMutation.mutate({ id, dataPagamento });
    }
  };

  const handleVisualizarHolerite = (folha: any) => {
    // Dados de exemplo para o holerite
    const holeriteData = {
      funcionario: {
        nome: "João Silva Santos",
        cpf: "123.456.789-01",
        matricula: "00001",
        cargo: "Gerente Administrativo",
        departamento: "Administrativo",
        dataAdmissao: "2020-01-15",
        salarioBase: 4500,
      },
      empresa: {
        cnpj: "12.345.678/0001-90",
        razaoSocial: "MARTINS TURISMO LTDA",
        endereco: "Rua das Flores, 123",
        cidade: "CURITIBA",
        uf: "PR",
      },
      periodo: {
        mes: folha.mesReferencia,
        ano: folha.anoReferencia,
      },
      proventos: {
        salarioBase: parseFloat(folha.totalBruto || "0"),
        horasExtras50: 0,
        horasExtras100: 0,
        adicionais: 0,
        comissoes: 0,
        bonus: 0,
        ferias: 0,
        decimoTerceiro: 0,
        total: parseFloat(folha.totalBruto || "0"),
      },
      descontos: {
        inss: parseFloat(folha.totalDescontos || "0") * 0.6,
        irrf: parseFloat(folha.totalDescontos || "0") * 0.2,
        valeTransporte: parseFloat(folha.totalDescontos || "0") * 0.2,
        valeAlimentacao: 0,
        contribuicaoSindical: 0,
        pensaoAlimenticia: 0,
        adiantamento: 0,
        total: parseFloat(folha.totalDescontos || "0"),
      },
      obrigacoesEmpresa: {
        fgts: parseFloat(folha.totalBruto || "0") * 0.08,
        contribuicaoPatronal: parseFloat(folha.totalBruto || "0") * 0.2,
        sat: parseFloat(folha.totalBruto || "0") * 0.02,
        total: parseFloat(folha.totalBruto || "0") * 0.3,
      },
      liquido: parseFloat(folha.totalLiquido || "0"),
      baseINSS: parseFloat(folha.totalBruto || "0"),
      baseIRRF: parseFloat(folha.totalBruto || "0") - (parseFloat(folha.totalDescontos || "0") * 0.6),
    };
    setHoleriteData(holeriteData);
    setHoleriteViewerOpen(true);
  };

  const handleDownloadPDF = () => {
    if (holeriteData) {
      const htmlContent = `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h1>${holeriteData.empresa.razaoSocial}</h1>
          <p>CNPJ: ${holeriteData.empresa.cnpj}</p>
          <h2>HOLERITE - ${holeriteData.periodo.mes}/${holeriteData.periodo.ano}</h2>
          <p>Funcionário: ${holeriteData.funcionario.nome}</p>
          <p>CPF: ${holeriteData.funcionario.cpf}</p>
          <h3>PROVENTOS</h3>
          <p>Salário Base: R$ ${holeriteData.proventos.salarioBase.toFixed(2)}</p>
          <p>Total: R$ ${holeriteData.proventos.total.toFixed(2)}</p>
          <h3>DESCONTOS</h3>
          <p>Total: R$ ${holeriteData.descontos.total.toFixed(2)}</p>
          <h3>LÍQUIDO A RECEBER</h3>
          <p style="font-size: 24px; font-weight: bold; color: green;">R$ ${holeriteData.liquido.toFixed(2)}</p>
        </div>
      `;
      gerarPDFComDados(
        htmlContent,
        holeriteData.funcionario.nome,
        holeriteData.periodo.mes,
        holeriteData.periodo.ano
      );
      toast.success("PDF gerado com sucesso!");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "aberta":
        return "bg-blue-100 text-blue-800 border-blue-300";
      case "processando":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "fechada":
        return "bg-orange-100 text-orange-800 border-orange-300";
      case "paga":
        return "bg-green-100 text-green-800 border-green-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "aberta":
        return <Clock className="h-4 w-4" />;
      case "processando":
        return <FileText className="h-4 w-4" />;
      case "fechada":
        return <Lock className="h-4 w-4" />;
      case "paga":
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getMesNome = (mes: number) => {
    const meses = [
      "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
      "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
    ];
    return meses[mes - 1];
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setLocation("/admin")}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                  <DollarSign className="h-6 w-6 text-green-600" />
                  Folha de Pagamento
                </h1>
                <p className="text-sm text-slate-600">
                  Gestão de folhas de pagamento mensais
                </p>
              </div>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  onClick={resetForm}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Folha
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Nova Folha de Pagamento</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="mesReferencia">Mês de Referência *</Label>
                    <Select
                      value={formData.mesReferencia.toString()}
                      onValueChange={(value) =>
                        setFormData({ ...formData, mesReferencia: parseInt(value) })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 12 }, (_, i) => i + 1).map((mes) => (
                          <SelectItem key={mes} value={mes.toString()}>
                            {getMesNome(mes)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="anoReferencia">Ano de Referência *</Label>
                    <Input
                      id="anoReferencia"
                      type="number"
                      value={formData.anoReferencia}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          anoReferencia: parseInt(e.target.value),
                        })
                      }
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="dataPagamento">Data de Pagamento Prevista</Label>
                    <Input
                      id="dataPagamento"
                      type="date"
                      value={formData.dataPagamento}
                      onChange={(e) =>
                        setFormData({ ...formData, dataPagamento: e.target.value })
                      }
                    />
                  </div>

                  <div className="flex justify-end gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsDialogOpen(false)}
                    >
                      Cancelar
                    </Button>
                    <Button
                      type="submit"
                      className="bg-green-600 hover:bg-green-700"
                      disabled={createMutation.isPending}
                    >
                      Criar Folha
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="mesFilter">Mês</Label>
                <Select value={mesFilter} onValueChange={setMesFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 12 }, (_, i) => i + 1).map((mes) => (
                      <SelectItem key={mes} value={mes.toString()}>
                        {getMesNome(mes)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="anoFilter">Ano</Label>
                <Select value={anoFilter} onValueChange={setAnoFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map((ano) => (
                      <SelectItem key={ano} value={ano.toString()}>
                        {ano}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Folhas List */}
        <div className="space-y-4">
          {folhas?.map((folha: any) => (
            <Card key={folha.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-xl mb-2">
                      {getMesNome(folha.mesReferencia)} / {folha.anoReferencia}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-3 py-1 text-sm font-semibold rounded border flex items-center gap-1 ${getStatusColor(
                          folha.status
                        )}`}
                      >
                        {getStatusIcon(folha.status)}
                        {folha.status}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-slate-600">Total Líquido</div>
                    <div className="text-2xl font-bold text-green-600">
                      R$ {parseFloat(folha.totalLiquido || "0").toLocaleString("pt-BR", {
                        minimumFractionDigits: 2,
                      })}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <div className="text-sm text-slate-600">Total Bruto</div>
                    <div className="text-lg font-semibold text-slate-900">
                      R$ {parseFloat(folha.totalBruto || "0").toLocaleString("pt-BR", {
                        minimumFractionDigits: 2,
                      })}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-slate-600">Total Descontos</div>
                    <div className="text-lg font-semibold text-red-600">
                      R$ {parseFloat(folha.totalDescontos || "0").toLocaleString("pt-BR", {
                        minimumFractionDigits: 2,
                      })}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-slate-600">Data de Pagamento</div>
                    <div className="text-lg font-semibold text-slate-900">
                      {folha.dataPagamento
                        ? new Date(folha.dataPagamento).toLocaleDateString("pt-BR")
                        : "Não definida"}
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleVisualizarHolerite(folha)}
                    className="flex-1 bg-blue-50 text-blue-700 hover:bg-blue-100"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Visualizar Holerite
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDownloadPDF}
                    className="bg-purple-50 text-purple-700 hover:bg-purple-100"
                    disabled={!holeriteData}
                  >
                    <FileDown className="h-4 w-4 mr-2" />
                    PDF
                  </Button>

                  {folha.status === "aberta" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleFechar(folha.id)}
                      className="bg-orange-50 text-orange-700 hover:bg-orange-100"
                    >
                      <Lock className="h-4 w-4 mr-2" />
                      Fechar Folha
                    </Button>
                  )}

                  {folha.status === "fechada" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePagar(folha.id)}
                      className="bg-green-50 text-green-700 hover:bg-green-100"
                    >
                      <CreditCard className="h-4 w-4 mr-2" />
                      Registrar Pagamento
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {folhas?.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <FileText className="h-12 w-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-600">Nenhuma folha de pagamento encontrada</p>
              <p className="text-sm text-slate-500 mt-2">
                Crie uma nova folha para começar
              </p>
            </CardContent>
          </Card>
        )}
      </main>

      {/* Holerite Viewer Modal */}
      {holeriteData && (
        <HoleriteViewer
          data={holeriteData}
          open={holeriteViewerOpen}
          onOpenChange={setHoleriteViewerOpen}
        />
      )}
    </div>
  );
}
