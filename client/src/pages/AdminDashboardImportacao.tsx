import { useLocation } from "wouter";
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, CheckCircle, AlertCircle, FileText, BarChart3 , ArrowLeft } from "lucide-react";
import { toast } from "sonner";

export function AdminDashboardImportacao() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importType, setImportType] = useState<"banco" | "viagens">("banco");
  const [isLoading, setIsLoading] = useState(false);

  const { data: importHistory, refetch: refetchHistory } = trpc.importData.listImportHistory.useQuery();
  const { data: vehicleTypes } = trpc.importData.listVehicleTypes.useQuery();
  const { data: cities } = trpc.importData.listCities.useQuery();
  const { data: routePrices } = trpc.importData.listRoutePrices.useQuery();

  const importBancoMutation = trpc.importData.importBancoData.useMutation();
  const importViagensMutation = trpc.importData.importViagensData.useMutation();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleImport = async () => {
    if (!selectedFile) {
      toast.error("Selecione um arquivo para importar");
      return;
    }

    setIsLoading(true);

    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64 = (event.target?.result as string).split(",")[1];

        if (importType === "banco") {
          await importBancoMutation.mutateAsync({
            fileBase64: base64,
            fileName: selectedFile.name,
          });
          toast.success("✅ Dados de Banco importados com sucesso!");
        } else {
          await importViagensMutation.mutateAsync({
            fileBase64: base64,
            fileName: selectedFile.name,
          });
          toast.success("✅ Dados de Viagens importados com sucesso!");
        }

        setSelectedFile(null);
        refetchHistory();
      };
      reader.readAsDataURL(selectedFile);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Erro ao importar";
      toast.error(`❌ ${errorMsg}`);
    } finally {
      setIsLoading(false);
    }
  };

  const getSuccessRate = (history: any) => {
    if (history.totalRecords === 0) return 0;
    return ((history.successfulRecords / history.totalRecords) * 100).toFixed(1);
  };

  return (
    <div className="space-y-6 p-6">
      {/* Botão Voltar */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setLocation("/admin")}
        className="mb-4"
      >
        <ArrowLeft size={20} />
        <span>Voltar</span>
      </Button>

      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Dashboard de Importação</h1>
        <div className="text-sm text-muted-foreground">
          Gerencie importações de dados e configurações
        </div>
      </div>

      <Tabs defaultValue="importar" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="importar">📤 Importar</TabsTrigger>
          <TabsTrigger value="historico">📋 Histórico</TabsTrigger>
          <TabsTrigger value="configuracoes">⚙️ Configurações</TabsTrigger>
          <TabsTrigger value="reconciliacao">🔄 Reconciliação</TabsTrigger>
        </TabsList>

        {/* TAB 1: IMPORTAR */}
        <TabsContent value="importar" className="space-y-4">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Upload className="w-5 h-5" />
              Importar Dados
            </h2>

            <div className="space-y-4">
              {/* Seleção de Tipo */}
              <div>
                <label className="text-sm font-medium mb-2 block">Tipo de Importação</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      value="banco"
                      checked={importType === "banco"}
                      onChange={(e) => setImportType(e.target.value as "banco" | "viagens")}
                      className="w-4 h-4"
                    />
                    <span>Dados de Banco (Fluxo de Caixa)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      value="viagens"
                      checked={importType === "viagens"}
                      onChange={(e) => setImportType(e.target.value as "banco" | "viagens")}
                      className="w-4 h-4"
                    />
                    <span>Dados de Viagens</span>
                  </label>
                </div>
              </div>

              {/* Upload de Arquivo */}
              <div>
                <label className="text-sm font-medium mb-2 block">Selecione o Arquivo Excel</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition">
                  <input
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={handleFileChange}
                    className="hidden"
                    id="file-input"
                  />
                  <label htmlFor="file-input" className="cursor-pointer block">
                    <FileText className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                    {selectedFile ? (
                      <div>
                        <p className="font-medium">{selectedFile.name}</p>
                        <p className="text-sm text-gray-500">
                          {(selectedFile.size / 1024).toFixed(2)} KB
                        </p>
                      </div>
                    ) : (
                      <div>
                        <p className="font-medium">Clique para selecionar arquivo</p>
                        <p className="text-sm text-gray-500">ou arraste um arquivo Excel aqui</p>
                      </div>
                    )}
                  </label>
                </div>
              </div>

              {/* Botão de Importação */}
              <Button
                onClick={handleImport}
                disabled={!selectedFile || isLoading}
                className="w-full"
                size="lg"
              >
                {isLoading ? "Importando..." : "Importar Dados"}
              </Button>
            </div>
          </Card>
        </TabsContent>

        {/* TAB 2: HISTÓRICO */}
        <TabsContent value="historico" className="space-y-4">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Histórico de Importações
            </h2>

            {!importHistory || importHistory.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Nenhuma importação realizada ainda
              </div>
            ) : (
              <div className="space-y-3">
                {importHistory.map((history) => (
                  <div
                    key={history.id}
                    className="border rounded-lg p-4 flex items-center justify-between hover:bg-gray-50"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {history.failedRecords === 0 ? (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        ) : (
                          <AlertCircle className="w-5 h-5 text-yellow-500" />
                        )}
                        <span className="font-medium">{history.fileName}</span>
                        <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                          {history.fileType}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600">
                        {history.successfulRecords}/{history.totalRecords} registros importados
                        ({getSuccessRate(history)}%)
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {new Date(history.importedAt).toLocaleString("pt-BR")}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">
                        {history.failedRecords > 0 && (
                          <span className="text-red-600">{history.failedRecords} erros</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </TabsContent>

        {/* TAB 3: CONFIGURAÇÕES */}
        <TabsContent value="configuracoes" className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {/* Veículos */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Tipos de Veículos</h3>
              <div className="space-y-2">
                {vehicleTypes?.map((vehicle) => (
                  <div key={vehicle.id} className="flex items-center justify-between p-2 border rounded">
                    <div>
                      <p className="font-medium">{vehicle.name}</p>
                      <p className="text-sm text-gray-500">{vehicle.capacity} passageiros</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Cidades */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Cidades Configuradas</h3>
              <div className="space-y-2">
                {cities?.map((city) => (
                  <div key={city.id} className="flex items-center justify-between p-2 border rounded">
                    <div>
                      <p className="font-medium">{city.name}</p>
                      <p className="text-sm text-gray-500">{city.state}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Preços de Rotas */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Preços por Rota</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b">
                  <tr>
                    <th className="text-left py-2">Veículo</th>
                    <th className="text-left py-2">Cidade</th>
                    <th className="text-right py-2">Preço/Viagem</th>
                    <th className="text-right py-2">Preço/KM</th>
                  </tr>
                </thead>
                <tbody>
                  {routePrices?.map((price) => (
                    <tr key={price.id} className="border-b hover:bg-gray-50">
                      <td className="py-2">
                        {vehicleTypes?.find((v) => v.id === price.vehicleTypeId)?.name}
                      </td>
                      <td className="py-2">
                        {cities?.find((c) => c.id === price.cityId)?.name}
                      </td>
                      <td className="text-right py-2">R$ {price.pricePerTrip}</td>
                      <td className="text-right py-2">
                        {price.pricePerKm ? `R$ ${price.pricePerKm}` : "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>

        {/* TAB 4: RECONCILIAÇÃO */}
        <TabsContent value="reconciliacao" className="space-y-4">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Análise de Reconciliação
            </h2>

            <div className="grid grid-cols-4 gap-4 mb-6">
              <div className="border rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {importHistory?.length || 0}
                </div>
                <div className="text-sm text-gray-600">Total de Importações</div>
              </div>

              <div className="border rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-green-600">
                  {importHistory?.filter((h) => h.failedRecords === 0).length || 0}
                </div>
                <div className="text-sm text-gray-600">Importações Sucesso</div>
              </div>

              <div className="border rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {importHistory?.filter((h) => h.failedRecords > 0).length || 0}
                </div>
                <div className="text-sm text-gray-600">Com Erros</div>
              </div>

              <div className="border rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {importHistory
                    ?.reduce((sum, h) => sum + h.successfulRecords, 0)
                    .toLocaleString() || 0}
                </div>
                <div className="text-sm text-gray-600">Registros Importados</div>
              </div>
            </div>

            <div className="border-t pt-6">
              <h3 className="font-semibold mb-4">Status de Dados</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded">
                  <span>Veículos Configurados</span>
                  <span className="font-bold text-green-600">{vehicleTypes?.length || 0}/5</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded">
                  <span>Cidades Configuradas</span>
                  <span className="font-bold text-green-600">{cities?.length || 0}/7</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded">
                  <span>Preços de Rotas</span>
                  <span className="font-bold text-blue-600">{routePrices?.length || 0}</span>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
