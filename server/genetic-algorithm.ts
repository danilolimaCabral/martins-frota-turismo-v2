/**
 * Genetic Algorithm para Otimização de Rotas
 * Ideal para problemas com 50+ pontos de embarque
 * Usa crossover, mutação e seleção natural para encontrar soluções ótimas
 */

interface RoutePoint {
  id: number;
  lat: number;
  lng: number;
  name: string;
}

interface GeneticAlgorithmConfig {
  populationSize: number; // Tamanho da população
  generations: number; // Número de gerações
  mutationRate: number; // Taxa de mutação (0-1)
  elitismRate: number; // Percentual de melhores indivíduos mantidos
  crossoverType: "order" | "pmx"; // Tipo de crossover
}

/**
 * Calcula distância Haversine entre dois pontos
 */
function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
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
function calculateRouteTotalDistance(route: number[], points: RoutePoint[]): number {
  let totalDistance = 0;
  for (let i = 0; i < route.length - 1; i++) {
    const point1 = points[route[i]];
    const point2 = points[route[i + 1]];
    totalDistance += calculateDistance(point1.lat, point1.lng, point2.lat, point2.lng);
  }
  // Retornar ao ponto de partida
  const lastPoint = points[route[route.length - 1]];
  const firstPoint = points[route[0]];
  totalDistance += calculateDistance(lastPoint.lat, lastPoint.lng, firstPoint.lat, firstPoint.lng);
  return totalDistance;
}

/**
 * Cria população inicial aleatória
 */
function createInitialPopulation(
  populationSize: number,
  routeLength: number
): number[][] {
  const population: number[][] = [];
  for (let i = 0; i < populationSize; i++) {
    const route = Array.from({ length: routeLength }, (_, i) => i);
    // Shuffle usando Fisher-Yates
    for (let j = route.length - 1; j > 0; j--) {
      const k = Math.floor(Math.random() * (j + 1));
      [route[j], route[k]] = [route[k], route[j]];
    }
    population.push(route);
  }
  return population;
}

/**
 * Calcula fitness (quanto menor a distância, melhor o fitness)
 */
function calculateFitness(route: number[], points: RoutePoint[]): number {
  const distance = calculateRouteTotalDistance(route, points);
  return 1 / (1 + distance); // Inverter para que maior fitness = melhor solução
}

/**
 * Seleção por torneio
 */
function tournamentSelection(
  population: number[][],
  fitness: number[],
  tournamentSize: number = 3
): number[] {
  let bestIdx = Math.floor(Math.random() * population.length);
  let bestFitness = fitness[bestIdx];

  for (let i = 1; i < tournamentSize; i++) {
    const idx = Math.floor(Math.random() * population.length);
    if (fitness[idx] > bestFitness) {
      bestFitness = fitness[idx];
      bestIdx = idx;
    }
  }

  return population[bestIdx];
}

/**
 * Crossover PMX (Partially Mapped Crossover)
 */
function pmxCrossover(parent1: number[], parent2: number[]): number[] {
  const n = parent1.length;
  const child = Array(n).fill(-1);

  // Selecionar dois pontos de corte
  const point1 = Math.floor(Math.random() * n);
  const point2 = Math.floor(Math.random() * n);
  const start = Math.min(point1, point2);
  const end = Math.max(point1, point2);

  // Copiar segmento de parent1
  for (let i = start; i <= end; i++) {
    child[i] = parent1[i];
  }

  // Preencher resto do child com parent2
  for (let i = 0; i < n; i++) {
    if (i >= start && i <= end) continue;

    let value = parent2[i];
    while (child.includes(value)) {
      const idx = parent2.indexOf(value);
      value = parent1[idx];
    }
    child[i] = value;
  }

  return child;
}

/**
 * Crossover OX (Order Crossover)
 */
function oxCrossover(parent1: number[], parent2: number[]): number[] {
  const n = parent1.length;
  const child = Array(n).fill(-1);

  // Selecionar dois pontos de corte
  const point1 = Math.floor(Math.random() * n);
  const point2 = Math.floor(Math.random() * n);
  const start = Math.min(point1, point2);
  const end = Math.max(point1, point2);

  // Copiar segmento de parent1
  for (let i = start; i <= end; i++) {
    child[i] = parent1[i];
  }

  // Preencher resto mantendo ordem de parent2
  let childIdx = (end + 1) % n;
  let parent2Idx = (end + 1) % n;

  while (childIdx !== start) {
    if (!child.includes(parent2[parent2Idx])) {
      child[childIdx] = parent2[parent2Idx];
      childIdx = (childIdx + 1) % n;
    }
    parent2Idx = (parent2Idx + 1) % n;
  }

  return child;
}

/**
 * Mutação por inversão (2-opt)
 */
function inverseMutation(route: number[]): number[] {
  const mutated = [...route];
  const i = Math.floor(Math.random() * mutated.length);
  const j = Math.floor(Math.random() * mutated.length);
  const start = Math.min(i, j);
  const end = Math.max(i, j);

  // Inverter segmento
  for (let k = start; k < start + Math.floor((end - start) / 2); k++) {
    [mutated[k], mutated[end - (k - start)]] = [mutated[end - (k - start)], mutated[k]];
  }

  return mutated;
}

