import { useState, useEffect } from "react";
import { useRoute } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Navigation, Clock, Fuel, Share2, ExternalLink, QrCode, ArrowLeft } from "lucide-react";
import { MapView } from "@/components/Map";

interface Ponto {
  id: number;
  nome: string;
  latitude: number;
  longitude: number;
}

interface Rota {
  id: number;
  nome: string;
  algoritmo: string;
  distancia: number;
  tempo: number;
  economia: number;
  combustivel: number;
  custo: number;
  pontos: Ponto[];
}

export default function MotoristaRotaCompartilhada() {
  const [, params] = useRoute("/motorista/rota/:token");
  const [rota, setRota] = useState<Rota | null>(null);
  const [loading, setLoading] = useState(true);
  const [mapInstance, setMapInstance] = useState<google.maps.Map | null>(null);
  const [mostrarQR, setMostrarQR] = useState(false);

  useEffect(() => {
    // Simular carregamento de rota
    setTimeout(() => {
      setRota({
        id: 1,
        nome: "Rota Teste",
        algoritmo: "Nearest Neighbor",
        distancia: 5.09,
        tempo: 45,
        economia: 79.1,
        combustivel: 1.02,
        custo: 6.63,
        pontos: [
          { id: 1, nome: "Ponto 1", latitude: -25.472397, longitude: -49.243755 },
          { id: 2, nome: "Ponto 2", latitude: -25.441285, longitude: -49.298742 },
          { id: 3, nome: "Ponto 3", latitude: -25.384629, longitude: -49.251847 },
          { id: 4, nome: "Ponto 4", latitude: -25.429384, longitude: -49.289374 },
          { id: 5, nome: "Ponto 5", latitude: -25.437251, longitude: -49.229973 },
        ],
      });
      setLoading(false);
    }, 1000);
  }, [params?.token]);

  const handleMapReady = (map: google.maps.Map) => {
    setMapInstance(map);
    if (rota) {
      atualizarMapa(map, rota.pontos);
    }
  };

  const atualizarMapa = (map: google.maps.Map, pontos: Ponto[]) => {
    const bounds = new google.maps.LatLngBounds();
    
    pontos.forEach((ponto, idx) => {
      const position = { lat: ponto.latitude, lng: ponto.longitude };
      new google.maps.Marker({
        position,
        map,
        title: ponto.nome,
        label: String(idx + 1),
        icon: idx === 0 ? "http://maps.google.com/mapfiles/ms/icons/green-dot.png" : 
              idx === pontos.length - 1 ? "http://maps.google.com/mapfiles/ms/icons/red-dot.png" :
              "http://maps.google.com/mapfiles/ms/icons/yellow-dot.png",
      });
      bounds.extend(position);
    });

    if (!bounds.isEmpty()) {
      map.fitBounds(bounds);
    }

    // Desenhar polyline
    new google.maps.Polyline({
      path: pontos.map(p => ({ lat: p.latitude, lng: p.longitude })),
      geodesic: true,
      strokeColor: "#FF6B35",
      strokeOpacity: 0.7,
      strokeWeight: 3,
      map,
    });
  };

  const abrirWaze = () => {
    if (!rota) return;
    const destino = rota.pontos[rota.pontos.length - 1];
    const url = `https://waze.com/ul?ll=${destino.latitude},${destino.longitude}&navigate=yes`;
    window.open(url, "_blank");
  };

  const abrirGoogleMaps = () => {
    if (!rota) return;
    const origem = rota.pontos[0];
    const destino = rota.pontos[rota.pontos.length - 1];
    const waypoints = rota.pontos
      .slice(1, -1)
      .map(p => `${p.latitude},${p.longitude}`)
      .join("|");
    
    const url = `https://www.google.com/maps/dir/${origem.latitude},${origem.longitude}/${destino.latitude},${destino.longitude}${
      waypoints ? `?waypoints=${waypoints}` : ""
    }`;
    window.open(url, "_blank");
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
        <div className="text-center">
          <p className="text-slate-600 text-lg">Rota não encontrada</p>
          <Button onClick={() => window.history.back()} className="mt-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
        </div>
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
              <h1 className="text-2xl font-bold text-slate-900">{rota.nome}</h1>
              <p className="text-sm text-slate-600">{rota.pontos.length} Pontos • Curitiba, PR</p>
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
          {/* Mapa */}
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-2xl h-96 lg:h-[600px]">
              <MapView onMapReady={handleMapReady} />
            </div>

            {/* Pontos da Rota */}
            <Card className="bg-white border-slate-200 shadow-lg">
              <CardHeader className="border-b border-slate-200">
                <CardTitle className="text-slate-900">📍 Sequência de Pontos</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-3">
                  {rota.pontos.map((ponto, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-orange-500 text-white font-bold text-sm">
                        {idx + 1}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-slate-900">{ponto.nome}</p>
                        <p className="text-xs text-slate-500">{ponto.latitude.toFixed(4)}, {ponto.longitude.toFixed(4)}</p>
                      </div>
                      {idx < rota.pontos.length - 1 && (
                        <div className="text-slate-400">→</div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Painel de Controle */}
          <div className="space-y-6">
            {/* Estatísticas */}
            <Card className="bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200 shadow-lg">
              <CardHeader className="border-b border-orange-200">
                <CardTitle className="text-slate-900 flex items-center gap-2">
                  <Badge className="bg-orange-500/20 text-orange-700">Rota Otimizada</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div className="bg-white rounded-lg p-4 border border-orange-100">
                  <p className="text-slate-600 text-sm">Distância Total</p>
                  <p className="text-3xl font-bold text-slate-900">{rota.distancia} km</p>
                  <p className="text-xs text-green-600 mt-1">Economia: {rota.economia}%</p>
                </div>

                <div className="bg-white rounded-lg p-4 border border-blue-100">
                  <div className="flex items-center gap-2 mb-1">
                    <Clock className="h-4 w-4 text-blue-500" />
                    <p className="text-slate-600 text-sm">Tempo Estimado</p>
                  </div>
                  <p className="text-3xl font-bold text-slate-900">{rota.tempo} min</p>
                </div>

                <div className="bg-white rounded-lg p-4 border border-yellow-100">
                  <div className="flex items-center gap-2 mb-1">
                    <Fuel className="h-4 w-4 text-yellow-500" />
                    <p className="text-slate-600 text-sm">Combustível</p>
                  </div>
                  <p className="text-2xl font-bold text-slate-900">{rota.combustivel} L</p>
                  <p className="text-xs text-yellow-600 mt-1">R$ {rota.custo}</p>
                </div>
              </CardContent>
            </Card>

            {/* Ações */}
            <Card className="bg-white border-slate-200 shadow-lg">
              <CardHeader className="border-b border-slate-200">
                <CardTitle className="text-slate-900">🚀 Ações</CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-3">
                <Button 
                  onClick={abrirWaze}
                  className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white gap-2"
                >
                  <ExternalLink className="h-4 w-4" />
                  Abrir no Waze
                </Button>

                <Button 
                  onClick={abrirGoogleMaps}
                  className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white gap-2"
                >
                  <ExternalLink className="h-4 w-4" />
                  Google Maps
                </Button>

                <Button 
                  onClick={() => setMostrarQR(!mostrarQR)}
                  variant="outline"
                  className="w-full border-slate-300 text-slate-700 hover:bg-slate-50 gap-2"
                >
                  <QrCode className="h-4 w-4" />
                  QR Code
                </Button>

                <Button 
                  onClick={() => {
                    const url = window.location.href;
                    navigator.clipboard.writeText(url);
                    alert("✅ Link copiado para a área de transferência!");
                  }}
                  variant="outline"
                  className="w-full border-slate-300 text-slate-700 hover:bg-slate-50 gap-2"
                >
                  <Share2 className="h-4 w-4" />
                  Copiar Link
                </Button>
              </CardContent>
            </Card>

            {/* QR Code */}
            {mostrarQR && (
              <Card className="bg-white border-slate-200 shadow-lg">
                <CardHeader className="border-b border-slate-200">
                  <CardTitle className="text-slate-900">QR Code</CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="flex justify-center">
                    <img 
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(window.location.href)}`}
                      alt="QR Code"
                      className="border-2 border-slate-200 rounded-lg"
                    />
                  </div>
                  <p className="text-xs text-slate-500 text-center mt-4">Escaneie com seu celular para acessar a rota</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
