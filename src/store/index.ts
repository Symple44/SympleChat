// src/store/index.ts

import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { apiClient } from '../core/api/client';
import { API_ENDPOINTS } from '../core/api/endpoints';
import type { Message } from '../features/chat/types/chat';
import type { Session } from '../core/session/types';
import { APP_CONFIG } from '../config/app.config';

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
  setCurrentSession: (session: Session) => Promise<void>;
  setSessions: (updater: Session[] | ((prev: Session[]) => Session[])) => void;
  
  // UI actions
  setTheme: (isDark: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
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

      sendMessage: async (content: string, sessionId: string): Promise<void> => {
        try {
          set(state => ({ chat: { ...state.chat, isLoading: true, error: null } }));
          
          // Format the request according to API specifications
          const request: ChatRequest = {
            user_id: APP_CONFIG.CHAT.DEFAULT_USER_ID,
            query: content.trim(),
            session_id: sessionId,
            language: APP_CONFIG.CHAT.DEFAULT_LANGUAGE,
            context: {},
            application: 'symple-chat'
          };

          // Create optimistic message
          const optimisticMessage: Message = {
            id: crypto.randomUUID(),
            content: content.trim(),
            type: 'user',
            timestamp: new Date().toISOString(),
            sessionId
          };

          // Add optimistic message
          set(state => ({
            chat: {
              ...state.chat,
              messages: [...state.chat.messages, optimisticMessage]
            }
          }));

          // Send to API
          const response = await apiClient.post<Message>(
            API_ENDPOINTS.CHAT.SEND,
            request
          );

          // Update with server response
          set(state => ({
            chat: {
              ...state.chat,
              messages: [
                ...state.chat.messages.filter(m => m.id !== optimisticMessage.id),
                response
              ],
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
        chat: { ...state.chat, messages, error: null }
      })),
      
      addMessage: (message) => set(state => ({
        chat: { 
          ...state.chat, 
          messages: [...state.chat.messages, message],
          error: null
        }
      })),
      
      clearMessages: () => set(state => ({
        chat: { ...state.chat, messages: [], error: null }
      })),

      loadSessionMessages: async (sessionId: string) => {
        try {
          set(state => ({ chat: { ...state.chat, isLoading: true, error: null } }));
          
          const response = await apiClient.get<Message[]>(
            API_ENDPOINTS.SESSION.HISTORY(sessionId)
          );

          set(state => ({ 
            chat: { 
              ...state.chat,
              messages: response || [],
              isLoading: false 
            }
          }));
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

      setCurrentSession: async (session) => {
        try {
          set(state => ({
            session: { 
              ...state.session, 
              currentSessionId: session.id,
              error: null
            }
          }));

          // Charger les messages de la session
          const messages = await apiClient.get<Message[]>(
            API_ENDPOINTS.SESSION.HISTORY(session.id)
          );

          set(state => ({
            chat: {
              ...state.chat,
              messages: messages || []
            }
          }));
        } catch (error) {
          set(state => ({
            session: {
              ...state.session,
              error: error instanceof Error ? error.message : 'Error setting session'
            }
          }));
          throw error;
        }
      },

      setSessions: (updater) => set(state => ({
        session: {
          ...state.session,
          sessions: typeof updater === 'function' 
            ? updater(state.session.sessions)
            : updater,
          error: null
        }
      })),

      setTheme: (isDark) => set(state => ({
        ui: { ...state.ui, theme: isDark ? 'dark' : 'light' }
      })),

      setError: (error) => set(state => ({
        ui: { ...state.ui, error }
      })),

      clearError: () => set(state => ({
        ui: { ...state.ui, error: null }
      }))
    }),
    {
      name: 'chat-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        ui: { theme: state.ui.theme }
      })
    }
  )
);

export default useStore;
