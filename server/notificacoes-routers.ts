import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { db } from "./db";
import { funcionarios, vehicles, contasPagar, contasReceber } from "../drizzle/schema";
import { eq, and, sql, lte, gte } from "drizzle-orm";
import { notifyOwner } from "./_core/notification";

/**
 * Router tRPC para Notificações Automáticas
 * 
 * Endpoints:
 * - verificarAlertas: Verifica todos os alertas pendentes
 * - enviarNotificacao: Envia notificação para o proprietário
 * - configurarAlertas: Configura preferências de alertas
 */

export const notificacoesRouter = router({
  /**
   * Verificar todos os alertas pendentes
   */
  verificarAlertas: protectedProcedure
    .query(async () => {
      const hoje = new Date();
      const em7Dias = new Date();
      em7Dias.setDate(em7Dias.getDate() + 7);
      const em30Dias = new Date();
      em30Dias.setDate(em30Dias.getDate() + 30);

      const alertas: Array<{
        tipo: string;
        categoria: string;
        titulo: string;
        descricao: string;
        dataVencimento: Date | null;
        urgencia: "critico" | "alto" | "medio" | "baixo";
        entidadeId: number;
        entidadeTipo: string;
      }> = [];

      // 1. Verificar CNH dos funcionários
      const funcionariosResult = await db.select().from(funcionarios);
      
      for (const func of funcionariosResult) {
        if (func.cnhValidade) {
          const validade = new Date(func.cnhValidade);
          if (validade <= hoje) {
            alertas.push({
              tipo: "documento_vencido",
              categoria: "CNH",
              titulo: `CNH Vencida - ${func.nome}`,
              descricao: `A CNH do funcionário ${func.nome} está vencida desde ${validade.toLocaleDateString("pt-BR")}`,
              dataVencimento: validade,
              urgencia: "critico",
              entidadeId: func.id,
              entidadeTipo: "funcionario",
            });
          } else if (validade <= em7Dias) {
            alertas.push({
              tipo: "documento_vencendo",
              categoria: "CNH",
              titulo: `CNH Vencendo - ${func.nome}`,
              descricao: `A CNH do funcionário ${func.nome} vence em ${Math.ceil((validade.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24))} dias`,
              dataVencimento: validade,
              urgencia: "alto",
              entidadeId: func.id,
              entidadeTipo: "funcionario",
            });
          } else if (validade <= em30Dias) {
            alertas.push({
              tipo: "documento_vencendo",
              categoria: "CNH",
              titulo: `CNH Vencendo - ${func.nome}`,
              descricao: `A CNH do funcionário ${func.nome} vence em ${Math.ceil((validade.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24))} dias`,
              dataVencimento: validade,
              urgencia: "medio",
              entidadeId: func.id,
              entidadeTipo: "funcionario",
            });
          }
        }
      }

      // 2. Verificar documentos dos veículos (ANTT, DER, Cadastur)
      const veiculosResult = await db.select().from(vehicles);
      
      for (const veiculo of veiculosResult) {
        const documentos = [
          { nome: "ANTT", validade: veiculo.anttExpiry },
          { nome: "DER", validade: veiculo.derExpiry },
          { nome: "Cadastur", validade: veiculo.cadasturExpiry },
        ];

        for (const doc of documentos) {
          if (doc.validade) {
            const validade = new Date(doc.validade);
            if (validade <= hoje) {
              alertas.push({
                tipo: "documento_vencido",
                categoria: doc.nome,
                titulo: `${doc.nome} Vencido - ${veiculo.plate}`,
                descricao: `O ${doc.nome} do veículo ${veiculo.plate} (${veiculo.model}) está vencido desde ${validade.toLocaleDateString("pt-BR")}`,
                dataVencimento: validade,
                urgencia: "critico",
                entidadeId: veiculo.id,
                entidadeTipo: "veiculo",
              });
            } else if (validade <= em7Dias) {
              alertas.push({
                tipo: "documento_vencendo",
                categoria: doc.nome,
                titulo: `${doc.nome} Vencendo - ${veiculo.plate}`,
                descricao: `O ${doc.nome} do veículo ${veiculo.plate} vence em ${Math.ceil((validade.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24))} dias`,
                dataVencimento: validade,
                urgencia: "alto",
                entidadeId: veiculo.id,
                entidadeTipo: "veiculo",
              });
            } else if (validade <= em30Dias) {
              alertas.push({
                tipo: "documento_vencendo",
                categoria: doc.nome,
                titulo: `${doc.nome} Vencendo - ${veiculo.plate}`,
                descricao: `O ${doc.nome} do veículo ${veiculo.plate} vence em ${Math.ceil((validade.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24))} dias`,
                dataVencimento: validade,
                urgencia: "medio",
                entidadeId: veiculo.id,
                entidadeTipo: "veiculo",
              });
            }
          }
        }
      }

      // 3. Verificar contas a pagar vencendo
      const contasVencendo = await db
        .select()
        .from(contasPagar)
        .where(
          and(
            sql`data_vencimento <= ${em7Dias.toISOString().split("T")[0]}`,
            sql`status = 'pendente'`
          )
        );

      for (const conta of contasVencendo) {
        const validade = conta.dataVencimento ? new Date(conta.dataVencimento) : null;
        if (validade) {
          const diasRestantes = Math.ceil((validade.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
          alertas.push({
            tipo: diasRestantes < 0 ? "conta_vencida" : "conta_vencendo",
            categoria: "Contas a Pagar",
            titulo: `Conta ${diasRestantes < 0 ? "Vencida" : "Vencendo"} - ${conta.descricao}`,
            descricao: `Valor: R$ ${conta.valorOriginal} - ${diasRestantes < 0 ? `Vencida há ${Math.abs(diasRestantes)} dias` : `Vence em ${diasRestantes} dias`}`,
            dataVencimento: validade,
            urgencia: diasRestantes < 0 ? "critico" : diasRestantes <= 3 ? "alto" : "medio",
            entidadeId: conta.id,
            entidadeTipo: "conta_pagar",
          });
        }
      }

      // Ordenar por urgência
      const ordemUrgencia = { critico: 0, alto: 1, medio: 2, baixo: 3 };
      alertas.sort((a, b) => ordemUrgencia[a.urgencia] - ordemUrgencia[b.urgencia]);

      return {
        total: alertas.length,
        criticos: alertas.filter(a => a.urgencia === "critico").length,
        altos: alertas.filter(a => a.urgencia === "alto").length,
        medios: alertas.filter(a => a.urgencia === "medio").length,
        alertas,
      };
    }),

  /**
   * Enviar notificação para o proprietário
   */
  enviarNotificacao: protectedProcedure
    .input(
      z.object({
        titulo: z.string(),
        conteudo: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const resultado = await notifyOwner({
        title: input.titulo,
        content: input.conteudo,
      });
      
      return { sucesso: resultado };
    }),

  /**
   * Enviar resumo diário de alertas
   */
  enviarResumoDiario: protectedProcedure
    .mutation(async () => {
      const hoje = new Date();
      const em7Dias = new Date();
      em7Dias.setDate(em7Dias.getDate() + 7);

      // Buscar alertas críticos
      const funcionariosResult = await db.select().from(funcionarios);
      const veiculosResult = await db.select().from(vehicles);

      let alertasCriticos = 0;
      let alertasAltos = 0;
      const detalhes: string[] = [];

      // Verificar CNH
      for (const func of funcionariosResult) {
        if (func.cnhValidade) {
          const validade = new Date(func.cnhValidade);
          if (validade <= hoje) {
            alertasCriticos++;
            detalhes.push(`❌ CNH VENCIDA: ${func.nome}`);
          } else if (validade <= em7Dias) {
            alertasAltos++;
            detalhes.push(`⚠️ CNH vencendo: ${func.nome}`);
          }
        }
      }

      // Verificar documentos veículos
      for (const veiculo of veiculosResult) {
        const docs = [
          { nome: "ANTT", val: veiculo.anttExpiry },
          { nome: "DER", val: veiculo.derExpiry },
          { nome: "Cadastur", val: veiculo.cadasturExpiry },
        ];
        for (const doc of docs) {
          if (doc.val) {
            const validade = new Date(doc.val);
            if (validade <= hoje) {
              alertasCriticos++;
              detalhes.push(`❌ ${doc.nome} VENCIDO: ${veiculo.plate}`);
            } else if (validade <= em7Dias) {
              alertasAltos++;
              detalhes.push(`⚠️ ${doc.nome} vencendo: ${veiculo.plate}`);
            }
          }
        }
      }

      if (alertasCriticos > 0 || alertasAltos > 0) {
        const conteudo = `
📊 RESUMO DIÁRIO DE ALERTAS - ${hoje.toLocaleDateString("pt-BR")}

🔴 Alertas Críticos: ${alertasCriticos}
🟠 Alertas Altos: ${alertasAltos}

📋 DETALHES:
${detalhes.slice(0, 10).join("\n")}
${detalhes.length > 10 ? `\n... e mais ${detalhes.length - 10} alertas` : ""}

Acesse o sistema para mais detalhes.
        `.trim();

        await notifyOwner({
          title: `⚠️ ${alertasCriticos + alertasAltos} Alertas Pendentes`,
          content: conteudo,
        });

        return { 
          enviado: true, 
          alertasCriticos, 
          alertasAltos,
          totalDetalhes: detalhes.length,
        };
      }

      return { 
        enviado: false, 
        alertasCriticos: 0, 
        alertasAltos: 0,
        mensagem: "Nenhum alerta crítico ou alto para enviar",
      };
    }),
});
