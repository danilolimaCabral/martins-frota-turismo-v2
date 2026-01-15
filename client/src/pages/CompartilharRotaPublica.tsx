import { useState, useEffect } from "react";
import { useRoute } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Navigation, Clock, Fuel, CheckCircle, XCircle, ArrowLeft, AlertCircle } from "lucide-react";
import { MapView } from "@/components/Map";
import { trpc } from "@/lib/trpc";

interface RotaCompartilhada {
  id: number;
  nome: string;
  distancia: number;
  tempo: number;
  combustivel: number;
  custo: number;
  pontos: Array<{
    id: number;
    nome: string;
    latitude: number;
    longitude: number;
    sequencia: number;
  }>;
}

export default function CompartilharRotaPublica() {
  const [, params] = useRoute("/compartilhar-rota/:shareToken");
  const shareToken = params?.shareToken;

  const [rota, setRota] = useState<RotaCompartilhada | null>(null);
  const [loading, setLoading] = useState(true);
  const [respondendo, setRespondendo] = useState(false);
  const [resposta, setResposta] = useState<"aceito" | "rejeitado" | null>(null);
  const [nomeMotorista, setNomeMotorista] = useState("");
  const [telefoneMotorista, setTelefoneMotorista] = useState("");

  // Simular carregamento de rota (em produção, buscar via API)
  useEffect(() => {
    setTimeout(() => {
      setRota({
        id: 1,
        nome: "Rota Centro - Bairro A",
        distancia: 5.09,
        tempo: 45,
        combustivel: 1.02,
        custo: 6.63,
        pontos: [
          { id: 1, nome: "Ponto 1 - Centro", latitude: -25.472397, longitude: -49.243755, sequencia: 1 },
          { id: 2, nome: "Ponto 2 - Bairro A", latitude: -25.441285, longitude: -49.298742, sequencia: 2 },
          { id: 3, nome: "Ponto 3 - Bairro B", latitude: -25.384629, longitude: -49.251847, sequencia: 3 },
          { id: 4, nome: "Ponto 4 - Zona Leste", latitude: -25.425123, longitude: -49.215634, sequencia: 4 },
        ],
      });
      setLoading(false);
    }, 1000);
  }, [shareToken]);

  const handleAceitar = async () => {
    if (!nomeMotorista.trim() || !telefoneMotorista.trim()) {
      alert("Por favor, preencha seu nome e telefone");
      return;
    }

    setRespondendo(true);
    try {
      // Aqui você chamaria a API para registrar a aceitação
      // await trpc.routeSharing.recordDriverAccepted.mutate(shareId);
      
      setResposta("aceito");
      setTimeout(() => {
        alert(`✅ Rota aceita! Você receberá as instruções no telefone: ${telefoneMotorista}`);
      }, 500);
    } catch (error) {
      console.error("Erro ao aceitar rota:", error);
      alert("Erro ao aceitar a rota. Tente novamente.");
    } finally {
      setRespondendo(false);
    }
  };

  const handleRejeitar = () => {
    setResposta("rejeitado");
    setTimeout(() => {
      alert("❌ Rota rejeitada. Você pode fechar esta página.");
    }, 500);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-slate-600">Carregando rota...</p>
        </div>
      </div>
    );
  }

  if (!rota) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center">
        <Card className="bg-white shadow-lg max-w-md w-full mx-4">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-slate-900 mb-2">Rota não encontrada</h2>
            <p className="text-slate-600 mb-6">O link de compartilhamento pode ter expirado ou ser inválido.</p>
            <Button
              onClick={() => window.history.back()}
              variant="outline"
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* Header */}
      <div className="border-b border-slate-200 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg">
              <Navigation className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Rota Compartilhada</h1>
              <p className="text-sm text-slate-600">Visualize e aceite a rota</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Mapa */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="bg-white border-slate-200 shadow-lg overflow-hidden">
              <CardHeader className="border-b border-slate-200">
                <CardTitle className="text-slate-900">Mapa da Rota</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="h-96 rounded-lg overflow-hidden">
                  <MapView />
                </div>
              </CardContent>
            </Card>

            {/* Detalhes da Rota */}
            <Card className="bg-white border-slate-200 shadow-lg">
              <CardHeader className="border-b border-slate-200">
                <CardTitle className="text-slate-900">{rota.nome}</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin className="h-4 w-4 text-blue-600" />
                      <p className="text-xs text-blue-600 font-medium">Distância</p>
                    </div>
                    <p className="text-2xl font-bold text-blue-900">{rota.distancia} km</p>
                  </div>

                  <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="h-4 w-4 text-green-600" />
                      <p className="text-xs text-green-600 font-medium">Tempo</p>
                    </div>
                    <p className="text-2xl font-bold text-green-900">{rota.tempo} min</p>
                  </div>

                  <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-lg border border-orange-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Fuel className="h-4 w-4 text-orange-600" />
                      <p className="text-xs text-orange-600 font-medium">Combustível</p>
                    </div>
                    <p className="text-2xl font-bold text-orange-900">{rota.combustivel} L</p>
                  </div>

                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
                    <div className="flex items-center gap-2 mb-2">
                      <p className="text-xs text-purple-600 font-medium">Custo</p>
                    </div>
                    <p className="text-2xl font-bold text-purple-900">R$ {rota.custo}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Pontos da Rota */}
            <Card className="bg-white border-slate-200 shadow-lg">
              <CardHeader className="border-b border-slate-200">
                <CardTitle className="text-slate-900">Pontos de Parada ({rota.pontos.length})</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-3">
                  {rota.pontos.map((ponto, idx) => (
                    <div
                      key={ponto.id}
                      className="flex items-start gap-4 p-4 bg-slate-50 rounded-lg border border-slate-200 hover:border-orange-300 transition"
                    >
                      <div className="flex-shrink-0">
                        <Badge className="bg-orange-100 text-orange-800">#{ponto.sequencia}</Badge>
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-slate-900">{ponto.nome}</p>
                        <p className="text-xs text-slate-500 mt-1">
                          {ponto.latitude.toFixed(6)}, {ponto.longitude.toFixed(6)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Formulário de Resposta */}
          <div className="space-y-6">
            {resposta === null ? (
              <Card className="bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200 shadow-lg sticky top-24">
                <CardHeader className="border-b border-orange-200">
                  <CardTitle className="text-slate-900 flex items-center gap-2">
                    <Navigation className="h-5 w-5 text-orange-600" />
                    Aceitar Rota?
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-900 mb-2">
                      Seu Nome
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: João Silva"
                      value={nomeMotorista}
                      onChange={(e) => setNomeMotorista(e.target.value)}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-900 mb-2">
                      Seu Telefone
                    </label>
                    <input
                      type="tel"
                      placeholder="Ex: (41) 99999-9999"
                      value={telefoneMotorista}
                      onChange={(e) => setTelefoneMotorista(e.target.value)}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
                    />
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-xs text-blue-800">
                      ℹ️ Ao aceitar, você receberá as instruções e detalhes da rota no seu telefone.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Button
                      onClick={handleAceitar}
                      disabled={respondendo || !nomeMotorista.trim() || !telefoneMotorista.trim()}
                      className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white gap-2"
                    >
                      <CheckCircle className="h-4 w-4" />
                      {respondendo ? "Processando..." : "Aceitar Rota"}
                    </Button>

                    <Button
                      onClick={handleRejeitar}
                      disabled={respondendo}
                      variant="outline"
                      className="w-full gap-2 border-slate-300 text-slate-700 hover:bg-slate-100"
                    >
                      <XCircle className="h-4 w-4" />
                      Rejeitar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : resposta === "aceito" ? (
              <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 shadow-lg">
                <CardContent className="pt-6 text-center">
                  <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-green-900 mb-2">Rota Aceita!</h3>
                  <p className="text-green-700 mb-6">
                    Você receberá as instruções no telefone: {telefoneMotorista}
                  </p>
                  <Button
                    onClick={() => window.close()}
                    className="w-full bg-green-600 hover:bg-green-700 text-white"
                  >
                    Fechar
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Card className="bg-gradient-to-br from-red-50 to-rose-50 border-red-200 shadow-lg">
                <CardContent className="pt-6 text-center">
                  <XCircle className="h-16 w-16 text-red-600 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-red-900 mb-2">Rota Rejeitada</h3>
                  <p className="text-red-700 mb-6">
                    Você rejeitou esta rota. Você pode fechar esta página.
                  </p>
                  <Button
                    onClick={() => window.close()}
                    className="w-full bg-red-600 hover:bg-red-700 text-white"
                  >
                    Fechar
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
