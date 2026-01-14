/**
 * Router para sincronização com API CTA Smart
 */

import { router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import {
  sincronizarTodosAbastecimentos,
  fetchCTASmartAbastecimentos,
  informarStatusCTASmart,
} from "./cta-smart-sync";

export const ctaSmartRouter = router({
  /**
   * Sincroniza todos os abastecimentos do CTA Smart
   */
  sincronizarAbastecimentos: protectedProcedure.mutation(async () => {
    try {
      const resultado = await sincronizarTodosAbastecimentos();
      return {
        sucesso: true,
        mensagem: `Sincronização concluída: ${resultado.sucesso} abastecimentos importados, ${resultado.erro} erros`,
        ...resultado,
      };
    } catch (error) {
      return {
        sucesso: false,
        mensagem:
          error instanceof Error
            ? error.message
            : "Erro ao sincronizar abastecimentos",
        total: 0,
        erro: 0,
      };
    }
  }),

  /**
   * Busca abastecimentos pendentes do CTA Smart (sem sincronizar)
   */
  buscarAbastecimentosPendentes: protectedProcedure
    .input(z.object({ lastId: z.string().optional() }).optional())
    .query(async ({ input }) => {
      try {
        const response = await fetchCTASmartAbastecimentos(input?.lastId);
        return {
          sucesso: true,
          registros: response.registros || [],
          proximoId: response.proximoId,
        };
      } catch (error) {
        return {
          sucesso: false,
          registros: [],
          erro:
            error instanceof Error
              ? error.message
              : "Erro ao buscar abastecimentos",
        };
      }
    }),

  /**
   * Informa status de um abastecimento ao CTA Smart
   */
  informarStatus: protectedProcedure
    .input(
      z.object({
        registroId: z.string(),
        status: z.enum(["sucesso", "erro", "duplicado"]),
      })
    )
    .mutation(async ({ input }) => {
      try {
        await informarStatusCTASmart(input.registroId, input.status);
        return {
          sucesso: true,
          mensagem: `Status ${input.status} informado ao CTA Smart`,
        };
      } catch (error) {
        return {
          sucesso: false,
          erro:
            error instanceof Error
              ? error.message
              : "Erro ao informar status",
        };
      }
    }),

  /**
   * Retorna status da sincronização
   */
  statusSincronizacao: protectedProcedure.query(async () => {
    return {
      ativo: true,
      ultimaSincronizacao: new Date(),
      intervalo: "5 minutos",
      mensagem: "Sincronização automática ativa",
    };
  }),
});
