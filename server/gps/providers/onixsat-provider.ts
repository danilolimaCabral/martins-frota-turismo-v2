/**
 * Adaptador para Onixsat
 * API: https://www.onixsat.com.br/
 */

import { BaseGPSProvider } from '../base-provider';
import {
  GPSProviderConfig,
  VehicleLocation,
  GPSAlert,
  RouteHistory,
  GPSProviderType,
} from '../types';

interface OnixsatVehicle {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  speed: number;
  heading: number;
  timestamp: string;
  fuel?: number;
  temperature?: number;
  odometer?: number;
  status?: string;
}

interface OnixsatAlert {
  id: string;
  vehicleId: string;
  type: string;
  message: string;
  timestamp: string;
  severity: string;
}

export class OnixsatProvider extends BaseGPSProvider {
  private authToken?: string;

  constructor(config: GPSProviderConfig) {
    super(config);
    if (config.type !== GPSProviderType.ONIXSAT) {
      throw new Error('Invalid provider type for OnixsatProvider');
    }
  }

  /**
   * Autenticar com Onixsat
   * Documentação: https://api.onixsat.com.br/docs
   */
  async authenticate(): Promise<boolean> {
    try {
      if (!this.validateConfig()) {
        throw new Error('Invalid configuration');
      }

      // Onixsat usa API Key no header
      const response = await this.makeRequest<{ token: string }>(
        `${this.config.apiUrl}/auth/token`,
        {
          method: 'POST',
          headers: {
            'X-API-Key': this.config.apiKey,
          },
        }
      );

      this.authToken = response.token;
      return true;
    } catch (error) {
      console.error('Onixsat authentication failed:', error);
      return false;
    }
  }

  /**
   * Obter localização de todos os veículos
   */
  async getVehicles(): Promise<VehicleLocation[]> {
    try {
      if (!this.authToken) {
        await this.authenticate();
      }

      const response = await this.makeRequest<{ vehicles: OnixsatVehicle[] }>(
        `${this.config.apiUrl}/vehicles/positions`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${this.authToken}`,
          },
        }
      );

      return response.vehicles.map((vehicle) => ({
        vehicleId: vehicle.id,
        latitude: vehicle.latitude,
        longitude: vehicle.longitude,
        speed: vehicle.speed,
        heading: vehicle.heading,
        timestamp: new Date(vehicle.timestamp),
        provider: GPSProviderType.ONIXSAT,
        providerVehicleId: vehicle.id,
        fuelLevel: vehicle.fuel,
        temperature: vehicle.temperature,
        odometer: vehicle.odometer,
        status: (vehicle.status as 'moving' | 'stopped' | 'idle' | 'offline') || 'offline',
      }));
    } catch (error) {
      console.error('Failed to get vehicles from Onixsat:', error);
      return [];
    }
  }

  /**
   * Obter localização de um veículo específico
   */
  async getVehicleLocation(vehicleId: string): Promise<VehicleLocation | null> {
    try {
      if (!this.authToken) {
        await this.authenticate();
      }

      const response = await this.makeRequest<OnixsatVehicle>(
        `${this.config.apiUrl}/vehicles/${vehicleId}/position`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${this.authToken}`,
          },
        }
      );

