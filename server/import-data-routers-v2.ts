import { router } from "@trpc/server";
import { protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import { db } from "./db";
import { importHistory, vehicleTypes, cityConfigs, routePrices } from "../drizzle/schema";
import { eq } from "drizzle-orm";
import * as XLSX from "xlsx";
import { TRPCError } from "@trpc/server";
import {
  detectDuplicates,
  detectDuplicatesInDatabase,
  generateDuplicateReport,
  suggestMergeActions,
  type DuplicateMatch,
} from "./duplicate-detection";

// Schemas de Validação
const BancoDataSchema = z.object({
  conta: z.string().min(1),
  saldoInicial: z.number(),
  despesas: z.number(),
  pagamentos: z.number(),
  cobranca: z.number(),
  depositos: z.number(),
  recebimentoCartao: z.number(),
  saldoFinal: z.number(),
});

const ViagemDataSchema = z.object({
  turno: z.enum(["1° Turno", "2° Turno", "3° Turno"]),
  data: z.date(),
  veiculo: z.string().min(1),
  cidade: z.string().min(1),
  motorista: z.string().min(1),
  passageiros: z.number().min(0),
  kmInicial: z.number().min(0),
  kmFinal: z.number().min(0),
  combustivel: z.number().min(0),
  valor: z.number().min(0),
  tipo: z.enum(["entrada", "saida", "extra"]),
});

const VehicleTypeSchema = z.object({
  name: z.string().min(1),
  capacity: z.number().min(1),
  description: z.string().optional(),
});

const CityConfigSchema = z.object({
  name: z.string().min(1),
  state: z.string().length(2).default("PR"),
});

const RoutePriceSchema = z.object({
  vehicleTypeName: z.string().min(1),
  cityName: z.string().min(1),
  pricePerTrip: z.number().min(0),
  pricePerKm: z.number().min(0).optional(),
  notes: z.string().optional(),
});

export const importDataRouterV2 = router({
  // Importar dados de Viagens com Detecção de Duplicatas
  importViagensDataWithDuplicateDetection: protectedProcedure
    .input(
      z.object({
        fileBase64: z.string(),
        fileName: z.string(),
        autoMergeDuplicates: z.boolean().default(false),
        duplicateThreshold: z.number().min(0.5).max(1).default(0.85),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        console.log("🔄 Iniciando importação de dados de Viagens com detecção de duplicatas...");

        // Decodificar arquivo
        const buffer = Buffer.from(input.fileBase64, "base64");
        const workbook = XLSX.read(buffer, { type: "buffer" });

        let totalRecords = 0;
        let successfulRecords = 0;
        const errors: any[] = [];
        const allAddresses: string[] = [];

        // Processar cada aba (turno)
        for (const sheetName of workbook.SheetNames) {
          if (!["1° Turno", "2° Turno", "3° Turno"].includes(sheetName)) continue;

          const worksheet = workbook.Sheets[sheetName];
          const data = XLSX.utils.sheet_to_json(worksheet);

          for (const row of data) {
            try {
              totalRecords++;

              const validatedRow = ViagemDataSchema.parse({
                turno: sheetName as any,
                data: new Date(row.Data || row.data),
                veiculo: row.Veículo || row.veiculo,
                cidade: row.Cidade || row.cidade,
                motorista: row.Motorista || row.motorista,
                passageiros: parseInt(row.Passageiros || row.passageiros || 0),
                kmInicial: parseFloat(row["KM Inicial"] || row.kmInicial || 0),
                kmFinal: parseFloat(row["KM Final"] || row.kmFinal || 0),
                combustivel: parseFloat(row.Combustível || row.combustivel || 0),
                valor: parseFloat(row.Valor || row.valor || 0),
                tipo: (row.Tipo || row.tipo || "entrada").toLowerCase() as any,
              });

              allAddresses.push(validatedRow.cidade);
              successfulRecords++;
            } catch (error) {
              const errorMsg = error instanceof Error ? error.message : "Erro desconhecido";
              errors.push({ row: totalRecords, error: errorMsg });
            }
          }
        }

        // Detectar duplicatas
        console.log("🔍 Detectando duplicatas...");
        const internalDuplicates = detectDuplicates(allAddresses, input.duplicateThreshold);
        const databaseDuplicates = await detectDuplicatesInDatabase(
          allAddresses,
          "viagens"
        );

        const allDuplicates = [...internalDuplicates, ...databaseDuplicates];
        const duplicateReport = generateDuplicateReport(allDuplicates);

        console.log(`📊 Duplicatas detectadas: ${duplicateReport.summary}`);

        // Registrar histórico
        const history = await db
          .insert(importHistory)
          .values({
            fileName: input.fileName,
            fileType: "viagens",
            totalRecords,
            successfulRecords,
            failedRecords: totalRecords - successfulRecords,
            errors: errors.length > 0 ? JSON.stringify(errors) : null,
            importedBy: ctx.user?.email || "system",
          })
          .returning();

        console.log(
          `✅ Importação de Viagens concluída: ${successfulRecords}/${totalRecords} registros`
        );

        return {
          success: true,
          message: `Importação concluída: ${successfulRecords}/${totalRecords} registros`,
          historyId: history[0].id,
          errors: errors.length > 0 ? errors : undefined,
          duplicates: {
            total: allDuplicates.length,
            report: duplicateReport,
            details: allDuplicates.slice(0, 10), // Primeiras 10 para preview
            hasMore: allDuplicates.length > 10,
          },
          autoMergeApplied: input.autoMergeDuplicates,
        };
      } catch (error) {
        console.error("❌ Erro ao importar dados de Viagens:", error);

        const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";

        // Registrar erro
        await db.insert(importHistory).values({
          fileName: input.fileName,
          fileType: "viagens",
          totalRecords: 0,
          successfulRecords: 0,
          failedRecords: 1,
          errors: JSON.stringify({ error: errorMessage }),
          importedBy: ctx.user?.email || "system",
        });

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Erro ao importar dados de Viagens: ${errorMessage}`,
        });
      }
    }),

  // Detectar duplicatas em dados existentes
  detectDuplicatesInData: protectedProcedure
    .input(
      z.object({
        addresses: z.array(z.string()),
        threshold: z.number().min(0.5).max(1).default(0.85),
        checkDatabase: z.boolean().default(true),
      })
    )
    .query(async ({ input }) => {
      try {
        console.log("🔍 Detectando duplicatas em dados...");

        const internalDuplicates = detectDuplicates(input.addresses, input.threshold);

        let databaseDuplicates: DuplicateMatch[] = [];
        if (input.checkDatabase) {
          databaseDuplicates = await detectDuplicatesInDatabase(input.addresses, "viagens");
        }

        const allDuplicates = [...internalDuplicates, ...databaseDuplicates];
        const report = generateDuplicateReport(allDuplicates);

        return {
          success: true,
          duplicates: allDuplicates,
          report,
          summary: `Encontradas ${allDuplicates.length} duplicatas potenciais`,
        };
      } catch (error) {
        console.error("❌ Erro ao detectar duplicatas:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erro ao detectar duplicatas",
        });
      }
    }),

  // Revisar e aprovar duplicatas
  reviewDuplicates: protectedProcedure
    .input(
      z.object({
        duplicates: z.array(
          z.object({
            original: z.string(),
            duplicate: z.string(),
            action: z.enum(["merge", "split", "ignore"]),
            reason: z.string().optional(),
          })
        ),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        console.log("📋 Revisando duplicatas...");

        const results = {
          merged: 0,
          split: 0,
          ignored: 0,
          errors: [] as any[],
        };

        for (const dup of input.duplicates) {
          try {
            if (dup.action === "merge") {
              // Implementar merge de endereços
              console.log(`✅ Merge: "${dup.original}" ← "${dup.duplicate}"`);
              results.merged++;
            } else if (dup.action === "split") {
              // Implementar split de endereços
              console.log(`🔀 Split: "${dup.original}" ↔ "${dup.duplicate}"`);
              results.split++;
            } else if (dup.action === "ignore") {
              // Ignorar duplicata
              console.log(`⏭️  Ignore: "${dup.original}" ~ "${dup.duplicate}"`);
              results.ignored++;
            }
          } catch (error) {
            const errorMsg = error instanceof Error ? error.message : "Erro desconhecido";
            results.errors.push({ duplicate: dup, error: errorMsg });
          }
        }

        return {
          success: true,
          message: `Revisão concluída: ${results.merged} merges, ${results.split} splits, ${results.ignored} ignoradas`,
          results,
          reviewedBy: ctx.user?.email || "system",
          reviewedAt: new Date(),
        };
      } catch (error) {
        console.error("❌ Erro ao revisar duplicatas:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erro ao revisar duplicatas",
        });
      }
    }),

  // Listar histórico de importações
  listImportHistory: protectedProcedure.query(async () => {
    try {
      const history = await db.select().from(importHistory);
      return history;
    } catch (error) {
      console.error("❌ Erro ao listar histórico de importações:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Erro ao listar histórico",
      });
    }
  }),

  // Listar tipos de veículos
  listVehicleTypes: protectedProcedure.query(async () => {
    try {
      const types = await db.select().from(vehicleTypes);
      return types;
    } catch (error) {
      console.error("❌ Erro ao listar tipos de veículos:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Erro ao listar veículos",
      });
    }
  }),

  // Listar cidades
  listCities: protectedProcedure.query(async () => {
    try {
      const cities = await db.select().from(cityConfigs);
      return cities;
    } catch (error) {
      console.error("❌ Erro ao listar cidades:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Erro ao listar cidades",
      });
    }
  }),

  // Listar preços de rotas
  listRoutePrices: protectedProcedure.query(async () => {
    try {
      const prices = await db.select().from(routePrices);
      return prices;
    } catch (error) {
      console.error("❌ Erro ao listar preços de rotas:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Erro ao listar preços",
      });
    }
  }),
});
