import { Server as HTTPServer } from "http";
import { Server as SocketIOServer, Socket } from "socket.io";
import { db } from "./db";
import { vehicles } from "../drizzle/schema";
import { eq } from "drizzle-orm";

interface VehicleLocation {
  vehicleId: number;
  lat: number;
  lng: number;
  speed: number;
  heading: number;
  timestamp: number;
  km: number;
  fuelLevel: number;
}

interface RouteHistory {
  vehicleId: number;
  positions: VehicleLocation[];
}

// Armazenar histórico de rotas em memória (em produção, usar banco de dados)
const routeHistory: Map<number, VehicleLocation[]> = new Map();
const connectedVehicles: Map<number, Socket> = new Map();

export function setupWebSocket(httpServer: HTTPServer) {
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket: Socket) => {
    console.log(`[WebSocket] Cliente conectado: ${socket.id}`);

    // Cliente se registra como rastreador de um veículo
    socket.on("register_vehicle", (vehicleId: number) => {
      connectedVehicles.set(vehicleId, socket);
      console.log(`[WebSocket] Veículo ${vehicleId} registrado`);

      // Enviar histórico de rotas ao conectar
      const history = routeHistory.get(vehicleId) || [];
      socket.emit("route_history", {
        vehicleId,
        positions: history.slice(-100), // Últimas 100 posições
      });
    });

    // Receber atualização de posição do veículo
    socket.on("update_location", async (data: VehicleLocation) => {
      const { vehicleId, lat, lng, speed, heading, km, fuelLevel } = data;

      // Adicionar ao histórico
      if (!routeHistory.has(vehicleId)) {
        routeHistory.set(vehicleId, []);
      }
      routeHistory.get(vehicleId)!.push({
        vehicleId,
        lat,
        lng,
        speed,
        heading,
        timestamp: Date.now(),
        km,
        fuelLevel,
      });

      // Manter apenas últimas 1000 posições
      const history = routeHistory.get(vehicleId)!;
      if (history.length > 1000) {
        history.shift();
      }

      // Broadcast para todos os clientes conectados
      io.emit("vehicle_location_update", {
        vehicleId,
        lat,
        lng,
        speed,
        heading,
        timestamp: Date.now(),
        km,
        fuelLevel,
      });

      // Verificar alertas
      checkAlerts(vehicleId, { lat, lng, speed, fuelLevel });
    });

    // Solicitar atualização de posição em tempo real
    socket.on("request_live_update", (vehicleId: number) => {
      // Simular atualização de posição (em produção, viria de GPS real)
      const mockLocation = generateMockLocation(vehicleId);
      socket.emit("live_update", mockLocation);
    });

    // Obter histórico de rota
    socket.on("get_route_history", (vehicleId: number) => {
      const history = routeHistory.get(vehicleId) || [];
      socket.emit("route_history", {
        vehicleId,
        positions: history,
      });
    });

    // Limpar histórico
    socket.on("clear_history", (vehicleId: number) => {
      routeHistory.delete(vehicleId);
      socket.emit("history_cleared", { vehicleId });
    });

    // Desconexão
    socket.on("disconnect", () => {
      console.log(`[WebSocket] Cliente desconectado: ${socket.id}`);
      // Remover veículo conectado
      connectedVehicles.forEach((vehicleSocket, vehicleId) => {
        if (vehicleSocket.id === socket.id) {
          connectedVehicles.delete(vehicleId);
        }
      });
    });

    socket.on("error", (error) => {
      console.error(`[WebSocket] Erro: ${error}`);
    });
  });

  return io;
}

// Gerar localização simulada para teste
function generateMockLocation(vehicleId: number): VehicleLocation {
  const baseLatitude = -23.5505;
  const baseLongitude = -46.6333;

  return {
    vehicleId,
    lat: baseLatitude + (Math.random() - 0.5) * 0.1,
    lng: baseLongitude + (Math.random() - 0.5) * 0.1,
    speed: Math.floor(Math.random() * 100),
    heading: Math.floor(Math.random() * 360),
    timestamp: Date.now(),
    km: Math.floor(Math.random() * 50000),
    fuelLevel: Math.random() * 100,
  };
}

// Verificar alertas de desvio de rota
function checkAlerts(vehicleId: number, location: { lat: number; lng: number; speed: number; fuelLevel: number }) {
  const alerts: string[] = [];

  // Alerta de velocidade
  if (location.speed > 120) {
    alerts.push(`Velocidade alta detectada: ${location.speed} km/h`);
  }

  // Alerta de combustível baixo
  if (location.fuelLevel < 20) {
    alerts.push(`Combustível baixo: ${location.fuelLevel.toFixed(1)}%`);
  }

  // Alerta de desvio de rota (simulado)
  if (Math.random() > 0.95) {
    alerts.push("Desvio de rota detectado!");
  }

  if (alerts.length > 0) {
    // Emitir alertas
    console.log(`[Alertas] Veículo ${vehicleId}:`, alerts);
  }
}

// Função para simular atualizações periódicas de posição
export function startVehicleSimulation(io: SocketIOServer) {
  setInterval(() => {
    // Simular atualização de posição para cada veículo conectado
    connectedVehicles.forEach((_, vehicleId) => {
      const mockLocation = generateMockLocation(vehicleId);

      io.emit("vehicle_location_update", mockLocation);

      // Adicionar ao histórico
      if (!routeHistory.has(vehicleId)) {
        routeHistory.set(vehicleId, []);
      }
      routeHistory.get(vehicleId)!.push(mockLocation);

      // Manter apenas últimas 1000 posições
      const history = routeHistory.get(vehicleId)!;
      if (history.length > 1000) {
        history.shift();
      }
    })
  }, 5000); // Atualizar a cada 5 segundos
}
