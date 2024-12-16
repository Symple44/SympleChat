// src/store/index.ts

import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { apiClient } from '../core/api/client';
import { API_ENDPOINTS } from '../core/api/endpoints';
import type { Message } from '../features/chat/types/chat';
import type { Session } from '../core/session/types';

interface StoreState {
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

interface StoreActions {
  // Chat actions
  sendMessage: (content: string, sessionId: string) => Promise<void>;
  setMessages: (messages: Message[]) => void;
  addMessage: (message: Message) => void;
  clearMessages: () => void;
  loadSessionMessages: (sessionId: string) => Promise<void>;
  
  // Session actions
  setCurrentSession: (session: Session) => void;
  setSessions: (sessions: Session[] | ((prev: Session[]) => Session[])) => void;
  
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
    (set) => ({
      ...initialState,

      sendMessage: async (content: string, sessionId: string) => {
        set(state => ({ chat: { ...state.chat, isLoading: true } }));
        try {
          const newMessage: Message = {
            id: crypto.randomUUID(),
            content,
            sessionId,
            type: 'user',
            timestamp: new Date().toISOString()
          };

          set(state => ({
            chat: {
              ...state.chat,
              messages: [...state.chat.messages, newMessage],
              isLoading: false
            }
          }));
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
        chat: { 
          ...state.chat, 
          messages: [...state.chat.messages, message] 
        }
      })),
      
      clearMessages: () => set(state => ({
        chat: { ...state.chat, messages: [] }
      })),

      loadSessionMessages: async (sessionId: string) => {
        set(state => ({ chat: { ...state.chat, isLoading: true } }));
        try {
          const messages = await apiClient.get<Message[]>(
            API_ENDPOINTS.SESSION.MESSAGES(sessionId)
          );

          set(state => ({ 
            chat: { 
              ...state.chat,
              messages: messages || [],
              isLoading: false 
            }
          }));
        } catch (error) {
          set(state => ({ 
            chat: { 
              ...state.chat, 
              isLoading: false,
              error: error instanceof Error ? error.message : 'Error loading messages',
              messages: []
            }
          }));
          throw error;
        }
      },

      setCurrentSession: (session) => set(state => ({
        session: { 
          ...state.session, 
          currentSessionId: session.id,
          error: null
        }
      })),

      setSessions: (sessionsOrUpdater) => set(state => ({
        session: {
          ...state.session,
          sessions: typeof sessionsOrUpdater === 'function'
            ? sessionsOrUpdater(state.session.sessions)
            : sessionsOrUpdater,
          error: null
        }
      })),

      setTheme: (isDark) => set(state => ({
        ui: { 
          ...state.ui, 
          theme: isDark ? 'dark' : 'light' 
        }
      })),

      setError: (error) => set(state => ({
        ui: { ...state.ui, error }
      })),

      clearError: () => set(state => ({
        ui: { ...state.ui, error: null }
      })),

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
