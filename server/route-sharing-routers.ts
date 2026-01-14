/**
 * Procedures tRPC para Compartilhamento de Rotas com QR Code
 * Gerencia QR codes, links de compartilhamento e analytics
 */

import { protectedProcedure } from "./_core/trpc";
import { router } from "./_core/trpc";
import { z } from "zod";
import { db } from "./db";
import { routeShares, routeShareEvents, optimizedRoutes } from "../drizzle/schema";
import { eq, desc, and } from "drizzle-orm";
import QRCode from "qrcode";
import { v4 as uuidv4 } from "uuid";
import { storagePut } from "./storage";

export const routeSharingRouter = router({
  // Gerar QR Code para uma rota
  generateQRCode: protectedProcedure
    .input(
      z.object({
        routeId: z.number(),
        platform: z.enum(["whatsapp", "sms", "email", "qrcode", "direct_link"]),
        sharedWithDriverId: z.number().optional(),
        sharedWithEmail: z.string().email().optional(),
        sharedWithPhone: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }: any) => {
      try {
        // Verificar se rota existe
        const route = await db
          .select()
          .from(optimizedRoutes)
          .where(eq(optimizedRoutes.id, input.routeId))
          .limit(1);

        if (!route || route.length === 0) {
          throw new Error("Rota não encontrada");
        }

        // Gerar token único
        const shareToken = uuidv4();
        const shareUrl = `${process.env.VITE_APP_ID || "http://localhost:3000"}/compartilhar-rota/${shareToken}`;

        // Gerar QR Code como imagem
        const qrCodeDataUrl = await QRCode.toDataURL(shareUrl, {
          errorCorrectionLevel: "H",
          type: "image/png",
          quality: 0.95,
          margin: 1,
          width: 300,
        });

        // Converter data URL para buffer e fazer upload para S3
        const base64Data = qrCodeDataUrl.split(",")[1];
        const buffer = Buffer.from(base64Data, "base64");
        
        const qrCodeKey = `route-qr-codes/${shareToken}.png`;
        const { url: qrCodeUrl } = await storagePut(qrCodeKey, buffer, "image/png");

        // Salvar compartilhamento no banco
        const result = await db.insert(routeShares).values({
          routeId: input.routeId,
          shareToken,
          platform: input.platform,
          qrCodeUrl,
          qrCodeData: shareUrl,
          sharedWithDriverId: input.sharedWithDriverId || null,
          sharedWithEmail: input.sharedWithEmail || null,
          sharedWithPhone: input.sharedWithPhone || null,
          sharedBy: ctx.user.id,
          isActive: true,
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 dias
        } as any);

        // Registrar evento de compartilhamento
        await db.insert(routeShareEvents).values({
          shareId: (result as any)[0],
          eventType: "shared",
          userAgent: ctx.user.id.toString(),
        } as any);

        return {
          success: true,
          message: "QR Code gerado com sucesso",
          shareToken,
          qrCodeUrl,
          shareUrl,
          shareId: (result as any)[0],
        };
      } catch (error: any) {
        throw new Error(`Erro ao gerar QR Code: ${error.message}`);
      }
    }),

  // Obter QR Code de uma rota
  getQRCode: protectedProcedure
    .input(z.number())
    .query(async ({ input }: any) => {
      const share = await db
        .select()
        .from(routeShares)
        .where(and(eq(routeShares.routeId, input), eq(routeShares.platform, "qrcode")))
        .orderBy(desc(routeShares.createdAt))
        .limit(1);

      if (!share || share.length === 0) {
        return null;
      }

      return share[0];
    }),

  // Listar todos os compartilhamentos de uma rota
  listShares: protectedProcedure
    .input(z.number())
    .query(async ({ input }: any) => {
      const shares = await db
        .select()
        .from(routeShares)
        .where(eq(routeShares.routeId, input))
        .orderBy(desc(routeShares.createdAt));

      return shares || [];
    }),

  // Registrar visualização de QR Code
  recordView: protectedProcedure
    .input(z.number())
    .mutation(async ({ input }: any) => {
      const share = await db
        .select()
        .from(routeShares)
        .where(eq(routeShares.id, input))
        .limit(1);

      if (!share || share.length === 0) {
        throw new Error("Compartilhamento não encontrado");
      }

      // Incrementar contador de visualizações
      await db
        .update(routeShares)
        .set({
          viewCount: (share[0].viewCount || 0) + 1,
          updatedAt: new Date(),
        } as any)
        .where(eq(routeShares.id, input));

      // Registrar evento
      await db.insert(routeShareEvents).values({
        shareId: input,
        eventType: "viewed",
      } as any);

      return { success: true };
    }),

  // Registrar clique no link
  recordClick: protectedProcedure
    .input(z.number())
    .mutation(async ({ input }: any) => {
      const share = await db
        .select()
        .from(routeShares)
        .where(eq(routeShares.id, input))
        .limit(1);

      if (!share || share.length === 0) {
        throw new Error("Compartilhamento não encontrado");
      }

      // Incrementar contador de cliques
      await db
        .update(routeShares)
        .set({
          clickCount: (share[0].clickCount || 0) + 1,
          updatedAt: new Date(),
        } as any)
        .where(eq(routeShares.id, input));

      // Registrar evento
      await db.insert(routeShareEvents).values({
        shareId: input,
        eventType: "clicked",
      } as any);

      return { success: true };
    }),

  // Registrar abertura em Waze
  recordWazeOpen: protectedProcedure
    .input(z.number())
    .mutation(async ({ input }: any) => {
      await db.insert(routeShareEvents).values({
        shareId: input,
        eventType: "opened_waze",
      } as any);

      return { success: true };
    }),

  // Registrar abertura em Google Maps
  recordMapsOpen: protectedProcedure
    .input(z.number())
    .mutation(async ({ input }: any) => {
      await db.insert(routeShareEvents).values({
        shareId: input,
        eventType: "opened_maps",
      } as any);

      return { success: true };
    }),

  // Registrar aceitação do motorista
  recordDriverAccepted: protectedProcedure
    .input(z.number())
    .mutation(async ({ input }: any) => {
      const share = await db
        .select()
        .from(routeShares)
        .where(eq(routeShares.id, input))
        .limit(1);

      if (!share || share.length === 0) {
        throw new Error("Compartilhamento não encontrado");
      }

      // Calcular tempo de resposta em minutos
      const responseTime = Math.round(
        (Date.now() - new Date(share[0].createdAt).getTime()) / (1000 * 60)
      );

      // Atualizar compartilhamento
      await db
        .update(routeShares)
        .set({
          driverAccepted: true,
          driverResponseTime: responseTime,
          updatedAt: new Date(),
        } as any)
        .where(eq(routeShares.id, input));

      // Registrar evento
      await db.insert(routeShareEvents).values({
        shareId: input,
        eventType: "driver_accepted",
      } as any);

      return { success: true, responseTime };
    }),

  // Obter estatísticas de compartilhamento
  getShareStats: protectedProcedure
    .input(z.number())
    .query(async ({ input }: any) => {
      const shares = await db
        .select()
        .from(routeShares)
        .where(eq(routeShares.routeId, input));

      if (!shares || shares.length === 0) {
        return {
          totalShares: 0,
          totalViews: 0,
          totalClicks: 0,
          averageResponseTime: 0,
          acceptanceRate: 0,
          byPlatform: {},
        };
      }

      const totalViews = shares.reduce((sum, s) => sum + (s.viewCount || 0), 0);
      const totalClicks = shares.reduce((sum, s) => sum + (s.clickCount || 0), 0);
      const acceptedShares = shares.filter((s) => s.driverAccepted).length;
      const avgResponseTime =
        acceptedShares > 0
          ? Math.round(
              shares
                .filter((s) => s.driverResponseTime)
                .reduce((sum, s) => sum + (s.driverResponseTime || 0), 0) /
                acceptedShares
            )
          : 0;

      const byPlatform: any = {};
      shares.forEach((s) => {
        if (!byPlatform[s.platform]) {
          byPlatform[s.platform] = { count: 0, views: 0, clicks: 0 };
        }
        byPlatform[s.platform].count++;
        byPlatform[s.platform].views += s.viewCount || 0;
        byPlatform[s.platform].clicks += s.clickCount || 0;
      });

      return {
        totalShares: shares.length,
        totalViews,
        totalClicks,
        averageResponseTime: avgResponseTime,
        acceptanceRate:
          shares.length > 0
            ? Math.round((acceptedShares / shares.length) * 100)
            : 0,
        byPlatform,
      };
    }),

  // Deletar compartilhamento
  deleteShare: protectedProcedure
    .input(z.number())
    .mutation(async ({ input }: any) => {
      await db.delete(routeShares).where(eq(routeShares.id, input));

      return { success: true, message: "Compartilhamento deletado com sucesso" };
    }),
});
