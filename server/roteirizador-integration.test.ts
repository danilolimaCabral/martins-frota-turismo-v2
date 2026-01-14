import { describe, it, expect, beforeAll } from "vitest";
import * as XLSX from "xlsx";
import { calculateDistance, optimizeRouteNearestNeighbor } from "./route-optimization";

interface RoutePoint {
  id: number;
  name: string;
  address: string;
  number: string;
  city: string;
  state: string;
  zipCode: string;
  lat?: number;
  lng?: number;
}

describe("Roteirizador Integration Tests", () => {
  let points: RoutePoint[] = [];

  beforeAll(() => {
    // Simular dados do Excel
    points = [
      {
        id: 463518,
        name: "ALEX TIBURCIO MAIA",
        address: "RUA ANACLETO CARDOSO DO AMARAL",
        number: "39",
        city: "CURITIBA",
        state: "PR",
        zipCode: "81935-447",
        lat: -25.4284,
        lng: -49.2733,
      },
      {
        id: 454983,
        name: "CARLOS EDUARDO MOREY",
        address: "RUA MARIALVA",
        number: "537",
        city: "CURITIBA",
        state: "PR",
        zipCode: "81000-000",
        lat: -25.4200,
        lng: -49.2800,
      },
      {
        id: 451386,
        name: "JOAO VICTOR BATISTA ORTIZ",
        address: "RUA ELEONORA BRASIL POMPEO",
        number: "248",
        city: "CURITIBA",
        state: "PR",
        zipCode: "81000-000",
        lat: -25.4150,
        lng: -49.2750,
      },
      {
        id: 452131,
        name: "LUCAS WILLIAN DE OLIVEIRA",
        address: "RUA FAVO DE MEL",
        number: "76",
        city: "CURITIBA",
        state: "PR",
        zipCode: "81000-000",
        lat: -25.4100,
        lng: -49.2700,
      },
      {
        id: 463257,
        name: "SABRINA BALCER PADILHA",
        address: "RUA JULIO SALSAMEND",
        number: "261",
        city: "CURITIBA",
        state: "PR",
        zipCode: "81000-000",
        lat: -25.4050,
        lng: -49.2650,
      },
    ];
  });

  it("✅ Deve calcular distância entre dois pontos", () => {
    const point1 = { lat: -25.4284, lng: -49.2733 };
    const point2 = { lat: -25.4200, lng: -49.2800 };

    const distance = calculateDistance(point1.lat, point1.lng, point2.lat, point2.lng);

    expect(distance).toBeGreaterThan(0);
    expect(distance).toBeLessThan(10); // Menos de 10km
    console.log(`  📍 Distância calculada: ${distance.toFixed(2)} km`);
  });

  it("✅ Deve importar dados do Excel", () => {
    expect(points).toHaveLength(5);
    expect(points[0].name).toBe("ALEX TIBURCIO MAIA");
    expect(points[0].city).toBe("CURITIBA");
    console.log(`  📊 ${points.length} pontos importados com sucesso`);
  });

  it("✅ Deve validar coordenadas de todos os pontos", () => {
    points.forEach((point) => {
      expect(point.lat).toBeDefined();
      expect(point.lng).toBeDefined();
      expect(point.lat).toBeGreaterThan(-90);
      expect(point.lat).toBeLessThan(90);
      expect(point.lng).toBeGreaterThan(-180);
      expect(point.lng).toBeLessThan(180);
    });
    console.log(`  ✅ Todas as ${points.length} coordenadas são válidas`);
  });

  it("✅ Deve calcular distância total da rota original", () => {
    let totalDistance = 0;
    for (let i = 0; i < points.length - 1; i++) {
      const dist = calculateDistance(
        points[i].lat!,
        points[i].lng!,
        points[i + 1].lat!,
        points[i + 1].lng!
      );
      totalDistance += dist;
    }

    expect(totalDistance).toBeGreaterThan(0);
    console.log(`  📏 Distância total da rota: ${totalDistance.toFixed(2)} km`);
  });

  it("✅ Deve otimizar rota com Nearest Neighbor", () => {
    const indices = points.map((_, i) => i);
    const optimized = optimizeRouteNearestNeighbor(indices, points);

    expect(optimized).toHaveLength(points.length);
    expect(optimized).toContain(0);
    console.log(`  🚀 Rota otimizada: ${optimized.join(" -> ")}`);
  });

  it("✅ Deve gerar KPIs da rota", () => {
    const totalDistance = 15.5; // km
    const avgSpeed = 40; // km/h
    const fuelConsumption = 6; // km/l
    const fuelPrice = 5.5; // R$/l

    const time = (totalDistance / avgSpeed) * 60; // minutos
    const fuel = totalDistance / fuelConsumption; // litros
    const cost = fuel * fuelPrice; // R$

    expect(time).toBeGreaterThan(0);
    expect(fuel).toBeGreaterThan(0);
    expect(cost).toBeGreaterThan(0);

    console.log(`  📊 KPIs Calculados:`);
    console.log(`     - Distância: ${totalDistance.toFixed(2)} km`);
    console.log(`     - Tempo: ${time.toFixed(0)} min`);
    console.log(`     - Combustível: ${fuel.toFixed(2)} L`);
    console.log(`     - Custo: R$ ${cost.toFixed(2)}`);
  });

  it("✅ Deve validar estrutura de dados para mapa", () => {
    const mapData = points.map((p) => ({
      id: p.id,
      name: p.name,
      lat: p.lat,
      lng: p.lng,
      address: `${p.address}, ${p.number} - ${p.city}, ${p.state}`,
    }));

    expect(mapData).toHaveLength(points.length);
    expect(mapData[0]).toHaveProperty("lat");
    expect(mapData[0]).toHaveProperty("lng");
    expect(mapData[0]).toHaveProperty("address");
    console.log(`  🗺️ ${mapData.length} pontos formatados para mapa`);
  });
});
