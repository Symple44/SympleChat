// src/store/index.ts

import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { Message } from '../features/chat/types/chat';
import type { Session } from '../core/session/types';

export interface StoreState {
  chat: {
    messages: Message[];
    isLoading: boolean;
    error: string | null;
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

export interface StoreActions {
  // Chat actions
  sendMessage: (content: string, options?: any) => Promise<void>;
  setMessages: (messages: Message[]) => void;
  addMessage: (message: Message) => void;
  clearMessages: () => void;
  loadSessionMessages: (sessionId: string) => Promise<void>;
  
  // Session actions
  loadSessions: () => Promise<void>;
  setCurrentSession: (session: Session) => void;
  setSessions: (sessions: Session[]) => void;
  createNewSession: () => Promise<Session>;
  
  // UI actions
  setTheme: (isDark: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  
  // Common actions
  resetStore: () => void;
}

const initialState: StoreState = {
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

export const useStore = create<StoreState & StoreActions>()(
  persist(
    (set, get) => ({
      ...initialState,

      // Chat actions
      sendMessage: async (content: string) => {
        set(state => ({ chat: { ...state.chat, isLoading: true } }));
        try {
          // Implémentation
          set(state => ({ chat: { ...state.chat, isLoading: false } }));
        } catch (error) {
          set(state => ({ 
            chat: { 
              ...state.chat, 
              isLoading: false,
              error: error instanceof Error ? error.message : 'Error sending message'
            }
          }));
          throw error;
        }
      },
      
      setMessages: (messages) => set(state => ({
        chat: { ...state.chat, messages }
      })),
      
      addMessage: (message) => set(state => ({
        chat: { ...state.chat, messages: [...state.chat.messages, message] }
      })),
      
      clearMessages: () => set(state => ({
        chat: { ...state.chat, messages: [] }
      })),

      loadSessionMessages: async (id: string) => {
        set(state => ({ chat: { ...state.chat, isLoading: true } }));
        try {
          // Implémentation avec id
          set(state => ({ chat: { ...state.chat, isLoading: false } }));
        } catch (error) {
          set(state => ({ 
            chat: { 
              ...state.chat, 
              isLoading: false,
              error: error instanceof Error ? error.message : 'Error loading messages'
            }
          }));
          throw error;
        }
      },

      // Session actions
      loadSessions: async () => {
        set(state => ({ session: { ...state.session, isLoading: true } }));
        try {
          // Implémentation du chargement des sessions
          set(state => ({ session: { ...state.session, isLoading: false } }));
        } catch (error) {
          set(state => ({ 
            session: { 
              ...state.session, 
              isLoading: false, 
              error: error instanceof Error ? error.message : 'Error loading sessions'
            } 
          }));
        }
      },

      setCurrentSession: (session) => set(state => ({
        session: { ...state.session, currentSessionId: session.id }
      })),

      setSessions: (sessions) => set(state => ({
        session: { ...state.session, sessions }
      })),

      createNewSession: async () => {
        set(state => ({ session: { ...state.session, isLoading: true } }));
        try {
          // Implémentation de la création d'une session
          const newSession = {} as Session; // À implémenter
          set(state => ({ session: { ...state.session, isLoading: false } }));
          return newSession;
        } catch (error) {
          set(state => ({ 
            session: { 
              ...state.session, 
              isLoading: false, 
              error: error instanceof Error ? error.message : 'Error creating session'
            } 
          }));
          throw error;
        }
      },

      // UI actions
      setTheme: (isDark) => set(state => ({
        ui: { ...state.ui, theme: isDark ? 'dark' : 'light' }
      })),

      setError: (error) => set(state => ({
        ui: { ...state.ui, error }
      })),

      clearError: () => set(state => ({
        ui: { ...state.ui, error: null }
      })),

      // Common actions
      resetStore: () => set(initialState)
    }),
    {
      name: 'chat-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        ui: { theme: state.ui.theme },
        session: { currentSessionId: state.session.currentSessionId }
      })
    }
  )
);

export default useStore;
