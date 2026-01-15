import { router } from "@trpc/server";
import { protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import { db } from "./db";
import { importHistory, vehicleTypes, cityConfigs, routePrices } from "../drizzle/schema";
import { eq } from "drizzle-orm";
import * as XLSX from "xlsx";
import { TRPCError } from "@trpc/server";

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

export const importDataRouter = router({
  // Importar dados de Banco (Excel)
  importBancoData: protectedProcedure
    .input(
      z.object({
        fileBase64: z.string(),
        fileName: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        console.log("🔄 Iniciando importação de dados de Banco...");

        // Decodificar arquivo
        const buffer = Buffer.from(input.fileBase64, "base64");
        const workbook = XLSX.read(buffer, { type: "buffer" });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const data = XLSX.utils.sheet_to_json(worksheet);

        // Validar dados
        const validatedData = data.map((row: any) =>
          BancoDataSchema.parse({
            conta: row.Conta || row.conta,
            saldoInicial: parseFloat(row["Saldo Inicial"] || row.saldoInicial || 0),
            despesas: parseFloat(row.Despesas || row.despesas || 0),
            pagamentos: parseFloat(row.Pagamentos || row.pagamentos || 0),
            cobranca: parseFloat(row.Cobrança || row.cobranca || 0),
            depositos: parseFloat(row.Depósitos || row.depositos || 0),
            recebimentoCartao: parseFloat(row["Recebimento Cartão"] || row.recebimentoCartao || 0),
            saldoFinal: parseFloat(row["Saldo Final"] || row.saldoFinal || 0),
          })
        );

        // Registrar histórico
        const history = await db
          .insert(importHistory)
          .values({
            fileName: input.fileName,
            fileType: "banco",
            totalRecords: validatedData.length,
            successfulRecords: validatedData.length,
            failedRecords: 0,
            errors: null,
            importedBy: ctx.user?.email || "system",
          })
          .returning();

        console.log(`✅ Importação de Banco concluída: ${validatedData.length} registros`);

        return {
          success: true,
          message: `Importação concluída: ${validatedData.length} registros`,
          historyId: history[0].id,
        };
      } catch (error) {
        console.error("❌ Erro ao importar dados de Banco:", error);

        const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";

        // Registrar erro
        await db.insert(importHistory).values({
          fileName: input.fileName,
          fileType: "banco",
          totalRecords: 0,
          successfulRecords: 0,
          failedRecords: 1,
          errors: JSON.stringify({ error: errorMessage }),
          importedBy: ctx.user?.email || "system",
        });

        throw new Error(`Erro ao importar dados de Banco: ${errorMessage}`);
      }
    }),

  // Importar dados de Viagens (Excel)
  importViagensData: protectedProcedure
    .input(
      z.object({
        fileBase64: z.string(),
        fileName: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        console.log("🔄 Iniciando importação de dados de Viagens...");

        // Decodificar arquivo
        const buffer = Buffer.from(input.fileBase64, "base64");
        const workbook = XLSX.read(buffer, { type: "buffer" });

        let totalRecords = 0;
        let successfulRecords = 0;
        const errors: any[] = [];

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

              successfulRecords++;
            } catch (error) {
              const errorMsg = error instanceof Error ? error.message : "Erro desconhecido";
              errors.push({ row: totalRecords, error: errorMsg });
            }
          }
        }

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

        throw new Error(`Erro ao importar dados de Viagens: ${errorMessage}`);
      }
    }),

  // Criar configurações de Veículos
  createVehicleType: protectedProcedure
    .input(VehicleTypeSchema)
    .mutation(async ({ input }) => {
      try {
        const result = await db
          .insert(vehicleTypes)
          .values({
            name: input.name,
            capacity: input.capacity,
            description: input.description,
          })
          .returning();

        console.log(`✅ Tipo de veículo criado: ${input.name}`);
        return result[0];
      } catch (error) {
        console.error("❌ Erro ao criar tipo de veículo:", error);
        throw error;
      }
    }),

  // Criar configurações de Cidades
  createCityConfig: protectedProcedure
    .input(CityConfigSchema)
    .mutation(async ({ input }) => {
      try {
        const result = await db
          .insert(cityConfigs)
          .values({
            name: input.name,
            state: input.state,
          })
          .returning();

        console.log(`✅ Cidade criada: ${input.name}`);
        return result[0];
      } catch (error) {
        console.error("❌ Erro ao criar cidade:", error);
        throw error;
      }
    }),

  // Criar Preço de Rota
  createRoutePrice: protectedProcedure
    .input(RoutePriceSchema)
    .mutation(async ({ input }) => {
      try {
        // Buscar IDs
        const vehicleType = await db
          .select()
          .from(vehicleTypes)
          .where(eq(vehicleTypes.name, input.vehicleTypeName))
          .limit(1);

        const city = await db
          .select()
          .from(cityConfigs)
          .where(eq(cityConfigs.name, input.cityName))
          .limit(1);

        if (!vehicleType.length) throw new Error(`Tipo de veículo não encontrado: ${input.vehicleTypeName}`);
        if (!city.length) throw new Error(`Cidade não encontrada: ${input.cityName}`);

        const result = await db
          .insert(routePrices)
          .values({
            vehicleTypeId: vehicleType[0].id,
            cityId: city[0].id,
            pricePerTrip: input.pricePerTrip,
            pricePerKm: input.pricePerKm,
            notes: input.notes,
          })
          .returning();

        console.log(`✅ Preço de rota criado: ${input.vehicleTypeName} → ${input.cityName}`);
        return result[0];
      } catch (error) {
        console.error("❌ Erro ao criar preço de rota:", error);
        throw error;
      }
    }),

  // Listar histórico de importações
  listImportHistory: protectedProcedure.query(async () => {
    try {
      const history = await db.select().from(importHistory);
      return history;
    } catch (error) {
      console.error("❌ Erro ao listar histórico de importações:", error);
      throw error;
    }
  }),

  // Listar tipos de veículos
  listVehicleTypes: protectedProcedure.query(async () => {
    try {
      const types = await db.select().from(vehicleTypes);
      return types;
    } catch (error) {
      console.error("❌ Erro ao listar tipos de veículos:", error);
      throw error;
    }
  }),

  // Listar cidades
  listCities: protectedProcedure.query(async () => {
    try {
      const cities = await db.select().from(cityConfigs);
      return cities;
    } catch (error) {
      console.error("❌ Erro ao listar cidades:", error);
      throw error;
    }
  }),

  // Listar preços de rotas
  listRoutePrices: protectedProcedure.query(async () => {
    try {
      const prices = await db.select().from(routePrices);
      return prices;
    } catch (error) {
      console.error("❌ Erro ao listar preços de rotas:", error);
      throw error;
    }
  }),
});
