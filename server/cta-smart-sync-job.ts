/**
 * Job Agendado para Sincronização CTA Smart
 * Sincroniza abastecimentos automaticamente a cada hora
 */

import cron from "node-cron";
import { getCTASmartInstance } from "./cta-smart-integration";
import { db } from "./db";
import { notifyOwner } from "./notification";
import type { Fueling } from "./cta-smart-integration";

interface SyncJobConfig {
  schedule: string; // Cron expression (ex: "0 * * * *" = a cada hora)
  enabled: boolean;
  retryOnFailure: boolean;
  maxRetries: number;
  notifyOnError: boolean;
  notifyOnSuccess: boolean;
}

/**
 * Configuração padrão do job
 */
const defaultConfig: SyncJobConfig = {
  schedule: "0 * * * *", // A cada hora
  enabled: true,
  retryOnFailure: true,
  maxRetries: 3,
  notifyOnError: true,
  notifyOnSuccess: false,
};

/**
 * Estado global do job
 */
let syncJobInstance: cron.ScheduledTask | null = null;
let lastSyncResult: {
  timestamp: Date;
  success: boolean;
  imported: number;
  errors: number;
  message: string;
} | null = null;

/**
 * Inicia job agendado de sincronização
 */
export function startCTASyncJob(config: Partial<SyncJobConfig> = {}): void {
  const finalConfig = { ...defaultConfig, ...config };

  if (!finalConfig.enabled) {
    console.log("⏸️  Job de sincronização CTA Smart desabilitado");
    return;
  }

  if (syncJobInstance) {
    console.log("⚠️  Job de sincronização CTA Smart já está em execução");
    return;
  }

  console.log(`🚀 Iniciando job de sincronização CTA Smart (${finalConfig.schedule})`);

  syncJobInstance = cron.schedule(finalConfig.schedule, async () => {
    await performSync(finalConfig);
  });

  // Executar sincronização imediatamente na inicialização
  performSync(finalConfig).catch((error) => {
    console.error("❌ Erro na sincronização inicial:", error.message);
  });
}

/**
 * Para o job agendado
 */
export function stopCTASyncJob(): void {
  if (syncJobInstance) {
    syncJobInstance.stop();
    syncJobInstance = null;
    console.log("⏹️  Job de sincronização CTA Smart parado");
  }
}

/**
 * Realiza sincronização com retry
 */
