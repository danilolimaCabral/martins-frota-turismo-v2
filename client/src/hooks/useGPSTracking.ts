/**
 * Hook React para rastreamento GPS em tempo real via WebSocket
 */

import { useEffect, useState, useCallback, useRef } from 'react';
import { useAuth } from './useAuth';
import { io, Socket } from 'socket.io-client';

export interface VehicleLocationUpdate {
  vehicleId: string;
  latitude: number;
  longitude: number;
  speed: number;
  heading: number;
  status: 'moving' | 'stopped' | 'idle' | 'offline';
  timestamp: Date;
  fuelLevel?: number;
  temperature?: number;
  odometer?: number;
}

export interface GPSAlertUpdate {
  id: string;
  vehicleId: string;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: Date;
  acknowledged: boolean;
}

interface UseGPSTrackingReturn {
  locations: Map<string, VehicleLocationUpdate>;
  alerts: GPSAlertUpdate[];
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
  subscribe: (userId: string) => void;
  unsubscribe: (userId: string) => void;
  clearAlerts: () => void;
}

export function useGPSTracking(): UseGPSTrackingReturn {
  const { user } = useAuth();
  const [locations, setLocations] = useState<Map<string, VehicleLocationUpdate>>(new Map());
  const [alerts, setAlerts] = useState<GPSAlertUpdate[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const subscriptionRef = useRef<string | null>(null);

  // Conectar ao WebSocket
  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    try {
      const socket = io(window.location.origin, {
        path: '/socket.io',
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: 5,
      });

      socketRef.current = socket;

      socket.on('connect', () => {
        console.log('[GPS] Conectado ao servidor');
        setIsConnected(true);
        setError(null);

        // Inscrever para atualizações
        if (subscriptionRef.current) {
          socket.emit('gps:subscribe', subscriptionRef.current);
        }
      });

      socket.on('disconnect', () => {
        console.log('[GPS] Desconectado do servidor');
        setIsConnected(false);
      });

      socket.on('gps:subscribed', (data) => {
        console.log('[GPS]', data.message);
        setIsLoading(false);
      });

      // Receber localizações atuais
      socket.on('gps:current-locations', (data) => {
        const newLocations = new Map<string, VehicleLocationUpdate>();
        for (const location of data.locations) {
          newLocations.set(location.vehicleId, {
            ...location,
            timestamp: new Date(location.timestamp),
          });
        }
        setLocations(newLocations);
      });

      // Receber atualização de localização
      socket.on('gps:location-update', (location) => {
        setLocations((prev) => {
          const updated = new Map(prev);
          updated.set(location.vehicleId, {
            ...location,
            timestamp: new Date(location.timestamp),
          });
          return updated;
        });
      });

      // Receber alerta
      socket.on('gps:alert', (alert) => {
        setAlerts((prev) => [
          {
            ...alert,
            timestamp: new Date(alert.timestamp),
          },
          ...prev,
        ]);
      });

      socket.on('error', (error) => {
        console.error('[GPS] Erro de socket:', error);
        setError(error.message || 'Erro de conexão');
      });

      return () => {
        socket.disconnect();
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro desconhecido';
      console.error('[GPS] Erro ao conectar:', message);
      setError(message);
      setIsLoading(false);
    }
  }, [user]);

  // Inscrever para atualizações
  const subscribe = useCallback((userId: string) => {
    subscriptionRef.current = userId;
    if (socketRef.current?.connected) {
      socketRef.current.emit('gps:subscribe', userId);
    }
  }, []);

  // Desinscrever de atualizações
  const unsubscribe = useCallback((userId: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('gps:unsubscribe', userId);
    }
    subscriptionRef.current = null;
  }, []);

  // Limpar alertas
  const clearAlerts = useCallback(() => {
    setAlerts([]);
  }, []);

  return {
    locations,
    alerts,
    isConnected,
    isLoading,
    error,
    subscribe,
    unsubscribe,
    clearAlerts,
  };
}

/**
 * Hook para obter localização de um veículo específico
 */
export function useVehicleLocation(vehicleId: string | null) {
  const { locations } = useGPSTracking();
  const [location, setLocation] = useState<VehicleLocationUpdate | null>(null);

  useEffect(() => {
    if (vehicleId) {
      setLocation(locations.get(vehicleId) || null);
    }
  }, [vehicleId, locations]);

  return location;
}

/**
 * Hook para obter alertas de um veículo específico
 */
export function useVehicleAlerts(vehicleId: string | null) {
  const { alerts } = useGPSTracking();
  const [vehicleAlerts, setVehicleAlerts] = useState<GPSAlertUpdate[]>([]);

  useEffect(() => {
    if (vehicleId) {
      setVehicleAlerts(alerts.filter((alert) => alert.vehicleId === vehicleId));
    }
  }, [vehicleId, alerts]);

  return vehicleAlerts;
}
