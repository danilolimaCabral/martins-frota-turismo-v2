import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Zap, TrendingDown, Clock, Fuel } from 'lucide-react';
import { useLocation } from 'wouter';
import { toast } from 'sonner';

interface Point {
  id: string;
  lat: number;
  lng: number;
  name: string;
  passengers?: number;
}

interface RouteOptimizationResult {
  originalOrder: Point[];
  optimizedOrder: Point[];
  originalDistance: number;
  optimizedDistance: number;
  savings: number;
  savingsPercentage: number;
  iterations: number;
}

// Função Haversine para calcular distância entre dois pontos
function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371; // Raio da Terra em km
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
}

// Calcula distância total de uma rota
function calculateTotalDistance(points: Point[]): number {
  let total = 0;
  for (let i = 0; i < points.length - 1; i++) {
    total += haversineDistance(
      points[i].lat,
      points[i].lng,
      points[i + 1].lat,
      points[i + 1].lng
    );
  }
  return total;
}

// Algoritmo Nearest Neighbor
function nearestNeighbor(points: Point[]): Point[] {
  if (points.length <= 1) return points;

  const unvisited = new Set(points.map((_, i) => i));
  const route: Point[] = [points[0]];
  unvisited.delete(0);

  while (unvisited.size > 0) {
    const current = route[route.length - 1];
    let nearest = -1;
    let minDistance = Infinity;

    for (const idx of Array.from(unvisited)) {
      const distance = haversineDistance(
        current.lat,
        current.lng,
        points[idx].lat,
        points[idx].lng
      );
      if (distance < minDistance) {
        minDistance = distance;
        nearest = idx;
      }
    }

    route.push(points[nearest]);
    unvisited.delete(nearest);
  }

  return route;
}

// Algoritmo 2-opt
function twoOpt(points: Point[], maxIterations: number = 1000): { route: Point[]; iterations: number } {
  let route = [...points];
  let improved = true;
  let iterations = 0;

  while (improved && iterations < maxIterations) {
    improved = false;
    iterations++;

    for (let i = 0; i < route.length - 2; i++) {
      for (let j = i + 2; j < route.length; j++) {
        const before =
          haversineDistance(route[i].lat, route[i].lng, route[i + 1].lat, route[i + 1].lng) +
          haversineDistance(route[j].lat, route[j].lng, route[(j + 1) % route.length].lat, route[(j + 1) % route.length].lng);

        const after =
          haversineDistance(route[i].lat, route[i].lng, route[j].lat, route[j].lng) +
          haversineDistance(route[i + 1].lat, route[i + 1].lng, route[(j + 1) % route.length].lat, route[(j + 1) % route.length].lng);

        if (after < before) {
          const newRoute = [
            ...route.slice(0, i + 1),
            ...route.slice(i + 1, j + 1).reverse(),
            ...route.slice(j + 1),
          ];
          route = newRoute;
          improved = true;
          break;
        }
      }
      if (improved) break;
    }
  }

  return { route, iterations };
}

// Função principal de otimização
function optimizeRoute(points: Point[]): RouteOptimizationResult {
  if (points.length <= 2) {
    const distance = calculateTotalDistance(points);
    return {
      originalOrder: points,
      optimizedOrder: points,
      originalDistance: distance,
      optimizedDistance: distance,
      savings: 0,
      savingsPercentage: 0,
      iterations: 0,
    };
  }

  const originalDistance = calculateTotalDistance(points);
  const initialRoute = nearestNeighbor(points);
  const { route: optimizedRoute, iterations } = twoOpt(initialRoute);
  const optimizedDistance = calculateTotalDistance(optimizedRoute);

  const savings = originalDistance - optimizedDistance;
  const savingsPercentage = (savings / originalDistance) * 100;

  return {
    originalOrder: points,
    optimizedOrder: optimizedRoute,
    originalDistance: parseFloat(originalDistance.toFixed(2)),
    optimizedDistance: parseFloat(optimizedDistance.toFixed(2)),
    savings: parseFloat(savings.toFixed(2)),
    savingsPercentage: parseFloat(savingsPercentage.toFixed(2)),
    iterations,
  };
}

