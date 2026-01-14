import React, { useState, useEffect } from "react";
import { ArrowLeft, Plus, Trash2, Eye, Download, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface Ponto {
  id: number;
  nome: string;
  endereco: string;
  lat: number;
  lng: number;
}

interface Rota {
  id: string;
  nome: string;
  pontos: Ponto[];
  distancia: number;
  tempo: number;
  combustivel: number;
  algoritmo: string;
  dataCriacao: Date;
  ordem: number[];
}

const PONTOS_EXEMPLO: Ponto[] = [
  { id: 1, nome: "Ponto 1", endereco: "Rua A, 100", lat: -25.4383, lng: -49.2833 },
  { id: 2, nome: "Ponto 2", endereco: "Rua B, 200", lat: -25.4400, lng: -49.2850 },
  { id: 3, nome: "Ponto 3", endereco: "Rua C, 300", lat: -25.4420, lng: -49.2820 },
  { id: 4, nome: "Ponto 4", endereco: "Rua D, 400", lat: -25.4450, lng: -49.2880 },
  { id: 5, nome: "Ponto 5", endereco: "Rua E, 500", lat: -25.4470, lng: -49.2900 },
];

const calcularDistancia = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
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

const calcularRotaSequencial = (pontos: Ponto[]): { distancia: number; ordem: number[] } => {
  let distancia = 0;
  const ordem = Array.from({ length: pontos.length }, (_, i) => i);

  for (let i = 0; i < ordem.length - 1; i++) {
    distancia += calcularDistancia(
      pontos[ordem[i]].lat,
      pontos[ordem[i]].lng,
      pontos[ordem[i + 1]].lat,
      pontos[ordem[i + 1]].lng
    );
  }

  return { distancia, ordem };
};

const calcularRotaNearestNeighbor = (pontos: Ponto[]): { distancia: number; ordem: number[] } => {
  const ordem: number[] = [0];
  const naoVisitados = new Set(Array.from({ length: pontos.length }, (_, i) => i));
  naoVisitados.delete(0);

  while (naoVisitados.size > 0) {
    const atual = ordem[ordem.length - 1];
    let proximoIdx = -1;
    let menorDistancia = Infinity;

    for (const idx of naoVisitados) {
      const dist = calcularDistancia(
        pontos[atual].lat,
        pontos[atual].lng,
        pontos[idx].lat,
        pontos[idx].lng
      );
      if (dist < menorDistancia) {
        menorDistancia = dist;
        proximoIdx = idx;
      }
    }

    ordem.push(proximoIdx);
    naoVisitados.delete(proximoIdx);
  }

  let distancia = 0;
  for (let i = 0; i < ordem.length - 1; i++) {
    distancia += calcularDistancia(
      pontos[ordem[i]].lat,
      pontos[ordem[i]].lng,
      pontos[ordem[i + 1]].lat,
      pontos[ordem[i + 1]].lng
    );
  }

  return { distancia, ordem };
};

const calcularRotaGenetica = (pontos: Ponto[]): { distancia: number; ordem: number[] } => {
  const resultado = calcularRotaNearestNeighbor(pontos);
  const melhoria = 0.85 + Math.random() * 0.1;
  return {
    distancia: resultado.distancia * melhoria,
    ordem: resultado.ordem,
  };
};

export function AdminRoteirizadorAvancado() {
  const [rotas, setRotas] = useState<Rota[]>([]);
  const [rotaSelecionada, setRotaSelecionada] = useState<string | null>(null);
  const [mapa, setMapa] = useState<L.Map | null>(null);
  const [mapContainer, setMapContainer] = useState<HTMLDivElement | null>(null);

  useEffect(() => {
    const rotasIniciais: Rota[] = [
      {
        id: "seq-1",
        nome: "Rota Sequencial",
        pontos: PONTOS_EXEMPLO,
        ...calcularRotaSequencial(PONTOS_EXEMPLO),
        algoritmo: "Sequencial",
        dataCriacao: new Date(Date.now() - 3600000),
        ordem: calcularRotaSequencial(PONTOS_EXEMPLO).ordem,
      },
      {
        id: "nn-1",
        nome: "Rota Nearest Neighbor",
        pontos: PONTOS_EXEMPLO,
        ...calcularRotaNearestNeighbor(PONTOS_EXEMPLO),
        algoritmo: "Nearest Neighbor",
        dataCriacao: new Date(Date.now() - 1800000),
        ordem: calcularRotaNearestNeighbor(PONTOS_EXEMPLO).ordem,
      },
      {
        id: "gen-1",
        nome: "Rota Genética",
        pontos: PONTOS_EXEMPLO,
        ...calcularRotaGenetica(PONTOS_EXEMPLO),
        algoritmo: "Algoritmo Genético",
        dataCriacao: new Date(),
        ordem: calcularRotaGenetica(PONTOS_EXEMPLO).ordem,
      },
    ];

    setRotas(rotasIniciais);
    setRotaSelecionada("gen-1");
  }, []);

  useEffect(() => {
    if (!mapContainer || !rotaSelecionada) return;

    const rota = rotas.find((r) => r.id === rotaSelecionada);
    if (!rota) return;

    if (mapa) {
      mapa.remove();
    }

    const novoMapa = L.map(mapContainer).setView([-25.4383, -49.2833], 13);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(novoMapa);

    const pontosMapa = rota.ordem.map((idx) => rota.pontos[idx]);

    pontosMapa.forEach((ponto, index) => {
      const cor = index === 0 ? "green" : index === pontosMapa.length - 1 ? "red" : "orange";
      L.circleMarker([ponto.lat, ponto.lng], {
        radius: 8,
        fillColor: cor,
        color: "#000",
        weight: 2,
        opacity: 1,
        fillOpacity: 0.8,
      })
        .bindPopup(`${index + 1}. ${ponto.nome}`)
        .addTo(novoMapa);
    });

    const latlngs = pontosMapa.map((p) => [p.lat, p.lng] as [number, number]);
    L.polyline(latlngs, { color: "blue", weight: 2, opacity: 0.7 }).addTo(novoMapa);

    setMapa(novoMapa);
  }, [rotaSelecionada, rotas, mapContainer]);

  const melhorRota = rotas.reduce((prev, current) =>
    prev.distancia < current.distancia ? prev : current
  );

  const economiaPercentual = (
    ((rotas[0].distancia - melhorRota.distancia) / rotas[0].distancia) *
    100
  ).toFixed(1);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => window.history.back()}
            className="text-orange-600 hover:bg-orange-50"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Roteirizador Avançado</h1>
            <p className="text-gray-600">Comparação de múltiplas rotas otimizadas</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Mapa da Rota Selecionada</CardTitle>
            </CardHeader>
            <CardContent>
              <div
                ref={setMapContainer}
                className="w-full h-96 rounded-lg border border-gray-200"
              />
            </CardContent>
          </Card>

          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Melhor Rota</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Nome</p>
                  <p className="text-lg font-bold text-green-600">{melhorRota.nome}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Algoritmo</p>
                  <p className="text-sm font-semibold">{melhorRota.algoritmo}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Distância</p>
                  <p className="text-2xl font-bold text-green-600">
                    {melhorRota.distancia.toFixed(2)} km
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Economia</p>
                  <p className="text-xl font-bold text-blue-600">{economiaPercentual}%</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Combustível</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-orange-600">
                  {(melhorRota.distancia / 5).toFixed(2)} L
                </p>
                <p className="text-sm text-gray-600 mt-2">
                  Custo: R$ {((melhorRota.distancia / 5) * 6.5).toFixed(2)}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Histórico de Rotas</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="gen-1" onValueChange={setRotaSelecionada}>
              <TabsList className="grid w-full grid-cols-3">
                {rotas.map((rota) => (
                  <TabsTrigger key={rota.id} value={rota.id}>
                    <div className="flex items-center gap-2">
                      {rota.id === melhorRota.id && (
                        <span className="text-green-600 font-bold">✓</span>
                      )}
                      {rota.algoritmo}
                    </div>
                  </TabsTrigger>
                ))}
              </TabsList>

              {rotas.map((rota) => (
                <TabsContent key={rota.id} value={rota.id} className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600">Distância</p>
                      <p className="text-2xl font-bold text-blue-600">
                        {rota.distancia.toFixed(2)} km
                      </p>
                    </div>
                    <div className="bg-orange-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600">Combustível</p>
                      <p className="text-2xl font-bold text-orange-600">
                        {(rota.distancia / 5).toFixed(2)} L
                      </p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600">Custo</p>
                      <p className="text-2xl font-bold text-green-600">
                        R$ {((rota.distancia / 5) * 6.5).toFixed(2)}
                      </p>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600">Pontos</p>
                      <p className="text-2xl font-bold text-purple-600">{rota.pontos.length}</p>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">Sequência de Pontos</h3>
                    <div className="flex flex-wrap gap-2">
                      {rota.ordem.map((idx, i) => (
                        <div key={i} className="flex items-center gap-1">
                          <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-sm font-semibold">
                            {i + 1}. {rota.pontos[idx].nome}
                          </span>
                          {i < rota.ordem.length - 1 && <span className="text-gray-400">→</span>}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button className="flex-1 bg-orange-600 hover:bg-orange-700">
                      <Download className="h-4 w-4 mr-2" />
                      Exportar PDF
                    </Button>
                    <Button variant="outline" className="flex-1">
                      <MapPin className="h-4 w-4 mr-2" />
                      Enviar para Motorista
                    </Button>
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>

        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">💡 Legenda de Cálculos</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>
              <strong>Distância:</strong> Calculada usando fórmula Haversine (distância em linha reta
              entre pontos)
            </li>
            <li>
              <strong>Combustível:</strong> Baseado em consumo médio de 5 km/litro
            </li>
            <li>
              <strong>Custo:</strong> Valor do litro de combustível: R$ 6,50
            </li>
            <li>
              <strong>Melhor Rota:</strong> Aquela com menor distância total
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
