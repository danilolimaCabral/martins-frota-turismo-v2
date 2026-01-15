import { db } from "./db";
import { routeShares, routeShareEvents } from "../drizzle/schema";
import { eq, and, lt } from "drizzle-orm";
import { notifyOwner } from "./_core/notification";

interface ResendConfig {
  maxRetries: number;
  retryIntervalMinutes: number;
  whatsappApiUrl: string;
  whatsappApiKey: string;
}

export class WhatsAppQRCodeResender {
  private config: ResendConfig;

  constructor(config: ResendConfig) {
    this.config = config;
  }

  async checkAndResendQRCodes() {
    try {
      console.log("Verificando compartilhamentos sem resposta...");

      const unresponded = await db
        .select()
        .from(routeShares)
        .where(
          and(
            eq(routeShares.driverAccepted, false),
            lt(
              routeShares.createdAt,
              new Date(Date.now() - this.config.retryIntervalMinutes * 60 * 1000)
            )
          )
        );

      for (const share of unresponded) {
        if (share.resendAttempts >= this.config.maxRetries) {
          console.log(`Maximo de tentativas atingido para compartilhamento ${share.id}`);
          continue;
        }

        await this.sendQRCodeViaWhatsApp(share);
      }
    } catch (error) {
      console.error("Erro ao verificar compartilhamentos:", error);
    }
  }

  private async sendQRCodeViaWhatsApp(share: any) {
    try {
      const phoneNumber = share.driverPhone;
      const shareToken = share.shareToken;
      const qrCodeUrl = share.qrCodeUrl;
      const routeName = share.routeName;

      const message = `
Ola!

Voce recebeu uma nova rota para aceitar:

${routeName}

Clique no link abaixo para visualizar e aceitar a rota:
${process.env.VITE_FRONTEND_URL}/compartilhar-rota/${shareToken}

Ou escaneie o QR Code anexado.

Tentativa: ${share.resendAttempts + 1}/${this.config.maxRetries}

Obrigado!
      `;

      const response = await fetch(`${this.config.whatsappApiUrl}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.config.whatsappApiKey}`,
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to: phoneNumber,
          type: "template",
          template: {
            name: "route_qr_code",
            language: {
              code: "pt_BR",
            },
            components: [
              {
                type: "body",
                parameters: [
                  {
                    type: "text",
                    text: message,
                  },
                  {
                    type: "image",
                    image: {
                      link: qrCodeUrl,
                    },
                  },
                ],
              },
            ],
          },
        }),
      });

      if (response.ok) {
        await db
          .update(routeShares)
          .set({
            resendAttempts: share.resendAttempts + 1,
            lastResendAt: new Date(),
          } as any)
          .where(eq(routeShares.id, share.id));

        await db.insert(routeShareEvents).values({
          shareId: share.id,
          eventType: "resend_attempt",
        } as any);

        console.log(`QR Code reenviado para ${phoneNumber} (tentativa ${share.resendAttempts + 1})`);

        await notifyOwner({
          title: "QR Code Reenviado",
          content: `QR Code reenviado para ${phoneNumber} - Tentativa ${share.resendAttempts + 1}/${this.config.maxRetries}`,
        });
      } else {
        console.error(`Erro ao enviar QR Code para ${phoneNumber}:`, response.statusText);
      }
    } catch (error) {
      console.error("Erro ao enviar QR Code via WhatsApp:", error);
    }
  }

  startScheduledCheck(intervalMinutes: number = 5) {
    console.log(`Iniciando verificacao periodica a cada ${intervalMinutes} minutos`);

    setInterval(() => {
      this.checkAndResendQRCodes();
    }, intervalMinutes * 60 * 1000);
  }
}

export const whatsappResender = new WhatsAppQRCodeResender({
  maxRetries: 3,
  retryIntervalMinutes: 5,
  whatsappApiUrl: process.env.WHATSAPP_API_URL || "https://graph.instagram.com/v18.0",
  whatsappApiKey: process.env.WHATSAPP_API_KEY || "",
});
