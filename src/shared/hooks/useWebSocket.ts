import { useState, useEffect, useCallback, useRef } from 'react';
import { APP_CONFIG } from '../../config/app.config';
import type { 
  WebSocketMessage, 
  WebSocketEventType,
  WebSocketPayloadMap,
  WebSocketConfig,
  WebSocketEventHandler 
} from '../../core/socket/types';

interface UseWebSocketOptions extends Partial<WebSocketConfig> {
  autoReconnect?: boolean;
  maxReconnectAttempts?: number;
  reconnectDelay?: number;
  heartbeatInterval?: number;
  debug?: boolean;
}

interface UseWebSocketReturn {
  isConnected: boolean;
  lastMessage: WebSocketMessage | null;
  error: Error | null;
  reconnectAttempts: number;
  send: <T extends WebSocketEventType>(
    type: T,
    payload: WebSocketPayloadMap[T]
  ) => boolean;
  connect: () => void;
  disconnect: () => void;
  addEventListener: <T extends WebSocketEventType>(
    type: T,
    handler: WebSocketEventHandler<T>
  ) => void;
  removeEventListener: <T extends WebSocketEventType>(
    type: T,
    handler: WebSocketEventHandler<T>
  ) => void;
}

const DEFAULT_OPTIONS: Required<UseWebSocketOptions> = {
  url: APP_CONFIG.CHAT.WS_URL,
  autoReconnect: true,
  maxReconnectAttempts: 5,
  reconnectDelay: 3000,
  heartbeatInterval: 30000,
  debug: process.env.NODE_ENV === 'development',
  protocols: [],
  connectionTimeout: 5000
};

export function useWebSocket(options: UseWebSocketOptions = {}): UseWebSocketReturn {
  const config = { ...DEFAULT_OPTIONS, ...options };
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);

  const wsRef = useRef<WebSocket | null>(null);
  const eventHandlersRef = useRef<Map<WebSocketEventType, Set<WebSocketEventHandler>>>(
    new Map()
  );
  const heartbeatIntervalRef = useRef<number | null>(null);
  const reconnectTimeoutRef = useRef<number | null>(null);

  const log = useCallback(
    (...args: unknown[]) => {
      if (config.debug) {
        console.log('[WebSocket]', ...args);
      }
    },
    [config.debug]
  );

  const clearHeartbeat = useCallback(() => {
    if (heartbeatIntervalRef.current) {
      window.clearInterval(heartbeatIntervalRef.current);
      heartbeatIntervalRef.current = null;
    }
  }, []);

  const setupHeartbeat = useCallback(() => {
    clearHeartbeat();
    if (config.heartbeatInterval > 0) {
      heartbeatIntervalRef.current = window.setInterval(() => {
        send('status', { type: 'heartbeat' });
      }, config.heartbeatInterval);
    }
  }, [config.heartbeatInterval, clearHeartbeat]);

  const handleOpen = useCallback(() => {
    log('Connected');
    setIsConnected(true);
    setError(null);
    setReconnectAttempts(0);
    setupHeartbeat();
  }, [log, setupHeartbeat]);

  const handleClose = useCallback(() => {
    log('Disconnected');
    setIsConnected(false);
    clearHeartbeat();

    if (config.autoReconnect && reconnectAttempts < config.maxReconnectAttempts) {
      const timeout = config.reconnectDelay * Math.pow(1.5, reconnectAttempts);
      log(`Reconnecting in ${timeout}ms (attempt ${reconnectAttempts + 1})`);
      reconnectTimeoutRef.current = window.setTimeout(() => {
        setReconnectAttempts(prev => prev + 1);
        connect();
      }, timeout);
    }
  }, [config, reconnectAttempts, clearHeartbeat, log]);

  const handleMessage = useCallback((event: MessageEvent) => {
    try {
      const message: WebSocketMessage = JSON.parse(event.data);
      log('Received:', message);
      setLastMessage(message);

      // Notify all handlers for this message type
      const handlers = eventHandlersRef.current.get(message.type);
      if (handlers) {
        handlers.forEach(handler => {
          try {
            handler(message);
          } catch (error) {
            console.error('Error in message handler:', error);
          }
        });
      }
    } catch (error) {
      console.error('Error parsing WebSocket message:', error);
    }
  }, [log]);

  const handleError = useCallback((event: Event) => {
    const error = event instanceof Error ? event : new Error('WebSocket error');
    log('Error:', error);
    setError(error);
  }, [log]);

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    try {
      wsRef.current = new WebSocket(config.url, config.protocols);
      wsRef.current.onopen = handleOpen;
      wsRef.current.onclose = handleClose;
      wsRef.current.onmessage = handleMessage;
      wsRef.current.onerror = handleError;

      // Connection timeout
      const timeoutId = window.setTimeout(() => {
        if (wsRef.current?.readyState !== WebSocket.OPEN) {
          wsRef.current?.close();
          setError(new Error('Connection timeout'));
        }
      }, config.connectionTimeout);

      return () => {
        window.clearTimeout(timeoutId);
      };
    } catch (error) {
      console.error('Error creating WebSocket:', error);
      setError(error instanceof Error ? error : new Error('Failed to connect'));
    }
  }, [config, handleOpen, handleClose, handleMessage, handleError]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      window.clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    clearHeartbeat();
    wsRef.current?.close();
    wsRef.current = null;
    setIsConnected(false);
  }, [clearHeartbeat]);

  const send = useCallback(<T extends WebSocketEventType>(
    type: T,
    payload: WebSocketPayloadMap[T]
  ): boolean => {
    if (wsRef.current?.readyState !== WebSocket.OPEN) {
      return false;
    }

    try {
      const message: WebSocketMessage = {
        type,
        payload,
        timestamp: new Date().toISOString()
      };
      wsRef.current.send(JSON.stringify(message));
      log('Sent:', message);
      return true;
    } catch (error) {
      console.error('Error sending message:', error);
      return false;
    }
  }, [log]);

  const addEventListener = useCallback(<T extends WebSocketEventType>(
    type: T,
    handler: WebSocketEventHandler<T>
  ) => {
    if (!eventHandlersRef.current.has(type)) {
      eventHandlersRef.current.set(type, new Set());
    }
    eventHandlersRef.current.get(type)?.add(handler as WebSocketEventHandler);
  }, []);

  const removeEventListener = useCallback(<T extends WebSocketEventType>(
    type: T,
    handler: WebSocketEventHandler<T>
  ) => {
    eventHandlersRef.current.get(type)?.delete(handler as WebSocketEventHandler);
  }, []);

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
    disconnect,
    addEventListener,
    removeEventListener
  };
}

export default useWebSocket;
