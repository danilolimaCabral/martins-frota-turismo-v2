import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MapPin, Navigation, Save, Share2, Trash2, ArrowLeft, Copy, QrCode, Download, X } from "lucide-react";
import { MapView } from "@/components/Map";
import { trpc } from "@/lib/trpc";
import { useState } from "react";

interface Ponto {
  id: number;
  nome: string;
  latitude: number;
  longitude: number;
  sequencia: number;
}

interface RotaSalva {
  id: number;
  nome: string;
  descricao?: string;
  distancia_total: number;
  tempo_estimado: number;
  economia_percentual: number;
  combustivel_economizado: number;
  algoritmo_usado: string;
  data_criacao: string;
}

const pontosMock: Ponto[] = [
  { id: 1, nome: "Ponto 1 - Centro", latitude: -25.472397, longitude: -49.243755, sequencia: 1 },
  { id: 2, nome: "Ponto 2 - Bairro A", latitude: -25.441285, longitude: -49.298742, sequencia: 2 },
  { id: 3, nome: "Ponto 3 - Bairro B", latitude: -25.384629, longitude: -49.251847, sequencia: 3 },
  { id: 4, nome: "Ponto 4 - Zona Leste", latitude: -25.425123, longitude: -49.215634, sequencia: 4 },
  { id: 5, nome: "Ponto 5 - Zona Oeste", latitude: -25.465789, longitude: -49.325412, sequencia: 5 },
];

const rotasSalvasMock: RotaSalva[] = [
  {
    id: 1,
    nome: "Rota Centro - Bairro A",
    descricao: "Rota otimizada para coleta no centro e bairro A",
    distancia_total: 5.09,
    tempo_estimado: 45,
    economia_percentual: 79.1,
    combustivel_economizado: 12.5,
    algoritmo_usado: "Nearest Neighbor + 2-opt",
    data_criacao: "2026-01-14",
  },
  {
    id: 2,
    nome: "Rota Zona Leste",
    descricao: "Rota para zona leste com 5 pontos",
    distancia_total: 8.32,
    tempo_estimado: 65,
    economia_percentual: 82.3,
    combustivel_economizado: 18.7,
    algoritmo_usado: "Algoritmo Genético",
    data_criacao: "2026-01-13",
  },
];

