// src/core/socket/types.ts

export type WebSocketEventType = 'message' | 'typing' | 'status' | 'heartbeat';

export interface ChatMessage {
  content: string;
  userId: string;
  sessionId: string;
  timestamp: string;
  type?: 'user' | 'assistant';
  metadata?: Record<string, unknown>;
}

export interface TypingStatus {
  userId: string;
  sessionId: string;
  isTyping: boolean;
}

export interface UserStatus {
  userId: string;
  status: 'online' | 'offline' | 'away' | 'heartbeat';
}

export interface WebSocketPayloadMap {
  message: ChatMessage;
  typing: TypingStatus;
  status: UserStatus;
  heartbeat: { timestamp: string };
}

export interface WebSocketMessage<T extends WebSocketEventType = WebSocketEventType> {
  type: T;
  payload: WebSocketPayloadMap[T];
  timestamp: string;
}

export interface UseWebSocketOptions {
  url?: string;
  autoReconnect?: boolean;
  maxReconnectAttempts?: number;
  reconnectDelay?: number;
  heartbeatInterval?: number;
  debug?: boolean;
  protocols?: string[];
  connectionTimeout?: number;
  reconnectAttempts?: number;
}
