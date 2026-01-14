import * as math from 'mathjs';

interface Ponto {
  id: string;
  lat: number;
  lng: number;
}

interface Cromossomo {
  rota: number[];
  distancia: number;
  fitness: number;
}

/**
 * Calcular distância entre dois pontos (Haversine)
 */
function calcularDistancia(p1: Ponto, p2: Ponto): number {
  const R = 6371; // Raio da Terra em km
  const dLat = ((p2.lat - p1.lat) * Math.PI) / 180;
  const dLng = ((p2.lng - p1.lng) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((p1.lat * Math.PI) / 180) *
      Math.cos((p2.lat * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Calcular distância total de uma rota
 */
function calcularDistanciaRota(rota: number[], pontos: Ponto[]): number {
  let distancia = 0;
  for (let i = 0; i < rota.length - 1; i++) {
    distancia += calcularDistancia(pontos[rota[i]], pontos[rota[i + 1]]);
  }
  return distancia;
}

/**
 * Gerar população inicial aleatória
 */
function gerarPopulacaoInicial(tamanho: number, numPontos: number): number[][] {
  const populacao: number[][] = [];
  for (let i = 0; i < tamanho; i++) {
    const rota = Array.from({ length: numPontos }, (_, i) => i);
    // Fisher-Yates shuffle
    for (let j = rota.length - 1; j > 0; j--) {
      const k = Math.floor(Math.random() * (j + 1));
      [rota[j], rota[k]] = [rota[k], rota[j]];
    }
    populacao.push(rota);
  }
  return populacao;
}

/**
 * Calcular fitness (inverso da distância)
 */
function calcularFitness(rota: number[], pontos: Ponto[]): number {
  const distancia = calcularDistanciaRota(rota, pontos);
  return 1 / (distancia + 1); // +1 para evitar divisão por zero
}

/**
 * Seleção por torneio
 */
function selecaoTorneio(populacao: number[][], fitness: number[], tamanhoTorneio: number = 3): number[] {
  let melhor = Math.floor(Math.random() * populacao.length);
  for (let i = 1; i < tamanhoTorneio; i++) {
    const candidato = Math.floor(Math.random() * populacao.length);
    if (fitness[candidato] > fitness[melhor]) {
      melhor = candidato;
    }
  }
  return populacao[melhor];
}

/**
 * Cruzamento OX (Order Crossover)
 */
function cruzamentoOX(pai1: number[], pai2: number[]): number[] {
  const tamanho = pai1.length;
  const ponto1 = Math.floor(Math.random() * tamanho);
  const ponto2 = Math.floor(Math.random() * tamanho);
  const inicio = Math.min(ponto1, ponto2);
  const fim = Math.max(ponto1, ponto2);

  const filho: number[] = new Array(tamanho).fill(-1);

  // Copiar segmento do pai1
  for (let i = inicio; i <= fim; i++) {
    filho[i] = pai1[i];
  }

  // Preencher com genes do pai2
  let posicaoFilho = (fim + 1) % tamanho;
  let posicaoPai2 = (fim + 1) % tamanho;

  while (posicaoFilho !== inicio) {
    const gene = pai2[posicaoPai2];
    if (!filho.includes(gene)) {
      filho[posicaoFilho] = gene;
      posicaoFilho = (posicaoFilho + 1) % tamanho;
    }
    posicaoPai2 = (posicaoPai2 + 1) % tamanho;
  }

  return filho;
}

/**
 * Mutação por inversão
 */
function mutacaoInversao(rota: number[], taxaMutacao: number = 0.02): number[] {
  const novaRota = [...rota];
  if (Math.random() < taxaMutacao) {
    const i = Math.floor(Math.random() * novaRota.length);
    const j = Math.floor(Math.random() * novaRota.length);
    [novaRota[i], novaRota[j]] = [novaRota[j], novaRota[i]];
  }
  return novaRota;
}

/**
 * Otimizar rota usando Algoritmo Genético
 */
export function otimizarRotaGenetico(
  pontos: Ponto[],
  opcoes: {
    tamanhoPopulacao?: number;
    geracoes?: number;
    taxaMutacao?: number;
    elitismo?: number;
  } = {}
): {
  rota: number[];
  distancia: number;
  economia: number;
  geracoes: number;
} {
  const {
    tamanhoPopulacao = 100,
    geracoes = 500,
    taxaMutacao = 0.02,
    elitismo = 10
  } = opcoes;

  // Rota sequencial (baseline)
  const rotaSequencial = Array.from({ length: pontos.length }, (_, i) => i);
  const distanciaSequencial = calcularDistanciaRota(rotaSequencial, pontos);

  // Gerar população inicial
  let populacao = gerarPopulacaoInicial(tamanhoPopulacao, pontos.length);
  let melhorRota = [...rotaSequencial];
  let melhorFitness = calcularFitness(melhorRota, pontos);

  for (let gen = 0; gen < geracoes; gen++) {
    // Calcular fitness
    const fitness = populacao.map(rota => calcularFitness(rota, pontos));

    // Encontrar melhor
    const indiceMelhor = fitness.indexOf(Math.max(...fitness));
    if (fitness[indiceMelhor] > melhorFitness) {
      melhorFitness = fitness[indiceMelhor];
      melhorRota = [...populacao[indiceMelhor]];
    }

    // Criar nova população
    const novaPopulacao: number[][] = [];

    // Elitismo
    for (let i = 0; i < elitismo; i++) {
      const indice = fitness.indexOf(Math.max(...fitness));
      novaPopulacao.push([...populacao[indice]]);
      fitness[indice] = -1; // Marcar como usado
    }

    // Preencher resto da população
    while (novaPopulacao.length < tamanhoPopulacao) {
      const pai1 = selecaoTorneio(populacao, fitness);
      const pai2 = selecaoTorneio(populacao, fitness);
      let filho = cruzamentoOX(pai1, pai2);
      filho = mutacaoInversao(filho, taxaMutacao);
      novaPopulacao.push(filho);
    }

    populacao = novaPopulacao;
  }

  const distanciaOtimizada = calcularDistanciaRota(melhorRota, pontos);
  const economia = distanciaSequencial - distanciaOtimizada;

  return {
    rota: melhorRota,
    distancia: distanciaOtimizada,
    economia,
    geracoes
  };
}

/**
 * Comparar algoritmos
 */
export function compararAlgoritmos(pontos: Ponto[]): {
  sequencial: { distancia: number };
  nearestNeighbor: { distancia: number; economia: number; percentual: number };
  genetico: { distancia: number; economia: number; percentual: number };
} {
  // Rota sequencial
  const rotaSequencial = Array.from({ length: pontos.length }, (_, i) => i);
  const distanciaSequencial = calcularDistanciaRota(rotaSequencial, pontos);

  // Nearest Neighbor
  const rotaNN = nearestNeighbor(pontos);
  const distanciaNN = calcularDistanciaRota(rotaNN, pontos);
  const economiaNN = distanciaSequencial - distanciaNN;

  // Genético
  const resultadoGenetico = otimizarRotaGenetico(pontos, {
    tamanhoPopulacao: 150,
    geracoes: 1000
  });

  return {
    sequencial: {
      distancia: distanciaSequencial
    },
    nearestNeighbor: {
      distancia: distanciaNN,
      economia: economiaNN,
      percentual: (economiaNN / distanciaSequencial) * 100
    },
    genetico: {
      distancia: resultadoGenetico.distancia,
      economia: resultadoGenetico.economia,
      percentual: (resultadoGenetico.economia / distanciaSequencial) * 100
    }
  };
}

/**
 * Nearest Neighbor (para comparação)
 */
function nearestNeighbor(pontos: Ponto[]): number[] {
  const visitados = new Set<number>();
  const rota: number[] = [0];
  visitados.add(0);

  while (visitados.size < pontos.length) {
    const atual = rota[rota.length - 1];
    let proximoMaisProximo = -1;
    let menorDistancia = Infinity;

    for (let i = 0; i < pontos.length; i++) {
      if (!visitados.has(i)) {
        const distancia = calcularDistancia(pontos[atual], pontos[i]);
        if (distancia < menorDistancia) {
          menorDistancia = distancia;
          proximoMaisProximo = i;
        }
      }
    }

    if (proximoMaisProximo !== -1) {
      rota.push(proximoMaisProximo);
      visitados.add(proximoMaisProximo);
    }
  }

  return rota;
}
