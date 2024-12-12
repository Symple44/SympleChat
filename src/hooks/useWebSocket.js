// src/hooks/useWebSocket.js
import { useState, useEffect, useCallback } from 'react';
import { config } from '../config';

const WS_URL = 'ws://192.168.0.15:8000/ws';

export const useWebSocket = () => {
  const [connected, setConnected] = useState(false);
  const [socket, setSocket] = useState(null);

  const connect = useCallback(() => {
    try {
      console.log('Tentative de connexion WebSocket à:', config.WS_URL);
      const ws = new WebSocket(config.WS_URL);

      ws.onopen = () => {
        console.log('WebSocket connecté');
        setConnected(true);
      };

      ws.onmessage = (event) => {
        console.log('Message reçu:', event.data);
      };

      ws.onclose = () => {
        console.log('WebSocket déconnecté');
        setConnected(false);
        setTimeout(connect, 3000);
      };

      ws.onerror = (error) => {
        console.error('Erreur WebSocket:', error);
      };

      setSocket(ws);
    } catch (error) {
      console.error('Erreur connexion WebSocket:', error);
    }
  }, []);

  const sendMessage = useCallback((message) => {
    if (socket?.readyState === WebSocket.OPEN) {
      const messageData = {
        type: 'user',
        content: message,
        timestamp: new Date().toISOString()
      };
      console.log('Envoi message:', messageData);
      socket.send(JSON.stringify(messageData));
      return true;
    }
    console.warn('WebSocket non connecté');
    return false;
  }, [socket]);

  useEffect(() => {
    connect();
    return () => {
      if (socket) {
        socket.close();
      }
    };
  }, [connect]);

  return { connected, sendMessage };
};
