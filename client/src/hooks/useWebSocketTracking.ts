import { useEffect, useRef, useState, useCallback } from "react";
import io, { Socket } from "socket.io-client";

export interface VehicleLocation {
  vehicleId: number;
  lat: number;
  lng: number;
  speed: number;
  heading: number;
  timestamp: number;
  km: number;
  fuelLevel: number;
}

export interface RouteHistory {
  vehicleId: number;
  positions: VehicleLocation[];
}

interface UseWebSocketTrackingOptions {
  vehicleId?: number;
  onLocationUpdate?: (location: VehicleLocation) => void;
  onRouteHistory?: (history: RouteHistory) => void;
  onAlert?: (alert: string) => void;
}

export function useWebSocketTracking(options: UseWebSocketTrackingOptions = {}) {
  const { vehicleId, onLocationUpdate, onRouteHistory, onAlert } = options;
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<VehicleLocation | null>(null);
  const [routeHistory, setRouteHistory] = useState<VehicleLocation[]>([]);
  const [alerts, setAlerts] = useState<string[]>([]);

  useEffect(() => {
    // Conectar ao servidor WebSocket
    const socket = io(window.location.origin, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("[WebSocket] Conectado ao servidor");
      setIsConnected(true);

      // Registrar veículo se fornecido
      if (vehicleId) {
        socket.emit("register_vehicle", vehicleId);
      }
    });

    socket.on("disconnect", () => {
      console.log("[WebSocket] Desconectado do servidor");
      setIsConnected(false);
    });

    // Receber atualização de localização
    socket.on("vehicle_location_update", (location: VehicleLocation) => {
      setCurrentLocation(location);
      onLocationUpdate?.(location);

      // Verificar alertas
      const newAlerts: string[] = [];
      if (location.speed > 120) {
        newAlerts.push(`⚠️ Velocidade alta: ${location.speed} km/h`);
      }
      if (location.fuelLevel < 20) {
        newAlerts.push(`⛽ Combustível baixo: ${location.fuelLevel.toFixed(1)}%`);
      }

      if (newAlerts.length > 0) {
        setAlerts(newAlerts);
        newAlerts.forEach((alert) => onAlert?.(alert));
      }
    });

    // Receber histórico de rota
    socket.on("route_history", (data: RouteHistory) => {
      setRouteHistory(data.positions);
      onRouteHistory?.(data);
    });

    // Receber atualização ao vivo
    socket.on("live_update", (location: VehicleLocation) => {
      setCurrentLocation(location);
      onLocationUpdate?.(location);
    });

    // Receber confirmação de limpeza de histórico
    socket.on("history_cleared", () => {
      setRouteHistory([]);
      console.log("[WebSocket] Histórico de rota limpo");
    });

    socket.on("error", (error) => {
      console.error("[WebSocket] Erro:", error);
    });

    return () => {
      socket.disconnect();
    };
  }, [vehicleId, onLocationUpdate, onRouteHistory, onAlert]);

  // Funções para interagir com o servidor
  const updateLocation = useCallback((location: VehicleLocation) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit("update_location", location);
    }
  }, []);

  const requestLiveUpdate = useCallback((id: number) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit("request_live_update", id);
    }
  }, []);

  const getRouteHistory = useCallback((id: number) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit("get_route_history", id);
    }
  }, []);

  const clearHistory = useCallback((id: number) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit("clear_history", id);
    }
  }, []);

  return {
    isConnected,
    currentLocation,
    routeHistory,
    alerts,
    updateLocation,
    requestLiveUpdate,
    getRouteHistory,
    clearHistory,
  };
}
