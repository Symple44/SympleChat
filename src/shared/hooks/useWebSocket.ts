// /src/shared/hooks/useWebSocket.ts

import { useState, useEffect, useCallback, useRef } from 'react';
import { useStore } from '@/store/store';
import { APP_CONFIG } from '@/config/app.config';
import type { WebSocketMessage, WebSocketConfig } from '../types';

interface UseWebSocketReturn {
  isConnected: boolean;
  error: Error | null;
  send: (type: string, payload: unknown) => boolean;
  connect: () => void;
  disconnect: () => void;
}

const DEFAULT_CONFIG: Required<WebSocketConfig> = {
  url: APP_CONFIG.CHAT.WS_BASE_URL,
  reconnectAttempts: 5,
  reconnectDelay: 3000,
  debug: APP_CONFIG.UI.DEBUG
};

export function useWebSocket(config?: Partial<WebSocketConfig>): UseWebSocketReturn {
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const reconnectTimeoutRef = useRef<number>();

  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  const store = useStore();

  const debug = useCallback((...args: unknown[]) => {
    if (finalConfig.debug) {
      console.log('[WebSocket]', ...args);
    }
  }, [finalConfig.debug]);

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    try {
      wsRef.current = new WebSocket(finalConfig.url);

      wsRef.current.onopen = () => {
        debug('Connected');
        setIsConnected(true);
        setError(null);
        reconnectAttemptsRef.current = 0;
      };

      wsRef.current.onclose = () => {
        debug('Disconnected');
        setIsConnected(false);

        if (reconnectAttemptsRef.current < finalConfig.reconnectAttempts) {
          const timeout = finalConfig.reconnectDelay;
          debug(`Reconnecting in ${timeout}ms (attempt ${reconnectAttemptsRef.current + 1})`);
          
          reconnectTimeoutRef.current = window.setTimeout(() => {
            reconnectAttemptsRef.current += 1;
            connect();
          }, timeout);
        }
      };

      wsRef.current.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          debug('Received:', message);

          // Mise à jour du store en fonction du type de message
          if (message.type === 'message' && store.sessions.currentId) {
            store.messages.bySession[store.sessions.currentId].push(message.payload);
          }
        } catch (error) {
          debug('Error parsing message:', error);
        }
      };

      wsRef.current.onerror = (event) => {
        const wsError = event instanceof Error ? event : new Error('WebSocket error');
        debug('Error:', wsError);
        setError(wsError);
      };

    } catch (error) {
      debug('Connection error:', error);
      setError(error instanceof Error ? error : new Error('Failed to connect'));
    }
  }, [finalConfig, debug, store]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      window.clearTimeout(reconnectTimeoutRef.current);
    }
    wsRef.current?.close();
    wsRef.current = null;
    setIsConnected(false);
  }, []);

  const send = useCallback((type: string, payload: unknown): boolean => {
    if (wsRef.current?.readyState !== WebSocket.OPEN) {
      return false;
    }

    try {
      const message: WebSocketMessage = { type, payload };
      wsRef.current.send(JSON.stringify(message));
      debug('Sent:', message);
      return true;
    } catch (error) {
      debug('Send error:', error);
      return false;
    }
  }, [debug]);

  useEffect(() => {
    connect();
    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  return {
    isConnected,
    error,
    send,
    connect,
    disconnect
  };
}

export default useWebSocket;
