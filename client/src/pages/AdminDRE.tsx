import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { TrendingUp, TrendingDown, DollarSign, BarChart3 , ArrowLeft } from "lucide-react";
import { trpc } from "@/lib/trpc";

export default function AdminDRE() {
  const [, setLocation] = useLocation();
  const [dataInicio, setDataInicio] = useState(
    new Date(new Date().getFullYear(), 0, 1).toISOString().split("T")[0]
  );
  const [dataFim, setDataFim] = useState(
    new Date().toISOString().split("T")[0]
  );

  const { data: dreData } = trpc.dre.getSummary.useQuery(
    { dataInicio, dataFim },
    { enabled: !!dataInicio && !!dataFim }
  );

  const { data: monthlyData } = trpc.dre.monthlyData.useQuery(
    { ano: new Date().getFullYear() },
    { enabled: true }
  );

  const { data: receitas } = trpc.dre.receitas.useQuery(
    { dataInicio, dataFim },
    { enabled: !!dataInicio && !!dataFim }
  );

  const { data: despesas } = trpc.dre.despesas.useQuery(
    { dataInicio, dataFim },
    { enabled: !!dataInicio && !!dataFim }
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg">
            <BarChart3 className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900">DRE - Demonstrativo de Resultados</h1>
        </div>
        <p className="text-slate-600">Análise financeira completa do período</p>
      </div>

      <div className="mb-6 flex flex-col md:flex-row gap-3">
        <div className="flex-1">
          <label className="block text-sm font-medium text-slate-700 mb-2">Data Início</label>
          <Input
            type="date"
            value={dataInicio}
            onChange={(e) => setDataInicio(e.target.value)}
          />
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium text-slate-700 mb-2">Data Fim</label>
          <Input
            type="date"
            value={dataFim}
            onChange={(e) => setDataFim(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600">Receitas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-green-600">
                  R$ {(dreData?.receitas || 0).toLocaleString("pt-BR", { maximumFractionDigits: 2 })}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600">Despesas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-red-600">
                  R$ {(dreData?.despesas || 0).toLocaleString("pt-BR", { maximumFractionDigits: 2 })}
                </p>
              </div>
              <div className="p-3 bg-red-100 rounded-lg">
                <TrendingDown className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600">Lucro Líquido</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-2xl font-bold ${(dreData?.lucroLiquido || 0) >= 0 ? "text-blue-600" : "text-red-600"}`}>
                  R$ {(dreData?.lucroLiquido || 0).toLocaleString("pt-BR", { maximumFractionDigits: 2 })}
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600">Margem de Lucro</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-purple-600">
                  {dreData?.margemLucro}%
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <BarChart3 className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Receitas do Período</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-100">
                  <tr>
                    <th className="px-4 py-2 text-left">Descrição</th>
                    <th className="px-4 py-2 text-right">Valor</th>
                  </tr>
                </thead>
                <tbody>
                  {receitas && receitas.length > 0 ? (
                    receitas.map((r: any, idx: number) => (
                      <tr key={idx} className="border-b hover:bg-slate-50">
                        <td className="px-4 py-2">{r.descricao}</td>
                        <td className="px-4 py-2 text-right text-green-600 font-semibold">
                          R$ {parseFloat(r.valor).toLocaleString("pt-BR", { maximumFractionDigits: 2 })}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={2} className="px-4 py-8 text-center text-slate-500">
                        Nenhuma receita encontrada
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Despesas do Período</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-100">
                  <tr>
                    <th className="px-4 py-2 text-left">Descrição</th>
                    <th className="px-4 py-2 text-right">Valor</th>
                  </tr>
                </thead>
                <tbody>
                  {despesas && despesas.length > 0 ? (
                    despesas.map((d: any, idx: number) => (
                      <tr key={idx} className="border-b hover:bg-slate-50">
                        <td className="px-4 py-2">{d.descricao}</td>
                        <td className="px-4 py-2 text-right text-red-600 font-semibold">
                          R$ {parseFloat(d.valor).toLocaleString("pt-BR", { maximumFractionDigits: 2 })}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={2} className="px-4 py-8 text-center text-slate-500">
                        Nenhuma despesa encontrada
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-0 shadow-lg mt-6">
        <CardHeader>
          <CardTitle>Resumo Mensal do Ano</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-100">
                <tr>
                  <th className="px-4 py-2 text-left">Mês</th>
                  <th className="px-4 py-2 text-right">Receitas</th>
                  <th className="px-4 py-2 text-right">Despesas</th>
                  <th className="px-4 py-2 text-right">Lucro</th>
                </tr>
              </thead>
              <tbody>
                {monthlyData && monthlyData.length > 0 ? (
                  monthlyData.map((m: any) => (
                    <tr key={m.mes} className="border-b hover:bg-slate-50">
                      <td className="px-4 py-2">
                        {new Date(2024, m.mes - 1).toLocaleString("pt-BR", { month: "long" })}
                      </td>
                      <td className="px-4 py-2 text-right text-green-600">
                        R$ {m.receitas.toLocaleString("pt-BR", { maximumFractionDigits: 2 })}
                      </td>
                      <td className="px-4 py-2 text-right text-red-600">
                        R$ {m.despesas.toLocaleString("pt-BR", { maximumFractionDigits: 2 })}
                      </td>
                      <td className={`px-4 py-2 text-right font-semibold ${m.lucro >= 0 ? "text-blue-600" : "text-red-600"}`}>
                        R$ {m.lucro.toLocaleString("pt-BR", { maximumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-slate-500">
                      Nenhum dado disponível
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
