/**
 * Serviço de sincronização de dados GPS
 * Gerencia sincronização periódica com provedores de GPS
 */

import { GPSProviderInterface, VehicleLocation, GPSAlert, SyncStatus } from './types';
import { GPSProviderFactory } from './provider-factory';
import { db } from '../db';
import { vehicles, gpsLocations, gpsAlerts } from '../../drizzle/schema';
import { eq, and, gte, lte } from 'drizzle-orm';

export interface SyncResult {
  providerId: string;
  vehiclesUpdated: number;
  alertsGenerated: number;
  status: 'success' | 'error';
  errorMessage?: string;
  timestamp: Date;
}

export class GPSSyncService {
  private syncIntervals: Map<string, NodeJS.Timeout> = new Map();
  private isSyncing: Map<string, boolean> = new Map();

  /**
   * Iniciar sincronização periódica para um provedor
   */
  async startSync(providerId: string, syncInterval: number): Promise<void> {
    // Evitar sincronizações duplicadas
    if (this.syncIntervals.has(providerId)) {
      console.warn(`Sync already running for provider ${providerId}`);
      return;
    }

    // Sincronizar imediatamente
    await this.sync(providerId);

    // Agendar sincronizações periódicas
    const interval = setInterval(async () => {
      await this.sync(providerId);
    }, syncInterval * 1000);

    this.syncIntervals.set(providerId, interval);
    console.log(`Sync started for provider ${providerId} (interval: ${syncInterval}s)`);
  }

  /**
   * Parar sincronização periódica para um provedor
   */
  stopSync(providerId: string): void {
    const interval = this.syncIntervals.get(providerId);
    if (interval) {
      clearInterval(interval);
      this.syncIntervals.delete(providerId);
      console.log(`Sync stopped for provider ${providerId}`);
    }
  }

  /**
   * Sincronizar dados de um provedor
   */
  async sync(providerId: string): Promise<SyncResult> {
    // Evitar sincronizações simultâneas
    if (this.isSyncing.get(providerId)) {
      return {
        providerId,
        vehiclesUpdated: 0,
        alertsGenerated: 0,
        status: 'error',
        errorMessage: 'Sync already in progress',
        timestamp: new Date(),
      };
    }

    this.isSyncing.set(providerId, true);

    try {
      const provider = GPSProviderFactory.getProvider(providerId);
      if (!provider) {
        throw new Error(`Provider ${providerId} not found`);
      }

      // Sincronizar dados
      const result = await provider.sync();

      // Salvar localizações no banco
      let vehiclesUpdated = 0;
      for (const location of result.vehicles) {
        await this.saveVehicleLocation(location);
        vehiclesUpdated++;
      }

      // Salvar alertas no banco
      let alertsGenerated = 0;
      for (const alert of result.alerts || []) {
        await this.saveAlert(alert);
        alertsGenerated++;
      }

      return {
        providerId,
        vehiclesUpdated,
        alertsGenerated,
        status: 'success',
        timestamp: new Date(),
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`Sync error for provider ${providerId}:`, errorMessage);

      return {
        providerId,
        vehiclesUpdated: 0,
        alertsGenerated: 0,
        status: 'error',
        errorMessage,
        timestamp: new Date(),
      };
    } finally {
      this.isSyncing.set(providerId, false);
    }
  }

  /**
   * Salvar localização de veículo no banco
   */
  private async saveVehicleLocation(location: VehicleLocation): Promise<void> {
    try {
      // Verificar se veículo existe
      const vehicle = await db
        .select()
        .from(vehicles)
        .where(eq(vehicles.id, location.vehicleId))
        .limit(1);

      if (vehicle.length === 0) {
        console.warn(`Vehicle ${location.vehicleId} not found in database`);
        return;
      }

      // Salvar localização (se tabela gpsLocations existir)
      if (gpsLocations) {
        await db.insert(gpsLocations).values({
          vehicleId: location.vehicleId,
          latitude: location.latitude,
          longitude: location.longitude,
          speed: location.speed,
          heading: location.heading,
          altitude: location.altitude,
          accuracy: location.accuracy,
          timestamp: location.timestamp,
          provider: location.provider,
          providerVehicleId: location.providerVehicleId,
          fuelLevel: location.fuelLevel,
          temperature: location.temperature,
          odometer: location.odometer,
          status: location.status,
          address: location.address,
        });
      }
    } catch (error) {
      console.error(`Error saving vehicle location ${location.vehicleId}:`, error);
    }
  }

  /**
   * Salvar alerta no banco
   */
  private async saveAlert(alert: GPSAlert): Promise<void> {
    try {
      // Salvar alerta (se tabela gpsAlerts existir)
      if (gpsAlerts) {
        await db.insert(gpsAlerts).values({
          vehicleId: alert.vehicleId,
          type: alert.type,
          severity: alert.severity,
          message: alert.message,
          timestamp: alert.timestamp,
          acknowledged: alert.acknowledged,
          acknowledgedBy: alert.acknowledgedBy,
          acknowledgedAt: alert.acknowledgedAt,
          metadata: JSON.stringify(alert.metadata || {}),
        });
      }
    } catch (error) {
      console.error(`Error saving alert for vehicle ${alert.vehicleId}:`, error);
    }
  }

