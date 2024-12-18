// Base types
export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt: string;
}

// Message types
export interface Message {
  id: string;
  content: string;
  type: 'user' | 'assistant';
  timestamp: string;
  sessionId: string;
  metadata?: MessageMetadata;
  documents?: DocumentReference[];
  fragments?: DocumentFragment[];
  confidence?: number;
}

export interface MessageMetadata {
  edited?: boolean;
  editedAt?: string;
  readAt?: string;
  language?: string;
  context?: Record<string, unknown>;
}

// Session types
export interface Session {
  id: string;
  userId: string;
  status: 'active' | 'archived' | 'deleted';
  metadata: SessionMetadata;
}

export interface SessionMetadata {
  title?: string;
  messageCount: number;
  createdAt: string;
  updatedAt: string;
  language: string;
  tags?: string[];
}

// Document types
export interface DocumentReference {
  id: string;
  source: string;
  page?: number;
  excerpt?: string;
}

export interface DocumentFragment {
  text: string;
  page_num: number;
  images: DocumentImage[];
  confidence: number;
  source: string;
  context_before: string;
  context_after: string;
}

export interface DocumentImage {
  type: string;
  data: string;
  alt?: string;
}

// Store types
export interface StoreState {
  sessions: SessionState;
  messages: MessagesState;
  theme: 'light' | 'dark';
}

export interface SessionState {
  data: Record<string, Session>;
  currentId: string | null;
  loading: boolean;
  error: string | null;
}

export interface MessagesState {
  bySession: Record<string, Message[]>;
  loading: boolean;
  error: string | null;
}

// API types
export interface ChatRequest {
  user_id: string;
  query: string;
  session_id?: string;
  context?: Record<string, unknown>;
  language?: string;
  application?: string;
}

export interface ChatResponse {
  response: string;
  session_id: string;
  conversation_id: string;
  documents_used: DocumentReference[];
  confidence_score: number;
  fragments?: DocumentFragment[];
  processing_time: number;
}

// Websocket types
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
