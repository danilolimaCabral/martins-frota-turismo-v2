/**
 * Algoritmo de Otimização de Rota
 * Usa Nearest Neighbor + 2-opt Local Search
 */

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

/**
 * Calcula distância entre dois pontos usando Haversine
 */
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

/**
 * Calcula distância total de uma rota
 */
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

/**
 * Algoritmo Nearest Neighbor para encontrar uma boa solução inicial
 */
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

/**
 * Algoritmo 2-opt para melhorar a rota iterativamente
 */
function twoOpt(points: Point[], maxIterations: number = 1000): { route: Point[]; iterations: number } {
  let route = [...points];
  let improved = true;
  let iterations = 0;

  while (improved && iterations < maxIterations) {
    improved = false;
    iterations++;

    for (let i = 0; i < route.length - 2; i++) {
      for (let j = i + 2; j < route.length; j++) {
        // Calcula distância antes da troca
        const before =
          haversineDistance(route[i].lat, route[i].lng, route[i + 1].lat, route[i + 1].lng) +
          haversineDistance(route[j].lat, route[j].lng, route[(j + 1) % route.length].lat, route[(j + 1) % route.length].lng);

        // Calcula distância depois da troca
        const after =
          haversineDistance(route[i].lat, route[i].lng, route[j].lat, route[j].lng) +
          haversineDistance(route[i + 1].lat, route[i + 1].lng, route[(j + 1) % route.length].lat, route[(j + 1) % route.length].lng);

        // Se melhorou, faz a troca
        if (after < before) {
          // Inverte a ordem entre i+1 e j
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

/**
 * Função principal de otimização de rota
 */
export function optimizeRoute(points: Point[]): RouteOptimizationResult {
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

  // Calcula distância original
  const originalDistance = calculateTotalDistance(points);

  // Aplica Nearest Neighbor para encontrar solução inicial
  const initialRoute = nearestNeighbor(points);

  // Aplica 2-opt para melhorar
  const { route: optimizedRoute, iterations } = twoOpt(initialRoute);

  // Calcula distância otimizada
  const optimizedDistance = calculateTotalDistance(optimizedRoute);

  // Calcula economia
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

/**
 * Função para calcular distância entre dois pontos (para uso no frontend)
 */
export function getDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  return parseFloat(haversineDistance(lat1, lng1, lat2, lng2).toFixed(2));
}

/**
 * Função para calcular distância total de uma rota (para uso no frontend)
 */
export function getRouteTotalDistance(points: Point[]): number {
  return parseFloat(calculateTotalDistance(points).toFixed(2));
}

/**
 * Alias para calculateDistance (compatibilidade com testes)
 */
export function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  return getDistance(lat1, lng1, lat2, lng2);
}

/**
 * Otimização com Nearest Neighbor
 */
export function optimizeRouteNearestNeighbor(indices: number[], points: any[]): number[] {
  const visited = new Set<number>();
  const route: number[] = [indices[0]];
  visited.add(indices[0]);

  while (visited.size < indices.length) {
    const current = route[route.length - 1];
    let nearest = -1;
    let minDistance = Infinity;

    for (const idx of indices) {
      if (!visited.has(idx)) {
        const dist = calculateDistance(
          points[current].lat,
          points[current].lng,
          points[idx].lat,
          points[idx].lng
        );
        if (dist < minDistance) {
          minDistance = dist;
          nearest = idx;
        }
      }
    }

    if (nearest !== -1) {
      route.push(nearest);
      visited.add(nearest);
    }
  }

  return route;
}
