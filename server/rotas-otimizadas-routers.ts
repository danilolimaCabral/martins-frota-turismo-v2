import { protectedProcedure, router } from './_core/trpc';
import { z } from 'zod';
import { db } from './db';
import { optimizedRoutes, routeVersionHistory, embarquePoints } from '../drizzle/schema';
import { eq } from 'drizzle-orm';

interface PontoRota {
  id: string;
  nome: string;
  endereco: string;
  cep: string;
  cidade: string;
  horario: string;
  lat: number;
  lng: number;
}

/**
 * Router para gerenciar rotas otimizadas
 */
export const rotasOtimizadasRouter = router({
  /**
   * Salvar nova rota otimizada
   */
  salvarRota: protectedProcedure
    .input(z.object({
      nome: z.string().min(3),
      descricao: z.string().optional(),
      pontos: z.array(z.object({
        id: z.string(),
        nome: z.string(),
        endereco: z.string(),
        cep: z.string(),
        cidade: z.string(),
        horario: z.string(),
        lat: z.number(),
        lng: z.number()
      })),
      distanciaOriginal: z.number(),
      distanciaOtimizada: z.number(),
      algoritmo: z.enum(['sequencial', 'nearest_neighbor', 'genetic']),
      iteracoes: z.number().optional(),
      veiculoId: z.number().optional(),
      motoristaId: z.number().optional()
    }))
    .mutation(async ({ input, ctx }) => {
      try {
        const economia = input.distanciaOriginal - input.distanciaOtimizada;
        const percentualEconomia = (economia / input.distanciaOriginal) * 100;

        // Salvar rota otimizada
        const resultado = await db.insert(optimizedRoutes).values({
          name: input.nome,
          description: input.descricao,
          vehicleId: input.veiculoId,
          driverId: input.motoristaId,
          totalDistance: input.distanciaOtimizada.toString(),
          estimatedTime: Math.ceil((input.distanciaOtimizada / 60) * 60),
          status: 'optimized',
          originalDistance: input.distanciaOriginal.toString(),
          savings: economia.toString(),
          savingsPercentage: percentualEconomia.toString(),
          algorithmUsed: input.algoritmo,
          iterations: input.iteracoes || 1,
          routePoints: JSON.stringify(input.pontos),
          createdBy: ctx.user.id,
          updatedBy: ctx.user.id
        });

        // Obter a rota criada
        const rotasCriadas = await db
          .select()
          .from(optimizedRoutes)
          .where(eq(optimizedRoutes.createdBy, ctx.user.id))
          .orderBy(optimizedRoutes.createdAt)
          .limit(1);

        const rotaId = rotasCriadas[0]?.id;
        if (!rotaId) throw new Error('Erro ao criar rota');

        // Salvar pontos de embarque
        for (let i = 0; i < input.pontos.length; i++) {
          const ponto = input.pontos[i];
          await db.insert(embarquePoints).values({
            routeId: rotaId,
            name: ponto.nome,
            address: ponto.endereco,
            latitude: ponto.lat.toString(),
            longitude: ponto.lng.toString(),
            sequenceNumber: i + 1,
            arrivalTime: ponto.horario
          });
        }

        return {
          sucesso: true,
          rotaId: rotaId,
          mensagem: `Rota "${input.nome}" salva com sucesso!`
        };
      } catch (error) {
        console.error('Erro ao salvar rota:', error);
        return {
          sucesso: false,
          mensagem: error instanceof Error ? error.message : 'Erro ao salvar rota'
        };
      }
    }),

  /**
   * Listar rotas otimizadas
   */
  listarRotas: protectedProcedure
    .input(z.object({
      limite: z.number().default(10),
      offset: z.number().default(0)
    }))
    .query(async ({ input }) => {
      try {
        const rotas = await db
          .select()
          .from(optimizedRoutes)
          .limit(input.limite)
          .offset(input.offset);

        return {
          sucesso: true,
          rotas: rotas.map(r => ({
            id: r.id,
            nome: r.name,
            distancia: parseFloat(r.totalDistance),
            economia: r.savings ? parseFloat(r.savings) : 0,
            percentualEconomia: r.savingsPercentage ? parseFloat(r.savingsPercentage) : 0,
            algoritmo: r.algorithmUsed,
            status: r.status,
            dataCriacao: r.createdAt
          }))
        };
      } catch (error) {
        console.error('Erro ao listar rotas:', error);
        return {
          sucesso: false,
          rotas: [],
          mensagem: error instanceof Error ? error.message : 'Erro ao listar rotas'
        };
      }
    }),

  /**
   * Obter detalhes de uma rota
   */
  obterRota: protectedProcedure
    .input(z.object({
      rotaId: z.number()
    }))
    .query(async ({ input }) => {
      try {
        const rota = await db
          .select()
          .from(optimizedRoutes)
          .where(eq(optimizedRoutes.id, input.rotaId))
          .limit(1);

        if (!rota.length) {
          return {
            sucesso: false,
            mensagem: 'Rota não encontrada'
          };
        }

        const r = rota[0];
        const pontos = await db
          .select()
          .from(embarquePoints)
          .where(eq(embarquePoints.routeId, input.rotaId));

        return {
          sucesso: true,
          rota: {
            id: r.id,
            nome: r.name,
            descricao: r.description,
            distancia: parseFloat(r.totalDistance),
            distanciaOriginal: r.originalDistance ? parseFloat(r.originalDistance) : 0,
            economia: r.savings ? parseFloat(r.savings) : 0,
            percentualEconomia: r.savingsPercentage ? parseFloat(r.savingsPercentage) : 0,
            algoritmo: r.algorithmUsed,
            status: r.status,
            pontos: pontos.map(p => ({
              id: p.id.toString(),
              nome: p.name,
              endereco: p.address,
              sequencia: p.sequenceNumber,
              lat: parseFloat(p.latitude),
              lng: parseFloat(p.longitude),
              horaChegada: p.arrivalTime
            })),
            dataCriacao: r.createdAt,
            dataAtualizacao: r.updatedAt
          }
        };
      } catch (error) {
        console.error('Erro ao obter rota:', error);
        return {
          sucesso: false,
          mensagem: error instanceof Error ? error.message : 'Erro ao obter rota'
        };
      }
    }),

  /**
   * Atualizar rota existente
   */
  atualizarRota: protectedProcedure
    .input(z.object({
      rotaId: z.number(),
      nome: z.string().optional(),
      descricao: z.string().optional(),
      status: z.enum(['draft', 'optimized', 'active', 'completed', 'cancelled']).optional()
    }))
    .mutation(async ({ input, ctx }) => {
      try {
        await db
          .update(optimizedRoutes)
          .set({
            name: input.nome,
            description: input.descricao,
            status: input.status,
            updatedBy: ctx.user.id,
            updatedAt: new Date()
          })
          .where(eq(optimizedRoutes.id, input.rotaId));

        return {
          sucesso: true,
          mensagem: 'Rota atualizada com sucesso!'
        };
      } catch (error) {
        console.error('Erro ao atualizar rota:', error);
        return {
          sucesso: false,
          mensagem: error instanceof Error ? error.message : 'Erro ao atualizar rota'
        };
      }
    }),

  /**
   * Criar versão da rota (histórico)
   */
  criarVersaoRota: protectedProcedure
    .input(z.object({
      rotaId: z.number(),
      descricaoMudanca: z.string(),
      pontos: z.array(z.object({
        id: z.string(),
        nome: z.string(),
        endereco: z.string(),
        lat: z.number(),
        lng: z.number()
      })),
      distancia: z.number(),
      economia: z.number()
    }))
    .mutation(async ({ input, ctx }) => {
      try {
        // Obter versão anterior
        const versoes = await db
          .select()
          .from(routeVersionHistory)
          .where(eq(routeVersionHistory.routeId, input.rotaId));

        const novaVersao = versoes.length + 1;
        const percentualEconomia = (input.economia / input.distancia) * 100;

        await db.insert(routeVersionHistory).values({
          routeId: input.rotaId,
          versionNumber: novaVersao,
          totalDistance: input.distancia.toString(),
          estimatedTime: Math.ceil((input.distancia / 60) * 60),
          savings: input.economia.toString(),
          savingsPercentage: percentualEconomia.toString(),
          routePoints: JSON.stringify(input.pontos),
          changeDescription: input.descricaoMudanca,
          createdBy: ctx.user.id
        });

        return {
          sucesso: true,
          versao: novaVersao,
          mensagem: `Versão ${novaVersao} criada com sucesso!`
        };
      } catch (error) {
        console.error('Erro ao criar versão:', error);
        return {
          sucesso: false,
          mensagem: error instanceof Error ? error.message : 'Erro ao criar versão'
        };
      }
    }),

  /**
   * Obter histórico de versões
   */
  obterHistoricoVersoes: protectedProcedure
    .input(z.object({
      rotaId: z.number()
    }))
    .query(async ({ input }) => {
      try {
        const versoes = await db
          .select()
          .from(routeVersionHistory)
          .where(eq(routeVersionHistory.routeId, input.rotaId));

        return {
          sucesso: true,
          versoes: versoes.map(v => ({
            versao: v.versionNumber,
            distancia: parseFloat(v.totalDistance),
            economia: v.savings ? parseFloat(v.savings) : 0,
            percentualEconomia: v.savingsPercentage ? parseFloat(v.savingsPercentage) : 0,
            descricaoMudanca: v.changeDescription,
            dataCriacao: v.createdAt
          }))
        };
      } catch (error) {
        console.error('Erro ao obter histórico:', error);
        return {
          sucesso: false,
          versoes: [],
          mensagem: error instanceof Error ? error.message : 'Erro ao obter histórico'
        };
      }
    })
});
