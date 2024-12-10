// src/hooks/useWebSocket.js
import { useState, useEffect, useCallback } from 'react';

export const useWebSocket = () => {
  const [connected, setConnected] = useState(false);
  const [socket, setSocket] = useState(null);

  const connect = useCallback(() => {
    try {
      const ws = new WebSocket(import.meta.env.VITE_WS_URL);

      ws.onopen = () => {
        setConnected(true);
        console.log('WebSocket connecté');
      };

      ws.onclose = () => {
        setConnected(false);
        console.log('WebSocket déconnecté, reconnexion...');
        setTimeout(connect, 3000);
      };

      ws.onerror = (error) => {
        console.error('Erreur WebSocket:', error);
        ws.close();
      };

      setSocket(ws);
    } catch (error) {
      console.error('Erreur connexion WebSocket:', error);
    }
  }, []);

  useEffect(() => {
    connect();
    return () => {
      if (socket) {
        socket.close();
      }
    };
  }, [connect]);

  const sendMessage = useCallback((message) => {
    if (socket?.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify(message));
    }
  }, [socket]);

  return { connected, sendMessage };
};