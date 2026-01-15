/**
 * Integração com API CTA Smart para Sincronização de Abastecimentos
 * Sincroniza dados de abastecimentos em tempo real
 */

import axios, { AxiosInstance } from "axios";
import { z } from "zod";

// ============================================================================
// SCHEMAS ZOD PARA VALIDAÇÃO
// ============================================================================

const FuelingSchema = z.object({
  id: z.number().int(),
  vehicleId: z.number().int(),
  driverId: z.number().int(),
  fuelingDate: z.string().datetime(),
  liters: z.number().positive(),
  costPerLiter: z.number().positive(),
  totalCost: z.number().positive(),
  odometer: z.number().int().positive(),
  fuelType: z.enum(["gasoline", "diesel", "ethanol", "electric"]),
  location: z.string(),
  notes: z.string().optional(),
  status: z.enum(["pending", "confirmed", "rejected"]).optional().default("pending"),
});

const CTASmartResponseSchema = z.object({
  success: z.boolean(),
  total: z.number().int(),
  imported: z.number().int(),
  errors: z.number().int(),
  message: z.string(),
  fuelings: z.array(FuelingSchema).optional(),
  timestamp: z.string().datetime().optional(),
});

const CTASmartConfigSchema = z.object({
  token: z.string().min(1, "Token é obrigatório"),
  baseUrl: z.string().url().default("https://ctasmart.com.br:8443"),
  timeout: z.number().int().positive().default(30000),
  retryAttempts: z.number().int().min(1).default(3),
  retryDelay: z.number().int().positive().default(1000),
});

// ============================================================================
// TIPOS DERIVADOS
// ============================================================================

type Fueling = z.infer<typeof FuelingSchema>;
type CTASmartResponse = z.infer<typeof CTASmartResponseSchema>;
type CTASmartConfig = z.infer<typeof CTASmartConfigSchema>;

// ============================================================================
// CLASSE DE INTEGRAÇÃO CTA SMART
// ============================================================================

export class CTASmartIntegration {
  private client: AxiosInstance;
  private config: CTASmartConfig;
  private lastSyncTime: Date | null = null;
  private syncInProgress: boolean = false;

