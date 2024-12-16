// src/core/socket/types.ts

// Types généraux pour les WebSocket
export type WebSocketEventType = 'message' | 'typing' | 'status' | 'error' | 'connect' | 'disconnect';

// Interface de base pour tous les messages WebSocket
export interface WebSocketMessage<T = unknown> {
  type: WebSocketEventType;
  payload: T;
  timestamp?: string;
}

// Types spécifiques pour chaque type de message
export interface ChatMessage {
  content: string;
  userId: string;
  sessionId: string;
  metadata?: Record<string, unknown>;
}

export interface TypingStatus {
  userId: string;
  sessionId: string;
  isTyping: boolean;
}

export interface UserStatus {
  userId: string;
  status: 'online' | 'offline' | 'away';
  lastSeen?: string;
}

export interface ErrorPayload {
  code: string;
  message: string;
  details?: unknown;
}

// Map des payloads pour chaque type d'événement
export interface WebSocketPayloadMap {
  message: ChatMessage;
  typing: TypingStatus;
  status: UserStatus;
  error: ErrorPayload;
  connect: undefined;
  disconnect: undefined;
}

// Helper type pour obtenir le type de payload correspondant à un type d'événement
export type PayloadType<T extends WebSocketEventType> = WebSocketPayloadMap[T];

// Type pour les gestionnaires d'événements
export type WebSocketEventHandler<T extends WebSocketEventType = WebSocketEventType> = 
  (message: WebSocketMessage<PayloadType<T>>) => void | Promise<void>;

// Configuration du WebSocket
export interface WebSocketConfig {
  url: string;
  protocols?: string | string[];
  reconnectAttempts?: number;
  reconnectDelay?: number;
  heartbeatInterval?: number;
  connectionTimeout?: number;
  debug?: boolean;
}

// Options pour la connexion WebSocket
export interface WebSocketOptions {
  autoReconnect?: boolean;
  maxReconnectAttempts?: number;
  reconnectDelay?: number;
  onMessage?: WebSocketEventHandler;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Event) => void;
}

// État de la connexion WebSocket
export interface WebSocketState {
  isConnected: boolean;
  lastMessage: WebSocketMessage | null;
  error: Error | null;
  reconnectAttempts: number;
}

// Interface pour le gestionnaire WebSocket
export interface WebSocketManager {
  connect(): void;
  disconnect(): void;
  send<T extends WebSocketEventType>(
    type: T,
    payload: PayloadType<T>
  ): boolean;
  isConnected(): boolean;
  addEventListener<T extends WebSocketEventType>(
    type: T,
    handler: WebSocketEventHandler<T>
  ): void;
  removeEventListener<T extends WebSocketEventType>(
    type: T,
    handler: WebSocketEventHandler<T>
  ): void;
}

// Hook useWebSocket return type
export interface UseWebSocketReturn {
  isConnected: boolean;
  lastMessage: WebSocketMessage | null;
  error: Error | null;
  send: <T extends WebSocketEventType>(type: T, payload: PayloadType<T>) => boolean;
  connect: () => void;
  disconnect: () => void;
}

// Types pour la gestion des retries
export interface RetryConfig {
  maxAttempts: number;
  delay: number;
  backoff?: boolean;
  backoffMultiplier?: number;
}

// Types pour la gestion du heartbeat
export interface HeartbeatConfig {
  interval: number;
  timeout: number;
  payload?: unknown;
}