  /**
   * Obter última localização de um veículo
   */
  async getLastLocation(vehicleId: string): Promise<VehicleLocation | null> {
    try {
      if (!gpsLocations) return null;

      const result = await db
        .select()
        .from(gpsLocations)
        .where(eq(gpsLocations.vehicleId, vehicleId))
        .limit(1);

      if (result.length === 0) return null;

      const location = result[0];
      return {
        vehicleId: location.vehicleId,
        latitude: location.latitude,
        longitude: location.longitude,
        speed: location.speed,
        heading: location.heading,
        altitude: location.altitude,
        accuracy: location.accuracy,
        timestamp: location.timestamp,
        provider: location.provider,
        providerVehicleId: location.providerVehicleId,
        fuelLevel: location.fuelLevel,
        temperature: location.temperature,
        odometer: location.odometer,
        status: location.status,
        address: location.address,
      };
    } catch (error) {
      console.error(`Error getting last location for vehicle ${vehicleId}:`, error);
      return null;
    }
  }

  /**
   * Obter histórico de localizações de um veículo
   */
  async getLocationHistory(
    vehicleId: string,
    startDate: Date,
    endDate: Date,
    limit: number = 1000
  ): Promise<VehicleLocation[]> {
    try {
      if (!gpsLocations) return [];

      const result = await db
        .select()
        .from(gpsLocations)
        .where(
          and(
            eq(gpsLocations.vehicleId, vehicleId),
            gte(gpsLocations.timestamp, startDate),
            lte(gpsLocations.timestamp, endDate)
          )
        )
        .limit(limit);

      return result.map((location) => ({
        vehicleId: location.vehicleId,
        latitude: location.latitude,
        longitude: location.longitude,
        speed: location.speed,
        heading: location.heading,
        altitude: location.altitude,
        accuracy: location.accuracy,
        timestamp: location.timestamp,
        provider: location.provider,
        providerVehicleId: location.providerVehicleId,
        fuelLevel: location.fuelLevel,
        temperature: location.temperature,
        odometer: location.odometer,
        status: location.status,
        address: location.address,
      }));
    } catch (error) {
      console.error(`Error getting location history for vehicle ${vehicleId}:`, error);
      return [];
    }
  }

  /**
   * Obter alertas não reconhecidos
   */
  async getUnacknowledgedAlerts(vehicleId?: string): Promise<GPSAlert[]> {
    try {
      if (!gpsAlerts) return [];

      let query;
      if (vehicleId) {
        query = db
          .select()
          .from(gpsAlerts)
          .where(
            and(
              eq(gpsAlerts.vehicleId, vehicleId),
              eq(gpsAlerts.acknowledged, false)
            )
          );
      } else {
        query = db
          .select()
          .from(gpsAlerts)
          .where(eq(gpsAlerts.acknowledged, false));
      }

      const result = await query;

      return result.map((alert) => ({
        id: alert.id,
        vehicleId: alert.vehicleId,
        type: alert.type,
        severity: alert.severity,
        message: alert.message,
        timestamp: alert.timestamp,
        acknowledged: alert.acknowledged,
        acknowledgedBy: alert.acknowledgedBy,
        acknowledgedAt: alert.acknowledgedAt,
        metadata: alert.metadata ? JSON.parse(alert.metadata) : undefined,
      }));
    } catch (error) {
      console.error('Error getting unacknowledged alerts:', error);
      return [];
    }
  }

  /**
   * Reconhecer alerta
   */
  async acknowledgeAlert(alertId: number, userId: string): Promise<boolean> {
    try {
      if (!gpsAlerts) return false;

      await db
        .update(gpsAlerts)
        .set({
          acknowledged: true,
          acknowledgedBy: parseInt(userId),
          acknowledgedAt: new Date(),
        })
        .where(eq(gpsAlerts.id, alertId));

      return true;
    } catch (error) {
      console.error(`Error acknowledging alert ${alertId}:`, error);
      return false;
    }
  }

  /**
   * Parar todas as sincronizações
   */
  stopAllSync(): void {
    const providerIds = Array.from(this.syncIntervals.keys());
    for (const providerId of providerIds) {
      this.stopSync(providerId);
    }
  }

  /**
   * Obter status de todas as sincronizações
   */
  getSyncStatus(): Array<{
    providerId: string;
    isRunning: boolean;
    isSyncing: boolean;
  }> {
    const status = [];
    const providerIds = Array.from(this.syncIntervals.keys());

    for (const providerId of providerIds) {
      const interval = this.syncIntervals.get(providerId);
      status.push({
        providerId,
        isRunning: !!interval,
        isSyncing: this.isSyncing.get(providerId) || false,
      });
    }

    return status;
  }
}

// Exportar instância singleton
export const gpsSyncService = new GPSSyncService();
