import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FileText, Plus, Edit, Trash2, CheckCircle, Download, Send, DollarSign, Calendar , ArrowLeft } from "lucide-react";
import { toast } from "sonner";

interface Servico {
  id: number;
  descricao: string;
  quantidade: number;
  valor_unitario: number;
  subtotal: number;
}

interface Orcamento {
  id: number;
  numero: string;
  cliente: string;
  empresa: string;
  data_criacao: string;
  data_validade: string;
  status: "rascunho" | "enviado" | "aprovado" | "contrato";
  servicos: Servico[];
  subtotal: number;
  desconto: number;
  total: number;
  observacoes: string;
}

interface Contrato {
  id: number;
  numero: string;
  orcamento_id: number;
  cliente: string;
  empresa: string;
  data_inicio: string;
  data_fim: string;
  status: "ativo" | "finalizado" | "cancelado";
  valor_total: number;
  valor_pago: number;
  parcelas: Parcela[];
}

interface Parcela {
  id: number;
  numero: number;
  valor: number;
  data_vencimento: string;
  status: "pendente" | "pago" | "atrasado";
  data_pagamento?: string;
}

const EMPRESAS_EXEMPLO = [
  { id: 1, nome: "Martins Viagens e Turismo", logo: "🚌" },
  { id: 2, nome: "Transporte XYZ", logo: "🚐" },
];

const SERVICOS_PADRAO = [
  { id: 1, descricao: "Fretamento Executivo", valor_unitario: 150 },
  { id: 2, descricao: "Ônibus Turístico", valor_unitario: 200 },
  { id: 3, descricao: "Van Executiva", valor_unitario: 120 },
  { id: 4, descricao: "Motorista Profissional", valor_unitario: 80 },
];

