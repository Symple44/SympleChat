// src/shared/hooks/useWebSocket.ts

import { useState, useEffect, useCallback, useRef } from 'react';
import { socketManager } from '../core/socket/socket';
import type { WebSocketMessage } from '../core/socket/types';

interface UseWebSocketReturn {
  isConnected: boolean;
  lastMessage: WebSocketMessage | null;
  error: Error | null;
  send: (message: unknown) => boolean;
  connect: () => void;
  disconnect: () => void;
}

export function useWebSocket(): UseWebSocketReturn {
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const reconnectTimeoutRef = useRef<number | null>(null);

  const handleConnect = useCallback(() => {
    setIsConnected(true);
    setError(null);
    console.log('WebSocket connecté');
  }, []);

  const handleDisconnect = useCallback(() => {
    setIsConnected(false);
    console.log('WebSocket déconnecté');
  }, []);

  const handleError = useCallback((err: Event) => {
    const error = err instanceof Error ? err : new Error('WebSocket error');
    setError(error);
    console.error('WebSocket erreur:', error);
  }, []);

  const handleMessage = useCallback((message: WebSocketMessage) => {
    setLastMessage(message);
    console.log('WebSocket message reçu:', message);
  }, []);

  useEffect(() => {
    socketManager.config.onConnect = handleConnect;
    socketManager.config.onDisconnect = handleDisconnect;
    socketManager.config.onError = handleError;
    socketManager.config.onMessage = handleMessage;

    if (!socketManager.isConnected) {
      socketManager.connect();
    }

    return () => {
      if (reconnectTimeoutRef.current) {
        window.clearTimeout(reconnectTimeoutRef.current);
      }
      socketManager.disconnect();
    };
  }, [handleConnect, handleDisconnect, handleError, handleMessage]);

  const send = useCallback((message: unknown): boolean => {
    if (!isConnected) {
      setError(new Error('WebSocket non connecté'));
      return false;
    }

    try {
      return socketManager.send(message);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Erreur d\'envoi');
      setError(error);
      return false;
    }
  }, [isConnected]);

  const connect = useCallback(() => {
    setError(null);
    socketManager.connect();
  }, []);

  const disconnect = useCallback(() => {
    socketManager.disconnect();
  }, []);

  return {
    isConnected,
    lastMessage,
    error,
    send,
    connect,
    disconnect
  };
}

export default useWebSocket;
