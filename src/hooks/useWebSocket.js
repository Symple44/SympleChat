// src/hooks/useWebSocket.js
import { useState, useEffect, useCallback, useRef } from 'react';
import { config } from '../config';

const MAX_RECONNECT_ATTEMPTS = 5;

export const useWebSocket = () => {
  const [connected, setConnected] = useState(false);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);

  const clearReconnectTimeout = () => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
  };

  const connect = useCallback(() => {
    try {
      // Nettoyage de l'ancienne connexion si elle existe
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }

      console.log('Tentative de connexion WebSocket à:', config.API.WS_URL);
      const ws = new WebSocket(config.API.WS_URL);

      ws.onopen = () => {
        console.log('WebSocket connecté');
        setConnected(true);
        setReconnectAttempts(0);
        clearReconnectTimeout();
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('Message WebSocket reçu:', data);
        } catch (error) {
          console.log('Message WebSocket reçu (non-JSON):', event.data);
        }
      };

      ws.onclose = (event) => {
        console.log('WebSocket déconnecté - Code:', event.code);
        setConnected(false);
        wsRef.current = null;

        // Tentative de reconnexion si le nombre maximum n'est pas atteint
        if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
          const nextAttempt = reconnectAttempts + 1;
          setReconnectAttempts(nextAttempt);
          
          const delay = Math.min(1000 * Math.pow(2, nextAttempt), 10000);
          console.log(`Tentative de reconnexion ${nextAttempt} dans ${delay}ms...`);
          
          clearReconnectTimeout();
          reconnectTimeoutRef.current = setTimeout(connect, delay);
        } else {
          console.error('Nombre maximum de tentatives de reconnexion atteint');
        }
      };

      ws.onerror = (error) => {
        console.error('Erreur WebSocket:', error);
      };

      wsRef.current = ws;
    } catch (error) {
      console.error('Erreur lors de la création de la connexion WebSocket:', error);
      setConnected(false);
    }
  }, [reconnectAttempts]);

  const sendMessage = useCallback((message) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      try {
        const messageData = {
          type: 'message',
          content: message,
          timestamp: new Date().toISOString(),
          user_id: config.CHAT.DEFAULT_USER_ID
        };
        
        wsRef.current.send(JSON.stringify(messageData));
        return true;
      } catch (error) {
        console.error('Erreur lors de l\'envoi du message:', error);
        return false;
      }
    }
    return false;
  }, []);

  // Connexion initiale
  useEffect(() => {
    connect();
    
    // Nettoyage à la démontage du composant
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      clearReconnectTimeout();
    };
  }, [connect]);

  // Reconnexion en cas de changement de connectivité réseau
  useEffect(() => {
    const handleOnline = () => {
      console.log('Connexion réseau rétablie - Tentative de reconnexion WebSocket');
      setReconnectAttempts(0);
      connect();
    };

    window.addEventListener('online', handleOnline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
    };
  }, [connect]);

  return {
    connected,
    sendMessage,
    reconnectAttempts
  };
};

export default useWebSocket;
