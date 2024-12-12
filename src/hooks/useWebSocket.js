// src/hooks/useWebSocket.js
import { useState, useEffect, useCallback, useRef } from 'react';
import { config } from '../config';

export const useWebSocket = () => {
  const [connected, setConnected] = useState(false);
  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);

  const connect = useCallback(() => {
    try {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        return;
      }

      const ws = new WebSocket(config.API.WS_URL);

      ws.onopen = () => {
        console.log('WebSocket connecté');
        setConnected(true);
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
          reconnectTimeoutRef.current = null;
        }
      };

      ws.onmessage = (event) => {
        console.log('Message WebSocket reçu:', event.data);
      };

      ws.onclose = () => {
        console.log('WebSocket déconnecté');
        setConnected(false);
        wsRef.current = null;

        // Tentative de reconnexion
        reconnectTimeoutRef.current = setTimeout(() => {
          console.log('Tentative de reconnexion...');
          connect();
        }, 3000);
      };

      ws.onerror = (error) => {
        console.error('Erreur WebSocket:', error);
      };

      wsRef.current = ws;
    } catch (error) {
      console.error('Erreur connexion WebSocket:', error);
      setConnected(false);
    }
  }, []);

  const sendMessage = useCallback((message) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'message',
        content: message,
        timestamp: new Date().toISOString()
      }));
      return true;
    }
    return false;
  }, []);

  useEffect(() => {
    connect();
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [connect]);

  return { 
    connected,
    sendMessage 
  };
};

export default useWebSocket;
