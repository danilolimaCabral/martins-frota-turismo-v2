import { useState, useEffect } from "react";
import { Bell, X, AlertTriangle, Wrench, Fuel, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Notification {
  id: string;
  type: "maintenance" | "fueling" | "alert" | "success";
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
}

export function NotificationCenter() {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: "1",
      type: "maintenance",
      title: "Manutenção Programada",
      message: "Van Sprinter (ABC-1234) necessita manutenção preventiva",
      timestamp: new Date(Date.now() - 5 * 60000),
      read: false,
    },
    {
      id: "2",
      type: "fueling",
      title: "Abastecimento Baixo",
      message: "Ônibus (XYZ-5678) com combustível abaixo de 20%",
      timestamp: new Date(Date.now() - 15 * 60000),
      read: false,
    },
    {
      id: "3",
      type: "alert",
      title: "Excesso de Velocidade",
      message: "Motorista João Silva excedeu limite de velocidade em rodovia",
      timestamp: new Date(Date.now() - 30 * 60000),
      read: true,
    },
    {
      id: "4",
      type: "success",
      title: "Viagem Concluída",
      message: "Rota para São Paulo finalizada com sucesso",
      timestamp: new Date(Date.now() - 2 * 60 * 60000),
      read: true,
    },
  ]);

  const [isOpen, setIsOpen] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const getIcon = (type: string) => {
    switch (type) {
      case "maintenance":
        return <Wrench className="w-5 h-5 text-orange-500" />;
      case "fueling":
        return <Fuel className="w-5 h-5 text-yellow-500" />;
      case "alert":
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case "success":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      default:
        return <Bell className="w-5 h-5" />;
    }
  };

  const getColor = (type: string) => {
    switch (type) {
      case "maintenance":
        return "bg-orange-50 border-orange-200";
      case "fueling":
        return "bg-yellow-50 border-yellow-200";
      case "alert":
        return "bg-red-50 border-red-200";
      case "success":
        return "bg-green-50 border-green-200";
      default:
        return "bg-blue-50 border-blue-200";
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Agora";
    if (minutes < 60) return `${minutes}m atrás`;
    if (hours < 24) return `${hours}h atrás`;
    if (days < 7) return `${days}d atrás`;
    return date.toLocaleDateString("pt-BR");
  };

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const deleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  return (
    <div className="relative">
      {/* Notification Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
        title="Notificações"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-xl shadow-2xl border border-slate-200/50 z-50 max-h-96 overflow-hidden flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-slate-200/50 bg-gradient-to-r from-slate-50 to-blue-50">
            <div>
              <h3 className="font-semibold text-slate-900">Notificações</h3>
              <p className="text-xs text-slate-500">
                {unreadCount} {unreadCount === 1 ? "nova" : "novas"}
              </p>
            </div>
            <div className="flex gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                >
                  Marcar todas como lidas
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Notifications List */}
          <div className="overflow-y-auto flex-1">
            {notifications.length === 0 ? (
              <div className="p-8 text-center">
                <Bell className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                <p className="text-slate-500">Nenhuma notificação</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-200/50">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 hover:bg-slate-50 transition-colors cursor-pointer border-l-4 ${
                      notification.read ? "border-l-transparent" : "border-l-blue-500"
                    } ${getColor(notification.type)}`}
                    onClick={() => markAsRead(notification.id)}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="mt-1">{getIcon(notification.type)}</div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-slate-900 text-sm">
                            {notification.title}
                          </p>
                          <p className="text-xs text-slate-600 mt-1 line-clamp-2">
                            {notification.message}
                          </p>
                          <p className="text-xs text-slate-500 mt-2">
                            {formatTime(notification.timestamp)}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteNotification(notification.id);
                        }}
                        className="text-slate-400 hover:text-slate-600 flex-shrink-0"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="p-3 border-t border-slate-200/50 bg-slate-50">
              <button className="w-full text-center text-sm text-blue-600 hover:text-blue-700 font-medium py-2">
                Ver todas as notificações
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
