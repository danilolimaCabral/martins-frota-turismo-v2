import { useState } from "react";
import { useLocalAuth } from "@/hooks/useLocalAuth";
import { Redirect } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  MapPin,
  Navigation,
  Clock,
  Camera,
  Play,
  Pause,
  CheckCircle2,
  AlertCircle,
  Upload,
  MapPinned,
  Route,
  TrendingUp,
} from "lucide-react";
import { toast } from "sonner";

interface Checkpoint {
  id: number;
  tipo: "saida" | "parada" | "chegada";
  latitude: number;
  longitude: number;
  timestamp: Date;
  observacao?: string;
  foto?: string;
}

interface ViagemAtiva {
  id: number;
  destino: string;
  veiculo: string;
  placa: string;
  horarioSaida: Date;
  kmInicial: number;
  checkpoints: Checkpoint[];
  status: "em_andamento" | "pausada" | "finalizada";
}

export default function Motorista() {
  const { user } = useLocalAuth();
  const [viagemAtiva, setViagemAtiva] = useState<ViagemAtiva | null>({
    id: 1,
    destino: "Florianópolis - SC",
    veiculo: "Van Mercedes Sprinter",
    placa: "ABC-1234",
    horarioSaida: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2h atrás
    kmInicial: 45230,
    checkpoints: [
      {
        id: 1,
        tipo: "saida",
        latitude: -25.4284,
        longitude: -49.2733,
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        observacao: "Saída da garagem - Veículo em perfeitas condições",
      },
      {
        id: 2,
        tipo: "parada",
        latitude: -25.5,
        longitude: -49.3,
        timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
        observacao: "Parada para abastecimento - Posto BR",
      },
    ],
    status: "em_andamento",
  });

  const [novoCheckpoint, setNovoCheckpoint] = useState({
    tipo: "parada" as "saida" | "parada" | "chegada",
    observacao: "",
    foto: null as File | null,
  });

  // Redirecionar se não for motorista
  if (!user || user.role !== "motorista") {
    return <Redirect to="/login" />;
  }

  const handleIniciarViagem = () => {
    // Capturar localização GPS
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const novaViagem: ViagemAtiva = {
            id: Date.now(),
            destino: "Destino a definir",
            veiculo: "Veículo a definir",
            placa: "XXX-0000",
            horarioSaida: new Date(),
            kmInicial: 0,
            checkpoints: [
              {
                id: 1,
                tipo: "saida",
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                timestamp: new Date(),
                observacao: "Viagem iniciada",
              },
            ],
            status: "em_andamento",
          };
          setViagemAtiva(novaViagem);
          toast.success("Viagem iniciada com sucesso!");
        },
        (error) => {
          toast.error("Erro ao capturar localização GPS");
          console.error(error);
        }
      );
    } else {
      toast.error("Geolocalização não suportada pelo navegador");
    }
  };

  const handleRegistrarCheckpoint = () => {
    if (!viagemAtiva) return;

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const checkpoint: Checkpoint = {
            id: viagemAtiva.checkpoints.length + 1,
            tipo: novoCheckpoint.tipo,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            timestamp: new Date(),
            observacao: novoCheckpoint.observacao,
            foto: novoCheckpoint.foto ? URL.createObjectURL(novoCheckpoint.foto) : undefined,
          };

          setViagemAtiva({
            ...viagemAtiva,
            checkpoints: [...viagemAtiva.checkpoints, checkpoint],
            status: novoCheckpoint.tipo === "chegada" ? "finalizada" : viagemAtiva.status,
          });

          setNovoCheckpoint({
            tipo: "parada",
            observacao: "",
            foto: null,
          });

          toast.success(`Checkpoint registrado: ${checkpoint.tipo}`);

          if (novoCheckpoint.tipo === "chegada") {
            toast.success("Viagem finalizada com sucesso!");
          }
        },
        (error) => {
          toast.error("Erro ao capturar localização GPS");
          console.error(error);
        }
      );
    }
  };

  const handlePausarViagem = () => {
    if (!viagemAtiva) return;
    setViagemAtiva({
      ...viagemAtiva,
      status: viagemAtiva.status === "em_andamento" ? "pausada" : "em_andamento",
    });
    toast.success(
      viagemAtiva.status === "em_andamento" ? "Viagem pausada" : "Viagem retomada"
    );
  };

  const getTipoLabel = (tipo: string) => {
    switch (tipo) {
      case "saida":
        return "Saída";
      case "parada":
        return "Parada";
      case "chegada":
        return "Chegada";
      default:
        return tipo;
    }
  };

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case "saida":
        return "text-green-600 bg-green-50";
      case "parada":
        return "text-orange-600 bg-orange-50";
      case "chegada":
        return "text-blue-600 bg-blue-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  const tempoDecorrido = viagemAtiva
    ? Math.floor((Date.now() - viagemAtiva.horarioSaida.getTime()) / 1000 / 60)
    : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-4 shadow-lg">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Área do Motorista</h1>
            <p className="text-sm text-blue-100">Bem-vindo, {user.name}</p>
          </div>
          <Button
            variant="outline"
            className="bg-white text-blue-600 hover:bg-blue-50"
            onClick={() => (window.location.href = "/funcionario")}
          >
            Voltar ao Portal
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Estatísticas do Motorista */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-green-100 mb-1">Viagens Concluídas</p>
                  <h3 className="text-2xl font-bold">127</h3>
                </div>
                <CheckCircle2 className="h-8 w-8 text-green-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-blue-100 mb-1">KM Rodados</p>
                  <h3 className="text-2xl font-bold">45.230</h3>
                </div>
                <Route className="h-8 w-8 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-purple-100 mb-1">Avaliação</p>
                  <h3 className="text-2xl font-bold">4.8 ⭐</h3>
                </div>
                <TrendingUp className="h-8 w-8 text-purple-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-orange-100 mb-1">Tempo Ativo</p>
                  <h3 className="text-2xl font-bold">{tempoDecorrido}min</h3>
                </div>
                <Clock className="h-8 w-8 text-orange-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Viagem Ativa */}
        {viagemAtiva ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Info da Viagem */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Navigation className="h-5 w-5 text-blue-600" />
                    Viagem em Andamento
                  </span>
                  <div className="flex items-center gap-2">
                    {viagemAtiva.status === "em_andamento" ? (
                      <span className="flex items-center gap-1 text-sm font-normal text-green-600 bg-green-50 px-3 py-1 rounded-full">
                        <Play className="h-3 w-3" />
                        Em Andamento
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-sm font-normal text-orange-600 bg-orange-50 px-3 py-1 rounded-full">
                        <Pause className="h-3 w-3" />
                        Pausada
                      </span>
                    )}
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Destino</p>
                    <p className="font-semibold">{viagemAtiva.destino}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Veículo</p>
                    <p className="font-semibold">{viagemAtiva.veiculo}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Placa</p>
                    <p className="font-semibold">{viagemAtiva.placa}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Horário Saída</p>
                    <p className="font-semibold">
                      {viagemAtiva.horarioSaida.toLocaleTimeString("pt-BR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>

                {/* Ações Rápidas */}
                <div className="flex gap-3">
                  <Button
                    onClick={handlePausarViagem}
                    variant="outline"
                    className="flex-1"
                  >
                    {viagemAtiva.status === "em_andamento" ? (
                      <>
                        <Pause className="h-4 w-4 mr-2" />
                        Pausar Viagem
                      </>
                    ) : (
                      <>
                        <Play className="h-4 w-4 mr-2" />
                        Retomar Viagem
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={() => (window.location.href = "/rastreamento")}
                    variant="outline"
                    className="flex-1"
                  >
                    <MapPin className="h-4 w-4 mr-2" />
                    Ver no Mapa
                  </Button>
                </div>

                {/* Timeline de Checkpoints */}
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <MapPinned className="h-4 w-4" />
                    Timeline de Checkpoints
                  </h4>
                  <div className="space-y-3">
                    {viagemAtiva.checkpoints.map((checkpoint, index) => (
                      <div
                        key={checkpoint.id}
                        className="flex gap-3 items-start pb-3 border-b last:border-0"
                      >
                        <div
                          className={`p-2 rounded-full ${getTipoColor(checkpoint.tipo)}`}
                        >
                          {checkpoint.tipo === "saida" && <Play className="h-4 w-4" />}
                          {checkpoint.tipo === "parada" && <Pause className="h-4 w-4" />}
                          {checkpoint.tipo === "chegada" && (
                            <CheckCircle2 className="h-4 w-4" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <p className="font-semibold text-sm">
                              {getTipoLabel(checkpoint.tipo)}
                            </p>
                            <p className="text-xs text-gray-500">
                              {checkpoint.timestamp.toLocaleTimeString("pt-BR", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </p>
                          </div>
                          {checkpoint.observacao && (
                            <p className="text-sm text-gray-600">{checkpoint.observacao}</p>
                          )}
                          <p className="text-xs text-gray-500 mt-1">
                            📍 {checkpoint.latitude.toFixed(4)}, {checkpoint.longitude.toFixed(4)}
                          </p>
                          {checkpoint.foto && (
                            <img
                              src={checkpoint.foto}
                              alt="Checkpoint"
                              className="mt-2 w-32 h-32 object-cover rounded-lg"
                            />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Registrar Novo Checkpoint */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Registrar Checkpoint
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-2">
                    Tipo de Checkpoint
                  </label>
                  <select
                    className="w-full h-10 px-3 rounded-md border border-border bg-white"
                    value={novoCheckpoint.tipo}
                    onChange={(e) =>
                      setNovoCheckpoint({
                        ...novoCheckpoint,
                        tipo: e.target.value as "saida" | "parada" | "chegada",
                      })
                    }
                  >
                    <option value="parada">Parada</option>
                    <option value="chegada">Chegada</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-2">
                    Observações
                  </label>
                  <textarea
                    className="w-full px-3 py-2 rounded-md border border-border bg-white resize-none"
                    rows={3}
                    placeholder="Descreva o motivo da parada ou observações..."
                    value={novoCheckpoint.observacao}
                    onChange={(e) =>
                      setNovoCheckpoint({
                        ...novoCheckpoint,
                        observacao: e.target.value,
                      })
                    }
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-2">
                    Foto (opcional)
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      id="foto-upload"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setNovoCheckpoint({
                            ...novoCheckpoint,
                            foto: file,
                          });
                        }
                      }}
                    />
                    <label htmlFor="foto-upload" className="cursor-pointer">
                      {novoCheckpoint.foto ? (
                        <div>
                          <CheckCircle2 className="h-8 w-8 text-green-600 mx-auto mb-2" />
                          <p className="text-sm text-gray-600">
                            {novoCheckpoint.foto.name}
                          </p>
                        </div>
                      ) : (
                        <div>
                          <Camera className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                          <p className="text-sm text-gray-600">
                            Clique para tirar/enviar foto
                          </p>
                        </div>
                      )}
                    </label>
                  </div>
                </div>

                <Button
                  onClick={handleRegistrarCheckpoint}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700"
                >
                  <MapPin className="h-4 w-4 mr-2" />
                  Registrar Checkpoint
                </Button>

                <div className="pt-3 border-t">
                  <p className="text-xs text-gray-500 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    A localização GPS será capturada automaticamente
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <Navigation className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Nenhuma viagem ativa</h3>
              <p className="text-gray-600 mb-6">
                Inicie uma nova viagem para começar a registrar checkpoints
              </p>
              <Button
                onClick={handleIniciarViagem}
                className="bg-gradient-to-r from-green-600 to-green-700"
              >
                <Play className="h-4 w-4 mr-2" />
                Iniciar Nova Viagem
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