export default function AdminRoteirizacaoSalvarWaze() {
  const [nomRota, setNomeRota] = useState("");
  const [descricaoRota, setDescricaoRota] = useState("");
  const [rotasSalvas, setRotasSalvas] = useState<RotaSalva[]>(rotasSalvasMock);
  const [rotaSelecionada, setRotaSelecionada] = useState<RotaSalva | null>(null);
  const [copiadoLink, setCopiadoLink] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [gerando, setGerando] = useState(false);
  const [shareToken, setShareToken] = useState<string | null>(null);

  const generateQRCode = async (rota: RotaSalva) => {
    setGerando(true);
    try {
      const result = await trpc.routeSharing.generateQRCode.mutate({
        routeId: rota.id,
        platform: "qrcode",
      });
      setQrCodeUrl(result.qrCodeUrl);
      setShareToken(result.shareToken);
    } catch (error) {
      console.error("Erro ao gerar QR Code:", error);
      alert("Erro ao gerar QR Code. Tente novamente.");
    } finally {
      setGerando(false);
    }
  };

  const downloadQRCode = async () => {
    if (!qrCodeUrl) return;
    try {
      const response = await fetch(qrCodeUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `qrcode-${shareToken}.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Erro ao baixar QR Code:", error);
    }
  };

  const handleSalvarRota = () => {
    if (!nomRota.trim()) {
      alert("Por favor, insira um nome para a rota");
      return;
    }

    const novaRota: RotaSalva = {
      id: rotasSalvas.length + 1,
      nome: nomRota,
      descricao: descricaoRota,
      distancia_total: 5.09,
      tempo_estimado: 45,
      economia_percentual: 79.1,
      combustivel_economizado: 12.5,
      algoritmo_usado: "Nearest Neighbor + 2-opt",
      data_criacao: new Date().toISOString().split("T")[0],
    };

    setRotasSalvas([novaRota, ...rotasSalvas]);
    setNomeRota("");
    setDescricaoRota("");
    alert(`✅ Rota "${nomRota}" salva com sucesso!`);
  };

  const handleCompartilharWaze = (rota: RotaSalva) => {
    const linkWaze = `https://waze.com/ul?navigate=yes&ll=-25.425123,-49.215634`;
    window.open(linkWaze, "_blank");
  };

  const handleCompartilharGoogleMaps = (rota: RotaSalva) => {
    const linkGoogleMaps = `https://www.google.com/maps/dir/?api=1&origin=-25.472397,-49.243755&destination=-25.425123,-49.215634`;
    window.open(linkGoogleMaps, "_blank");
  };

  const handleCopiarLink = (rota: RotaSalva) => {
    const linkDireto = `${window.location.origin}/motorista/rota/${rota.id}`;
    navigator.clipboard.writeText(linkDireto);
    setCopiadoLink(true);
    setTimeout(() => setCopiadoLink(false), 2000);
  };

  const handleDeletarRota = (rotaId: number) => {
    setRotasSalvas(rotasSalvas.filter((r) => r.id !== rotaId));
    alert("Rota deletada com sucesso!");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* Header */}
      <div className="border-b border-slate-200 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg">
              <Save className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Salvar & Compartilhar Rotas</h1>
              <p className="text-sm text-slate-600">Salve rotas otimizadas e compartilhe com Waze/Google Maps</p>
            </div>
          </div>
          <Button 
            variant="outline" 
            className="gap-2 border-slate-300 text-slate-700 hover:bg-slate-100" 
            onClick={() => window.history.back()}
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Formulário de Salvar Rota */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="bg-white border-slate-200 shadow-lg">
              <CardHeader className="border-b border-slate-200">
                <CardTitle className="text-slate-900 flex items-center gap-2">
                  💾 Salvar Nova Rota
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-2">Nome da Rota</label>
                  <Input
                    placeholder="Ex: Rota Centro - Bairro A"
                    value={nomRota}
                    onChange={(e) => setNomeRota(e.target.value)}
                    className="border-slate-300 focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-2">Descrição (Opcional)</label>
                  <Textarea
                    placeholder="Descreva a rota, pontos de coleta, etc."
                    value={descricaoRota}
                    onChange={(e) => setDescricaoRota(e.target.value)}
                    className="border-slate-300 focus:border-orange-500 h-24"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                    <p className="text-xs text-slate-600">Distância Total</p>
                    <p className="text-2xl font-bold text-slate-900">5.09 km</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                    <p className="text-xs text-slate-600">Economia</p>
                    <p className="text-2xl font-bold text-orange-600">79.1%</p>
                  </div>
                </div>

                <Button 
                  onClick={handleSalvarRota}
                  className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white gap-2"
                >
                  <Save className="h-4 w-4" />
                  Salvar Rota
                </Button>
              </CardContent>
            </Card>

            {/* Mapa */}
            <Card className="bg-white border-slate-200 shadow-lg overflow-hidden">
              <CardHeader className="border-b border-slate-200">
                <CardTitle className="text-slate-900">Visualização da Rota</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="h-96 rounded-lg overflow-hidden">
                  <MapView />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Rotas Salvas */}
          <div className="space-y-6">
            <Card className="bg-white border-slate-200 shadow-lg">
              <CardHeader className="border-b border-slate-200">
                <CardTitle className="text-slate-900 flex items-center gap-2">
                  📋 Rotas Salvas
                  <Badge variant="secondary">{rotasSalvas.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-3 max-h-96 overflow-y-auto">
                {rotasSalvas.map((rota) => (
                  <div 
                    key={rota.id} 
                    className="p-3 bg-gradient-to-r from-slate-50 to-white rounded-lg border border-slate-200 hover:border-orange-300 cursor-pointer transition"
                    onClick={() => setRotaSelecionada(rota)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <p className="font-medium text-slate-900 text-sm">{rota.nome}</p>
                        <p className="text-xs text-slate-500">{rota.data_criacao}</p>
                      </div>
                      <Badge className="bg-orange-100 text-orange-800">{rota.economia_percentual}%</Badge>
                    </div>
                    <div className="text-xs text-slate-600 space-y-1">
                      <p>📍 {rota.distancia_total} km</p>
                      <p>⏱️ {rota.tempo_estimado} min</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Detalhes da Rota Selecionada */}
            {rotaSelecionada && (
              <Card className="bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200 shadow-lg">
                <CardHeader className="border-b border-orange-200">
                  <CardTitle className="text-slate-900 text-sm">{rotaSelecionada.nome}</CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-3">
                  <div className="bg-white rounded-lg p-3 border border-orange-100">
                    <p className="text-xs text-slate-600">Combustível Economizado</p>
                    <p className="text-xl font-bold text-orange-600">{rotaSelecionada.combustivel_economizado} L</p>
                  </div>

                  <div className="bg-white rounded-lg p-3 border border-blue-100">
                    <p className="text-xs text-slate-600">Algoritmo</p>
                    <p className="text-xs font-medium text-slate-900">{rotaSelecionada.algoritmo_usado}</p>
                  </div>

                  <div className="space-y-2">
                    <Button
                      onClick={() => handleCompartilharWaze(rotaSelecionada)}
                      className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white gap-2"
                      size="sm"
                    >
                      <Navigation className="h-4 w-4" />
                      Abrir no Waze
                    </Button>

                    <Button
                      onClick={() => handleCompartilharGoogleMaps(rotaSelecionada)}
                      className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white gap-2"
                      size="sm"
                    >
                      <MapPin className="h-4 w-4" />
                      Abrir no Google Maps
                    </Button>

                    <Button
                      onClick={() => generateQRCode(rotaSelecionada)}
                      className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white gap-2"
                      size="sm"
                      disabled={gerando}
                    >
                      <QrCode className="h-4 w-4" />
                      {gerando ? "Gerando..." : "Gerar QR Code"}
                    </Button>

                    <Button
                      onClick={() => handleCopiarLink(rotaSelecionada)}
                      variant="outline"
                      className="w-full gap-2 border-slate-300 text-slate-700 hover:bg-slate-100"
                      size="sm"
                    >
                      <Copy className="h-4 w-4" />
                      {copiadoLink ? "✓ Copiado!" : "Copiar Link"}
                    </Button>

                    <Button
                      onClick={() => {
                        handleDeletarRota(rotaSelecionada.id);
                        setRotaSelecionada(null);
                      }}
                      variant="destructive"
                      className="w-full gap-2"
                      size="sm"
                    >
                      <Trash2 className="h-4 w-4" />
                      Deletar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
      {qrCodeUrl && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="bg-white shadow-2xl max-w-sm w-full mx-4">
            <CardHeader className="border-b border-slate-200 flex flex-row items-center justify-between">
              <CardTitle className="text-slate-900 flex items-center gap-2">
                <QrCode className="h-5 w-5 text-purple-600" />
                QR Code Gerado
              </CardTitle>
              <button
                onClick={() => {
                  setQrCodeUrl(null);
                  setShareToken(null);
                }}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="flex justify-center">
                <img
                  src={qrCodeUrl}
                  alt="QR Code"
                  className="w-64 h-64 border-4 border-slate-200 rounded-lg"
                />
              </div>
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                <p className="text-xs text-slate-600 mb-1">Token de Compartilhamento</p>
                <p className="text-xs font-mono text-slate-900 break-all">{shareToken}</p>
              </div>
              <div className="space-y-2">
                <Button
                  onClick={downloadQRCode}
                  className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white gap-2"
                >
                  <Download className="h-4 w-4" />
                  Baixar QR Code
                </Button>
                <Button
                  onClick={() => {
                    if (shareToken) {
                      navigator.clipboard.writeText(`${window.location.origin}/compartilhar-rota/${shareToken}`);
                      alert("Link copiado!");
                    }
                  }}
                  variant="outline"
                  className="w-full gap-2 border-slate-300 text-slate-700 hover:bg-slate-100"
                >
                  <Copy className="h-4 w-4" />
                  Copiar Link
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
