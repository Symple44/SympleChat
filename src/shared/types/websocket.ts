// src/shared/types/websocket.ts

export interface WebSocketMessage<T = unknown> {
  type: string;
  payload: T;
}

export interface WebSocketConfig {
  url: string;
  reconnectAttempts?: number;
  reconnectDelay?: number;
  debug?: boolean;
}

export interface WebSocketState {
  connected: boolean;
  error: Error | null;
}

export type WebSocketEventType = 'message' | 'session_update' | 'status';

export interface WebSocketPayload {
  message: {
    content: string;
    sessionId: string;
    timestamp: string;
  };
  session_update: {
    id: string;
    status: string;
    metadata: Record<string, unknown>;
  };
  status: {
    connected: boolean;
    timestamp: string;
  };
}
