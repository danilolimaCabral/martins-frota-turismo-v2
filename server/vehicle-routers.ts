import { z } from "zod";
import { publicProcedure, protectedProcedure, router, createPermissionProcedure } from "./_core/trpc";
import { db } from "./db";
import { vehicles } from "../drizzle/schema";
import { eq } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { logAudit } from "./_core/audit";

const frotaProcedure = createPermissionProcedure("frota");

export const vehicleRouter = router({
  // Listar todos os veículos
  list: frotaProcedure.query(async () => {
    return await db.select().from(vehicles).orderBy(vehicles.createdAt);
  }),

  // Buscar veículo por ID
  getById: frotaProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const vehicle = await db
        .select()
        .from(vehicles)
        .where(eq(vehicles.id, input.id))
        .limit(1);

      if (!vehicle[0]) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Veículo não encontrado",
        });
      }

      return vehicle[0];
    }),

  // Criar novo veículo
  create: frotaProcedure
    .input(
      z.object({
        fleetNumber: z.string().min(5), // Número de frota (mín 5 caracteres)
        plate: z.string().min(7).max(10),
        model: z.string().min(1),
        brand: z.string().min(1),
        year: z.number().int().min(1900).max(2100),
        type: z.enum(["onibus", "van", "micro-onibus"]),
        capacity: z.number().int().min(1),
        color: z.string().optional(),
        renavam: z.string().optional(),
        chassis: z.string().optional(),
        status: z.enum(["ativo", "manutencao", "inativo"]).default("ativo"),
        currentKm: z.string().default("0"),
        gpsDevice: z.string().optional(),
        notes: z.string().optional(),
        // Documentação
        rcoExpiry: z.string().optional(), // Data de validade RCO
        rcoHasThirdParty: z.boolean().default(false), // Tem cobertura de terceiros
        imetroExpiry: z.string().optional(), // Data de validade IMETRO
        tachographExpiry: z.string().optional(), // Data de validade Tacógrafo
        ipvaExpiry: z.string().optional(), // Data de validade IPVA
        ipvaIsInstallment: z.boolean().default(false), // IPVA parcelado
        ipvaInstallments: z.number().int().optional(), // Número de parcelas
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Converter datas de string para Date se fornecidas
      const vehicleData = {
        ...input,
        rcoExpiry: input.rcoExpiry ? new Date(input.rcoExpiry) : undefined,
        imetroExpiry: input.imetroExpiry ? new Date(input.imetroExpiry) : undefined,
        tachographExpiry: input.tachographExpiry ? new Date(input.tachographExpiry) : undefined,
        ipvaExpiry: input.ipvaExpiry ? new Date(input.ipvaExpiry) : undefined,
      };
      
      const [result] = await db.insert(vehicles).values(vehicleData);
      
      // Log de auditoria
      await logAudit({
        userId: ctx.user!.id,
        username: (ctx.user as any).username || ctx.user!.name,
        action: "create",
        module: "frota",
        entity: "vehicles",
        entityId: result.insertId,
        description: `Criou veículo: ${input.plate} - ${input.model}`,
        newValues: input,
        ipAddress: ctx.req.ip || "unknown",
        userAgent: ctx.req.headers["user-agent"] || "unknown",
      });

      return { success: true };
    }),

  // Atualizar veículo
  update: frotaProcedure
    .input(
      z.object({
        id: z.number(),
        fleetNumber: z.string().min(5).optional(),
        plate: z.string().min(7).max(10).optional(),
        model: z.string().min(1).optional(),
        brand: z.string().min(1).optional(),
        year: z.number().int().min(1900).max(2100).optional(),
        type: z.enum(["onibus", "van", "micro-onibus"]).optional(),
        capacity: z.number().int().min(1).optional(),
        color: z.string().optional(),
        renavam: z.string().optional(),
        chassis: z.string().optional(),
        status: z.enum(["ativo", "manutencao", "inativo"]).optional(),
        currentKm: z.string().optional(),
        gpsDevice: z.string().optional(),
        notes: z.string().optional(),
        // Documentação
        rcoExpiry: z.string().optional(),
        rcoHasThirdParty: z.boolean().optional(),
        imetroExpiry: z.string().optional(),
        tachographExpiry: z.string().optional(),
        ipvaExpiry: z.string().optional(),
        ipvaIsInstallment: z.boolean().optional(),
        ipvaInstallments: z.number().int().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { id, ...data } = input;
      
      // Converter datas de string para Date se fornecidas
      const updateData = {
        ...data,
        rcoExpiry: data.rcoExpiry ? new Date(data.rcoExpiry) : undefined,
        imetroExpiry: data.imetroExpiry ? new Date(data.imetroExpiry) : undefined,
        tachographExpiry: data.tachographExpiry ? new Date(data.tachographExpiry) : undefined,
        ipvaExpiry: data.ipvaExpiry ? new Date(data.ipvaExpiry) : undefined,
      };
      
      // Remover undefined values
      Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key]);
      
      // Buscar valores antigos
      const [oldVehicle] = await db.select().from(vehicles).where(eq(vehicles.id, id)).limit(1);

      await db
        .update(vehicles)
        .set(updateData)
        .where(eq(vehicles.id, id));
      
      // Log de auditoria
      await logAudit({
        userId: ctx.user!.id,
        username: (ctx.user as any).username || ctx.user!.name,
        action: "update",
        module: "frota",
        entity: "vehicles",
        entityId: id,
        description: `Atualizou veículo: ${oldVehicle?.plate || id}`,
        oldValues: oldVehicle,
        newValues: { ...oldVehicle, ...data },
        ipAddress: ctx.req.ip || "unknown",
        userAgent: ctx.req.headers["user-agent"] || "unknown",
      });

      return { success: true };
    }),

  // Deletar veículo
  delete: frotaProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      // Buscar dados antes de deletar
      const [vehicle] = await db.select().from(vehicles).where(eq(vehicles.id, input.id)).limit(1);
      
      await db.delete(vehicles).where(eq(vehicles.id, input.id));
      
      // Log de auditoria
      await logAudit({
        userId: ctx.user!.id,
        username: (ctx.user as any).username || ctx.user!.name,
        action: "delete",
        module: "frota",
        entity: "vehicles",
        entityId: input.id,
        description: `Deletou veículo: ${vehicle?.plate || input.id}`,
        oldValues: vehicle,
        ipAddress: ctx.req.ip || "unknown",
        userAgent: ctx.req.headers["user-agent"] || "unknown",
      });

      return { success: true };
    }),

  // Atualizar KM do veículo
  updateKm: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        currentKm: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      await db
        .update(vehicles)
        .set({
          currentKm: input.currentKm,
        })
        .where(eq(vehicles.id, input.id));

      return { success: true };
    }),

  // Atualizar status do veículo
  updateStatus: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        status: z.enum(["ativo", "manutencao", "inativo"]),
      })
    )
    .mutation(async ({ input }) => {
      await db
        .update(vehicles)
        .set({
          status: input.status,
          updatedAt: new Date(),
        })
        .where(eq(vehicles.id, input.id));

      return { success: true };
    }),
});
