// src/core/session/types.ts

export interface SessionMetadata {
  title?: string;
  lastMessage?: string;
  messageCount: number;
  createdAt: string;
  updatedAt: string;
  language: string;
  tags?: string[];
}

export interface Session {
  id: string;
  userId: string;
  status: 'active' | 'archived' | 'deleted';
  metadata: SessionMetadata;
}

export interface SessionHistory {
  sessionId: string;
  messages: Array<{
    id: string;
    content: string;
    type: 'user' | 'assistant';
    timestamp: string;
  }>;
}

export interface SessionError extends Error {
  code: string;
  details?: unknown;
}

export interface SessionOptions {
  autoArchive?: boolean;
  maxIdleTime?: number;
  persistMetadata?: boolean;
}

export type SessionEventType = 
  | 'created'
  | 'updated'
  | 'deleted'
  | 'archived'
  | 'restored';

export interface SessionEvent {
  type: SessionEventType;
  sessionId: string;
  timestamp: string;
  metadata?: Partial<SessionMetadata>;
}
