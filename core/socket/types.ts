// src/core/socket/types.ts

export interface WebSocketEventMap {
  message: {
    type: 'message';
    content: string;
    userId: string;
    sessionId: string;
    timestamp: string;
  };
  typing: {
    type: 'typing';
    userId: string;
    sessionId: string;
    isTyping: boolean;
  };
  status: {
    type: 'status';
    userId: string;
    status: 'online' | 'offline' | 'away';
  };
  error: {
    type: 'error';
    code: number;
    message: string;
  };
}

export type WebSocketEventType = keyof WebSocketEventMap;
export type WebSocketPayload<T extends WebSocketEventType> = WebSocketEventMap[T];

export interface WebSocketMessage<T extends WebSocketEventType = WebSocketEventType> {
  type: T;
  payload: WebSocketPayload<T>;
}

export interface WebSocketOptions {
  autoReconnect?: boolean;
  maxReconnectAttempts?: number;
  reconnectDelay?: number;
  debug?: boolean;
}

export type WebSocketEventHandler<T extends WebSocketEventType> = 
  (payload: WebSocketPayload<T>) => void | Promise<void>;

export interface WebSocketEventHandlers {
  [K in WebSocketEventType]?: WebSocketEventHandler<K>;
}
