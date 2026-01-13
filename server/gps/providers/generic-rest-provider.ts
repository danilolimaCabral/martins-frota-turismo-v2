/**
 * Adaptador genérico REST para qualquer API de GPS
 * Permite integração com qualquer provedor via configuração
 */

import { BaseGPSProvider } from '../base-provider';
import {
  GPSProviderConfig,
  VehicleLocation,
  GPSAlert,
  RouteHistory,
  GPSProviderType,
} from '../types';

interface GenericRestCredentials {
  username?: string;
  password?: string;
  apiKey?: string;
  bearerToken?: string;
  customHeaders?: Record<string, string>;
}

interface GenericRestEndpoints {
  vehicles?: string;
  vehicleLocation?: string; // com {vehicleId}
  alerts?: string;
  routeHistory?: string; // com {vehicleId}, {startDate}, {endDate}
  acknowledgeAlert?: string; // com {alertId}
  setGeofence?: string; // com {vehicleId}
}

interface GenericRestFieldMapping {
  vehicleId?: string;
  latitude?: string;
  longitude?: string;
  speed?: string;
  heading?: string;
  timestamp?: string;
  fuelLevel?: string;
  temperature?: string;
  odometer?: string;
  status?: string;
}

interface GenericRestConfig extends GPSProviderConfig {
  credentials?: GenericRestCredentials;
  endpoints?: GenericRestEndpoints;
  fieldMapping?: GenericRestFieldMapping;
}

export class GenericRestProvider extends BaseGPSProvider {
  config: GenericRestConfig;
  private authToken?: string;
  private credentials?: GenericRestCredentials;

  constructor(config: GenericRestConfig) {
    super(config);
    this.config = config;
    this.credentials = config.credentials;
    if (config.type !== GPSProviderType.GENERIC_REST) {
      throw new Error('Invalid provider type for GenericRestProvider');
    }
  }

