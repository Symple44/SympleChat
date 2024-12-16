// /src/shared/hooks/useWebSocket.ts

import { useState, useEffect, useCallback, useRef } from 'react';
import type { 
  WebSocketEventType,
  WebSocketMessage,
  WebSocketPayload,
  UseWebSocketOptions
} from '../../core/socket/types';
import { API_CONFIG } from '../../config/api.config';

const DEFAULT_OPTIONS: Required<UseWebSocketOptions> = {
  url: API_CONFIG.WS_URL,
  autoReconnect: true,
  reconnectAttempts: 5,
  reconnectDelay: 3000,
  debug: process.env.NODE_ENV === 'development'
};

interface UseWebSocketReturn {
  isConnected: boolean;
  lastMessage: WebSocketMessage | null;
  error: Error | null;
  reconnectAttempts: number;
  send: <T extends WebSocketEventType>(type: T, payload: WebSocketPayload<T>) => boolean;
  connect: () => void;
  disconnect: () => void;
}

export function useWebSocket(options: Partial<UseWebSocketOptions> = {}): UseWebSocketReturn {
  const config = { ...DEFAULT_OPTIONS, ...options };
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<number | null>(null);

  const debug = useCallback((...args: unknown[]) => {
    if (config.debug) {
      console.log('[WebSocket]', ...args);
    }
  }, [config.debug]);

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    try {
      wsRef.current = new WebSocket(config.url);
      wsRef.current.onopen = () => {
        debug('Connected');
        setIsConnected(true);
        setError(null);
        setReconnectAttempts(0);
      };

      wsRef.current.onclose = () => {
        debug('Disconnected');
        setIsConnected(false);
        if (config.autoReconnect && reconnectAttempts < config.reconnectAttempts) {
          const timeout = config.reconnectDelay * Math.pow(1.5, reconnectAttempts);
          debug(`Reconnecting in ${timeout}ms (attempt ${reconnectAttempts + 1})`);
          reconnectTimeoutRef.current = window.setTimeout(() => {
            setReconnectAttempts(prev => prev + 1);
            connect();
          }, timeout);
        }
      };

      wsRef.current.onmessage = (event: MessageEvent) => {
        try {
          const message = JSON.parse(event.data) as WebSocketMessage;
          debug('Received:', message);
          setLastMessage(message);
        } catch (error) {
          debug('Error parsing message:', error);
        }
      };

      wsRef.current.onerror = (event: Event) => {
        const error = event instanceof Error ? event : new Error('WebSocket error');
        debug('Error:', error);
        setError(error);
      };
    } catch (error) {
      debug('Error creating WebSocket:', error);
      setError(error instanceof Error ? error : new Error('Failed to connect'));
    }
  }, [config.url, config.autoReconnect, config.reconnectAttempts, config.reconnectDelay, reconnectAttempts, debug]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      window.clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    wsRef.current?.close();
    wsRef.current = null;
    setIsConnected(false);
  }, []);

  const send = useCallback(<T extends WebSocketEventType>(
    type: T,
    payload: WebSocketPayload<T>
  ): boolean => {
    if (wsRef.current?.readyState !== WebSocket.OPEN) {
      return false;
    }

    try {
      const message: WebSocketMessage<T> = {
        type,
        payload
      };
      wsRef.current.send(JSON.stringify(message));
      debug('Sent:', message);
      return true;
    } catch (error) {
      debug('Error sending message:', error);
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
    lastMessage,
    error,
    reconnectAttempts,
    send,
    connect,
    disconnect
  };
}

export default useWebSocket;
