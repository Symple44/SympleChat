// src/store/rootReducer.ts

import type { Message } from '../features/chat/types/chat';
import type { Session } from '../core/session/types';

// State types
interface ChatState {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
}

interface SessionState {
  sessions: Session[];
  currentSessionId: string | null;
  isLoading: boolean;
  error: string | null;
}

interface UIState {
  theme: 'light' | 'dark';
  error: string | null;
  isMenuOpen: boolean;
}

export interface RootState {
  chat: ChatState;
  session: SessionState;
  ui: UIState;
}

// Action types
export interface RootActions {
  // Chat actions
  setMessages: (messages: Message[]) => void;
  addMessage: (message: Message) => void;
  clearMessages: () => void;
  
  // Session actions
  setCurrentSession: (session: Session | null) => void;
  setSessions: (sessions: Session[]) => void;
  
  // UI actions
  setTheme: (isDark: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  
  // Common actions
  resetStore: () => void;
  batchUpdate: (updates: Partial<RootState>) => void;
}

// Initial state
const initialState: RootState = {
  chat: {
    messages: [],
    isLoading: false,
    error: null
  },
  session: {
    sessions: [],
    currentSessionId: null,
    isLoading: false,
    error: null
  },
  ui: {
    theme: 'light',
    error: null,
    isMenuOpen: false
  }
};

// Reducers
const chatReducer = {
  setMessages: (state: RootState, messages: Message[]): Partial<RootState> => ({
    chat: { ...state.chat, messages }
  }),
  
  addMessage: (state: RootState, message: Message): Partial<RootState> => ({
    chat: {
      ...state.chat,
      messages: [...state.chat.messages, message]
    }
  }),
  
  clearMessages: (state: RootState): Partial<RootState> => ({
    chat: {
      ...state.chat,
      messages: []
    }
  })
};

const sessionReducer = {
  setCurrentSession: (state: RootState, session: Session | null): Partial<RootState> => ({
    session: {
      ...state.session,
      currentSessionId: session?.id || null
    }
  }),
  
  setSessions: (state: RootState, sessions: Session[]): Partial<RootState> => ({
    session: {
      ...state.session,
      sessions
    }
  })
};

const uiReducer = {
  setTheme: (state: RootState, isDark: boolean): Partial<RootState> => ({
    ui: {
      ...state.ui,
      theme: isDark ? 'dark' : 'light'
    }
  }),
  
  setError: (state: RootState, error: string | null): Partial<RootState> => ({
    ui: {
      ...state.ui,
      error
    }
  }),
  
  clearError: (state: RootState): Partial<RootState> => ({
    ui: {
      ...state.ui,
      error: null
    }
  })
};

// Root reducer export
export const rootReducer = {
  initialState,
  chat: chatReducer,
  session: sessionReducer,
  ui: uiReducer
};

export default rootReducer;
