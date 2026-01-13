/**
 * Routers tRPC para gerenciar integrações de GPS
 */

import { router, protectedProcedure, adminProcedure } from './_core/trpc';
import { z } from 'zod';
import { GPSProviderFactory } from './gps/provider-factory';
import { gpsSyncService } from './gps/sync-service';
import { db } from './db';
import { gpsProviders, gpsLocations, gpsAlerts } from '../drizzle/schema';
import { eq } from 'drizzle-orm';
import { GPSProviderType } from './gps/types';

export const gpsRouter = router<any>({
  /**
   * Listar provedores de GPS suportados
   */
  getSupportedProviders: protectedProcedure.query(async () => {
    return GPSProviderFactory.getSupportedProviders();
  }),

  /**
   * Listar provedores configurados
   */
  listProviders: adminProcedure.query(async () => {
    try {
      const providers = await db.select().from(gpsProviders);
      return providers.map((p) => ({
        ...p,
        credentials: p.credentials ? JSON.parse(p.credentials) : undefined,
      }));
    } catch (error) {
      console.error('Error listing GPS providers:', error);
      return [];
    }
  }),

  /**
   * Obter provedor por ID
   */
  getProvider: adminProcedure
    .input(z.object({ providerId: z.string() }))
    .query(async ({ input }) => {
      try {
        const provider = await db
          .select()
          .from(gpsProviders)
          .where(eq(gpsProviders.id, input.providerId))
          .limit(1);

        if (provider.length === 0) return null;

        const p = provider[0];
        return {
          ...p,
          credentials: p.credentials ? JSON.parse(p.credentials) : undefined,
        };
      } catch (error) {
        console.error(`Error getting GPS provider ${input.providerId}:`, error);
        return null;
      }
    }),

  /**
   * Criar novo provedor de GPS
   */
  createProvider: adminProcedure
    .input(
      z.object({
        id: z.string(),
        type: z.enum([
          GPSProviderType.ONIXSAT,
          GPSProviderType.SASCAR,
          GPSProviderType.GENERIC_REST,
          GPSProviderType.TRACCAR,
        ]),
        name: z.string(),
        apiKey: z.string(),
        apiUrl: z.string(),
        syncInterval: z.number().min(5).default(30),
        credentials: z.record(z.any()).optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        // Validar configuração
        const validation = GPSProviderFactory.validateConfig({
          id: input.id,
          type: input.type,
          name: input.name,
          apiKey: input.apiKey,
          apiUrl: input.apiUrl,
          enabled: true,
          syncInterval: input.syncInterval,
          credentials: input.credentials,
        });

        if (!validation.valid) {
          throw new Error(`Invalid configuration: ${validation.errors.join(', ')}`);
        }

        // Salvar no banco
        await db.insert(gpsProviders).values({
          id: input.id,
          type: input.type,
          name: input.name,
          apiKey: input.apiKey,
          apiUrl: input.apiUrl,
          enabled: true,
          syncInterval: input.syncInterval,
          credentials: input.credentials ? JSON.stringify(input.credentials) : undefined,
        });

        // Criar instância do provedor
        const provider = GPSProviderFactory.createProvider({
          id: input.id,
          type: input.type,
          name: input.name,
          apiKey: input.apiKey,
          apiUrl: input.apiUrl,
          enabled: true,
          syncInterval: input.syncInterval,
          credentials: input.credentials,
        });

        // Testar autenticação
        const isAuthenticated = await provider.authenticate();

        if (!isAuthenticated) {
          throw new Error('Failed to authenticate with GPS provider');
        }

        // Iniciar sincronização
        await gpsSyncService.startSync(input.id, input.syncInterval);

        return {
          success: true,
          message: `GPS provider ${input.name} created and sync started`,
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error('Error creating GPS provider:', errorMessage);
        throw new Error(errorMessage);
      }
    }),

  /**
   * Atualizar provedor de GPS
   */
  updateProvider: adminProcedure
    .input(
      z.object({
        providerId: z.string(),
        name: z.string().optional(),
        apiKey: z.string().optional(),
        apiUrl: z.string().optional(),
        syncInterval: z.number().min(5).optional(),
        enabled: z.boolean().optional(),
        credentials: z.record(z.any()).optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        // Atualizar no banco
        await db
          .update(gpsProviders)
          .set({
            name: input.name,
            apiKey: input.apiKey,
            apiUrl: input.apiUrl,
            syncInterval: input.syncInterval,
            credentials: input.credentials ? JSON.stringify(input.credentials) : undefined,
          })
          .where(eq(gpsProviders.id, input.providerId));

        // Se desabilitar, parar sincronização
        if (input.enabled === false) {
          gpsSyncService.stopSync(input.providerId);
        }
        // Se habilitar, iniciar sincronização
        else if (input.enabled === true) {
          const provider = await db
            .select()
            .from(gpsProviders)
            .where(eq(gpsProviders.id, input.providerId))
            .limit(1);

          if (provider.length > 0) {
            await gpsSyncService.startSync(input.providerId, provider[0].syncInterval || 30);
          }
        }

        // Limpar cache
        GPSProviderFactory.removeProvider(input.providerId);

        return { success: true, message: 'GPS provider updated' };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error('Error updating GPS provider:', errorMessage);
        throw new Error(errorMessage);
      }
    }),

  /**
   * Deletar provedor de GPS
   */
  deleteProvider: adminProcedure
    .input(z.object({ providerId: z.string() }))
    .mutation(async ({ input }) => {
      try {
        // Parar sincronização
        gpsSyncService.stopSync(input.providerId);

        // Deletar do banco
        await db.delete(gpsProviders).where(eq(gpsProviders.id, input.providerId));

        // Limpar cache
        GPSProviderFactory.removeProvider(input.providerId);

        return { success: true, message: 'GPS provider deleted' };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error('Error deleting GPS provider:', errorMessage);
        throw new Error(errorMessage);
      }
    }),

  /**
   * Sincronizar dados manualmente
   */
  syncNow: adminProcedure
    .input(z.object({ providerId: z.string() }))
    .mutation(async ({ input }) => {
      try {
        const result = await gpsSyncService.sync(input.providerId);
        return result;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error('Error syncing GPS data:', errorMessage);
        throw new Error(errorMessage);
      }
    }),

  /**
   * Obter status de sincronização
   */
  getSyncStatus: adminProcedure.query(() => {
    return gpsSyncService.getSyncStatus();
  }),

  /**
   * Obter última localização de um veículo
   */
  getLastLocation: protectedProcedure
    .input(z.object({ vehicleId: z.string() }))
    .query(async ({ input }) => {
      try {
        return await gpsSyncService.getLastLocation(input.vehicleId);
      } catch (error) {
        console.error(`Error getting last location for vehicle ${input.vehicleId}:`, error);
        return null;
      }
    }),

  /**
   * Obter histórico de localizações
   */
  getLocationHistory: protectedProcedure
    .input(
      z.object({
        vehicleId: z.string(),
        startDate: z.date(),
        endDate: z.date(),
        limit: z.number().min(1).max(5000).default(1000),
      })
    )
    .query(async ({ input }) => {
      try {
        return await gpsSyncService.getLocationHistory(
          input.vehicleId,
          input.startDate,
          input.endDate,
          input.limit
        );
      } catch (error) {
        console.error(`Error getting location history for vehicle ${input.vehicleId}:`, error);
        return [];
      }
    }),

  /**
   * Obter alertas não reconhecidos
   */
  getUnacknowledgedAlerts: protectedProcedure
    .input(z.object({ vehicleId: z.string().optional() }))
    .query(async ({ input }) => {
      try {
        return await gpsSyncService.getUnacknowledgedAlerts(input.vehicleId);
      } catch (error) {
        console.error('Error getting unacknowledged alerts:', error);
        return [];
      }
    }),

  /**
   * Reconhecer alerta
   */
  acknowledgeAlert: protectedProcedure
    .input(z.object({ alertId: z.string(), userId: z.string() }))
    .mutation(async ({ input }) => {
      try {
        const success = await gpsSyncService.acknowledgeAlert(input.alertId, input.userId);
        return { success, message: success ? 'Alert acknowledged' : 'Failed to acknowledge alert' };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error('Error acknowledging alert:', errorMessage);
        throw new Error(errorMessage);
      }
    }),

  /**
   * Obter estatísticas de GPS
   */
  getStats: adminProcedure.query(async () => {
    try {
      return {
        syncStatus: gpsSyncService.getSyncStatus(),
        message: 'GPS integration ready',
      };
    } catch (error) {
      console.error('Error getting GPS stats:', error);
      return {
        syncStatus: [],
        message: 'Error getting GPS stats',
      };
    }
  })
});
