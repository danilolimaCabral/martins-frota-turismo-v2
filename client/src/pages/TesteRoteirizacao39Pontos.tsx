import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import L from "leaflet";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Download, Zap } from "lucide-react";
import { useLocation } from "wouter";

// Ícones customizados
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

interface Ponto {
  id: string;
  nome: string;
  endereco: string;
  cep: string;
  cidade: string;
  horario: string;
  lat: number;
  lng: number;
}

interface RotaComparacao {
  sequencial: {
    ordem: number[];
    distancia: number;
    pontos: Ponto[];
  };
  otimizada: {
    ordem: number[];
    distancia: number;
    pontos: Ponto[];
  };
  economia: {
    km: number;
    percentual: number;
  };
}

export default function TesteRoteirizacao39Pontos() {
  const [, navigate] = useLocation();
  const [pontos, setPontos] = useState<Ponto[]>([]);
  const [rotas, setRotas] = useState<RotaComparacao | null>(null);
  const [rotaSelecionada, setRotaSelecionada] = useState<"sequencial" | "otimizada">("sequencial");
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      setCarregando(true);
      
      // Simular carregamento dos dados
      const pontosData: Ponto[] = [
        {
          id: "1",
          nome: "CARLOS EDUARDO MOREY MOREY",
          endereco: "RUA MARIALVA, 537",
          cep: "81880340",
          cidade: "CURITIBA-PR",
          horario: "06:00",
          lat: -25.4284,
          lng: -49.2733
        },
        {
          id: "2",
          nome: "JOAO VICTOR BATISTA ORTIZ",
          endereco: "RUA ELEONORA BRASIL POMPEO, 248",
          cep: "81470340",
          cidade: "CURITIBA-PR",
          horario: "06:00",
          lat: -25.4294,
          lng: -49.2743
        },
        // ... mais 37 pontos seriam carregados aqui
      ];

      setPontos(pontosData);

      // Simular dados de rotas
      const rotasData: RotaComparacao = {
        sequencial: {
          ordem: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
          distancia: 24.42,
          pontos: pontosData.slice(0, 10)
        },
        otimizada: {
          ordem: [0, 5, 2, 8, 1, 9, 3, 7, 4, 6],
          distancia: 5.09,
          pontos: pontosData.slice(0, 10)
        },
        economia: {
          km: 19.33,
          percentual: 79.1
        }
      };

      setRotas(rotasData);
      setCarregando(false);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      setCarregando(false);
    }
  };

  if (carregando) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando roteirização...</p>
        </div>
      </div>
    );
  }

  const rotaAtual = rotaSelecionada === "sequencial" ? rotas?.sequencial : rotas?.otimizada;
  const coordenadas = rotaAtual?.pontos.map(p => [p.lat, p.lng]) || [];

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
              <h1 className="text-3xl font-bold text-gray-900">Teste de Roteirização</h1>
              <p className="text-gray-600">39 Pontos - Curitiba/PR</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Mapa */}
          <div className="lg:col-span-2">
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Mapa de Roteirização</span>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant={rotaSelecionada === "sequencial" ? "default" : "outline"}
                      onClick={() => setRotaSelecionada("sequencial")}
                      className={rotaSelecionada === "sequencial" ? "bg-blue-600" : ""}
                    >
                      Sequencial
                    </Button>
                    <Button
                      size="sm"
                      variant={rotaSelecionada === "otimizada" ? "default" : "outline"}
                      onClick={() => setRotaSelecionada("otimizada")}
                      className={rotaSelecionada === "otimizada" ? "bg-green-600" : ""}
                    >
                      Otimizada
                    </Button>
                  </div>
                </CardTitle>
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
                    
                    {/* Marcadores */}
                    {rotaAtual?.pontos.map((ponto, idx) => (
                      <Marker
                        key={ponto.id}
                        position={[ponto.lat, ponto.lng]}
                        icon={rotaSelecionada === "sequencial" ? redIcon : greenIcon}
                      >
                        <Popup>
                          <div className="text-sm">
                            <p className="font-bold">{ponto.nome}</p>
                            <p className="text-gray-600">{ponto.endereco}</p>
                            <p className="text-gray-600">{ponto.cep}</p>
                          </div>
                        </Popup>
                      </Marker>
                    ))}

                    {/* Linha da rota */}
                    {coordenadas.length > 1 && (
                      <Polyline
                        positions={coordenadas}
                        color={rotaSelecionada === "sequencial" ? "#3b82f6" : "#10b981"}
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
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Estatísticas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600">Total de Pontos</p>
                  <p className="text-2xl font-bold text-gray-900">{rotaAtual?.pontos.length}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Distância Total</p>
                  <p className="text-2xl font-bold text-gray-900">{rotaAtual?.distancia.toFixed(2)} km</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Distância Média</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {((rotaAtual?.distancia || 0) / (rotaAtual?.pontos.length || 1)).toFixed(2)} km/ponto
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Economia */}
            {rotas && (
              <Card className="border-green-200 bg-green-50">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2 text-green-700">
                    <Zap className="h-5 w-5" />
                    Economia
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-green-600">Redução de Distância</p>
                    <p className="text-2xl font-bold text-green-700">{rotas.economia.km.toFixed(2)} km</p>
                  </div>
                  <div>
                    <p className="text-sm text-green-600">Percentual de Economia</p>
                    <p className="text-2xl font-bold text-green-700">{rotas.economia.percentual.toFixed(1)}%</p>
                  </div>
                  <div className="pt-4 border-t border-green-200">
                    <p className="text-xs text-green-600 font-semibold">
                      Com consumo de 5 km/litro:
                    </p>
                    <p className="text-lg font-bold text-green-700">
                      {(rotas.economia.km / 5).toFixed(1)} litros economizados
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Ações */}
            <div className="space-y-2">
              <Button className="w-full bg-orange-600 hover:bg-orange-700">
                <Download className="h-4 w-4 mr-2" />
                Exportar Rota
              </Button>
              <Button variant="outline" className="w-full">
                Imprimir Relatório
              </Button>
            </div>
          </div>
        </div>

        {/* Lista de Pontos */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Pontos da Rota ({rotaSelecionada === "sequencial" ? "Sequencial" : "Otimizada"})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-2 text-left font-semibold">Ordem</th>
                    <th className="px-4 py-2 text-left font-semibold">Colaborador</th>
                    <th className="px-4 py-2 text-left font-semibold">Endereço</th>
                    <th className="px-4 py-2 text-left font-semibold">CEP</th>
                    <th className="px-4 py-2 text-left font-semibold">Horário</th>
                  </tr>
                </thead>
                <tbody>
                  {rotaAtual?.pontos.map((ponto, idx) => (
                    <tr key={ponto.id} className="border-t hover:bg-gray-50">
                      <td className="px-4 py-2 font-bold text-orange-600">{idx + 1}</td>
                      <td className="px-4 py-2">{ponto.nome}</td>
                      <td className="px-4 py-2 text-gray-600">{ponto.endereco}</td>
                      <td className="px-4 py-2 text-gray-600">{ponto.cep}</td>
                      <td className="px-4 py-2 text-gray-600">{ponto.horario}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
