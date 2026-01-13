/**
 * Serviço de Socket.io para eventos de GPS em tempo real
 * Gerencia conexões WebSocket e broadcast de posições
 */

import { Server as SocketIOServer, Socket } from 'socket.io';
import { VehicleLocation, GPSAlert } from './types';
import { gpsSyncService } from './sync-service';

export class GPSSocketService {
  private io?: SocketIOServer;
  private connectedClients: Map<string, Set<string>> = new Map(); // userId -> Set<socketIds>
  private vehicleTracking: Map<string, VehicleLocation> = new Map(); // vehicleId -> lastLocation

  /**
   * Inicializar Socket.io
   */
  initialize(io: SocketIOServer) {
    this.io = io;

    io.on('connection', (socket: Socket) => {
      console.log(`[GPS] Cliente conectado: ${socket.id}`);

      // Registrar cliente
      socket.on('gps:subscribe', (userId: string) => {
        if (!this.connectedClients.has(userId)) {
          this.connectedClients.set(userId, new Set());
        }
        this.connectedClients.get(userId)!.add(socket.id);

        // Enviar posições atuais
        this.sendCurrentLocations(socket);

        socket.emit('gps:subscribed', {
          message: 'Inscrito em atualizações de GPS',
          timestamp: new Date(),
        });
      });

      // Unsubscribe
      socket.on('gps:unsubscribe', (userId: string) => {
        const userSockets = this.connectedClients.get(userId);
        if (userSockets) {
          userSockets.delete(socket.id);
          if (userSockets.size === 0) {
            this.connectedClients.delete(userId);
          }
        }
      });

      // Desconectar
      socket.on('disconnect', () => {
        console.log(`[GPS] Cliente desconectado: ${socket.id}`);
        // Limpar cliente de todas as listas
        for (const [userId, sockets] of this.connectedClients.entries()) {
          sockets.delete(socket.id);
          if (sockets.size === 0) {
            this.connectedClients.delete(userId);
          }
        }
      });

      // Erro
      socket.on('error', (error) => {
        console.error(`[GPS] Erro de socket ${socket.id}:`, error);
      });
    });
  }

  /**
   * Broadcast de atualização de localização
   */
  broadcastLocationUpdate(location: VehicleLocation) {
    if (!this.io) return;

    // Armazenar última localização
    this.vehicleTracking.set(location.vehicleId, location);

    // Broadcast para todos os clientes conectados
    this.io.emit('gps:location-update', {
      vehicleId: location.vehicleId,
      latitude: location.latitude,
      longitude: location.longitude,
      speed: location.speed,
      heading: location.heading,
      status: location.status,
      timestamp: location.timestamp,
      fuelLevel: location.fuelLevel,
      temperature: location.temperature,
      odometer: location.odometer,
    });
  }

  /**
   * Broadcast de múltiplas localizações
   */
  broadcastLocationUpdates(locations: VehicleLocation[]) {
    if (!this.io) return;

    for (const location of locations) {
      this.broadcastLocationUpdate(location);
    }
  }

  /**
   * Broadcast de alerta
   */
  broadcastAlert(alert: GPSAlert) {
    if (!this.io) return;

    this.io.emit('gps:alert', {
      id: alert.id,
      vehicleId: alert.vehicleId,
      type: alert.type,
      severity: alert.severity,
      message: alert.message,
      timestamp: alert.timestamp,
      acknowledged: alert.acknowledged,
    });
  }

  /**
   * Enviar localizações atuais para um cliente
   */
  private async sendCurrentLocations(socket: Socket) {
    try {
      const locations = Array.from(this.vehicleTracking.values());

      socket.emit('gps:current-locations', {
        locations: locations.map((loc) => ({
          vehicleId: loc.vehicleId,
          latitude: loc.latitude,
          longitude: loc.longitude,
          speed: loc.speed,
          heading: loc.heading,
          status: loc.status,
          timestamp: loc.timestamp,
          fuelLevel: loc.fuelLevel,
          temperature: loc.temperature,
          odometer: loc.odometer,
        })),
        timestamp: new Date(),
      });
    } catch (error) {
      console.error('[GPS] Erro ao enviar localizações atuais:', error);
    }
  }

  /**
   * Obter última localização de um veículo
   */
  getLastLocation(vehicleId: string): VehicleLocation | undefined {
    return this.vehicleTracking.get(vehicleId);
  }

  /**
   * Obter todas as localizações atuais
   */
  getAllLocations(): VehicleLocation[] {
    return Array.from(this.vehicleTracking.values());
  }

  /**
   * Limpar cache de localizações
   */
  clearLocationCache() {
    this.vehicleTracking.clear();
  }

  /**
   * Obter número de clientes conectados
   */
  getConnectedClientsCount(): number {
    return this.connectedClients.size;
  }

  /**
   * Obter número de sockets conectados
   */
  getConnectedSocketsCount(): number {
    let count = 0;
    for (const sockets of this.connectedClients.values()) {
      count += sockets.size;
    }
    return count;
  }
}

// Exportar instância singleton
export const gpsSocketService = new GPSSocketService();
