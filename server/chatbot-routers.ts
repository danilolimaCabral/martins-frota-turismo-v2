import { z } from "zod";
import { publicProcedure, router } from "./_core/trpc";
import { invokeLLM } from "./_core/llm";

/**
 * Contexto do chatbot MV - Informações da Martins Viagens e Turismo
 */
const CHATBOT_CONTEXT = `
Você é o MV, assistente virtual da Martins Viagens e Turismo, uma empresa com mais de 19 anos de experiência em transporte corporativo e turismo.

INFORMAÇÕES DA EMPRESA:
- Nome: Martins Viagens e Turismo
- Experiência: Mais de 19 anos no mercado
- Telefone: (41) 99102-1445
- Especialidade: Transporte corporativo premium com tecnologia, segurança e conforto
- Cidades atendidas: Curitiba, Maringá, Florianópolis, São Paulo e região

SERVIÇOS OFERECIDOS:
1. Transporte Corporativo
   - Transporte de funcionários
   - Eventos empresariais
   - Transfers executivos
   - Viagens corporativas

2. Turismo e Excursões
   - Beto Carrero World
   - Foz do Iguaçu
   - Florianópolis
   - Destinos personalizados

3. Fretamento
   - Vans (até 15 passageiros)
   - Micro-ônibus (até 28 passageiros)
   - Ônibus (até 46 passageiros)

DIFERENCIAIS:
- Frota moderna e bem mantida
- Motoristas experientes e treinados
- Rastreamento GPS em tempo real
- Seguro completo
- Pontualidade e profissionalismo
- Atendimento 24/7

COMO VOCÊ DEVE RESPONDER:
- Seja amigável, profissional e prestativo
- Use emojis moderadamente (🚐 ✅ 📍 📞)
- Responda de forma clara e objetiva
- Se não souber algo, seja honesto e ofereça contato direto
- Sempre incentive o cliente a entrar em contato pelo WhatsApp para orçamentos
- Sugira o tipo de veículo adequado baseado no número de passageiros
- Destaque os diferenciais da Martins

SUGESTÕES DE VEÍCULOS:
- Até 15 passageiros: Van
- 16 a 28 passageiros: Micro-ônibus
- 29 a 46 passageiros: Ônibus

Para orçamentos e reservas, sempre direcione para o WhatsApp: (41) 99102-1445
`;

/**
 * Rotas do chatbot MV
 */
export const chatbotRouter = router({
  /**
   * Enviar mensagem para o chatbot
   */
  sendMessage: publicProcedure
    .input(
      z.object({
        message: z.string().min(1, "Mensagem não pode estar vazia"),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const response = await invokeLLM({
          messages: [
            {
              role: "system",
              content: CHATBOT_CONTEXT,
            },
            {
              role: "user",
              content: input.message,
            },
          ],
        });

        const assistantMessage =
          response.choices[0]?.message?.content ||
          "Desculpe, não consegui processar sua mensagem. Por favor, entre em contato pelo WhatsApp (41) 99102-1445.";

        return {
          response: assistantMessage,
          timestamp: new Date(),
        };
      } catch (error) {
        console.error("Erro no chatbot:", error);
        return {
          response:
            "Desculpe, estou com dificuldades técnicas no momento. Por favor, entre em contato diretamente pelo WhatsApp (41) 99102-1445. 📞",
          timestamp: new Date(),
        };
      }
    }),

  /**
   * Calcular distância entre cidades (simplificado)
   */
  calculateDistance: publicProcedure
    .input(
      z.object({
        from: z.string(),
        to: z.string(),
      })
    )
    .query(async ({ input }) => {
      // Distâncias aproximadas entre principais cidades
      const distances: Record<string, Record<string, number>> = {
        curitiba: {
          maringa: 430,
          florianopolis: 300,
          "sao paulo": 400,
          "foz do iguacu": 640,
        },
        maringa: {
          curitiba: 430,
          florianopolis: 730,
          "sao paulo": 600,
          "foz do iguacu": 550,
        },
        florianopolis: {
          curitiba: 300,
          maringa: 730,
          "sao paulo": 700,
          "foz do iguacu": 940,
        },
        "sao paulo": {
          curitiba: 400,
          maringa: 600,
          florianopolis: 700,
          "foz do iguacu": 1040,
        },
      };

      const from = input.from.toLowerCase().replace(/\s+/g, " ").trim();
      const to = input.to.toLowerCase().replace(/\s+/g, " ").trim();

      const distance = distances[from]?.[to] || distances[to]?.[from];

      return {
        from: input.from,
        to: input.to,
        distance: distance || null,
        unit: "km",
      };
    }),
});
