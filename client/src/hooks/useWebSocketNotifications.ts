import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";

export function useWebSocketNotifications() {
  const [notificationCount, setNotificationCount] = useState(0);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const ws = new WebSocket("ws://localhost:3000/api/notifications");

    ws.onopen = () => {
      console.log("Conectado ao WebSocket de notificacoes");
    };

    ws.onmessage = (event) => {
      try {
        const notification = JSON.parse(event.data);

        if (notification.tipo === "rota_aceita_motorista") {
          setNotificationCount((prev) => prev + 1);

          toast.success(
            `${notification.motorista.nome} aceitou a rota ${notification.rota.nome}!`,
            {
              description: `Tempo de resposta: ${notification.tempoResposta}`,
              duration: 5000,
            }
          );

          playNotificationSound();
          updatePageBadge(notificationCount + 1);
        } else if (notification.tipo === "rota_rejeitada_motorista") {
          toast.error(
            `${notification.motorista.nome} rejeitou a rota ${notification.rota.nome}`,
            {
              duration: 5000,
            }
          );
          playNotificationSound();
        }
      } catch (error) {
        console.error("Erro ao processar notificacao:", error);
      }
    };

    ws.onerror = (error) => {
      console.error("Erro no WebSocket:", error);
    };

    ws.onclose = () => {
      console.log("Desconectado do WebSocket");
    };

    return () => {
      ws.close();
    };
  }, [user, notificationCount]);

  return { notificationCount };
}

export function playNotificationSound() {
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);

  oscillator.frequency.value = 800;
  oscillator.type = "sine";

  gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + 0.5);
}

export function updatePageBadge(count: number) {
  if (count > 0) {
    document.title = `(${count}) Martins Frota - Dashboard`;
  } else {
    document.title = "Martins Frota - Dashboard";
  }
}
