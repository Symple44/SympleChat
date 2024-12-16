// src/core/socket/types.ts

export interface WebSocketConfig {
  url: string;
  protocols?: string[];
  reconnectAttempts?: number;
  reconnectDelay?: number;
  heartbeatInterval?: number;
  connectionTimeout?: number;
  debug?: boolean;
}

export type WebSocketEventType = 'message' | 'typing' | 'status' | 'heartbeat';

export interface ChatMessage {
  content: string;
  userId: string;
  sessionId: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

export interface TypingStatus {
  userId: string;
  isTyping: boolean;
}

export interface UserStatus {
  userId: string;
  status: 'online' | 'offline' | 'away' | 'heartbeat';
  timestamp: string;
}

export interface HeartbeatStatus {
  timestamp: string;
}

export interface WebSocketPayloadMap {
  message: ChatMessage;
  typing: TypingStatus;
  status: UserStatus;
  heartbeat: HeartbeatStatus;
}

export type WebSocketPayload<T extends WebSocketEventType> = WebSocketPayloadMap[T];

export interface WebSocketMessage<T extends WebSocketEventType = WebSocketEventType> {
  type: T;
  payload: WebSocketPayload<T>;
}

export type WebSocketEventHandler<T extends WebSocketEventType> = 
  (message: WebSocketMessage<T>) => void | Promise<void>;

export interface UseWebSocketOptions {
  url: string;
  autoReconnect?: boolean;
  reconnectAttempts?: number;
  reconnectDelay?: number;
  debug?: boolean;
}
