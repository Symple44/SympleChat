// srx/hooks/useWebSocket.ts

import { useState, useEffect, useCallback, useRef } from 'react';
import { useStore } from '@/store/store';
import { APP_CONFIG } from '@/config/app.config';

interface WebSocketMessage {
  type: string;
  payload: any;
}

interface WebSocketConfig {
  url: string;
  reconnectAttempts?: number;
  reconnectDelay?: number;
  debug?: boolean;
}

export const useWebSocket = (config?: Partial<WebSocketConfig>) => {
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectAttempts = useRef(0);
  const reconnectTimeoutRef = useRef<number>();
  
  const store = useStore();

  const defaultConfig: WebSocketConfig = {
    url: APP_CONFIG.CHAT.WS_BASE_URL,
    reconnectAttempts: 5,
    reconnectDelay: 3000,
    debug: APP_CONFIG.UI.DEBUG,
    ...config
  };

  const debug = useCallback(
    (...args: unknown[]) => {
      if (defaultConfig.debug) {
        console.log('[WebSocket]', ...args);
      }
    },
    [defaultConfig.debug]
  );

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    try {
      wsRef.current = new WebSocket(defaultConfig.url);

      wsRef.current.onopen = () => {
        debug('Connected');
        setIsConnected(true);
        setError(null);
        reconnectAttempts.current = 0;
      };

      wsRef.current.onclose = () => {
        debug('Disconnected');
        setIsConnected(false);

        if (reconnectAttempts.current < (defaultConfig.reconnectAttempts || 5)) {
          const timeout = defaultConfig.reconnectDelay || 3000;
          debug(`Reconnecting in ${timeout}ms (attempt ${reconnectAttempts.current + 1})`);
          
          reconnectTimeoutRef.current = window.setTimeout(() => {
            reconnectAttempts.current += 1;
            connect();
          }, timeout);
        }
      };

      wsRef.current.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          debug('Received:', message);

          switch (message.type) {
            case 'message':
              if (message.payload.sessionId === store.sessions.currentId) {
                store.messages.bySession[message.payload.sessionId].push(message.payload);
              }
              break;

            case 'session_update':
              if (store.sessions.data[message.payload.id]) {
                store.sessions.data[message.payload.id] = {
                  ...store.sessions.data[message.payload.id],
                  ...message.payload
                };
              }
              break;

            default:
              debug('Unknown message type:', message.type);
          }
        } catch (error) {
          debug('Error parsing message:', error);
        }
      };

      wsRef.current.onerror = (event) => {
        const error = event instanceof Error ? event : new Error('WebSocket error');
        debug('Error:', error);
        setError(error);
      };

    } catch (error) {
      debug('Connection error:', error);
      setError(error instanceof Error ? error : new Error('Failed to connect'));
    }
  }, [defaultConfig.url, defaultConfig.reconnectAttempts, defaultConfig.reconnectDelay, debug, store]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      window.clearTimeout(reconnectTimeoutRef.current);
    }
    wsRef.current?.close();
    wsRef.current = null;
    setIsConnected(false);
  }, []);

  const send = useCallback((type: string, payload: any): boolean => {
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
};

export default useWebSocket;
