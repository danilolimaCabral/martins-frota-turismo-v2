import { useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, Users, Bus, CheckCircle, AlertCircle , ArrowLeft } from "lucide-react";

export default function AdminImportar() {
  const [, setLocation] = useLocation();
  const [resultado, setResultado] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const { data: stats } = trpc.import.getStats.useQuery();

  const importarFuncionariosMutation = trpc.import.importarFuncionarios.useMutation({
    onSuccess: (data) => {
      setResultado({ tipo: "funcionarios", ...data });
      setLoading(false);
      alert(`Importação concluída! ${data.importados} funcionários importados.`);
    },
    onError: (error) => {
      setLoading(false);
      alert(`Erro: ${error.message}`);
    },
  });

  const importarVeiculosMutation = trpc.import.importarVeiculos.useMutation({
    onSuccess: (data) => {
      setResultado({ tipo: "veiculos", ...data });
      setLoading(false);
      alert(`Importação concluída! ${data.importados} veículos importados.`);
    },
    onError: (error) => {
      setLoading(false);
      alert(`Erro: ${error.message}`);
    },
  });

  const importarTudoMutation = trpc.import.importarTudo.useMutation({
    onSuccess: (data) => {
      setResultado({ tipo: "tudo", ...data });
      setLoading(false);
      alert(`Importação concluída! ${data.funcionarios.importados} funcionários e ${data.veiculos.importados} veículos importados.`);
    },
    onError: (error) => {
      setLoading(false);
      alert(`Erro: ${error.message}`);
    },
  });

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Botão Voltar */}
      <div className="mb-6 flex items-center gap-2">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-orange-600 hover:bg-orange-700 text-white transition-colors font-medium"
        >
          <ArrowLeft size={20} />
          <span>Voltar</span>
        </button>
      </div>

      <div>
        <h1 className="text-3xl font-bold">Importar Dados</h1>
        <p className="text-muted-foreground">Importar funcionários e veículos das planilhas Excel</p>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4" />
              Funcionários Disponíveis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats?.funcionariosDisponiveis || 0}</div>
            <p className="text-xs text-muted-foreground">Da planilha CONTROLE DE FUNCIONÁRIOS</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Bus className="h-4 w-4" />
              Veículos Disponíveis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats?.veiculosDisponiveis || 0}</div>
            <p className="text-xs text-muted-foreground">Da planilha FROTA</p>
          </CardContent>
        </Card>
      </div>

      {/* Ações de Importação */}
      <Card>
        <CardHeader>
          <CardTitle>Ações de Importação</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              size="lg"
              className="h-24 flex-col gap-2"
              onClick={() => {
                setLoading(true);
                importarFuncionariosMutation.mutate();
              }}
              disabled={loading}
            >
              <Users className="h-8 w-8" />
              <span>Importar Funcionários</span>
            </Button>

            <Button
              size="lg"
              className="h-24 flex-col gap-2"
              onClick={() => {
                setLoading(true);
                importarVeiculosMutation.mutate();
              }}
              disabled={loading}
            >
              <Bus className="h-8 w-8" />
              <span>Importar Veículos</span>
            </Button>

            <Button
              size="lg"
              variant="default"
              className="h-24 flex-col gap-2 bg-green-600 hover:bg-green-700"
              onClick={() => {
                setLoading(true);
                importarTudoMutation.mutate();
              }}
              disabled={loading}
            >
              <Upload className="h-8 w-8" />
              <span>Importar Tudo</span>
            </Button>
          </div>

          {loading && (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-muted-foreground">Importando dados...</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Resultado */}
      {resultado && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {resultado.erros === 0 ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <AlertCircle className="h-5 w-5 text-orange-600" />
              )}
              Resultado da Importação
            </CardTitle>
          </CardHeader>
          <CardContent>
            {resultado.tipo === "tudo" ? (
              <div className="space-y-2">
                <p><strong>Funcionários:</strong> {resultado.funcionarios.importados} importados, {resultado.funcionarios.erros} erros</p>
                <p><strong>Veículos:</strong> {resultado.veiculos.importados} importados, {resultado.veiculos.erros} erros</p>
              </div>
            ) : (
              <div className="space-y-2">
                <p><strong>Total:</strong> {resultado.total}</p>
                <p><strong>Importados:</strong> {resultado.importados}</p>
                <p><strong>Erros:</strong> {resultado.erros}</p>
                {resultado.detalhes && (
                  <div className="mt-4 max-h-60 overflow-y-auto">
                    <p className="font-semibold mb-2">Detalhes:</p>
                    <ul className="text-sm space-y-1">
                      {resultado.detalhes.map((d: string, i: number) => (
                        <li key={i} className={d.includes("Erro") ? "text-red-600" : "text-green-600"}>
                          {d}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