export default function AdminOrcamentoContrato() {
  const [, setLocation] = useLocation();
  const [orcamentos, setOrcamentos] = useState<Orcamento[]>([
    {
      id: 1,
      numero: "ORC-2024-001",
      cliente: "Empresa ABC",
      empresa: "Martins Viagens e Turismo",
      data_criacao: "2024-01-10",
      data_validade: "2024-02-10",
      status: "aprovado",
      servicos: [
        { id: 1, descricao: "Fretamento Executivo", quantidade: 5, valor_unitario: 150, subtotal: 750 },
        { id: 2, descricao: "Motorista Profissional", quantidade: 5, valor_unitario: 80, subtotal: 400 },
      ],
      subtotal: 1150,
      desconto: 50,
      total: 1100,
      observacoes: "Válido para janeiro de 2024",
    },
  ]);

  const [contratos, setContratos] = useState<Contrato[]>([]);
  const [orcamentoSelecionado, setOrcamentoSelecionado] = useState<Orcamento | null>(null);
  const [contratoSelecionado, setContratoSelecionado] = useState<Contrato | null>(null);
  const [modalNovoOrcamento, setModalNovoOrcamento] = useState(false);
  const [modalEditarOrcamento, setModalEditarOrcamento] = useState(false);
  const [modalEfetivar, setModalEfetivar] = useState(false);
  const [formOrcamento, setFormOrcamento] = useState({
    cliente: "",
    empresa: EMPRESAS_EXEMPLO[0].nome,
    servicos: [] as Servico[],
    desconto: 0,
    observacoes: "",
  });

  const handleNovoOrcamento = () => {
    setFormOrcamento({
      cliente: "",
      empresa: EMPRESAS_EXEMPLO[0].nome,
      servicos: [],
      desconto: 0,
      observacoes: "",
    });
    setModalNovoOrcamento(true);
  };

  const handleSalvarOrcamento = () => {
    if (!formOrcamento.cliente || formOrcamento.servicos.length === 0) {
      toast.error("Preencha cliente e adicione serviços");
      return;
    }

    const subtotal = formOrcamento.servicos.reduce((acc, s) => acc + s.subtotal, 0);
    const total = subtotal - formOrcamento.desconto;

    const novoOrcamento: Orcamento = {
      id: Math.max(...orcamentos.map(o => o.id), 0) + 1,
      numero: `ORC-2024-${String(orcamentos.length + 1).padStart(3, "0")}`,
      cliente: formOrcamento.cliente,
      empresa: formOrcamento.empresa,
      data_criacao: new Date().toISOString().split("T")[0],
      data_validade: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      status: "rascunho",
      servicos: formOrcamento.servicos,
      subtotal,
      desconto: formOrcamento.desconto,
      total,
      observacoes: formOrcamento.observacoes,
    };

    setOrcamentos([...orcamentos, novoOrcamento]);
    setModalNovoOrcamento(false);
    toast.success("Orçamento criado com sucesso!");
  };

  const handleEfetivarOrcamento = (orcamento: Orcamento) => {
    if (orcamento.status !== "aprovado") {
      toast.error("Apenas orçamentos aprovados podem ser efetivados");
      return;
    }

    const novoContrato: Contrato = {
      id: Math.max(...contratos.map(c => c.id), 0) + 1,
      numero: `CTR-2024-${String(contratos.length + 1).padStart(3, "0")}`,
      orcamento_id: orcamento.id,
      cliente: orcamento.cliente,
      empresa: orcamento.empresa,
      data_inicio: new Date().toISOString().split("T")[0],
      data_fim: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      status: "ativo",
      valor_total: orcamento.total,
      valor_pago: 0,
      parcelas: gerarParcelas(orcamento.total),
    };

    setContratos([...contratos, novoContrato]);
    setOrcamentos(
      orcamentos.map(o =>
        o.id === orcamento.id ? { ...o, status: "contrato" } : o
      )
    );
    setModalEfetivar(false);
    toast.success("Contrato gerado com sucesso!");
  };

  const gerarParcelas = (total: number, numParcelas: number = 3): Parcela[] => {
    const valorParcela = total / numParcelas;
    const parcelas: Parcela[] = [];

    for (let i = 0; i < numParcelas; i++) {
      const dataVencimento = new Date();
      dataVencimento.setMonth(dataVencimento.getMonth() + (i + 1));

      parcelas.push({
        id: i + 1,
        numero: i + 1,
        valor: valorParcela,
        data_vencimento: dataVencimento.toISOString().split("T")[0],
        status: "pendente",
      });
    }

    return parcelas;
  };

  const handleAdicionarServico = () => {
    const novoServico: Servico = {
      id: Math.max(...formOrcamento.servicos.map(s => s.id), 0) + 1,
      descricao: "",
      quantidade: 1,
      valor_unitario: 0,
      subtotal: 0,
    };
    setFormOrcamento({
      ...formOrcamento,
      servicos: [...formOrcamento.servicos, novoServico],
    });
  };

  const handleRemoverServico = (id: number) => {
    setFormOrcamento({
      ...formOrcamento,
      servicos: formOrcamento.servicos.filter(s => s.id !== id),
    });
  };

  const handleAtualizarServico = (id: number, campo: string, valor: any) => {
    const servicos = formOrcamento.servicos.map(s => {
      if (s.id === id) {
        const atualizado = { ...s, [campo]: valor };
        if (campo === "quantidade" || campo === "valor_unitario") {
          atualizado.subtotal = atualizado.quantidade * atualizado.valor_unitario;
        }
        return atualizado;
      }
      return s;
    });
    setFormOrcamento({ ...formOrcamento, servicos });
  };

  const handleRegistrarPagamento = (contrato: Contrato, parcelaId: number) => {
    const novoContrato = {
      ...contrato,
      parcelas: contrato.parcelas.map(p =>
        p.id === parcelaId
          ? { ...p, status: "pago", data_pagamento: new Date().toISOString().split("T")[0] }
          : p
      ),
    };

    const valorPago = novoContrato.parcelas
      .filter(p => p.status === "pago")
      .reduce((acc, p) => acc + p.valor, 0);

    novoContrato.valor_pago = valorPago;

    setContratos(contratos.map(c => (c.id === contrato.id ? novoContrato : c)));
    toast.success("Pagamento registrado!");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-8">
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

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-gradient-to-br from-green-500 to-green-600 rounded-lg">
            <FileText className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900">Orçamento e Contrato</h1>
        </div>
        <p className="text-slate-600">Gerencie orçamentos e transforme em contratos</p>
      </div>

      <Tabs defaultValue="orcamentos" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="orcamentos">Orçamentos</TabsTrigger>
          <TabsTrigger value="contratos">Contratos</TabsTrigger>
        </TabsList>

        {/* Orçamentos */}
        <TabsContent value="orcamentos" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-slate-900">Orçamentos</h2>
            <Dialog open={modalNovoOrcamento} onOpenChange={setModalNovoOrcamento}>
              <DialogTrigger asChild>
                <Button onClick={handleNovoOrcamento} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Novo Orçamento
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-96 overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Novo Orçamento</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Cliente *</Label>
                    <Input
                      value={formOrcamento.cliente}
                      onChange={(e) =>
                        setFormOrcamento({ ...formOrcamento, cliente: e.target.value })
                      }
                      placeholder="Nome do cliente"
                    />
                  </div>

                  <div>
                    <Label>Empresa *</Label>
                    <Select
                      value={formOrcamento.empresa}
                      onValueChange={(value) =>
                        setFormOrcamento({ ...formOrcamento, empresa: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {EMPRESAS_EXEMPLO.map((emp) => (
                          <SelectItem key={emp.id} value={emp.nome}>
                            {emp.logo} {emp.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Serviços *</Label>
                    <div className="space-y-2 max-h-40 overflow-y-auto border rounded-lg p-2">
                      {formOrcamento.servicos.map((servico) => (
                        <div key={servico.id} className="flex gap-2 items-end">
                          <Input
                            placeholder="Descrição"
                            value={servico.descricao}
                            onChange={(e) =>
                              handleAtualizarServico(servico.id, "descricao", e.target.value)
                            }
                            className="flex-1"
                          />
                          <Input
                            type="number"
                            placeholder="Qtd"
                            value={servico.quantidade}
                            onChange={(e) =>
                              handleAtualizarServico(servico.id, "quantidade", parseFloat(e.target.value))
                            }
                            className="w-16"
                          />
                          <Input
                            type="number"
                            placeholder="Valor"
                            value={servico.valor_unitario}
                            onChange={(e) =>
                              handleAtualizarServico(servico.id, "valor_unitario", parseFloat(e.target.value))
                            }
                            className="w-20"
                          />
                          <span className="text-sm font-semibold">R$ {servico.subtotal.toFixed(2)}</span>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleRemoverServico(servico.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleAdicionarServico}
                      className="w-full mt-2"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Adicionar Serviço
                    </Button>
                  </div>

                  <div>
                    <Label>Desconto (R$)</Label>
                    <Input
                      type="number"
                      value={formOrcamento.desconto}
                      onChange={(e) =>
                        setFormOrcamento({
                          ...formOrcamento,
                          desconto: parseFloat(e.target.value) || 0,
                        })
                      }
                    />
                  </div>

                  <div>
                    <Label>Observações</Label>
                    <Textarea
                      value={formOrcamento.observacoes}
                      onChange={(e) =>
                        setFormOrcamento({ ...formOrcamento, observacoes: e.target.value })
                      }
                      placeholder="Observações adicionais..."
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button onClick={handleSalvarOrcamento} className="flex-1">
                      Salvar Orçamento
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setModalNovoOrcamento(false)}
                      className="flex-1"
                    >
                      Cancelar
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Tabela de Orçamentos */}
          <Card>
            <CardContent className="pt-6">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b">
                    <tr>
                      <th className="text-left py-2 px-4 font-semibold">Número</th>
                      <th className="text-left py-2 px-4 font-semibold">Cliente</th>
                      <th className="text-left py-2 px-4 font-semibold">Data</th>
                      <th className="text-right py-2 px-4 font-semibold">Total</th>
                      <th className="text-center py-2 px-4 font-semibold">Status</th>
                      <th className="text-center py-2 px-4 font-semibold">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orcamentos.map((orcamento) => (
                      <tr key={orcamento.id} className="border-b hover:bg-slate-50">
                        <td className="py-3 px-4 font-semibold text-slate-900">
                          {orcamento.numero}
                        </td>
                        <td className="py-3 px-4 text-slate-700">{orcamento.cliente}</td>
                        <td className="py-3 px-4 text-slate-700">{orcamento.data_criacao}</td>
                        <td className="py-3 px-4 text-right font-semibold text-slate-900">
                          R$ {orcamento.total.toFixed(2)}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <Badge
                            className={
                              orcamento.status === "aprovado"
                                ? "bg-green-100 text-green-800"
                                : orcamento.status === "contrato"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-yellow-100 text-yellow-800"
                            }
                          >
                            {orcamento.status}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex gap-2 justify-center">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setOrcamentoSelecionado(orcamento)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            {orcamento.status === "aprovado" && (
                              <Dialog open={modalEfetivar} onOpenChange={setModalEfetivar}>
                                <DialogTrigger asChild>
                                  <Button
                                    size="sm"
                                    className="gap-2 bg-green-600 hover:bg-green-700"
                                    onClick={() => setOrcamentoSelecionado(orcamento)}
                                  >
                                    <CheckCircle className="h-4 w-4" />
                                    Efetivar
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Efetivar Orçamento em Contrato?</DialogTitle>
                                  </DialogHeader>
                                  <div className="space-y-4">
                                    <p className="text-slate-700">
                                      Tem certeza que deseja transformar este orçamento em contrato?
                                    </p>
                                    <div className="bg-slate-50 p-4 rounded-lg space-y-2">
                                      <p>
                                        <strong>Cliente:</strong> {orcamento.cliente}
                                      </p>
                                      <p>
                                        <strong>Valor Total:</strong> R$ {orcamento.total.toFixed(2)}
                                      </p>
                                      <p>
                                        <strong>Parcelas:</strong> 3x de R${" "}
                                        {(orcamento.total / 3).toFixed(2)}
                                      </p>
                                    </div>
                                    <div className="flex gap-2">
                                      <Button
                                        onClick={() => handleEfetivarOrcamento(orcamento)}
                                        className="flex-1 bg-green-600 hover:bg-green-700"
                                      >
                                        Confirmar
                                      </Button>
                                      <Button
                                        variant="outline"
                                        onClick={() => setModalEfetivar(false)}
                                        className="flex-1"
                                      >
                                        Cancelar
                                      </Button>
                                    </div>
                                  </div>
                                </DialogContent>
                              </Dialog>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Contratos */}
        <TabsContent value="contratos" className="space-y-4">
          <h2 className="text-2xl font-bold text-slate-900">Contratos</h2>

          {contratos.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center text-slate-500">
                <p>Nenhum contrato criado ainda. Efetivar um orçamento para criar um contrato.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {contratos.map((contrato) => (
                <Card key={contrato.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{contrato.numero}</CardTitle>
                        <p className="text-sm text-slate-600 mt-1">{contrato.cliente}</p>
                      </div>
                      <Badge
                        className={
                          contrato.status === "ativo"
                            ? "bg-green-100 text-green-800"
                            : "bg-slate-100 text-slate-800"
                        }
                      >
                        {contrato.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <p className="text-xs text-slate-600">Valor Total</p>
                        <p className="text-lg font-semibold">R$ {contrato.valor_total.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-600">Valor Pago</p>
                        <p className="text-lg font-semibold text-green-700">
                          R$ {contrato.valor_pago.toFixed(2)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-600">Saldo</p>
                        <p className="text-lg font-semibold text-red-700">
                          R$ {(contrato.valor_total - contrato.valor_pago).toFixed(2)}
                        </p>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold text-slate-900 mb-2">Parcelas</h4>
                      <div className="space-y-2">
                        {contrato.parcelas.map((parcela) => (
                          <div
                            key={parcela.id}
                            className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                          >
                            <div className="flex-1">
                              <p className="font-medium">
                                Parcela {parcela.numero} - R$ {parcela.valor.toFixed(2)}
                              </p>
                              <p className="text-xs text-slate-600">
                                Vencimento: {parcela.data_vencimento}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge
                                className={
                                  parcela.status === "pago"
                                    ? "bg-green-100 text-green-800"
                                    : parcela.status === "atrasado"
                                    ? "bg-red-100 text-red-800"
                                    : "bg-yellow-100 text-yellow-800"
                                }
                              >
                                {parcela.status}
                              </Badge>
                              {parcela.status === "pendente" && (
                                <Button
                                  size="sm"
                                  onClick={() =>
                                    handleRegistrarPagamento(contrato, parcela.id)
                                  }
                                  className="gap-2"
                                >
                                  <DollarSign className="h-4 w-4" />
                                  Pagar
                                </Button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
