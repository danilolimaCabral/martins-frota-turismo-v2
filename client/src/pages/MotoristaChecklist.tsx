import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { trpc } from "../lib/trpc";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Textarea } from "../components/ui/textarea";
import { Input } from "../components/ui/input";
import { toast } from "sonner";
import { CheckCircle2, XCircle, MinusCircle, Camera, ArrowLeft, Send } from "lucide-react";

export default function MotoristaChecklist() {
  const [, setLocation] = useLocation();
  const [veiculoId, setVeiculoId] = useState<number | null>(null);
  const [kmAtual, setKmAtual] = useState("");
  const [checklistId, setChecklistId] = useState<number | null>(null);
  const [respostas, setRespostas] = useState<Record<number, { resposta: 'ok' | 'problema' | 'nao_aplicavel', observacao?: string, fotoUrl?: string }>>({});
  const [observacoesFinais, setObservacoesFinais] = useState("");

  // Buscar templates
  const { data: templates } = trpc.checklist.listTemplates.useQuery();
  
  // Buscar veículos
  const { data: veiculos } = trpc.vehicle.list.useQuery();

  // Buscar template com itens
  const { data: templateData } = trpc.checklist.getTemplate.useQuery(
    { id: 1 }, // Template padrão
    { enabled: !!checklistId }
  );

  // Mutations
  const iniciarMutation = trpc.checklist.iniciarChecklist.useMutation({
    onSuccess: (data) => {
      setChecklistId(data.checklistId);
      toast.success("Check-list iniciado!");
    },
    onError: () => {
      toast.error("Erro ao iniciar check-list");
    }
  });

  const salvarRespostaMutation = trpc.checklist.salvarResposta.useMutation({
    onSuccess: () => {
      // Silencioso - não mostrar toast para cada resposta
    },
    onError: () => {
      toast.error("Erro ao salvar resposta");
    }
  });

  const finalizarMutation = trpc.checklist.finalizarChecklist.useMutation({
    onSuccess: (data) => {
      if (data.temProblemas) {
        toast.success(`Check-list finalizado! ${data.quantidadeProblemas} problema(s) detectado(s). Ordem de serviço #${data.osId} criada automaticamente.`, {
          duration: 5000
        });
      } else {
        toast.success("Check-list finalizado com sucesso! Nenhum problema detectado.");
      }
      // Resetar formulário
      setChecklistId(null);
      setVeiculoId(null);
      setKmAtual("");
      setRespostas({});
      setObservacoesFinais("");
      setLocation("/motorista");
    },
    onError: () => {
      toast.error("Erro ao finalizar check-list");
    }
  });

  const handleIniciar = () => {
    if (!veiculoId || !kmAtual) {
      toast.error("Selecione o veículo e informe a quilometragem");
      return;
    }

    // TODO: Pegar motorista do contexto de autenticação
    const motoristaId = 1; // Temporário

    iniciarMutation.mutate({
      veiculoId,
      motoristaId,
      templateId: 1, // Template padrão
      kmAtual: parseInt(kmAtual)
    });
  };

  const handleResposta = (itemId: number, resposta: 'ok' | 'problema' | 'nao_aplicavel') => {
    const novaResposta = { ...respostas[itemId], resposta };
    setRespostas({ ...respostas, [itemId]: novaResposta });

    if (checklistId) {
      salvarRespostaMutation.mutate({
        checklistId,
        itemId,
        resposta,
        observacao: novaResposta.observacao,
        fotoUrl: novaResposta.fotoUrl
      });
    }
  };

  const handleObservacao = (itemId: number, observacao: string) => {
    const novaResposta = { ...respostas[itemId], observacao };
    setRespostas({ ...respostas, [itemId]: novaResposta });
  };

  const handleFinalizar = () => {
    if (!checklistId) return;

    // Verificar se todos os itens obrigatórios foram respondidos
    const itensObrigatorios = templateData?.itens.filter((item: any) => item.obrigatorio) || [];
    const todosRespondidos = itensObrigatorios.every((item: any) => respostas[item.id]);

    if (!todosRespondidos) {
      toast.error("Responda todos os itens obrigatórios antes de finalizar");
      return;
    }

    finalizarMutation.mutate({
      checklistId,
      observacoes: observacoesFinais || undefined
    });
  };

  // Agrupar itens por categoria
  const itensPorCategoria = templateData?.itens.reduce((acc: any, item: any) => {
    if (!acc[item.categoria]) {
      acc[item.categoria] = [];
    }
    acc[item.categoria].push(item);
    return acc;
  }, {}) || {};

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 pb-20">
      {/* Header fixo */}
      <div className="sticky top-0 z-50 bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setLocation("/motorista")}
              className="flex items-center gap-2 hover:bg-white/10 px-3 py-2 rounded-lg transition"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Voltar</span>
            </button>
            <h1 className="text-xl font-bold">Check-list Digital</h1>
            <div className="w-20"></div> {/* Spacer para centralizar título */}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 max-w-2xl">
        {!checklistId ? (
          // Formulário inicial
          <Card className="p-6 shadow-xl">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Iniciar Check-list</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Selecione o Veículo
                </label>
                <select
                  value={veiculoId || ""}
                  onChange={(e) => setVeiculoId(parseInt(e.target.value))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                >
                  <option value="">Selecione...</option>
                  {veiculos?.map((veiculo: any) => (
                    <option key={veiculo.id} value={veiculo.id}>
                      {veiculo.plate} - {veiculo.model}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quilometragem Atual
                </label>
                <Input
                  type="number"
                  value={kmAtual}
                  onChange={(e) => setKmAtual(e.target.value)}
                  placeholder="Ex: 45000"
                  className="text-lg py-6"
                />
              </div>

              <Button
                onClick={handleIniciar}
                disabled={!veiculoId || !kmAtual || iniciarMutation.isPending}
                className="w-full py-6 text-lg bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
              >
                {iniciarMutation.isPending ? "Iniciando..." : "Iniciar Check-list"}
              </Button>
            </div>
          </Card>
        ) : (
          // Formulário de check-list
          <div className="space-y-4">
            {Object.entries(itensPorCategoria).map(([categoria, itens]: [string, any]) => (
              <Card key={categoria} className="p-4 shadow-lg">
                <h3 className="text-lg font-bold text-gray-800 mb-4 pb-2 border-b-2 border-blue-500">
                  {categoria}
                </h3>
                
                <div className="space-y-4">
                  {itens.map((item: any) => {
                    const resposta = respostas[item.id];
                    const temProblema = resposta?.resposta === 'problema';

                    return (
                      <div key={item.id} className="border-b border-gray-200 pb-4 last:border-0">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <p className="font-medium text-gray-800 text-base">
                              {item.descricao}
                              {item.obrigatorio && <span className="text-red-500 ml-1">*</span>}
                            </p>
                          </div>
                        </div>

                        {/* Botões de resposta */}
                        <div className="grid grid-cols-3 gap-2 mb-3">
                          <button
                            onClick={() => handleResposta(item.id, 'ok')}
                            className={`flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium transition ${
                              resposta?.resposta === 'ok'
                                ? 'bg-green-500 text-white shadow-lg'
                                : 'bg-gray-100 text-gray-700 hover:bg-green-50'
                            }`}
                          >
                            <CheckCircle2 className="w-5 h-5" />
                            <span>OK</span>
                          </button>

                          <button
                            onClick={() => handleResposta(item.id, 'problema')}
                            className={`flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium transition ${
                              resposta?.resposta === 'problema'
                                ? 'bg-red-500 text-white shadow-lg'
                                : 'bg-gray-100 text-gray-700 hover:bg-red-50'
                            }`}
                          >
                            <XCircle className="w-5 h-5" />
                            <span>Problema</span>
                          </button>

                          <button
                            onClick={() => handleResposta(item.id, 'nao_aplicavel')}
                            className={`flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium transition ${
                              resposta?.resposta === 'nao_aplicavel'
                                ? 'bg-gray-500 text-white shadow-lg'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            <MinusCircle className="w-5 h-5" />
                            <span>N/A</span>
                          </button>
                        </div>

                        {/* Campo de observação (aparece se houver problema) */}
                        {temProblema && (
                          <div className="mt-3 space-y-2">
                            <Textarea
                              placeholder="Descreva o problema encontrado..."
                              value={resposta?.observacao || ""}
                              onChange={(e) => handleObservacao(item.id, e.target.value)}
                              className="text-base"
                              rows={3}
                            />
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full"
                              onClick={() => toast.info("Funcionalidade de foto em desenvolvimento")}
                            >
                              <Camera className="w-4 h-4 mr-2" />
                              Adicionar Foto
                            </Button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </Card>
            ))}

            {/* Observações finais */}
            <Card className="p-4 shadow-lg">
              <h3 className="text-lg font-bold text-gray-800 mb-3">Observações Finais</h3>
              <Textarea
                placeholder="Adicione observações gerais sobre a vistoria..."
                value={observacoesFinais}
                onChange={(e) => setObservacoesFinais(e.target.value)}
                className="text-base"
                rows={4}
              />
            </Card>

            {/* Botão finalizar fixo no bottom */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg">
              <div className="container mx-auto max-w-2xl">
                <Button
                  onClick={handleFinalizar}
                  disabled={finalizarMutation.isPending}
                  className="w-full py-6 text-lg bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
                >
                  <Send className="w-5 h-5 mr-2" />
                  {finalizarMutation.isPending ? "Finalizando..." : "Finalizar Check-list"}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