export default function AdminRoteirizacaoOtimizacao() {
  const [, navigate] = useLocation();
  const [points, setPoints] = useState<Point[]>([
    { id: '1', lat: -25.4284, lng: -49.2733, name: 'Ponto A', passengers: 5 },
    { id: '2', lat: -25.4350, lng: -49.2700, name: 'Ponto B', passengers: 3 },
    { id: '3', lat: -25.4200, lng: -49.2800, name: 'Ponto C', passengers: 4 },
    { id: '4', lat: -25.4100, lng: -49.2650, name: 'Ponto D', passengers: 2 },
  ]);
  const [result, setResult] = useState<RouteOptimizationResult | null>(null);
  const [loading, setLoading] = useState(false);

  const handleOptimize = () => {
    setLoading(true);
    setTimeout(() => {
      const optimizationResult = optimizeRoute(points);
      setResult(optimizationResult);
      toast.success('Rota otimizada com sucesso!');
      setLoading(false);
    }, 500);
  };

  const handleApplyOptimization = () => {
    if (result) {
      setPoints(result.optimizedOrder);
      toast.success('Rota otimizada aplicada!');
    }
  };

  // Calcular bounds do mapa
  const bounds = points.length > 0
    ? [
        [Math.min(...points.map(p => p.lat)), Math.min(...points.map(p => p.lng))],
        [Math.max(...points.map(p => p.lat)), Math.max(...points.map(p => p.lng))],
      ]
    : [[-25.5, -49.3], [-25.4, -49.2]];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate('/admin/roteirizacao')}
            className="rounded-full"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Otimização de Rota</h1>
            <p className="text-slate-600">Reordene pontos para minimizar distância total</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Mapa */}
          <div className="lg:col-span-2">
            <Card className="h-full">
              <CardHeader>
                <CardTitle>Visualização da Rota</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[500px] rounded-lg overflow-hidden border border-slate-200">
                  <MapContainer
                    center={[-25.4284, -49.2733]}
                    zoom={13}
                    style={{ height: '100%', width: '100%' }}
                  >
                    <TileLayer
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      attribution='&copy; OpenStreetMap contributors'
                    />
                    
                    {/* Rota Original */}
                    {points.length > 1 && (
                      <Polyline
                        positions={points.map(p => [p.lat, p.lng])}
                        color="#ef4444"
                        weight={2}
                        opacity={0.7}
                        dashArray="5, 5"
                      />
                    )}

                    {/* Rota Otimizada */}
                    {result && result.optimizedOrder.length > 1 && (
                      <Polyline
                        positions={result.optimizedOrder.map(p => [p.lat, p.lng])}
                        color="#22c55e"
                        weight={3}
                        opacity={0.8}
                      />
                    )}

                    {/* Marcadores */}
                    {(result ? result.optimizedOrder : points).map((point, index) => (
                      <Marker
                        key={point.id}
                        position={[point.lat, point.lng]}
                        icon={L.icon({
                          iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${
                            index === 0 ? 'green' : index === (result ? result.optimizedOrder.length - 1 : points.length - 1) ? 'red' : 'blue'
                          }.png`,
                          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
                          iconSize: [25, 41],
                          iconAnchor: [12, 41],
                          popupAnchor: [1, -34],
                          shadowSize: [41, 41],
                        })}
                      >
                        <Popup>
                          <div className="text-sm">
                            <p className="font-bold">{point.name}</p>
                            <p>Passageiros: {point.passengers}</p>
                            <p>Ordem: {index + 1}</p>
                          </div>
                        </Popup>
                      </Marker>
                    ))}
                  </MapContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Resultados */}
          <div className="space-y-6">
            {/* KPIs */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Comparação</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <p className="text-sm text-slate-600">Distância Original</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {result ? result.originalDistance : calculateTotalDistance(points)} km
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-slate-600">Distância Otimizada</p>
                  <p className="text-2xl font-bold text-green-600">
                    {result ? result.optimizedDistance : '—'} km
                  </p>
                </div>
                {result && (
                  <>
                    <div className="border-t pt-4 space-y-2">
                      <div className="flex items-center gap-2">
                        <TrendingDown className="w-4 h-4 text-green-600" />
                        <span className="text-sm text-slate-600">Economia</span>
                      </div>
                      <p className="text-2xl font-bold text-green-600">
                        {result.savings} km ({result.savingsPercentage}%)
                      </p>
                    </div>
                    <div className="border-t pt-4 space-y-2">
                      <div className="flex items-center gap-2">
                        <Zap className="w-4 h-4 text-blue-600" />
                        <span className="text-sm text-slate-600">Iterações</span>
                      </div>
                      <p className="text-lg font-bold text-slate-900">{result.iterations}</p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Estimativas */}
            {result && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Estimativas</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="text-sm text-slate-600">Tempo economizado</p>
                      <p className="font-bold text-slate-900">
                        {Math.round((result.savings / 60) * 60)} min
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Fuel className="w-5 h-5 text-orange-600" />
                    <div>
                      <p className="text-sm text-slate-600">Combustível economizado</p>
                      <p className="font-bold text-slate-900">
                        {(result.savings * 0.08).toFixed(2)} L
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Botões */}
            <div className="space-y-2">
              <Button
                onClick={handleOptimize}
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                {loading ? 'Otimizando...' : 'Otimizar Rota'}
              </Button>
              {result && (
                <Button
                  onClick={handleApplyOptimization}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  Aplicar Otimização
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
