import { router, publicProcedure, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import { fuelings, vehicles, drivers } from "../drizzle/schema";
import { eq, and, gte, lte, desc } from "drizzle-orm";
import { db } from "./db";

// Função auxiliar para ordenar por data
const orderByDate = (a: any, b: any) => {
  const dateA = new Date(a.date).getTime();
  const dateB = new Date(b.date).getTime();
  return dateB - dateA; // Descendente
};

// Schema de validação
const createFuelingSchema = z.object({
  vehicleId: z.number().int().positive("Selecione um veículo"),
  driverId: z.number().int().positive("Selecione um motorista").optional(),
  date: z.date("Data inválida"),
  km: z.number().positive("Quilometragem deve ser positiva"),
  liters: z.number().positive("Quantidade de litros deve ser positiva"),
  pricePerLiter: z.number().positive("Preço por litro deve ser positivo"),
  fuelType: z.enum(["gasolina", "etanol", "diesel", "gnv"]),
  station: z.string().min(1, "Informe o posto de abastecimento"),
  city: z.string().optional(),
  receipt: z.string().optional(),
  notes: z.string().optional(),
});

const updateFuelingSchema = createFuelingSchema.partial();

export const fuelingRouter = router({
  // Listar abastecimentos com filtros
  list: publicProcedure
    .input(
      z.object({
        vehicleId: z.number().optional(),
        driverId: z.number().optional(),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
        limit: z.number().default(50),
        offset: z.number().default(0),
      })
    )
    .query(async ({ input }: any) => {
      try {
        const conditions = [];

        if (input.vehicleId) {
          conditions.push(eq(fuelings.vehicleId, input.vehicleId));
        }

        if (input.driverId) {
          conditions.push(eq(fuelings.driverId, input.driverId));
        }

        if (input.startDate) {
          conditions.push(gte(fuelings.date, input.startDate));
        }

        if (input.endDate) {
          conditions.push(lte(fuelings.date, input.endDate));
        }

        const where = conditions.length > 0 ? and(...conditions) : undefined;

        const result = await db
          .select({
            id: fuelings.id,
            vehicleId: fuelings.vehicleId,
            vehicleName: vehicles.plate,
            driverId: fuelings.driverId,
            driverName: drivers.name,
            date: fuelings.date,
            km: fuelings.km,
            liters: fuelings.liters,
            pricePerLiter: fuelings.pricePerLiter,
            totalCost: fuelings.totalCost,
            station: fuelings.station,
            city: fuelings.city,
            fuelType: fuelings.fuelType,
            receipt: fuelings.receipt,
            notes: fuelings.notes,
            createdAt: fuelings.createdAt,
          })
          .from(fuelings)
          .leftJoin(vehicles, eq(fuelings.vehicleId, vehicles.id))
          .leftJoin(drivers, eq(fuelings.driverId, drivers.id))
          .where(where)
        .orderBy(desc(fuelings.date));

        return {
          data: result,
          total: result.length,
        };
      } catch (error) {
        console.error("Erro ao listar abastecimentos:", error);
        return {
          data: [],
          total: 0,
        };
      }
    }),

  // Obter abastecimento por ID
  getById: publicProcedure
    .input(z.number().int().positive())
    .query(async ({ input }: any) => {
      try {
        const result = await db
          .select()
          .from(fuelings)
          .where(eq(fuelings.id, input))
          .limit(1);

        return result[0] || null;
      } catch (error) {
        console.error("Erro ao obter abastecimento:", error);
        return null;
      }
    }),

  // Criar novo abastecimento
  create: protectedProcedure
    .input(createFuelingSchema)
    .mutation(async ({ input }: any) => {
      try {
        const totalCost = input.liters * input.pricePerLiter;

        await db.insert(fuelings).values({
          vehicleId: input.vehicleId,
          driverId: input.driverId || null,
          date: input.date,
          km: String(input.km),
          liters: String(input.liters),
          pricePerLiter: String(input.pricePerLiter),
          totalCost: String(totalCost),
          station: input.station,
          city: input.city,
          fuelType: input.fuelType,
          receipt: input.receipt,
          notes: input.notes,
        });

        return {
          success: true,
          message: "Abastecimento registrado com sucesso",
        };
      } catch (error) {
        console.error("Erro ao criar abastecimento:", error);
        return {
          success: false,
          message: "Erro ao registrar abastecimento",
        };
      }
    }),

  // Atualizar abastecimento
  update: protectedProcedure
    .input(
      z.object({
        id: z.number().int().positive(),
        data: updateFuelingSchema,
      })
    )
    .mutation(async ({ input }: any) => {
      try {
        const totalCost = input.data.liters && input.data.pricePerLiter
          ? input.data.liters * input.data.pricePerLiter
          : undefined;

        await db
          .update(fuelings)
          .set({
            ...input.data,
            totalCost,
          })
          .where(eq(fuelings.id, input.id));

        return {
          success: true,
          message: "Abastecimento atualizado com sucesso",
        };
      } catch (error) {
        console.error("Erro ao atualizar abastecimento:", error);
        return {
          success: false,
          message: "Erro ao atualizar abastecimento",
        };
      }
    }),

  // Deletar abastecimento
  delete: protectedProcedure
    .input(z.number().int().positive())
    .mutation(async ({ input }: any) => {
      try {
        await db.delete(fuelings).where(eq(fuelings.id, input));

        return {
          success: true,
          message: "Abastecimento deletado com sucesso",
        };
      } catch (error) {
        console.error("Erro ao deletar abastecimento:", error);
        return {
          success: false,
          message: "Erro ao deletar abastecimento",
        };
      }
    }),

  // Obter estatísticas de abastecimento
  getStats: publicProcedure
    .input(
      z.object({
        vehicleId: z.number().optional(),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
      })
    )
    .query(async ({ input }: any) => {
      try {
        const conditions = [];

        if (input.vehicleId) {
          conditions.push(eq(fuelings.vehicleId, input.vehicleId));
        }

        if (input.startDate) {
          conditions.push(gte(fuelings.date, input.startDate));
        }

        if (input.endDate) {
          conditions.push(lte(fuelings.date, input.endDate));
        }

        const where = conditions.length > 0 ? and(...conditions) : undefined;

        // Primeiro, obter todos os registros
        const allRecords = await db
          .select()
          .from(fuelings)
          .where(where);

        // Calcular estatísticas manualmente
        if (allRecords.length === 0) {
          return {
            totalLiters: 0,
            totalCost: 0,
            averagePrice: 0,
            count: 0,
          };
        }

        let totalLiters = 0;
        let totalCost = 0;
        let totalPrice = 0;

        allRecords.forEach((record: any) => {
          totalLiters += Number(record.liters || 0);
          totalCost += Number(record.totalCost || 0);
          totalPrice += Number(record.pricePerLiter || 0);
        });

        return {
          totalLiters: Number(totalLiters.toFixed(2)),
          totalCost: Number(totalCost.toFixed(2)),
          averagePrice: Number((totalPrice / allRecords.length).toFixed(2)),
          count: allRecords.length,
        };
      } catch (error) {
        console.error("Erro ao obter estatísticas:", error);
        return {
          totalLiters: 0,
          totalCost: 0,
          averagePrice: 0,
          count: 0,
        };
      }
    }),

  // Obter consumo médio por veículo
  getConsumption: publicProcedure
    .input(z.number().int().positive())
    .query(async ({ input }: any) => {
      try {
        const fuelingRecords = await db
          .select()
          .from(fuelings)
          .where(eq(fuelings.vehicleId, input))
          .orderBy(desc(fuelings.date));

        if (fuelingRecords.length < 2) {
          return {
            averageConsumption: null,
            message: "Dados insuficientes para calcular consumo",
          };
        }

        let totalConsumption = 0;
        let totalDistance = 0;
        let count = 0;

        for (let i = 1; i < fuelingRecords.length; i++) {
          const prev = fuelingRecords[i - 1];
          const current = fuelingRecords[i];

          const distance = Number(current.km) - Number(prev.km);
          const consumption = distance / Number(current.liters);

          if (distance > 0 && consumption > 0) {
            totalConsumption += consumption;
            totalDistance += distance;
            count++;
          }
        }

        const averageConsumption = count > 0 ? totalConsumption / count : null;

        return {
          averageConsumption: averageConsumption ? Number(averageConsumption.toFixed(2)) : null,
          totalDistance: Number(totalDistance.toFixed(2)),
          totalFuelings: fuelingRecords.length,
        };
      } catch (error) {
        console.error("Erro ao calcular consumo:", error);
        return {
          averageConsumption: null,
          message: "Erro ao calcular consumo",
        };
      }
    }),

  // Listar veículos para seleção
  getVehicles: publicProcedure.query(async () => {
    try {
      return await db
        .select({
          id: vehicles.id,
          plate: vehicles.plate,
          type: vehicles.type,
          brand: vehicles.brand,
          model: vehicles.model,
        })
        .from(vehicles)
        .where(eq(vehicles.status, "ativo"));
    } catch (error) {
      console.error("Erro ao listar veículos:", error);
      return [];
    }
  }),

  // Listar motoristas para seleção
  getDrivers: publicProcedure.query(async () => {
    try {
      return await db
        .select({
          id: drivers.id,
          name: drivers.name,
        })
        .from(drivers)
        .where(eq(drivers.status, "ativo"));
    } catch (error) {
      console.error("Erro ao listar motoristas:", error);
      return [];
    }
  }),
});
