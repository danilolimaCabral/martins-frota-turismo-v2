import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TrendingUp, TrendingDown, DollarSign, Plus, Check } from "lucide-react";

export default function AdminFinanceiro() {
  const { data: stats } = trpc.financeiro.getStats.useQuery();
  const { data: contasPagar, refetch: refetchPagar } = trpc.financeiro.contasPagar.list.useQuery();
  const { data: contasReceber, refetch: refetchReceber } = trpc.financeiro.contasReceber.list.useQuery();
  const { data: saldoCaixa } = trpc.financeiro.caixa.getSaldo.useQuery();

  const [showFormPagar, setShowFormPagar] = useState(false);
  const [showFormReceber, setShowFormReceber] = useState(false);

  const createPagarMutation = trpc.financeiro.contasPagar.create.useMutation({
    onSuccess: () => {
      alert("Conta a pagar criada!");
      setShowFormPagar(false);
      refetchPagar();
    },
  });

  const createReceberMutation = trpc.financeiro.contasReceber.create.useMutation({
    onSuccess: () => {
      alert("Conta a receber criada!");
      setShowFormReceber(false);
      refetchReceber();
    },
  });

  const pagarMutation = trpc.financeiro.contasPagar.pagar.useMutation({
    onSuccess: () => {
      alert("Pagamento registrado!");
      refetchPagar();
    },
  });

  const receberMutation = trpc.financeiro.contasReceber.receber.useMutation({
    onSuccess: () => {
      alert("Recebimento registrado!");
      refetchReceber();
    },
  });

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">Financeiro</h1>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">A Pagar</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">R$ {stats?.totalPagar || "0.00"}</div>
            <p className="text-xs text-muted-foreground">{stats?.contasPagarPendentes || 0} pendentes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">A Receber</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">R$ {stats?.totalReceber || "0.00"}</div>
            <p className="text-xs text-muted-foreground">{stats?.contasReceberPendentes || 0} pendentes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Saldo Caixa</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">R$ {saldoCaixa?.saldo || "0.00"}</div>
            <p className="text-xs text-muted-foreground">Saldo atual do caixa</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Saldo Projetado</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {stats?.saldoProjetado || "0.00"}</div>
            <p className="text-xs text-muted-foreground">Receber - Pagar</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="pagar">
        <TabsList>
          <TabsTrigger value="pagar">Contas a Pagar</TabsTrigger>
          <TabsTrigger value="receber">Contas a Receber</TabsTrigger>
        </TabsList>

        {/* CONTAS A PAGAR */}
        <TabsContent value="pagar" className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => setShowFormPagar(!showFormPagar)}>
              <Plus className="mr-2 h-4 w-4" />
              Nova Conta
            </Button>
          </div>

          {showFormPagar && (
            <Card>
              <CardHeader>
                <CardTitle>Nova Conta a Pagar</CardTitle>
              </CardHeader>
              <CardContent>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const fd = new FormData(e.currentTarget);
                    createPagarMutation.mutate({
                      descricao: fd.get("descricao") as string,
                      fornecedor: fd.get("fornecedor") as string,
                      valorOriginal: parseFloat(fd.get("valorOriginal") as string),
                      dataEmissao: fd.get("dataEmissao") as string,
                      dataVencimento: fd.get("dataVencimento") as string,
                    });
                  }}
                  className="grid grid-cols-2 gap-4"
                >
                  <div className="col-span-2">
                    <Label>Descrição *</Label>
                    <Input name="descricao" required />
                  </div>
                  <div>
                    <Label>Fornecedor</Label>
                    <Input name="fornecedor" />
                  </div>
                  <div>
                    <Label>Valor (R$) *</Label>
                    <Input type="number" step="0.01" name="valorOriginal" required />
                  </div>
                  <div>
                    <Label>Data Emissão *</Label>
                    <Input type="date" name="dataEmissao" required />
                  </div>
                  <div>
                    <Label>Data Vencimento *</Label>
                    <Input type="date" name="dataVencimento" required />
                  </div>
                  <div className="col-span-2 flex gap-2">
                    <Button type="submit">Salvar</Button>
                    <Button type="button" variant="outline" onClick={() => setShowFormPagar(false)}>
                      Cancelar
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Lista ({contasPagar?.length || 0})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {contasPagar?.map((conta) => (
                  <div key={conta.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-semibold">{conta.descricao}</p>
                      <p className="text-sm text-muted-foreground">{conta.fornecedor}</p>
                      <p className="text-xs text-muted-foreground">
                        Vence: {conta.dataVencimento ? new Date(conta.dataVencimento).toLocaleDateString("pt-BR") : "N/A"}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-red-600">
                        R$ {parseFloat(String(conta.valorTotal)).toFixed(2)}
                      </div>
                      {conta.status === "pendente" && (
                        <Button
                          size="sm"
                          onClick={() => {
                            const valor = prompt("Valor pago:");
                            if (valor) {
                              pagarMutation.mutate({
                                id: conta.id,
                                dataPagamento: new Date().toISOString().split("T")[0],
                                valorPago: parseFloat(valor),
                              });
                            }
                          }}
                        >
                          <Check className="mr-1 h-3 w-3" />
                          Pagar
                        </Button>
                      )}
                      {conta.status === "paga" && (
                        <span className="text-xs text-green-600">✓ Paga</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* CONTAS A RECEBER */}
        <TabsContent value="receber" className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => setShowFormReceber(!showFormReceber)}>
              <Plus className="mr-2 h-4 w-4" />
              Nova Conta
            </Button>
          </div>

          {showFormReceber && (
            <Card>
              <CardHeader>
                <CardTitle>Nova Conta a Receber</CardTitle>
              </CardHeader>
              <CardContent>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const fd = new FormData(e.currentTarget);
                    createReceberMutation.mutate({
                      descricao: fd.get("descricao") as string,
                      cliente: fd.get("cliente") as string,
                      valorOriginal: parseFloat(fd.get("valorOriginal") as string),
                      dataEmissao: fd.get("dataEmissao") as string,
                      dataVencimento: fd.get("dataVencimento") as string,
                    });
                  }}
                  className="grid grid-cols-2 gap-4"
                >
                  <div className="col-span-2">
                    <Label>Descrição *</Label>
                    <Input name="descricao" required />
                  </div>
                  <div>
                    <Label>Cliente</Label>
                    <Input name="cliente" />
                  </div>
                  <div>
                    <Label>Valor (R$) *</Label>
                    <Input type="number" step="0.01" name="valorOriginal" required />
                  </div>
                  <div>
                    <Label>Data Emissão *</Label>
                    <Input type="date" name="dataEmissao" required />
                  </div>
                  <div>
                    <Label>Data Vencimento *</Label>
                    <Input type="date" name="dataVencimento" required />
                  </div>
                  <div className="col-span-2 flex gap-2">
                    <Button type="submit">Salvar</Button>
                    <Button type="button" variant="outline" onClick={() => setShowFormReceber(false)}>
                      Cancelar
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Lista ({contasReceber?.length || 0})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {contasReceber?.map((conta) => (
                  <div key={conta.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-semibold">{conta.descricao}</p>
                      <p className="text-sm text-muted-foreground">{conta.cliente}</p>
                      <p className="text-xs text-muted-foreground">
                        Vence: {conta.dataVencimento ? new Date(conta.dataVencimento).toLocaleDateString("pt-BR") : "N/A"}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-green-600">
                        R$ {parseFloat(String(conta.valorTotal)).toFixed(2)}
                      </div>
                      {conta.status === "pendente" && (
                        <Button
                          size="sm"
                          onClick={() => {
                            const valor = prompt("Valor recebido:");
                            if (valor) {
                              receberMutation.mutate({
                                id: conta.id,
                                dataRecebimento: new Date().toISOString().split("T")[0],
                                valorRecebido: parseFloat(valor),
                              });
                            }
                          }}
                        >
                          <Check className="mr-1 h-3 w-3" />
                          Receber
                        </Button>
                      )}
                      {conta.status === "recebida" && (
                        <span className="text-xs text-green-600">✓ Recebida</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
