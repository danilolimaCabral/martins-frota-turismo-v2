/**
 * Tipos para integração com sistemas de rastreamento GPS
 * Suporta múltiplos provedores: Onixsat, Sascar, Autotrac, etc.
 */

export enum GPSProviderType {
  ONIXSAT = 'onixsat',
  SASCAR = 'sascar',
  AUTOTRAC = 'autotrac',
  GENERIC_REST = 'generic_rest',
  TRACCAR = 'traccar',
}

export interface GPSProviderConfig {
  id: string;
  type: GPSProviderType;
  name: string;
  apiKey: string;
  apiUrl: string;
  enabled: boolean;
  syncInterval: number; // em segundos
  lastSync?: Date;
  credentials?: Record<string, any>;
}

export interface VehicleLocation {
  vehicleId: string;
  latitude: number;
  longitude: number;
  speed: number; // km/h
  heading: number; // 0-360 graus
  altitude?: number; // metros
  accuracy?: number; // metros
  timestamp: Date;
  provider: GPSProviderType;
  providerVehicleId?: string; // ID do veículo no sistema do provedor
  fuelLevel?: number; // 0-100%
  temperature?: number; // °C
  odometer?: number; // km
  status?: 'moving' | 'stopped' | 'idle' | 'offline';
  address?: string;
}

export interface GPSAlert {
  id: string | number;
  vehicleId: string;
  type: 'speeding' | 'harsh_braking' | 'harsh_acceleration' | 'low_fuel' | 'engine_fault' | 'geofence_violation' | 'offline' | 'custom';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: Date;
  location?: {
    latitude: number;
    longitude: number;
  };
  acknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: Date;
  metadata?: Record<string, any>;
}

export interface RouteHistory {
  vehicleId: string;
  startTime: Date;
  endTime?: Date;
  startLocation: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  endLocation?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  distance: number; // km
  duration: number; // minutos
  averageSpeed: number; // km/h
  maxSpeed: number; // km/h
  fuelConsumed?: number; // litros
  points: VehicleLocation[];
  provider: GPSProviderType;
}

export interface SyncStatus {
  provider: GPSProviderType;
  lastSync: Date;
  nextSync: Date;
  vehiclesUpdated: number;
  alertsGenerated: number;
  status: 'success' | 'error' | 'pending';
  errorMessage?: string;
}

export interface GPSProviderResponse {
  vehicles: VehicleLocation[];
  alerts?: GPSAlert[];
  routes?: RouteHistory[];
  syncStatus: SyncStatus;
}

export interface GPSProviderInterface {
  config: GPSProviderConfig;
  authenticate(): Promise<boolean>;
  getVehicles(): Promise<VehicleLocation[]>;
  getVehicleLocation(vehicleId: string): Promise<VehicleLocation | null>;
  getAlerts(): Promise<GPSAlert[]>;
  getRouteHistory(vehicleId: string, startDate: Date, endDate: Date): Promise<RouteHistory | null>;
  acknowledgeAlert(alertId: string, userId: string): Promise<boolean>;
  setGeofence(vehicleId: string, latitude: number, longitude: number, radius: number): Promise<boolean>;
  getStatus(): Promise<SyncStatus>;
  sync(): Promise<GPSProviderResponse>;
}
