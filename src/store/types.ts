// src/store/
import type { Message } from '../features/chat/types/chat';
import type { Session } from '../core/session/types';

export interface RootState {
  chat: {
    messages: Message[];
    isLoading: boolean;
    error: string | null;
    currentSessionId: string | null;
  };
  session: {
    sessions: Session[];
    currentSessionId: string | null;
    isLoading: boolean;
    error: string | null;
  };
  ui: {
    theme: 'light' | 'dark';
    error: string | null;
    isMenuOpen: boolean;
  };
}

export interface RootActions {
  // Chat actions
  sendMessage: (content: string, options?: any) => Promise<void>;
  setMessages: (messages: Message[]) => void;
  addMessage: (message: Message) => void;
  clearMessages: () => void;
  loadSessionMessages: (sessionId: string) => Promise<void>;
  
  // Session actions
  setCurrentSession: (session: Session | null) => void;
  setSessions: (sessions: Session[]) => void;
  
  // UI actions
  setTheme: (isDark: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

export type Store = RootState & RootActions;