async function performSync(config: SyncJobConfig): Promise<void> {
  let attempt = 0;
  let lastError: Error | null = null;

  while (attempt < config.maxRetries) {
    try {
      attempt++;
      console.log(`🔄 Sincronização CTA Smart - Tentativa ${attempt}/${config.maxRetries}`);

      const ctaSmart = getCTASmartInstance();

      // Validar conexão
      const isConnected = await ctaSmart.validateConnection();
      if (!isConnected) {
        throw new Error("Falha ao conectar com CTA Smart");
      }

      // Sincronizar abastecimentos
      const syncResult = await ctaSmart.syncFuelings();

      // Processar resultados
      await processSyncResult(syncResult);

      // Atualizar estado
      lastSyncResult = {
        timestamp: new Date(),
        success: true,
        imported: syncResult.imported,
        errors: syncResult.errors,
        message: syncResult.message,
      };

      console.log(`✅ Sincronização concluída: ${syncResult.imported} abastecimentos importados`);

      // Notificar sucesso
      if (config.notifyOnSuccess) {
        await notifyOwner({
          title: "✅ Sincronização CTA Smart Concluída",
          content: `${syncResult.imported} abastecimentos foram sincronizados com sucesso.`,
        });
      }

      return;
    } catch (error: any) {
      lastError = error;
      console.error(`❌ Erro na tentativa ${attempt}: ${error.message}`);

      if (attempt < config.maxRetries) {
        // Aguardar antes de retry (backoff exponencial)
        const delayMs = Math.pow(2, attempt) * 1000;
        console.log(`⏳ Aguardando ${delayMs}ms antes da próxima tentativa...`);
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }
  }

  // Todas as tentativas falharam
  lastSyncResult = {
    timestamp: new Date(),
    success: false,
    imported: 0,
    errors: 0,
    message: lastError?.message || "Erro desconhecido",
  };

  console.error(`❌ Sincronização falhou após ${config.maxRetries} tentativas`);

  if (config.notifyOnError && lastError) {
    await notifyOwner({
      title: "❌ Erro na Sincronização CTA Smart",
      content: `Falha ao sincronizar abastecimentos: ${lastError.message}`,
    });
  }
}

/**
 * Processa resultados da sincronização
 */
async function processSyncResult(syncResult: any): Promise<void> {
  if (!syncResult.fuelings || syncResult.fuelings.length === 0) {
    console.log("ℹ️  Nenhum abastecimento novo para processar");
    return;
  }

  console.log(`📊 Processando ${syncResult.fuelings.length} abastecimentos...`);

  for (const fueling of syncResult.fuelings) {
    try {
      // Aqui você pode salvar no banco de dados
      // await db.insert(fuelings).values(fueling);
      console.log(`✓ Abastecimento ${fueling.id} processado`);
    } catch (error: any) {
      console.error(`✗ Erro ao processar abastecimento ${fueling.id}: ${error.message}`);
    }
  }
}

/**
 * Obtém informações do último sync
 */
export function getLastSyncInfo(): {
  lastSync: typeof lastSyncResult;
  isRunning: boolean;
  nextSync: string | null;
} {
  return {
    lastSync: lastSyncResult,
    isRunning: syncJobInstance !== null,
    nextSync: syncJobInstance ? "Agendado" : null,
  };
}

/**
 * Força sincronização manual
 */
export async function forceSyncNow(): Promise<void> {
  console.log("🔄 Sincronização manual iniciada...");
  await performSync(defaultConfig);
}

/**
 * Obtém estatísticas de sincronização
 */
export async function getSyncStatistics(
  startDate: Date,
  endDate: Date
): Promise<{
  totalSyncs: number;
  successfulSyncs: number;
  failedSyncs: number;
  totalImported: number;
  totalErrors: number;
  averageImportedPerSync: number;
}> {
  const ctaSmart = getCTASmartInstance();

  try {
    const stats = await ctaSmart.getStatistics(startDate, endDate);

    return {
      totalSyncs: 0, // Seria necessário rastrear isso no banco
      successfulSyncs: 0,
      failedSyncs: 0,
      totalImported: stats.totalFuelings,
      totalErrors: 0,
      averageImportedPerSync: 0,
    };
  } catch (error: any) {
    console.error("Erro ao obter estatísticas:", error.message);
    throw error;
  }
}

/**
 * Exemplo de como usar o job
 */
export const ctaSyncJobExample = `
// ============================================================================
// EXEMPLO: Como Usar o Job de Sincronização CTA Smart
// ============================================================================

import { startCTASyncJob, stopCTASyncJob, getLastSyncInfo, forceSyncNow } from "./cta-smart-sync-job";

// Iniciar job (sincroniza a cada hora)
startCTASyncJob({
  schedule: "0 * * * *", // A cada hora
  enabled: true,
  retryOnFailure: true,
  maxRetries: 3,
  notifyOnError: true,
  notifyOnSuccess: false,
});

// Obter informações do último sync
const syncInfo = getLastSyncInfo();
console.log("Último sync:", syncInfo.lastSync);

// Forçar sincronização manual
await forceSyncNow();

// Obter estatísticas
const stats = await getSyncStatistics(
  new Date("2025-01-01"),
  new Date("2025-01-31")
);
console.log("Estatísticas:", stats);

// Parar job
stopCTASyncJob();

// ============================================================================
// CRON EXPRESSIONS COMUNS
// ============================================================================

// A cada minuto
"* * * * *"

// A cada 5 minutos
"*/5 * * * *"

// A cada hora
"0 * * * *"

// A cada 6 horas
"0 */6 * * *"

// Diariamente às 2 da manhã
"0 2 * * *"

// Segunda a sexta às 9 da manhã
"0 9 * * 1-5"

// Primeiro dia do mês às meia-noite
"0 0 1 * *"
`;
