import { useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FileText, Download, DollarSign, Users, Car, TrendingUp, Calendar , ArrowLeft } from "lucide-react";

export default function AdminRelatorios() {
  const [, setLocation] = useLocation();
  const [periodoFinanceiro, setPeriodoFinanceiro] = useState({
    dataInicio: new Date(new Date().getFullYear(), 0, 1).toISOString().split("T")[0],
    dataFim: new Date().toISOString().split("T")[0],
  });
  const [periodoFolha, setPeriodoFolha] = useState({
    mes: new Date().getMonth() + 1,
    ano: new Date().getFullYear(),
  });
  const [periodoCustos, setPeriodoCustos] = useState({
    dataInicio: new Date(new Date().getFullYear(), 0, 1).toISOString().split("T")[0],
    dataFim: new Date().toISOString().split("T")[0],
  });

  const { data: relatorioFinanceiro, isLoading: loadingFinanceiro } = trpc.relatorios.relatorioFinanceiro.useQuery(periodoFinanceiro);
  const { data: relatorioFolha, isLoading: loadingFolha } = trpc.relatorios.relatorioFolhaPagamento.useQuery(periodoFolha);
  const { data: relatorioCustos, isLoading: loadingCustos } = trpc.relatorios.relatorioCustosOperacionais.useQuery(periodoCustos);
  const { data: relatorioFuncionarios } = trpc.relatorios.relatorioFuncionarios.useQuery();
  const { data: relatorioVeiculos } = trpc.relatorios.relatorioVeiculos.useQuery();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
  };

  const gerarPDF = (tipo: string, dados: any) => {
    // Criar conteúdo HTML para impressão/PDF
    const content = document.createElement("div");
    content.innerHTML = `
      <html>
        <head>
          <title>Relatório ${tipo}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1 { color: #333; border-bottom: 2px solid #f97316; padding-bottom: 10px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f97316; color: white; }
            .resumo { background: #f5f5f5; padding: 15px; margin: 20px 0; border-radius: 8px; }
            .valor { font-weight: bold; color: #f97316; }
          </style>
        </head>
        <body>
          <h1>Relatório ${tipo} - Martins Viagens e Turismo</h1>
          <p>Gerado em: ${new Date().toLocaleString("pt-BR")}</p>
          ${JSON.stringify(dados, null, 2).replace(/\n/g, "<br>").replace(/ /g, "&nbsp;")}
        </body>
      </html>
    `;
    
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(content.innerHTML);
      printWindow.document.close();
      printWindow.print();
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
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

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <FileText className="h-8 w-8" />
            Relatórios
          </h1>
          <p className="text-muted-foreground">Gere relatórios financeiros, de RH e operacionais</p>
        </div>
      </div>

      <Tabs defaultValue="financeiro" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="financeiro" className="gap-2">
            <DollarSign className="h-4 w-4" />
            Financeiro
          </TabsTrigger>
          <TabsTrigger value="folha" className="gap-2">
            <Users className="h-4 w-4" />
            Folha
          </TabsTrigger>
          <TabsTrigger value="custos" className="gap-2">
            <TrendingUp className="h-4 w-4" />
            Custos
          </TabsTrigger>
          <TabsTrigger value="funcionarios" className="gap-2">
            <Users className="h-4 w-4" />
            Funcionários
          </TabsTrigger>
          <TabsTrigger value="veiculos" className="gap-2">
            <Car className="h-4 w-4" />
            Veículos
          </TabsTrigger>
        </TabsList>

        {/* Relatório Financeiro */}
        <TabsContent value="financeiro">
          <Card>
            <CardHeader>
              <CardTitle>Relatório Financeiro Geral</CardTitle>
              <CardDescription>Visão geral de receitas, despesas e fluxo de caixa</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4 items-end">
                <div>
                  <Label>Data Início</Label>
                  <Input 
                    type="date" 
                    value={periodoFinanceiro.dataInicio}
                    onChange={(e) => setPeriodoFinanceiro(p => ({ ...p, dataInicio: e.target.value }))}
                  />
                </div>
                <div>
                  <Label>Data Fim</Label>
                  <Input 
                    type="date" 
                    value={periodoFinanceiro.dataFim}
                    onChange={(e) => setPeriodoFinanceiro(p => ({ ...p, dataFim: e.target.value }))}
                  />
                </div>
                <Button 
                  variant="outline" 
                  className="gap-2"
                  onClick={() => gerarPDF("Financeiro", relatorioFinanceiro)}
                  disabled={!relatorioFinanceiro}
                >
                  <Download className="h-4 w-4" />
                  Exportar PDF
                </Button>
              </div>

              {loadingFinanceiro ? (
                <p className="text-center py-8 text-muted-foreground">Carregando...</p>
              ) : relatorioFinanceiro ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card>
                      <CardContent className="pt-4">
                        <div className="text-2xl font-bold text-green-600">
                          {formatCurrency(relatorioFinanceiro.resumo.totalReceitas)}
                        </div>
                        <p className="text-xs text-muted-foreground">Total Receitas</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-4">
                        <div className="text-2xl font-bold text-red-600">
                          {formatCurrency(relatorioFinanceiro.resumo.totalDespesas)}
                        </div>
                        <p className="text-xs text-muted-foreground">Total Despesas</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-4">
                        <div className="text-2xl font-bold text-blue-600">
                          {formatCurrency(relatorioFinanceiro.resumo.saldoCaixa)}
                        </div>
                        <p className="text-xs text-muted-foreground">Saldo Caixa</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-4">
                        <div className={`text-2xl font-bold ${relatorioFinanceiro.resumo.lucroLiquido >= 0 ? "text-green-600" : "text-red-600"}`}>
                          {formatCurrency(relatorioFinanceiro.resumo.lucroLiquido)}
                        </div>
                        <p className="text-xs text-muted-foreground">Lucro Líquido</p>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Despesas por Categoria</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {relatorioFinanceiro.despesasPorCategoria.length === 0 ? (
                          <p className="text-muted-foreground">Nenhuma despesa no período</p>
                        ) : (
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Categoria</TableHead>
                                <TableHead className="text-right">Valor</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {relatorioFinanceiro.despesasPorCategoria.map((d: any, idx: number) => (
                                <TableRow key={idx}>
                                  <TableCell>{d.categoria}</TableCell>
                                  <TableCell className="text-right">{formatCurrency(d.total)}</TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        )}
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Receitas por Categoria</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {relatorioFinanceiro.receitasPorCategoria.length === 0 ? (
                          <p className="text-muted-foreground">Nenhuma receita no período</p>
                        ) : (
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Categoria</TableHead>
                                <TableHead className="text-right">Valor</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {relatorioFinanceiro.receitasPorCategoria.map((r: any, idx: number) => (
                                <TableRow key={idx}>
                                  <TableCell>{r.categoria}</TableCell>
                                  <TableCell className="text-right">{formatCurrency(r.total)}</TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </div>
              ) : (
                <p className="text-center py-8 text-muted-foreground">Selecione um período para gerar o relatório</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Relatório de Folha */}
        <TabsContent value="folha">
          <Card>
            <CardHeader>
              <CardTitle>Relatório de Folha de Pagamento</CardTitle>
              <CardDescription>Detalhamento da folha de pagamento mensal</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4 items-end">
                <div>
                  <Label>Mês</Label>
                  <Select 
                    value={periodoFolha.mes.toString()} 
                    onValueChange={(v) => setPeriodoFolha(p => ({ ...p, mes: parseInt(v) }))}
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[1,2,3,4,5,6,7,8,9,10,11,12].map(m => (
                        <SelectItem key={m} value={m.toString()}>
                          {new Date(2024, m-1).toLocaleDateString("pt-BR", { month: "long" })}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Ano</Label>
                  <Select 
                    value={periodoFolha.ano.toString()} 
                    onValueChange={(v) => setPeriodoFolha(p => ({ ...p, ano: parseInt(v) }))}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[2024, 2025, 2026].map(a => (
                        <SelectItem key={a} value={a.toString()}>{a}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button 
                  variant="outline" 
                  className="gap-2"
                  onClick={() => gerarPDF("Folha de Pagamento", relatorioFolha)}
                  disabled={!relatorioFolha}
                >
                  <Download className="h-4 w-4" />
                  Exportar PDF
                </Button>
              </div>

              {loadingFolha ? (
                <p className="text-center py-8 text-muted-foreground">Carregando...</p>
              ) : relatorioFolha ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card>
                      <CardContent className="pt-4">
                        <div className="text-2xl font-bold">{relatorioFolha.resumo.totalFuncionarios}</div>
                        <p className="text-xs text-muted-foreground">Funcionários</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-4">
                        <div className="text-2xl font-bold text-blue-600">
                          {formatCurrency(relatorioFolha.resumo.totalBruto)}
                        </div>
                        <p className="text-xs text-muted-foreground">Total Bruto</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-4">
                        <div className="text-2xl font-bold text-red-600">
                          {formatCurrency(relatorioFolha.resumo.totalDescontos)}
                        </div>
                        <p className="text-xs text-muted-foreground">Total Descontos</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-4">
                        <div className="text-2xl font-bold text-green-600">
                          {formatCurrency(relatorioFolha.resumo.totalLiquido)}
                        </div>
                        <p className="text-xs text-muted-foreground">Total Líquido</p>
                      </CardContent>
                    </Card>
                  </div>

                  {relatorioFolha.detalhamento.length > 0 && (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Funcionário</TableHead>
                          <TableHead>Cargo</TableHead>
                          <TableHead className="text-right">Salário Base</TableHead>
                          <TableHead className="text-right">Proventos</TableHead>
                          <TableHead className="text-right">Descontos</TableHead>
                          <TableHead className="text-right">Líquido</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {relatorioFolha.detalhamento.map((f: any, idx: number) => (
                          <TableRow key={idx}>
                            <TableCell className="font-medium">{f.funcionarioNome}</TableCell>
                            <TableCell>{f.cargo}</TableCell>
                            <TableCell className="text-right">{formatCurrency(f.salarioBase)}</TableCell>
                            <TableCell className="text-right">{formatCurrency(f.totalProventos)}</TableCell>
                            <TableCell className="text-right text-red-600">{formatCurrency(f.totalDescontos)}</TableCell>
                            <TableCell className="text-right font-bold">{formatCurrency(f.salarioLiquido)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </div>
              ) : (
                <p className="text-center py-8 text-muted-foreground">Nenhum dado de folha para o período</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Relatório de Custos */}
        <TabsContent value="custos">
          <Card>
            <CardHeader>
              <CardTitle>Relatório de Custos Operacionais</CardTitle>
              <CardDescription>Análise de custos com frota e pessoal</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4 items-end">
                <div>
                  <Label>Data Início</Label>
                  <Input 
                    type="date" 
                    value={periodoCustos.dataInicio}
                    onChange={(e) => setPeriodoCustos(p => ({ ...p, dataInicio: e.target.value }))}
                  />
                </div>
                <div>
                  <Label>Data Fim</Label>
                  <Input 
                    type="date" 
                    value={periodoCustos.dataFim}
                    onChange={(e) => setPeriodoCustos(p => ({ ...p, dataFim: e.target.value }))}
                  />
                </div>
                <Button 
                  variant="outline" 
                  className="gap-2"
                  onClick={() => gerarPDF("Custos Operacionais", relatorioCustos)}
                  disabled={!relatorioCustos}
                >
                  <Download className="h-4 w-4" />
                  Exportar PDF
                </Button>
              </div>

              {loadingCustos ? (
                <p className="text-center py-8 text-muted-foreground">Carregando...</p>
              ) : relatorioCustos ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card>
                      <CardContent className="pt-4">
                        <div className="text-2xl font-bold">{relatorioCustos.resumo.totalVeiculos}</div>
                        <p className="text-xs text-muted-foreground">Veículos</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-4">
                        <div className="text-2xl font-bold text-orange-600">
                          {formatCurrency(relatorioCustos.resumo.totalDespesasOperacionais)}
                        </div>
                        <p className="text-xs text-muted-foreground">Despesas Operacionais</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-4">
                        <div className="text-2xl font-bold text-blue-600">
                          {formatCurrency(relatorioCustos.resumo.totalCustosPessoal)}
                        </div>
                        <p className="text-xs text-muted-foreground">Custos com Pessoal</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-4">
                        <div className="text-2xl font-bold text-red-600">
                          {formatCurrency(relatorioCustos.resumo.custoTotalOperacional)}
                        </div>
                        <p className="text-xs text-muted-foreground">Custo Total</p>
                      </CardContent>
                    </Card>
                  </div>

                  <Card>
                    <CardContent className="pt-4">
                      <p className="text-sm text-muted-foreground">
                        Custo médio por veículo: <span className="font-bold">{formatCurrency(relatorioCustos.resumo.custoMedioPorVeiculo)}</span>
                      </p>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <p className="text-center py-8 text-muted-foreground">Selecione um período para gerar o relatório</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Relatório de Funcionários */}
        <TabsContent value="funcionarios">
          <Card>
            <CardHeader>
              <CardTitle>Relatório de Funcionários</CardTitle>
              <CardDescription>Visão geral do quadro de funcionários</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-end">
                <Button 
                  variant="outline" 
                  className="gap-2"
                  onClick={() => gerarPDF("Funcionários", relatorioFuncionarios)}
                  disabled={!relatorioFuncionarios}
                >
                  <Download className="h-4 w-4" />
                  Exportar PDF
                </Button>
              </div>

              {relatorioFuncionarios ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <Card>
                      <CardContent className="pt-4">
                        <div className="text-2xl font-bold">{relatorioFuncionarios.resumo.totalFuncionarios}</div>
                        <p className="text-xs text-muted-foreground">Total</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-4">
                        <div className="text-2xl font-bold text-green-600">{relatorioFuncionarios.resumo.ativos}</div>
                        <p className="text-xs text-muted-foreground">Ativos</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-4">
                        <div className="text-2xl font-bold text-gray-600">{relatorioFuncionarios.resumo.inativos}</div>
                        <p className="text-xs text-muted-foreground">Inativos</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-4">
                        <div className="text-2xl font-bold text-yellow-600">{relatorioFuncionarios.resumo.afastados}</div>
                        <p className="text-xs text-muted-foreground">Afastados</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-4">
                        <div className="text-2xl font-bold text-red-600">{relatorioFuncionarios.resumo.documentosVencendo}</div>
                        <p className="text-xs text-muted-foreground">Docs Vencendo</p>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Por Cargo</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <Table>
                          <TableBody>
                            {relatorioFuncionarios.porCargo.map((c: any, idx: number) => (
                              <TableRow key={idx}>
                                <TableCell>{c.cargo}</TableCell>
                                <TableCell className="text-right font-bold">{c.total}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Por Status</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <Table>
                          <TableBody>
                            {relatorioFuncionarios.porStatus.map((s: any, idx: number) => (
                              <TableRow key={idx}>
                                <TableCell className="capitalize">{s.status}</TableCell>
                                <TableCell className="text-right font-bold">{s.total}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              ) : (
                <p className="text-center py-8 text-muted-foreground">Carregando...</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Relatório de Veículos */}
        <TabsContent value="veiculos">
          <Card>
            <CardHeader>
              <CardTitle>Relatório de Veículos</CardTitle>
              <CardDescription>Visão geral da frota</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-end">
                <Button 
                  variant="outline" 
                  className="gap-2"
                  onClick={() => gerarPDF("Veículos", relatorioVeiculos)}
                  disabled={!relatorioVeiculos}
                >
                  <Download className="h-4 w-4" />
                  Exportar PDF
                </Button>
              </div>

              {relatorioVeiculos ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <Card>
                      <CardContent className="pt-4">
                        <div className="text-2xl font-bold">{relatorioVeiculos.resumo.totalVeiculos}</div>
                        <p className="text-xs text-muted-foreground">Total</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-4">
                        <div className="text-2xl font-bold text-green-600">{relatorioVeiculos.resumo.disponiveis}</div>
                        <p className="text-xs text-muted-foreground">Disponíveis</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-4">
                        <div className="text-2xl font-bold text-blue-600">{relatorioVeiculos.resumo.emViagem}</div>
                        <p className="text-xs text-muted-foreground">Em Viagem</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-4">
                        <div className="text-2xl font-bold text-yellow-600">{relatorioVeiculos.resumo.emManutencao}</div>
                        <p className="text-xs text-muted-foreground">Manutenção</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-4">
                        <div className="text-2xl font-bold text-red-600">{relatorioVeiculos.resumo.documentosVencendo}</div>
                        <p className="text-xs text-muted-foreground">Docs Vencendo</p>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Por Tipo</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <Table>
                          <TableBody>
                            {relatorioVeiculos.porTipo.map((t: any, idx: number) => (
                              <TableRow key={idx}>
                                <TableCell className="capitalize">{t.tipo}</TableCell>
                                <TableCell className="text-right font-bold">{t.total}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Documentos Vencendo</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {relatorioVeiculos.documentosVencendo.length === 0 ? (
                          <p className="text-muted-foreground">Nenhum documento vencendo</p>
                        ) : (
                          <Table>
                            <TableBody>
                              {relatorioVeiculos.documentosVencendo.map((v: any, idx: number) => (
                                <TableRow key={idx}>
                                  <TableCell>{v.placa}</TableCell>
                                  <TableCell className="text-red-600">{v.documentos.join(", ")}</TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </div>
              ) : (
                <p className="text-center py-8 text-muted-foreground">Carregando...</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