      return {
        vehicleId: response.id,
        latitude: response.latitude,
        longitude: response.longitude,
        speed: response.speed,
        heading: response.heading,
        timestamp: new Date(response.timestamp),
        provider: GPSProviderType.ONIXSAT,
        providerVehicleId: response.id,
        fuelLevel: response.fuel,
        temperature: response.temperature,
        odometer: response.odometer,
        status: (response.status as 'moving' | 'stopped' | 'idle' | 'offline') || 'offline',
      };
    } catch (error) {
      console.error(`Failed to get vehicle location for ${vehicleId}:`, error);
      return null;
    }
  }

  /**
   * Obter alertas
   */
  async getAlerts(): Promise<GPSAlert[]> {
    try {
      if (!this.authToken) {
        await this.authenticate();
      }

      const response = await this.makeRequest<{ alerts: OnixsatAlert[] }>(
        `${this.config.apiUrl}/alerts/active`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${this.authToken}`,
          },
        }
      );

      return response.alerts.map((alert) => ({
        id: alert.id,
        vehicleId: alert.vehicleId,
        type: this.mapAlertType(alert.type),
        severity: (alert.severity as 'low' | 'medium' | 'high' | 'critical') || 'medium',
        message: alert.message,
        timestamp: new Date(alert.timestamp),
        acknowledged: false,
      }));
    } catch (error) {
      console.error('Failed to get alerts from Onixsat:', error);
      return [];
    }
  }

  /**
   * Obter histórico de rota
   */
  async getRouteHistory(
    vehicleId: string,
    startDate: Date,
    endDate: Date
  ): Promise<RouteHistory | null> {
    try {
      if (!this.authToken) {
        await this.authenticate();
      }

      const response = await this.makeRequest<{
        route: {
          startTime: string;
          endTime: string;
          startLocation: { latitude: number; longitude: number };
          endLocation: { latitude: number; longitude: number };
          distance: number;
          duration: number;
          averageSpeed: number;
          maxSpeed: number;
          fuelConsumed?: number;
          points: OnixsatVehicle[];
        };
      }>(
        `${this.config.apiUrl}/vehicles/${vehicleId}/routes?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${this.authToken}`,
          },
        }
      );

      const route = response.route;

      return {
        vehicleId,
        startTime: new Date(route.startTime),
        endTime: new Date(route.endTime),
        startLocation: route.startLocation,
        endLocation: route.endLocation,
        distance: route.distance,
        duration: route.duration,
        averageSpeed: route.averageSpeed,
        maxSpeed: route.maxSpeed,
        fuelConsumed: route.fuelConsumed,
        points: route.points.map((point) => ({
          vehicleId,
          latitude: point.latitude,
          longitude: point.longitude,
          speed: point.speed,
          heading: point.heading,
          timestamp: new Date(point.timestamp),
          provider: GPSProviderType.ONIXSAT,
          status: (point.status as 'moving' | 'stopped' | 'idle' | 'offline') || 'offline',
        })),
        provider: GPSProviderType.ONIXSAT,
      };
    } catch (error) {
      console.error(`Failed to get route history for ${vehicleId}:`, error);
      return null;
    }
  }

  /**
   * Reconhecer alerta
   */
  async acknowledgeAlert(alertId: string, userId: string): Promise<boolean> {
    try {
      if (!this.authToken) {
        await this.authenticate();
      }

      await this.makeRequest<{ success: boolean }>(
        `${this.config.apiUrl}/alerts/${alertId}/acknowledge`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${this.authToken}`,
          },
          body: JSON.stringify({ userId }),
        }
      );

      return true;
    } catch (error) {
      console.error(`Failed to acknowledge alert ${alertId}:`, error);
      return false;
    }
  }

  /**
   * Definir geofence
   */
  async setGeofence(
    vehicleId: string,
    latitude: number,
    longitude: number,
    radius: number
  ): Promise<boolean> {
    try {
      if (!this.authToken) {
        await this.authenticate();
      }

      await this.makeRequest<{ success: boolean }>(
        `${this.config.apiUrl}/vehicles/${vehicleId}/geofences`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${this.authToken}`,
          },
          body: JSON.stringify({ latitude, longitude, radius }),
        }
      );

      return true;
    } catch (error) {
      console.error(`Failed to set geofence for ${vehicleId}:`, error);
      return false;
    }
  }

  /**
   * Mapear tipos de alerta do Onixsat para tipos padrão
   */
  private mapAlertType(
    onixsatType: string
  ): 'speeding' | 'harsh_braking' | 'harsh_acceleration' | 'low_fuel' | 'engine_fault' | 'geofence_violation' | 'offline' | 'custom' {
    const mapping: Record<
      string,
      'speeding' | 'harsh_braking' | 'harsh_acceleration' | 'low_fuel' | 'engine_fault' | 'geofence_violation' | 'offline' | 'custom'
    > = {
      SPEEDING: 'speeding',
      HARSH_BRAKING: 'harsh_braking',
      HARSH_ACCELERATION: 'harsh_acceleration',
      LOW_FUEL: 'low_fuel',
      ENGINE_FAULT: 'engine_fault',
      GEOFENCE_VIOLATION: 'geofence_violation',
      OFFLINE: 'offline',
    };

    return mapping[onixsatType] || 'custom';
  }
}
