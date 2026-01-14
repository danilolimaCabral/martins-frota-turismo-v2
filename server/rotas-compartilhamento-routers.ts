import { router, protectedProcedure } from "./routers";
import { z } from "zod";
import { db } from "./db";
import { rotasOtimizadas, rotasCompartilhadas } from "../drizzle/schema";
import { eq } from "drizzle-orm";

export const rotasCompartilhamentoRouter = router({
  // Salvar rota otimizada
  salvarRota: protectedProcedure
    .input(
      z.object({
        nome: z.string(),
        algoritmo: z.string(),
        distancia: z.number(),
        tempo: z.number(),
        economia: z.number(),
        combustivel: z.number(),
        custo: z.number(),
        pontos: z.array(
          z.object({
            id: z.number(),
            nome: z.string(),
            latitude: z.number(),
            longitude: z.number(),
          })
        ),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const result = await db.insert(rotasOtimizadas).values({
        nome: input.nome,
        algoritmo: input.algoritmo,
        distancia: input.distancia,
        tempo: input.tempo,
        economia: input.economia,
        combustivel: input.combustivel,
        custo: input.custo,
        pontos: JSON.stringify(input.pontos),
        usuarioId: ctx.user.id,
        dataCriacao: new Date(),
      });

      return {
        id: result.insertId,
        mensagem: "✅ Rota salva com sucesso!",
      };
    }),

  // Compartilhar rota com motorista
  compartilharRota: protectedProcedure
    .input(
      z.object({
        rotaId: z.number(),
        motoristaEmail: z.string().email(),
      })
    )
    .mutation(async ({ input }) => {
      const rota = await db
        .select()
        .from(rotasOtimizadas)
        .where(eq(rotasOtimizadas.id, input.rotaId))
        .limit(1);

      if (!rota.length) {
        throw new Error("Rota não encontrada");
      }

      // Gerar token único para compartilhamento
      const token = Math.random().toString(36).substring(2, 15);

      await db.insert(rotasCompartilhadas).values({
        rotaId: input.rotaId,
        motoristaEmail: input.motoristaEmail,
        token,
        dataCriacao: new Date(),
      });

      // URL para o motorista acessar
      const urlCompartilhada = `${process.env.VITE_FRONTEND_URL}/motorista/rota/${token}`;

      return {
        mensagem: "✅ Rota compartilhada com sucesso!",
        urlCompartilhada,
        token,
      };
    }),

  // Gerar link para Waze
  gerarLinkWaze: protectedProcedure
    .input(z.object({ rotaId: z.number() }))
    .query(async ({ input }) => {
      const rota = await db
        .select()
        .from(rotasOtimizadas)
        .where(eq(rotasOtimizadas.id, input.rotaId))
        .limit(1);

      if (!rota.length) {
        throw new Error("Rota não encontrada");
      }

      const pontos = JSON.parse(rota[0].pontos);
      if (pontos.length === 0) {
        throw new Error("Rota sem pontos");
      }

      // Primeiro ponto como origem, último como destino
      const origem = pontos[0];
      const destino = pontos[pontos.length - 1];

      // URL do Waze
      const urlWaze = `https://waze.com/ul?ll=${destino.latitude},${destino.longitude}&navigate=yes&zoom=17`;

      return {
        urlWaze,
        origem: `${origem.latitude},${origem.longitude}`,
        destino: `${destino.latitude},${destino.longitude}`,
      };
    }),

  // Gerar link para Google Maps
  gerarLinkGoogleMaps: protectedProcedure
    .input(z.object({ rotaId: z.number() }))
    .query(async ({ input }) => {
      const rota = await db
        .select()
        .from(rotasOtimizadas)
        .where(eq(rotasOtimizadas.id, input.rotaId))
        .limit(1);

      if (!rota.length) {
        throw new Error("Rota não encontrada");
      }

      const pontos = JSON.parse(rota[0].pontos);
      if (pontos.length === 0) {
        throw new Error("Rota sem pontos");
      }

      // Construir URL com waypoints
      const origem = `${pontos[0].latitude},${pontos[0].longitude}`;
      const destino = `${pontos[pontos.length - 1].latitude},${pontos[pontos.length - 1].longitude}`;

      // Waypoints intermediários
      const waypoints = pontos
        .slice(1, -1)
        .map((p: any) => `${p.latitude},${p.longitude}`)
        .join("|");

      const urlGoogleMaps = `https://www.google.com/maps/dir/${origem}/${destino}${
        waypoints ? `?waypoints=${waypoints}` : ""
      }`;

      return {
        urlGoogleMaps,
        origem,
        destino,
        waypoints: waypoints ? waypoints.split("|") : [],
      };
    }),

  // Listar rotas salvas
  listarRotas: protectedProcedure.query(async ({ ctx }) => {
    const rotas = await db
      .select()
      .from(rotasOtimizadas)
      .where(eq(rotasOtimizadas.usuarioId, ctx.user.id));

    return rotas.map((rota) => ({
      ...rota,
      pontos: JSON.parse(rota.pontos),
    }));
  }),

  // Deletar rota
  deletarRota: protectedProcedure
    .input(z.object({ rotaId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      await db
        .delete(rotasOtimizadas)
        .where(eq(rotasOtimizadas.id, input.rotaId));

      return {
        mensagem: "✅ Rota deletada com sucesso!",
      };
    }),

  // Gerar QR Code para compartilhamento
  gerarQRCode: protectedProcedure
    .input(z.object({ rotaId: z.number() }))
    .query(async ({ input }) => {
      const rota = await db
        .select()
        .from(rotasOtimizadas)
        .where(eq(rotasOtimizadas.id, input.rotaId))
        .limit(1);

      if (!rota.length) {
        throw new Error("Rota não encontrada");
      }

      const urlCompartilhada = `${process.env.VITE_FRONTEND_URL}/motorista/rota/${input.rotaId}`;

      // API para gerar QR Code
      const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(
        urlCompartilhada
      )}`;

      return {
        qrCodeUrl,
        urlCompartilhada,
      };
    }),
});
