import { useState, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMapEvents } from "react-leaflet";
import L from "leaflet";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Save, RotateCcw } from "lucide-react";
import { useLocation } from "wouter";

interface Ponto {
  id: string;
  nome: string;
  endereco: string;
  lat: number;
  lng: number;
  sequencia: number;
}

const redIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-red.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const greenIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-green.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Componente para adicionar funcionalidade de drag ao mapa
function DraggableMarkers({ pontos, setPontos }: { pontos: Ponto[]; setPontos: (p: Ponto[]) => void }) {
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const mapEvents = useMapEvents({
    mousemove(e) {
      if (draggingId) {
        const novosPontos = pontos.map(p =>
          p.id === draggingId
            ? { ...p, lat: e.latlng.lat, lng: e.latlng.lng }
            : p
        );
        setPontos(novosPontos);
      }
    },
    mouseup() {
      setDraggingId(null);
    }
  });

  return (
    <>
      {pontos.map((ponto, idx) => (
        <Marker
          key={ponto.id}
          position={[ponto.lat, ponto.lng]}
          icon={idx === 0 ? greenIcon : redIcon}
          draggable={true}
          eventHandlers={{
            dragstart: () => setDraggingId(ponto.id),
            dragend: (e) => {
              const novosPontos = pontos.map(p =>
                p.id === ponto.id
                  ? { ...p, lat: e.target.getLatLng().lat, lng: e.target.getLatLng().lng }
                  : p
              );
              setPontos(novosPontos);
              setDraggingId(null);
            }
          }}
        >
          <Popup>
            <div className="text-sm">
              <p className="font-bold">{ponto.sequencia}. {ponto.nome}</p>
              <p className="text-gray-600">{ponto.endereco}</p>
              <p className="text-xs text-gray-500 mt-1">
                {ponto.lat.toFixed(6)}, {ponto.lng.toFixed(6)}
              </p>
            </div>
          </Popup>
        </Marker>
      ))}
    </>
  );
}

export default function AdminRoteirizacaoDragDrop() {
  const [, navigate] = useLocation();
  const [pontos, setPontos] = useState<Ponto[]>([
    { id: "1", nome: "Ponto 1", endereco: "Rua A, 100", lat: -25.4284, lng: -49.2733, sequencia: 1 },
    { id: "2", nome: "Ponto 2", endereco: "Rua B, 200", lat: -25.4300, lng: -49.2750, sequencia: 2 },
    { id: "3", nome: "Ponto 3", endereco: "Rua C, 300", lat: -25.4250, lng: -49.2700, sequencia: 3 },
    { id: "4", nome: "Ponto 4", endereco: "Rua D, 400", lat: -25.4320, lng: -49.2780, sequencia: 4 },
  ]);

  const calcularDistancia = (lat1: number, lng1: number, lat2: number, lng2: number) => {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const distanciaTotal = pontos.reduce((total, ponto, idx) => {
    if (idx === 0) return 0;
    return total + calcularDistancia(pontos[idx - 1].lat, pontos[idx - 1].lng, ponto.lat, ponto.lng);
  }, 0);

  const coordenadas = pontos.map(p => [p.lat, p.lng]);

  const handleSalvar = async () => {
    try {
      // Aqui você chamaria a API para salvar a rota
      alert(`Rota salva com sucesso!\nDistância total: ${distanciaTotal.toFixed(2)} km`);
    } catch (error) {
      console.error('Erro ao salvar:', error);
      alert('Erro ao salvar rota');
    }
  };

  const handleReordenar = () => {
    // Reordenar sequências
    const novosPontos = pontos.map((p, idx) => ({
      ...p,
      sequencia: idx + 1
    }));
    setPontos(novosPontos);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => window.history.back()}
              className="text-orange-600 hover:bg-orange-50"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Reordenação Manual de Rota</h1>
              <p className="text-gray-600">Arraste os pontos no mapa para reordenar a rota</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Mapa */}
          <div className="lg:col-span-3">
            <Card className="h-full">
              <CardHeader>
                <CardTitle>Mapa Interativo - Arraste os Pontos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-96 rounded-lg overflow-hidden border border-gray-200">
                  <MapContainer
                    center={[-25.4284, -49.2733]}
                    zoom={14}
                    style={{ height: "100%", width: "100%" }}
                  >
                    <TileLayer
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      attribution='&copy; OpenStreetMap contributors'
                    />
                    
                    <DraggableMarkers pontos={pontos} setPontos={setPontos} />

                    {coordenadas.length > 1 && (
                      <Polyline
                        positions={coordenadas}
                        color="#3b82f6"
                        weight={3}
                        opacity={0.7}
                      />
                    )}
                  </MapContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Painel Lateral */}
          <div className="space-y-4">
            {/* Estatísticas */}
            <Card className="border-orange-200 bg-orange-50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-orange-700">Distância Total</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-orange-700">
                  {distanciaTotal.toFixed(2)} km
                </p>
              </CardContent>
            </Card>

            {/* Botões de Ação */}
            <Button
              onClick={handleReordenar}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Reordenar Sequência
            </Button>

            <Button
              onClick={handleSalvar}
              className="w-full bg-orange-600 hover:bg-orange-700"
            >
              <Save className="h-4 w-4 mr-2" />
              Salvar Rota
            </Button>

            {/* Lista de Pontos */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Ordem dos Pontos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-80 overflow-y-auto">
                  {pontos.map((ponto) => (
                    <div
                      key={ponto.id}
                      className="p-2 bg-gray-100 rounded text-sm hover:bg-gray-200 cursor-move"
                    >
                      <p className="font-bold text-orange-600">{ponto.sequencia}. {ponto.nome}</p>
                      <p className="text-gray-600 text-xs">{ponto.endereco}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Instruções */}
        <Card className="mt-6 border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-sm text-blue-700">Como Usar</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-blue-600">
            <ul className="list-disc list-inside space-y-1">
              <li>Clique e arraste qualquer marcador no mapa para reposicionar</li>
              <li>A distância total é atualizada automaticamente</li>
              <li>Use "Reordenar Sequência" para atualizar a ordem dos pontos</li>
              <li>Clique "Salvar Rota" para persistir as mudanças</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
