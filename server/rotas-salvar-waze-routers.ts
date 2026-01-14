import { router, publicProcedure, protectedProcedure } from "./trpc";
import { z } from "zod";
import { db } from "./db";
import { rotasOtimizadas, rotasHistorico } from "../drizzle/schema";
import { eq, desc } from "drizzle-orm";

export const rotasSalvarWazeRouter = router({
  // Salvar rota otimizada
  salvarRota: protectedProcedure
    .input(
      z.object({
        nome: z.string(),
        descricao: z.string().optional(),
        pontos: z.array(
          z.object({
            id: z.number(),
            nome: z.string(),
            latitude: z.number(),
            longitude: z.number(),
            sequencia: z.number(),
          })
        ),
        distancia_total: z.number(),
        tempo_estimado: z.number(),
        economia_percentual: z.number(),
        combustivel_economizado: z.number(),
        algoritmo_usado: z.string(),
        motorista_id: z.number().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const resultado = await db.insert(rotasOtimizadas).values({
          nome: input.nome,
          descricao: input.descricao,
          pontos_embarque: JSON.stringify(input.pontos),
          distancia_total: input.distancia_total,
          tempo_estimado: input.tempo_estimado,
          economia_percentual: input.economia_percentual,
          combustivel_economizado: input.combustivel_economizado,
          algoritmo_usado: input.algoritmo_usado,
          motorista_id: input.motorista_id,
          usuario_id: ctx.user.id,
          status: "salva",
          data_criacao: new Date(),
        });

        console.log(`✅ Rota "${input.nome}" salva com sucesso`);

        return {
          sucesso: true,
          mensagem: `Rota "${input.nome}" salva com sucesso!`,
          rota_id: resultado.insertId,
        };
      } catch (erro) {
        console.error("❌ Erro ao salvar rota:", erro);
        throw new Error("Erro ao salvar rota no banco de dados");
      }
    }),

  // Obter todas as rotas salvas
  obterRotasSalvas: protectedProcedure.query(async ({ ctx }) => {
    try {
      const rotas = await db
        .select()
        .from(rotasOtimizadas)
        .where(eq(rotasOtimizadas.usuario_id, ctx.user.id))
        .orderBy(desc(rotasOtimizadas.data_criacao));

      return rotas.map((rota) => ({
        ...rota,
        pontos_embarque: JSON.parse(rota.pontos_embarque || "[]"),
      }));
    } catch (erro) {
      console.error("❌ Erro ao obter rotas:", erro);
      throw new Error("Erro ao obter rotas salvas");
    }
  }),

  // Gerar link para Waze
  gerarLinkWaze: publicProcedure
    .input(
      z.object({
        pontos: z.array(
          z.object({
            latitude: z.number(),
            longitude: z.number(),
            nome: z.string().optional(),
          })
        ),
      })
    )
    .query(({ input }) => {
      try {
        if (input.pontos.length === 0) {
          throw new Error("Nenhum ponto fornecido");
        }

        // Primeiro ponto é o ponto de partida
        const inicio = input.pontos[0];

        // Último ponto é o destino
        const destino = input.pontos[input.pontos.length - 1];

        // Pontos intermediários (waypoints)
        const waypoints = input.pontos.slice(1, -1);

        // Construir URL do Waze
        let urlWaze = `https://waze.com/ul?navigate=yes&ll=${destino.latitude},${destino.longitude}`;

        // Adicionar waypoints se existirem
        if (waypoints.length > 0) {
          waypoints.forEach((ponto) => {
            urlWaze += `&rt=${ponto.latitude},${ponto.longitude}`;
          });
        }

        console.log(`✅ Link Waze gerado com ${input.pontos.length} pontos`);

        return {
          sucesso: true,
          link_waze: urlWaze,
          pontos_totais: input.pontos.length,
          destino: `${destino.latitude}, ${destino.longitude}`,
        };
      } catch (erro) {
        console.error("❌ Erro ao gerar link Waze:", erro);
        throw new Error("Erro ao gerar link para Waze");
      }
    }),

  // Gerar link para Google Maps
  gerarLinkGoogleMaps: publicProcedure
    .input(
      z.object({
        pontos: z.array(
          z.object({
            latitude: z.number(),
            longitude: z.number(),
            nome: z.string().optional(),
          })
        ),
      })
    )
    .query(({ input }) => {
      try {
        if (input.pontos.length === 0) {
          throw new Error("Nenhum ponto fornecido");
        }

        // Primeiro ponto é o ponto de partida
        const inicio = input.pontos[0];

        // Último ponto é o destino
        const destino = input.pontos[input.pontos.length - 1];

        // Pontos intermediários (waypoints)
        const waypoints = input.pontos.slice(1, -1);

        // Construir URL do Google Maps
        let urlGoogleMaps = `https://www.google.com/maps/dir/?api=1&origin=${inicio.latitude},${inicio.longitude}&destination=${destino.latitude},${destino.longitude}`;

        // Adicionar waypoints se existirem
        if (waypoints.length > 0) {
          const waypointsStr = waypoints.map((p) => `${p.latitude},${p.longitude}`).join("|");
          urlGoogleMaps += `&waypoints=${waypointsStr}`;
        }

        console.log(`✅ Link Google Maps gerado com ${input.pontos.length} pontos`);

        return {
          sucesso: true,
          link_google_maps: urlGoogleMaps,
          pontos_totais: input.pontos.length,
          destino: `${destino.latitude}, ${destino.longitude}`,
        };
      } catch (erro) {
        console.error("❌ Erro ao gerar link Google Maps:", erro);
        throw new Error("Erro ao gerar link para Google Maps");
      }
    }),

  // Compartilhar rota com motorista
  compartilharRotaMotorista: protectedProcedure
    .input(
      z.object({
        rota_id: z.number(),
        motorista_id: z.number(),
        plataforma: z.enum(["waze", "google_maps", "link_direto"]),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        // Obter rota
        const rota = await db
          .select()
          .from(rotasOtimizadas)
          .where(eq(rotasOtimizadas.id, input.rota_id))
          .limit(1);

        if (rota.length === 0) {
          throw new Error("Rota não encontrada");
        }

        const rotaData = rota[0];
        const pontos = JSON.parse(rotaData.pontos_embarque || "[]");

        // Gerar link baseado na plataforma
        let link = "";
        if (input.plataforma === "waze") {
          const destino = pontos[pontos.length - 1];
          link = `https://waze.com/ul?navigate=yes&ll=${destino.latitude},${destino.longitude}`;
        } else if (input.plataforma === "google_maps") {
          const inicio = pontos[0];
          const destino = pontos[pontos.length - 1];
          link = `https://www.google.com/maps/dir/?api=1&origin=${inicio.latitude},${inicio.longitude}&destination=${destino.latitude},${destino.longitude}`;
        } else {
          link = `/motorista/rota/${rotaData.id}`;
        }

        // Registrar compartilhamento no histórico
        await db.insert(rotasHistorico).values({
          rota_id: input.rota_id,
          motorista_id: input.motorista_id,
          acao: "compartilhada",
          plataforma: input.plataforma,
          link_compartilhado: link,
          usuario_id: ctx.user.id,
          data_acao: new Date(),
        });

        console.log(`✅ Rota compartilhada com motorista ${input.motorista_id} via ${input.plataforma}`);

        return {
          sucesso: true,
          mensagem: `Rota compartilhada com sucesso via ${input.plataforma}!`,
          link,
        };
      } catch (erro) {
        console.error("❌ Erro ao compartilhar rota:", erro);
        throw new Error("Erro ao compartilhar rota");
      }
    }),

  // Obter histórico de rotas
  obterHistoricoRotas: protectedProcedure.query(async ({ ctx }) => {
    try {
      const historico = await db
        .select()
        .from(rotasHistorico)
        .where(eq(rotasHistorico.usuario_id, ctx.user.id))
        .orderBy(desc(rotasHistorico.data_acao));

      return historico;
    } catch (erro) {
      console.error("❌ Erro ao obter histórico:", erro);
      throw new Error("Erro ao obter histórico de rotas");
    }
  }),

  // Deletar rota
  deletarRota: protectedProcedure
    .input(z.object({ rota_id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      try {
        await db.delete(rotasOtimizadas).where(eq(rotasOtimizadas.id, input.rota_id));

        console.log(`✅ Rota ${input.rota_id} deletada com sucesso`);

        return {
          sucesso: true,
          mensagem: "Rota deletada com sucesso!",
        };
      } catch (erro) {
        console.error("❌ Erro ao deletar rota:", erro);
        throw new Error("Erro ao deletar rota");
      }
    }),
});
