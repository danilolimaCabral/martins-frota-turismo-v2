import { useEffect, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

export function useWebSocket(url: string = '') {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    // Conectar ao servidor WebSocket
    const socketUrl = url || window.location.origin;
    const newSocket = io(socketUrl, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    newSocket.on('connect', () => {
      console.log('WebSocket conectado');
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('WebSocket desconectado');
      setIsConnected(false);
    });

    newSocket.on('vehicleUpdate', (vehicleData) => {
      setData(vehicleData);
    });

    newSocket.on('error', (error) => {
      console.error('WebSocket erro:', error);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [url]);

  const emit = useCallback((event: string, data: any) => {
    if (socket) {
      socket.emit(event, data);
    }
  }, [socket]);

  const on = useCallback((event: string, callback: (data: any) => void) => {
    if (socket) {
      socket.on(event, callback);
    }
  }, [socket]);

  return {
    socket,
    isConnected,
    data,
    emit,
    on,
  };
}
