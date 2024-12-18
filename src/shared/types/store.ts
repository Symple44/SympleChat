// src/shared/types/store.ts

import type { Theme } from './common';
import type { Message } from './message';
import type { Session, SessionState } from './session';

export interface MessagesState {
  bySession: Record<string, Message[]>;
  loading: boolean;
  error: string | null;
}

export interface StoreState {
  sessions: SessionState;
  messages: MessagesState;
  theme: Theme;
}

export interface StoreActions {
  // Sessions
  setCurrentSession: (session: Session) => Promise<void>;
  fetchSessions: (userId: string) => Promise<void>;
  createSession: (userId: string) => Promise<Session>;
  archiveSession: (sessionId: string) => Promise<void>;

  // Messages
  sendMessage: (content: string, sessionId: string) => Promise<void>;
  fetchMessages: (sessionId: string) => Promise<void>;

  // UI
  setTheme: (theme: Theme) => void;
  setError: (error: string | null) => void;
}
