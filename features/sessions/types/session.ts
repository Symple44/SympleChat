// src/core/session/types.ts

export interface SessionUser {
  id: string;
  name?: string;
  email?: string;
  preferences?: {
    language: string;
    theme: 'light' | 'dark';
    notifications: boolean;
  };
}

export interface SessionMetadata {
  title?: string;
  description?: string;
  lastMessage?: string;
  messageCount: number;
  createdAt: string;
  updatedAt: string;
  language: string;
  tags?: string[];
  context?: Record<string, unknown>;
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
    metadata?: {
      edited?: boolean;
      editedAt?: string;
      readAt?: string;
    };
  }>;
}

export interface SessionError extends Error {
  code: string;
  details?: unknown;
}

export interface SessionOptions {
  autoArchive?: boolean;
  maxIdleTime?: number; // en millisecondes
  persistMetadata?: boolean;
  autoReconnect?: boolean;
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

export interface SessionManager {
  createSession(userId: string, options?: SessionOptions): Promise<Session>;
  getSession(sessionId: string): Promise<Session>;
  updateSession(sessionId: string, updates: Partial<SessionMetadata>): Promise<Session>;
  archiveSession(sessionId: string): Promise<void>;
  deleteSession(sessionId: string): Promise<void>;
  restoreSession(sessionId: string): Promise<Session>;
  getUserSessions(userId: string): Promise<Session[]>;
}

export interface SessionStore {
  sessions: Session[];
  currentSession: Session | null;
  isLoading: boolean;
  error: string | null;
  
  setCurrentSession(session: Session | null): void;
  setSessions(sessions: Session[]): void;
  addSession(session: Session): void;
  updateSession(sessionId: string, updates: Partial<Session>): void;
  removeSession(sessionId: string): void;
  clearSessions(): void;
  setError(error: string | null): void;
}

export interface UseSessions {
  sessions: Session[];
  currentSession: Session | null;
  isLoading: boolean;
  error: string | null;
  createSession: (options?: SessionOptions) => Promise<Session>;
  changeSession: (sessionId: string) => Promise<void>;
  archiveSession: (sessionId: string) => Promise<void>;
  updateSession: (sessionId: string, updates: Partial<SessionMetadata>) => Promise<void>;
  loadSessions: () => Promise<void>;
}

export interface SessionContextValue extends UseSessions {
  manager: SessionManager;
  store: SessionStore;
}
