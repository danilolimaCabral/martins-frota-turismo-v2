import { WebSocketServer, WebSocket } from "ws";
import { Server } from "http";

interface NotificacaoCliente {
  motoristaId: number;
  ws: WebSocket;
}

class NotificacaoManager {
  private wss: WebSocketServer;
  private clientes: Map<number, NotificacaoCliente> = new Map();

  constructor(server: Server) {
    this.wss = new WebSocketServer({ server });
    this.iniciarServidor();
  }

  private iniciarServidor() {
    this.wss.on("connection", (ws: WebSocket) => {
      console.log("✅ Cliente conectado ao WebSocket");

      ws.on("message", (data: string) => {
        try {
          const mensagem = JSON.parse(data);
          this.processarMensagem(ws, mensagem);
        } catch (erro) {
          console.error("❌ Erro ao processar mensagem:", erro);
        }
      });

      ws.on("close", () => {
        console.log("❌ Cliente desconectado do WebSocket");
        this.removerCliente(ws);
      });

      ws.on("error", (erro) => {
        console.error("❌ Erro no WebSocket:", erro);
      });
    });
  }

  private processarMensagem(ws: WebSocket, mensagem: any) {
    if (mensagem.tipo === "registrar") {
      const motoristaId = mensagem.motoristaId;
      this.clientes.set(motoristaId, { motoristaId, ws });
      console.log(`✅ Motorista ${motoristaId} registrado`);
      ws.send(JSON.stringify({ tipo: "registrado", motoristaId }));
    }
  }

  private removerCliente(ws: WebSocket) {
    for (const [motoristaId, cliente] of this.clientes.entries()) {
      if (cliente.ws === ws) {
        this.clientes.delete(motoristaId);
        console.log(`❌ Motorista ${motoristaId} removido`);
      }
    }
  }

  // Notificar motorista sobre nova rota atribuída
  notificarRotaAtribuida(motoristaId: number, rota: any) {
    const cliente = this.clientes.get(motoristaId);
    if (cliente && cliente.ws.readyState === WebSocket.OPEN) {
      cliente.ws.send(
        JSON.stringify({
          tipo: "rota_atribuida",
          titulo: "🎉 Nova Rota Atribuída!",
          mensagem: `Você recebeu a rota: ${rota.nome}`,
          rota: {
            id: rota.id,
            nome: rota.nome,
            distancia: rota.distancia,
            tempo: rota.tempo,
            economia: rota.economia,
            link: `/motorista/rota/${rota.id}`,
          },
          timestamp: new Date().toISOString(),
        })
      );
      console.log(`✅ Notificação enviada para motorista ${motoristaId}`);
    }
  }

  // Notificar motorista sobre transferência de rota
  notificarTransferenciaRota(motoristaIdAnterior: number, motoristaIdNovo: number, rota: any) {
    // Notificar motorista que perdeu a rota
    const clienteAnterior = this.clientes.get(motoristaIdAnterior);
    if (clienteAnterior && clienteAnterior.ws.readyState === WebSocket.OPEN) {
      clienteAnterior.ws.send(
        JSON.stringify({
          tipo: "rota_transferida",
          titulo: "⚠️ Rota Transferida",
          mensagem: `A rota ${rota.nome} foi transferida para outro motorista`,
          timestamp: new Date().toISOString(),
        })
      );
    }

    // Notificar novo motorista
    this.notificarRotaAtribuida(motoristaIdNovo, rota);
  }

  // Atualizar localização do motorista
  atualizarLocalizacao(motoristaId: number, latitude: number, longitude: number) {
    // Broadcast para todos os clientes conectados
    const mensagem = JSON.stringify({
      tipo: "atualizacao_localizacao",
      motoristaId,
      latitude,
      longitude,
      timestamp: new Date().toISOString(),
    });

    this.wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(mensagem);
      }
    });
  }

  // Notificar chegada em ponto de entrega
  notificarChegadaPonto(motoristaId: number, ponto: any) {
    const cliente = this.clientes.get(motoristaId);
    if (cliente && cliente.ws.readyState === WebSocket.OPEN) {
      cliente.ws.send(
        JSON.stringify({
          tipo: "chegada_ponto",
          titulo: "📍 Chegou ao Ponto",
          mensagem: `Você chegou em: ${ponto.nome}`,
          ponto,
          timestamp: new Date().toISOString(),
        })
      );
    }
  }

  // Notificar conclusão de rota
  notificarConclusaoRota(motoristaId: number, rota: any, economia: number) {
    const cliente = this.clientes.get(motoristaId);
    if (cliente && cliente.ws.readyState === WebSocket.OPEN) {
      cliente.ws.send(
        JSON.stringify({
          tipo: "rota_concluida",
          titulo: "✅ Rota Concluída!",
          mensagem: `Rota ${rota.nome} concluída com sucesso!`,
          economia: `${economia}% de economia`,
          rota,
          timestamp: new Date().toISOString(),
        })
      );
    }
  }

  // Broadcast para todos os motoristas
  notificarTodos(tipo: string, dados: any) {
    const mensagem = JSON.stringify({
      tipo,
      ...dados,
      timestamp: new Date().toISOString(),
    });

    this.wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(mensagem);
      }
    });
  }

  // Obter número de clientes conectados
  obterClientesConectados(): number {
    return this.clientes.size;
  }
}

export { NotificacaoManager };
