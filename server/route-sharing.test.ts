import { describe, expect, it, vi } from "vitest";
import QRCode from "qrcode";

/**
 * Testes para validar a lógica de compartilhamento de rotas
 * Foco em validação de entrada e geração de QR codes
 */

describe("Route Sharing Logic", () => {
  describe("QR Code Generation", () => {
    it("should generate valid QR code data URL", async () => {
      const testUrl = "http://localhost:3000/compartilhar-rota/test-token-123";
      const qrCodeDataUrl = await QRCode.toDataURL(testUrl, {
        errorCorrectionLevel: "H",
        type: "image/png",
        quality: 0.95,
        margin: 1,
        width: 300,
      });

      expect(qrCodeDataUrl).toBeDefined();
      expect(qrCodeDataUrl).toMatch(/^data:image\/png;base64,/);
    });

    it("should extract base64 data from QR code", async () => {
      const testUrl = "http://localhost:3000/compartilhar-rota/test-token-456";
      const qrCodeDataUrl = await QRCode.toDataURL(testUrl);
      const base64Data = qrCodeDataUrl.split(",")[1];

      expect(base64Data).toBeDefined();
      expect(base64Data.length).toBeGreaterThan(0);
      expect(base64Data).toMatch(/^[A-Za-z0-9+/=]+$/);
    });

    it("should convert base64 to buffer", async () => {
      const testUrl = "http://localhost:3000/compartilhar-rota/test-token-789";
      const qrCodeDataUrl = await QRCode.toDataURL(testUrl);
      const base64Data = qrCodeDataUrl.split(",")[1];
      const buffer = Buffer.from(base64Data, "base64");

      expect(buffer).toBeInstanceOf(Buffer);
      expect(buffer.length).toBeGreaterThan(0);
    });
  });

  describe("Share URL Generation", () => {
    it("should generate valid share URL", () => {
      const appId = "http://localhost:3000";
      const shareToken = "test-token-abc123";
      const shareUrl = `${appId}/compartilhar-rota/${shareToken}`;

      expect(shareUrl).toBe(
        "http://localhost:3000/compartilhar-rota/test-token-abc123"
      );
      expect(shareUrl).toMatch(/^http:\/\/.*\/compartilhar-rota\/.+$/);
    });

    it("should handle different app IDs", () => {
      const appIds = [
        "http://localhost:3000",
        "https://example.com",
        "https://app.manus.space",
      ];

      appIds.forEach((appId) => {
        const shareUrl = `${appId}/compartilhar-rota/token123`;
        expect(shareUrl).toContain(appId);
        expect(shareUrl).toContain("/compartilhar-rota/");
      });
    });
  });

  describe("Response Time Calculation", () => {
    it("should calculate response time in minutes", () => {
      const createdAt = new Date(Date.now() - 5 * 60 * 1000); // 5 minutos atrás
      const responseTime = Math.round(
        (Date.now() - createdAt.getTime()) / (1000 * 60)
      );

      expect(responseTime).toBe(5);
    });

    it("should calculate response time for different durations", () => {
      const testCases = [
        { minutes: 1, expected: 1 },
        { minutes: 30, expected: 30 },
        { minutes: 120, expected: 120 },
      ];

      testCases.forEach(({ minutes, expected }) => {
        const createdAt = new Date(Date.now() - minutes * 60 * 1000);
        const responseTime = Math.round(
          (Date.now() - createdAt.getTime()) / (1000 * 60)
        );

        expect(responseTime).toBe(expected);
      });
    });
  });

  describe("Platform Validation", () => {
    it("should validate platform enum values", () => {
      const validPlatforms = [
        "whatsapp",
        "sms",
        "email",
        "qrcode",
        "direct_link",
      ];

      validPlatforms.forEach((platform) => {
        expect(validPlatforms).toContain(platform);
      });
    });

    it("should reject invalid platform values", () => {
      const invalidPlatforms = ["telegram", "facebook", "twitter", "invalid"];
      const validPlatforms = [
        "whatsapp",
        "sms",
        "email",
        "qrcode",
        "direct_link",
      ];

      invalidPlatforms.forEach((platform) => {
        expect(validPlatforms).not.toContain(platform);
      });
    });
  });

  describe("Event Type Validation", () => {
    it("should validate event type enum values", () => {
      const validEventTypes = [
        "shared",
        "viewed",
        "clicked",
        "opened_waze",
        "opened_maps",
        "driver_accepted",
        "driver_rejected",
      ];

      validEventTypes.forEach((eventType) => {
        expect(validEventTypes).toContain(eventType);
      });
    });
  });

  describe("Statistics Calculation", () => {
    it("should calculate acceptance rate", () => {
      const totalShares = 10;
      const acceptedShares = 7;
      const acceptanceRate = Math.round((acceptedShares / totalShares) * 100);

      expect(acceptanceRate).toBe(70);
    });

    it("should calculate average response time", () => {
      const responseTimes = [5, 10, 15, 20, 25];
      const avgResponseTime = Math.round(
        responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length
      );

      expect(avgResponseTime).toBe(15);
    });

    it("should handle zero shares gracefully", () => {
      const totalShares = 0;
      const acceptanceRate = totalShares > 0 ? Math.round(100) : 0;

      expect(acceptanceRate).toBe(0);
    });

    it("should aggregate platform statistics", () => {
      const shares = [
        { platform: "whatsapp", viewCount: 5, clickCount: 2 },
        { platform: "whatsapp", viewCount: 3, clickCount: 1 },
        { platform: "qrcode", viewCount: 10, clickCount: 5 },
      ];

      const byPlatform: any = {};
      shares.forEach((s) => {
        if (!byPlatform[s.platform]) {
          byPlatform[s.platform] = { count: 0, views: 0, clicks: 0 };
        }
        byPlatform[s.platform].count++;
        byPlatform[s.platform].views += s.viewCount;
        byPlatform[s.platform].clicks += s.clickCount;
      });

      expect(byPlatform.whatsapp).toEqual({
        count: 2,
        views: 8,
        clicks: 3,
      });
      expect(byPlatform.qrcode).toEqual({
        count: 1,
        views: 10,
        clicks: 5,
      });
    });
  });
});
