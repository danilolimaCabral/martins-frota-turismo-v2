import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

import { Plus, DollarSign, TrendingUp, TrendingDown } from "lucide-react";

export default function AdminLancamentosRH() {

  const [showForm, setShowForm] = useState(false);
  const [filtroTipo, setFiltroTipo] = useState<"credito" | "debito" | "todos">("todos");
  const [filtroMes, setFiltroMes] = useState<number>(new Date().getMonth() + 1);
  const [filtroAno, setFiltroAno] = useState<number>(new Date().getFullYear());

  const { data: lancamentos, refetch } = trpc.lancamentosRH.list.useQuery({
    tipo: filtroTipo,
    mes: filtroMes,
    ano: filtroAno,
  });

  const { data: funcionarios } = trpc.funcionario.list.useQuery();

  const createMutation = trpc.lancamentosRH.create.useMutation({
    onSuccess: () => {
      alert("Lançamento criado com sucesso!");
      setShowForm(false);
      refetch();
    },
    onError: (error) => {
      alert(`Erro ao criar lançamento: ${error.message}`);
    },
  });

  const deleteMutation = trpc.lancamentosRH.delete.useMutation({
    onSuccess: () => {
      alert("Lançamento excluído!");
      refetch();
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    createMutation.mutate({
      funcionarioId: parseInt(formData.get("funcionarioId") as string),
      tipo: formData.get("tipo") as "credito" | "debito",
      categoria: formData.get("categoria") as any,
      descricao: formData.get("descricao") as string,
      valor: parseFloat(formData.get("valor") as string),
      mesReferencia: parseInt(formData.get("mesReferencia") as string),
      anoReferencia: parseInt(formData.get("anoReferencia") as string),
      dataLancamento: formData.get("dataLancamento") as string,
      observacoes: formData.get("observacoes") as string || undefined,
    });
  };

  // Calcular totais
  const totalCreditos = lancamentos?.filter(l => l.tipo === "credito")
    .reduce((acc, l) => acc + parseFloat(String(l.valor)), 0) || 0;
  
  const totalDebitos = lancamentos?.filter(l => l.tipo === "debito")
    .reduce((acc, l) => acc + parseFloat(String(l.valor)), 0) || 0;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Lançamentos RH</h1>
          <p className="text-muted-foreground">Créditos e débitos da folha de pagamento</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Lançamento
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Créditos</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              R$ {totalCreditos.toFixed(2)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Débitos</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              R$ {totalDebitos.toFixed(2)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Saldo Líquido</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              R$ {(totalCreditos - totalDebitos).toFixed(2)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Formulário */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Novo Lançamento</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="funcionarioId">Funcionário *</Label>
                  <Select name="funcionarioId" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {funcionarios?.map((f) => (
                        <SelectItem key={f.id} value={f.id.toString()}>
                          {f.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="tipo">Tipo *</Label>
                  <Select name="tipo" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="credito">Crédito</SelectItem>
                      <SelectItem value="debito">Débito</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="categoria">Categoria *</Label>
                  <Select name="categoria" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="salario">Salário</SelectItem>
                      <SelectItem value="hora_extra_50">Hora Extra 50%</SelectItem>
                      <SelectItem value="hora_extra_100">Hora Extra 100%</SelectItem>
                      <SelectItem value="adicional_noturno">Adicional Noturno</SelectItem>
                      <SelectItem value="bonus">Bônus</SelectItem>
                      <SelectItem value="comissao">Comissão</SelectItem>
                      <SelectItem value="adiantamento_salarial">Adiantamento</SelectItem>
                      <SelectItem value="inss">INSS</SelectItem>
                      <SelectItem value="irrf">IRRF</SelectItem>
                      <SelectItem value="vale_transporte_desc">Vale Transporte</SelectItem>
                      <SelectItem value="outros_creditos">Outros Créditos</SelectItem>
                      <SelectItem value="outros_debitos">Outros Débitos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="valor">Valor (R$) *</Label>
                  <Input
                    type="number"
                    step="0.01"
                    name="valor"
                    placeholder="0.00"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="mesReferencia">Mês Referência *</Label>
                  <Input
                    type="number"
                    min="1"
                    max="12"
                    name="mesReferencia"
                    defaultValue={new Date().getMonth() + 1}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="anoReferencia">Ano Referência *</Label>
                  <Input
                    type="number"
                    min="2020"
                    name="anoReferencia"
                    defaultValue={new Date().getFullYear()}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="dataLancamento">Data Lançamento *</Label>
                  <Input
                    type="date"
                    name="dataLancamento"
                    defaultValue={new Date().toISOString().split("T")[0]}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="descricao">Descrição *</Label>
                <Input name="descricao" placeholder="Descrição do lançamento" required />
              </div>

              <div>
                <Label htmlFor="observacoes">Observações</Label>
                <Textarea name="observacoes" placeholder="Observações adicionais" />
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending ? "Salvando..." : "Salvar"}
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Tipo</Label>
              <Select value={filtroTipo} onValueChange={(v: any) => setFiltroTipo(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="credito">Créditos</SelectItem>
                  <SelectItem value="debito">Débitos</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Mês</Label>
              <Input
                type="number"
                min="1"
                max="12"
                value={filtroMes}
                onChange={(e) => setFiltroMes(parseInt(e.target.value))}
              />
            </div>

            <div>
              <Label>Ano</Label>
              <Input
                type="number"
                value={filtroAno}
                onChange={(e) => setFiltroAno(parseInt(e.target.value))}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Lançamentos */}
      <Card>
        <CardHeader>
          <CardTitle>Lançamentos ({lancamentos?.length || 0})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {lancamentos?.map((lanc) => (
              <div
                key={lanc.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    {lanc.tipo === "credito" ? (
                      <TrendingUp className="h-4 w-4 text-green-600" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-600" />
                    )}
                    <span className="font-semibold">{lanc.funcionarioNome}</span>
                    <span className="text-sm text-muted-foreground">
                      • {lanc.categoria.replace(/_/g, " ")}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{lanc.descricao}</p>
                  <p className="text-xs text-muted-foreground">
                    {lanc.mesReferencia}/{lanc.anoReferencia}
                  </p>
                </div>
                <div className="text-right">
                  <div
                    className={`text-lg font-bold ${
                      lanc.tipo === "credito" ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {lanc.tipo === "credito" ? "+" : "-"} R$ {parseFloat(String(lanc.valor)).toFixed(2)}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteMutation.mutate({ id: lanc.id })}
                  >
                    Excluir
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
