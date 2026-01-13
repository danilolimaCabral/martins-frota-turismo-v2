/**
 * Classe abstrata para provedores de GPS
 * Todos os provedores devem estender esta classe
 */

import {
  GPSProviderConfig,
  GPSProviderInterface,
  VehicleLocation,
  GPSAlert,
  RouteHistory,
  SyncStatus,
  GPSProviderResponse,
} from './types';

export abstract class BaseGPSProvider implements GPSProviderInterface {
  config: GPSProviderConfig;
  protected lastSyncTime: Date = new Date();

  constructor(config: GPSProviderConfig) {
    this.config = config;
  }

  /**
   * Autenticar com o provedor
   */
  abstract authenticate(): Promise<boolean>;

  /**
   * Obter localização de todos os veículos
   */
  abstract getVehicles(): Promise<VehicleLocation[]>;

  /**
   * Obter localização de um veículo específico
   */
  abstract getVehicleLocation(vehicleId: string): Promise<VehicleLocation | null>;

  /**
   * Obter alertas do provedor
   */
  abstract getAlerts(): Promise<GPSAlert[]>;

  /**
   * Obter histórico de rota de um veículo
   */
  abstract getRouteHistory(
    vehicleId: string,
    startDate: Date,
    endDate: Date
  ): Promise<RouteHistory | null>;

  /**
   * Reconhecer um alerta
   */
  abstract acknowledgeAlert(alertId: string, userId: string): Promise<boolean>;

  /**
   * Definir geofence para um veículo
   */
  abstract setGeofence(
    vehicleId: string,
    latitude: number,
    longitude: number,
    radius: number
  ): Promise<boolean>;

  /**
   * Obter status da conexão
   */
  async getStatus(): Promise<SyncStatus> {
    return {
      provider: this.config.type,
      lastSync: this.lastSyncTime,
      nextSync: new Date(this.lastSyncTime.getTime() + this.config.syncInterval * 1000),
      vehiclesUpdated: 0,
      alertsGenerated: 0,
      status: 'pending',
    };
  }

  /**
   * Sincronizar dados com o provedor
   */
  async sync(): Promise<GPSProviderResponse> {
    try {
      if (!this.config.enabled) {
        throw new Error(`Provider ${this.config.name} is disabled`);
      }

      const isAuthenticated = await this.authenticate();
      if (!isAuthenticated) {
        throw new Error(`Failed to authenticate with ${this.config.name}`);
      }

      const vehicles = await this.getVehicles();
      const alerts = await this.getAlerts();

      this.lastSyncTime = new Date();

      return {
        vehicles,
        alerts,
        syncStatus: {
          provider: this.config.type,
          lastSync: this.lastSyncTime,
          nextSync: new Date(this.lastSyncTime.getTime() + this.config.syncInterval * 1000),
          vehiclesUpdated: vehicles.length,
          alertsGenerated: alerts.length,
          status: 'success',
        },
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return {
        vehicles: [],
        alerts: [],
        syncStatus: {
          provider: this.config.type,
          lastSync: this.lastSyncTime,
          nextSync: new Date(this.lastSyncTime.getTime() + this.config.syncInterval * 1000),
          vehiclesUpdated: 0,
          alertsGenerated: 0,
          status: 'error',
          errorMessage,
        },
      };
    }
  }

  /**
   * Validar configuração
   */
  protected validateConfig(): boolean {
    return !!(this.config.apiKey && this.config.apiUrl && this.config.name);
  }

  /**
   * Fazer requisição HTTP com retry
   */
  protected async makeRequest<T>(
    url: string,
    options: RequestInit = {},
    retries: number = 3
  ): Promise<T> {
    for (let i = 0; i < retries; i++) {
      try {
        const response = await fetch(url, {
          ...options,
          headers: {
            'Content-Type': 'application/json',
            ...options.headers,
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        return (await response.json()) as T;
      } catch (error) {
        if (i === retries - 1) throw error;
        await new Promise((resolve) => setTimeout(resolve, 1000 * (i + 1)));
      }
    }

    throw new Error('Max retries exceeded');
  }

  /**
   * Calcular distância entre dois pontos (Haversine)
   */
  protected calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371; // Raio da Terra em km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }
}
