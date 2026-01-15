import { z } from "zod";
import { db } from "./db";
import { rotasOtimizadas, rotasHistorico } from "../drizzle/schema";
import { eq, desc } from "drizzle-orm";
import type { GoogleMapsInput, GoogleMapsResponse, WazeShareInput, WazeShareResponse, TRPCContext } from "../shared/types";
import { GoogleMapsInputSchema, WazeShareInputSchema } from "./validation-schemas";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";

// ============================================================================
// SCHEMAS ESPECÍFICOS PARA ROTAS
// ============================================================================

const RotaPontoSchema = z.object({
  id: z.number().int(),
  nome: z.string(),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  sequencia: z.number().int().positive(),
});

const SalvarRotaInputSchema = z.object({
  nome: z.string().min(3, "Nome deve ter no mínimo 3 caracteres"),
  descricao: z.string().optional(),
  pontos: z.array(RotaPontoSchema).min(2, "Mínimo 2 pontos necessários"),
  distancia_total: z.number().positive(),
  tempo_estimado: z.number().positive(),
  economia_percentual: z.number().min(0).max(100),
  combustivel_economizado: z.number().min(0),
  algoritmo_usado: z.string(),
  motorista_id: z.number().int().positive().optional(),
});

const CompartilharRotaInputSchema = z.object({
  rota_id: z.number().int().positive(),
  motorista_id: z.number().int().positive(),
  plataforma: z.enum(["waze", "google_maps", "link_direto"]),
});

const DeletarRotaInputSchema = z.object({
  rota_id: z.number().int().positive(),
});

// ============================================================================
// TIPOS DERIVADOS
// ============================================================================

type SalvarRotaInput = z.infer<typeof SalvarRotaInputSchema>;
type CompartilharRotaInput = z.infer<typeof CompartilharRotaInputSchema>;
type DeletarRotaInput = z.infer<typeof DeletarRotaInputSchema>;

// ============================================================================
// ROUTER
// ============================================================================

export const rotasSalvarWazeRouter = router({
  // Salvar rota otimizada
  salvarRota: protectedProcedure
    .input(SalvarRotaInputSchema)
    .mutation(async ({ input, ctx }: { input: SalvarRotaInput; ctx: TRPCContext }): Promise<{ sucesso: boolean; mensagem: string; rota_id?: number }> => {
      try {
        if (!ctx.user) throw new Error("Usuário não autenticado");

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

        console.warn(`✅ Rota "${input.nome}" salva com sucesso`);

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
  obterRotasSalvas: protectedProcedure.query(async ({ ctx }: { ctx: TRPCContext }): Promise<Array<any>> => {
    try {
      if (!ctx.user) throw new Error("Usuário não autenticado");

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
    .input(WazeShareInputSchema)
    .query(({ input }: { input: WazeShareInput }): WazeShareResponse => {
      try {
        return {
          sucesso: true,
          url_waze: `https://waze.com/ul?navigate=yes&ll=${input.latitude},${input.longitude}&zoom=${input.zoom || 15}`,
          latitude: input.latitude,
          longitude: input.longitude,
          nome: input.nome,
        };
      } catch (erro) {
        console.error("❌ Erro ao gerar link Waze:", erro);
        throw new Error("Erro ao gerar link para Waze");
      }
    }),

  // Gerar link para Google Maps
  gerarLinkGoogleMaps: publicProcedure
    .input(GoogleMapsInputSchema)
    .query(async ({ input }: { input: GoogleMapsInput }): Promise<GoogleMapsResponse> => {
      try {
        if (input.pontos.length === 0) {
          throw new Error("Nenhum ponto fornecido");
        }

        const inicio = input.pontos[0];
        const destino = input.pontos[input.pontos.length - 1];
        const waypoints = input.pontos.slice(1, -1);

        let urlGoogleMaps = `https://www.google.com/maps/dir/?api=1&origin=${inicio.latitude},${inicio.longitude}&destination=${destino.latitude},${destino.longitude}`;

        if (waypoints.length > 0) {
          const waypointsStr = waypoints.map((p) => `${p.latitude},${p.longitude}`).join("|");
          urlGoogleMaps += `&waypoints=${waypointsStr}`;
        }

        console.warn(`✅ Link Google Maps gerado com ${input.pontos.length} pontos`);

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
    .input(CompartilharRotaInputSchema)
    .mutation(async ({ input, ctx }: { input: CompartilharRotaInput; ctx: TRPCContext }): Promise<{ sucesso: boolean; mensagem: string; link: string }> => {
      try {
        if (!ctx.user) throw new Error("Usuário não autenticado");

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

        await db.insert(rotasHistorico).values({
          rota_id: input.rota_id,
          motorista_id: input.motorista_id,
          acao: "compartilhada",
          plataforma: input.plataforma,
          link_compartilhado: link,
          usuario_id: ctx.user.id,
          data_acao: new Date(),
        });

        console.warn(`✅ Rota compartilhada com motorista ${input.motorista_id} via ${input.plataforma}`);

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
  obterHistoricoRotas: protectedProcedure.query(async ({ ctx }: { ctx: TRPCContext }): Promise<Array<any>> => {
    try {
      if (!ctx.user) throw new Error("Usuário não autenticado");

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
    .input(DeletarRotaInputSchema)
    .mutation(async ({ input, ctx }: { input: DeletarRotaInput; ctx: TRPCContext }): Promise<{ sucesso: boolean; mensagem: string }> => {
      try {
        if (!ctx.user) throw new Error("Usuário não autenticado");

        await db.delete(rotasOtimizadas).where(eq(rotasOtimizadas.id, input.rota_id));

        console.warn(`✅ Rota ${input.rota_id} deletada com sucesso`);

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