/**
 * Algoritmo Genético Principal
 */
export function optimizeRouteWithGA(
  points: RoutePoint[],
  config: Partial<GeneticAlgorithmConfig> = {}
): {
  bestRoute: number[];
  bestDistance: number;
  generations: number;
  improvementHistory: number[];
} {
  // Configuração padrão
  const finalConfig: GeneticAlgorithmConfig = {
    populationSize: Math.max(50, Math.min(200, points.length * 2)),
    generations: Math.max(100, Math.min(500, points.length * 5)),
    mutationRate: 0.1,
    elitismRate: 0.1,
    crossoverType: "pmx",
    ...config,
  };

  // Inicializar população
  let population = createInitialPopulation(finalConfig.populationSize, points.length);
  let bestRoute = population[0];
  let bestDistance = calculateRouteTotalDistance(bestRoute, points);
  const improvementHistory: number[] = [bestDistance];

  // Evolução
  for (let gen = 0; gen < finalConfig.generations; gen++) {
    // Calcular fitness
    const fitness = population.map((route) => calculateFitness(route, points));

    // Encontrar melhor indivíduo
    const maxFitnessIdx = fitness.indexOf(Math.max(...fitness));
    const currentBestRoute = population[maxFitnessIdx];
    const currentBestDistance = calculateRouteTotalDistance(currentBestRoute, points);

    if (currentBestDistance < bestDistance) {
      bestDistance = currentBestDistance;
      bestRoute = currentBestRoute;
    }

    improvementHistory.push(bestDistance);

    // Elitismo - manter melhores indivíduos
    const eliteCount = Math.ceil(finalConfig.populationSize * finalConfig.elitismRate);
    const sortedIndices = Array.from({ length: population.length }, (_, i) => i).sort(
      (a, b) => fitness[b] - fitness[a]
    );
    const elite = sortedIndices.slice(0, eliteCount).map((i) => population[i]);

    // Criar nova população
    const newPopulation: number[][] = [...elite];

    while (newPopulation.length < finalConfig.populationSize) {
      // Seleção
      const parent1 = tournamentSelection(population, fitness);
      const parent2 = tournamentSelection(population, fitness);

      // Crossover
      let child =
        finalConfig.crossoverType === "pmx"
          ? pmxCrossover(parent1, parent2)
          : oxCrossover(parent1, parent2);

      // Mutação
      if (Math.random() < finalConfig.mutationRate) {
        child = inverseMutation(child);
      }

      newPopulation.push(child);
    }

    population = newPopulation.slice(0, finalConfig.populationSize);
  }

  return {
    bestRoute,
    bestDistance,
    generations: finalConfig.generations,
    improvementHistory,
  };
}

/**
 * Comparar diferentes algoritmos
 */
export function compareOptimizationAlgorithms(
  points: RoutePoint[]
): {
  nearestNeighbor: { distance: number; time: number };
  twoOpt: { distance: number; time: number };
  geneticAlgorithm: { distance: number; time: number };
} {
  const results = {
    nearestNeighbor: { distance: 0, time: 0 },
    twoOpt: { distance: 0, time: 0 },
    geneticAlgorithm: { distance: 0, time: 0 },
  };

  // Nearest Neighbor
  let start = Date.now();
  const nnRoute = nearestNeighborRoute(points);
  results.nearestNeighbor.distance = calculateRouteTotalDistance(nnRoute, points);
  results.nearestNeighbor.time = Date.now() - start;

  // 2-opt (simplificado)
  start = Date.now();
  let twoOptRoute = [...nnRoute];
  for (let i = 0; i < 10; i++) {
    twoOptRoute = inverseMutation(twoOptRoute);
  }
  results.twoOpt.distance = calculateRouteTotalDistance(twoOptRoute, points);
  results.twoOpt.time = Date.now() - start;

  // Genetic Algorithm
  start = Date.now();
  const gaResult = optimizeRouteWithGA(points, {
    populationSize: 100,
    generations: 200,
  });
  results.geneticAlgorithm.distance = gaResult.bestDistance;
  results.geneticAlgorithm.time = Date.now() - start;

  return results;
}

/**
 * Nearest Neighbor simples
 */
function nearestNeighborRoute(points: RoutePoint[]): number[] {
  const route = [0];
  const visited = new Set([0]);

  while (visited.size < points.length) {
    const current = route[route.length - 1];
    let nearest = -1;
    let minDistance = Infinity;

    for (let i = 0; i < points.length; i++) {
      if (!visited.has(i)) {
        const dist = calculateDistance(
          points[current].lat,
          points[current].lng,
          points[i].lat,
          points[i].lng
        );
        if (dist < minDistance) {
          minDistance = dist;
          nearest = i;
        }
      }
    }

    route.push(nearest);
    visited.add(nearest);
  }

  return route;
}
