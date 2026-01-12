import { router, publicProcedure, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import { fuelings, vehicles, drivers } from "../drizzle/schema";
import { eq, and, gte, lte, desc, sql } from "drizzle-orm";
import { db } from "./db";

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
        .orderBy(desc(fuelings.date))
        .limit(input.limit)
        .offset(input.offset);

      return {
        data: result,
        total: result.length,
      };
    }),

  // Obter abastecimento por ID
  getById: publicProcedure
    .input(z.number().int().positive())
    .query(async ({ input }: any) => {
      const result = await db
        .select()
        .from(fuelings)
        .where(eq(fuelings.id, input))
        .limit(1);

      return result[0] || null;
    }),

  // Criar novo abastecimento
  create: protectedProcedure
    .input(createFuelingSchema)
    .mutation(async ({ input }: any) => {
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
    }),

  // Deletar abastecimento
  delete: protectedProcedure
    .input(z.number().int().positive())
    .mutation(async ({ input }: any) => {
      await db.delete(fuelings).where(eq(fuelings.id, input));

      return {
        success: true,
        message: "Abastecimento deletado com sucesso",
      };
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

      const result = await db
        .select({
          totalLiters: sql`SUM(${fuelings.liters})`,
          totalCost: sql`SUM(${fuelings.totalCost})`,
          averagePrice: sql`AVG(${fuelings.pricePerLiter})`,
          count: sql`COUNT(*)`,
        })
        .from(fuelings)
        .where(where);

      const data = result[0];
      return {
        totalLiters: Number(data?.totalLiters || 0),
        totalCost: Number(data?.totalCost || 0),
        averagePrice: Number(data?.averagePrice || 0),
        count: Number(data?.count || 0),
      };
    }),

  // Obter consumo médio por veículo
  getConsumption: publicProcedure
    .input(z.number().int().positive())
    .query(async ({ input }: any) => {
      const fuelingRecords = await db
        .select()
        .from(fuelings)
        .where(eq(fuelings.vehicleId, input))
        .orderBy(fuelings.date);

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
    }),

  // Listar veículos para seleção
  getVehicles: publicProcedure.query(async () => {
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
  }),

  // Listar motoristas para seleção
  getDrivers: publicProcedure.query(async () => {
    return await db
      .select({
        id: drivers.id,
        name: drivers.name,
      })
      .from(drivers)
      .where(eq(drivers.status, "ativo"));
  }),
});