  /**
   * Autenticar com o provedor
   */
  async authenticate(): Promise<boolean> {
    try {
      if (!this.validateConfig()) {
        throw new Error('Invalid configuration');
      }

      const credentials = this.config.credentials || {};

      // Se usar Bearer Token, não precisa fazer login
      if (credentials.bearerToken) {
        this.authToken = credentials.bearerToken;
        return true;
      }

      // Se usar API Key, adicionar ao header
      if (credentials.apiKey) {
        this.authToken = credentials.apiKey;
        return true;
      }

      // Se usar username/password, fazer login
      if (credentials.username && credentials.password) {
        const response = await this.makeRequest<{ token?: string; accessToken?: string }>(
          `${this.config.apiUrl}/login`,
          {
            method: 'POST',
            body: JSON.stringify({
              username: credentials.username,
              password: credentials.password,
            }),
          }
        );

        this.authToken = response.token || response.accessToken;
        return !!this.authToken;
      }

      return true;
    } catch (error) {
      console.error('Generic REST authentication failed:', error);
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

      const endpoint = this.config.endpoints?.vehicles || '/vehicles';
      const url = `${this.config.apiUrl}${endpoint}`;

      const response = await this.makeRequest<any>(url, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      // Suportar diferentes formatos de resposta
      const vehicles = Array.isArray(response) ? response : response.vehicles || response.data || [];

      return vehicles.map((vehicle: any) => this.mapVehicleLocation(vehicle));
    } catch (error) {
      console.error('Failed to get vehicles from Generic REST:', error);
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

      const endpoint = this.config.endpoints?.vehicleLocation || '/vehicles/{vehicleId}';
      const url = `${this.config.apiUrl}${endpoint.replace('{vehicleId}', vehicleId)}`;

      const response = await this.makeRequest<any>(url, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      return this.mapVehicleLocation(response);
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

      const endpoint = this.config.endpoints?.alerts || '/alerts';
      const url = `${this.config.apiUrl}${endpoint}`;

      const response = await this.makeRequest<any>(url, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      const alerts = Array.isArray(response) ? response : response.alerts || response.data || [];

      return alerts.map((alert: any) => ({
        id: alert.id || alert.alertId,
        vehicleId: alert.vehicleId || alert.vehicle_id,
        type: alert.type || alert.alertType || 'custom',
        severity: alert.severity || 'medium',
        message: alert.message || alert.description,
        timestamp: new Date(alert.timestamp || alert.createdAt),
        acknowledged: alert.acknowledged || false,
      }));
    } catch (error) {
      console.error('Failed to get alerts from Generic REST:', error);
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

      const endpoint =
        this.config.endpoints?.routeHistory || '/vehicles/{vehicleId}/routes';
      const url = `${this.config.apiUrl}${endpoint
        .replace('{vehicleId}', vehicleId)
        .replace('{startDate}', startDate.toISOString())
        .replace('{endDate}', endDate.toISOString())}`;

      const response = await this.makeRequest<any>(url, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      const route = response.route || response;

      return {
        vehicleId,
        startTime: new Date(route.startTime || route.start_time),
        endTime: new Date(route.endTime || route.end_time),
        startLocation: route.startLocation || route.start_location,
        endLocation: route.endLocation || route.end_location,
        distance: route.distance,
        duration: route.duration,
        averageSpeed: route.averageSpeed || route.average_speed,
        maxSpeed: route.maxSpeed || route.max_speed,
        fuelConsumed: route.fuelConsumed || route.fuel_consumed,
        points: (route.points || []).map((point: any) => this.mapVehicleLocation(point)),
        provider: GPSProviderType.GENERIC_REST,
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

      const endpoint = this.config.endpoints?.acknowledgeAlert || '/alerts/{alertId}/acknowledge';
      const url = `${this.config.apiUrl}${endpoint.replace('{alertId}', alertId)}`;

      await this.makeRequest<any>(url, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ userId }),
      });

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

      const endpoint = this.config.endpoints?.setGeofence || '/vehicles/{vehicleId}/geofences';
      const url = `${this.config.apiUrl}${endpoint.replace('{vehicleId}', vehicleId)}`;

      await this.makeRequest<any>(url, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ latitude, longitude, radius }),
      });

      return true;
    } catch (error) {
      console.error(`Failed to set geofence for ${vehicleId}:`, error);
      return false;
    }
  }

  /**
   * Mapear localização do veículo usando field mapping
   */
  private mapVehicleLocation(data: any): VehicleLocation {
    const mapping = this.config.fieldMapping || {};

    return {
      vehicleId: data[mapping.vehicleId || 'vehicleId'] || data.id,
      latitude: parseFloat(data[mapping.latitude || 'latitude']),
      longitude: parseFloat(data[mapping.longitude || 'longitude']),
      speed: parseFloat(data[mapping.speed || 'speed'] || 0),
      heading: parseFloat(data[mapping.heading || 'heading'] || 0),
      timestamp: new Date(data[mapping.timestamp || 'timestamp']),
      provider: GPSProviderType.GENERIC_REST,
      fuelLevel: data[mapping.fuelLevel || 'fuelLevel'],
      temperature: data[mapping.temperature || 'temperature'],
      odometer: data[mapping.odometer || 'odometer'],
      status: (data[mapping.status || 'status'] as 'moving' | 'stopped' | 'idle' | 'offline') || 'offline',
    };
  }

  /**
   * Obter headers de autenticação
   */
  private getAuthHeaders(): Record<string, string> {
    const headers: Record<string, string> = {};
    const credentials = this.config.credentials || {};

    if (credentials.bearerToken) {
      headers['Authorization'] = `Bearer ${credentials.bearerToken}`;
    } else if (credentials.apiKey) {
      headers['X-API-Key'] = credentials.apiKey;
    }

    // Adicionar headers customizados
    if (credentials.customHeaders) {
      Object.keys(credentials.customHeaders).forEach((key) => {
        headers[key] = credentials.customHeaders![key];
      });
    }

    return headers;
  }
}