  constructor(config: Partial<CTASmartConfig> = {}) {
    this.config = CTASmartConfigSchema.parse({
      token: process.env.CTA_SMART_TOKEN,
      ...config,
    });

    this.client = axios.create({
      baseURL: this.config.baseUrl,
      timeout: this.config.timeout,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.config.token}`,
      },
    });

    // Adicionar retry interceptor
    this.setupRetryInterceptor();
  }

  /**
   * Configura interceptor para retry automático
   */
  private setupRetryInterceptor(): void {
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        const config = error.config;

        if (!config || !config.retryCount) {
          config.retryCount = 0;
        }

        config.retryCount += 1;

        if (config.retryCount <= this.config.retryAttempts) {
          await new Promise((resolve) =>
            setTimeout(resolve, this.config.retryDelay * config.retryCount)
          );
          return this.client(config);
        }

        return Promise.reject(error);
      }
    );
  }

  /**
   * Sincroniza abastecimentos da API CTA Smart
   */
  async syncFuelings(): Promise<CTASmartResponse> {
    if (this.syncInProgress) {
      throw new Error("Sincronização já em andamento");
    }

    this.syncInProgress = true;

    try {
      console.warn("🔄 Iniciando sincronização com CTA Smart...");

      const response = await this.client.get("/SvWebSincronizaAbastecimentos", {
        params: {
          token: this.config.token,
          lastSync: this.lastSyncTime?.toISOString(),
        },
      });

      const validatedData = CTASmartResponseSchema.parse(response.data);

      this.lastSyncTime = new Date();

      console.warn(`✅ Sincronização concluída: ${validatedData.imported} abastecimentos importados`);

      return validatedData;
    } catch (error: any) {
      console.error("❌ Erro ao sincronizar com CTA Smart:", error.message);
      throw new Error(`Falha na sincronização CTA Smart: ${error.message}`);
    } finally {
      this.syncInProgress = false;
    }
  }

  /**
   * Obtém abastecimentos pendentes
   */
  async getPendingFuelings(): Promise<Fueling[]> {
    try {
      const response = await this.client.get("/SvWebAbastecimentosPendentes", {
        params: { token: this.config.token },
      });

      const fuelings = z.array(FuelingSchema).parse(response.data);
      return fuelings;
    } catch (error: any) {
      console.error("❌ Erro ao obter abastecimentos pendentes:", error.message);
      throw new Error(`Falha ao obter abastecimentos pendentes: ${error.message}`);
    }
  }

  /**
   * Atualiza status de um abastecimento
   */
  async updateFuelingStatus(
    fuelingId: number,
    status: "confirmed" | "rejected",
    notes?: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      const response = await this.client.post("/SvWebAtualizarStatusAbastecimento", {
        token: this.config.token,
        fuelingId,
        status,
        notes,
      });

      return response.data;
    } catch (error: any) {
      console.error("❌ Erro ao atualizar status do abastecimento:", error.message);
      throw new Error(`Falha ao atualizar status: ${error.message}`);
    }
  }

  /**
   * Obtém estatísticas de abastecimentos
   */
  async getStatistics(
    startDate: Date,
    endDate: Date
  ): Promise<{
    totalFuelings: number;
    totalCost: number;
    averageCostPerLiter: number;
    totalLiters: number;
    byVehicle: Record<string, { fuelings: number; cost: number }>;
    byDriver: Record<string, { fuelings: number; cost: number }>;
  }> {
    try {
      const response = await this.client.get("/SvWebEstatisticasAbastecimentos", {
        params: {
          token: this.config.token,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
        },
      });

      return response.data;
    } catch (error: any) {
      console.error("❌ Erro ao obter estatísticas:", error.message);
      throw new Error(`Falha ao obter estatísticas: ${error.message}`);
    }
  }

  /**
   * Valida conexão com API CTA Smart
   */
  async validateConnection(): Promise<boolean> {
    try {
      const response = await this.client.get("/SvWebValidarConexao", {
        params: { token: this.config.token },
      });

      return response.data.success === true;
    } catch (error) {
      console.error("❌ Falha ao validar conexão com CTA Smart");
      return false;
    }
  }

  /**
   * Obtém informações de sincronização
   */
  getSyncInfo(): {
    lastSyncTime: Date | null;
    syncInProgress: boolean;
    nextSyncIn: number;
  } {
    return {
      lastSyncTime: this.lastSyncTime,
      syncInProgress: this.syncInProgress,
      nextSyncIn: this.lastSyncTime
        ? Math.max(0, 3600000 - (Date.now() - this.lastSyncTime.getTime()))
        : 0,
    };
  }
}

// ============================================================================
// FACTORY FUNCTION
// ============================================================================

let ctaSmartInstance: CTASmartIntegration | null = null;

/**
 * Obtém instância singleton de CTASmartIntegration
 */
export function getCTASmartInstance(): CTASmartIntegration {
  if (!ctaSmartInstance) {
    ctaSmartInstance = new CTASmartIntegration();
  }
  return ctaSmartInstance;
}

/**
 * Cria nova instância de CTASmartIntegration
 */
export function createCTASmartInstance(config?: Partial<CTASmartConfig>): CTASmartIntegration {
  return new CTASmartIntegration(config);
}

// ============================================================================
// EXEMPLO DE USO
// ============================================================================

export const ctaSmartExample = `
// ============================================================================
// EXEMPLO: Como Usar a Integração CTA Smart
// ============================================================================

import { getCTASmartInstance } from "./cta-smart-integration";

// Obter instância singleton
const ctaSmart = getCTASmartInstance();

// Validar conexão
const isConnected = await ctaSmart.validateConnection();
console.log("Conectado ao CTA Smart:", isConnected);

// Sincronizar abastecimentos
const syncResult = await ctaSmart.syncFuelings();
console.log("Abastecimentos sincronizados:", syncResult.imported);

// Obter abastecimentos pendentes
const pending = await ctaSmart.getPendingFuelings();
console.log("Abastecimentos pendentes:", pending.length);

// Atualizar status
await ctaSmart.updateFuelingStatus(123, "confirmed", "Abastecimento confirmado");

// Obter estatísticas
const stats = await ctaSmart.getStatistics(
  new Date("2025-01-01"),
  new Date("2025-01-31")
);
console.log("Custo total:", stats.totalCost);

// Obter informações de sincronização
const syncInfo = ctaSmart.getSyncInfo();
console.log("Última sincronização:", syncInfo.lastSyncTime);
`;
