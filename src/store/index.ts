// src/store/index.ts

import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { apiClient } from '../core/api/client';
import { API_ENDPOINTS } from '../core/api/endpoints';
import type { Message, ChatRequest } from '../features/chat/types/chat';
import type { Session } from '../core/session/types';

interface SessionState {
  data: Record<string, Session>;
  currentId: string | null;
  loading: boolean;
  error: string | null;
}

interface MessagesState {
  bySession: Record<string, Message[]>;
  loading: boolean;
  error: string | null;
}

interface StoreState {
  sessions: SessionState;
  messages: MessagesState;
  theme: 'light' | 'dark';
}

interface StoreActions {
  // Session actions
  setCurrentSession: (session: Session) => Promise<void>;
  fetchSessions: (userId: string) => Promise<void>;
  createSession: (userId: string) => Promise<Session>;
  
  // Message actions
  sendMessage: (content: string, sessionId: string) => Promise<void>;
  fetchMessages: (sessionId: string) => Promise<void>;
  
  // UI actions
  setTheme: (theme: 'light' | 'dark') => void;
}

export const useStore = create<StoreState & StoreActions>()(
  persist(
    (set, get) => ({
      // Initial state
      sessions: {
        data: {},
        currentId: null,
        loading: false,
        error: null
      },
      messages: {
        bySession: {},
        loading: false,
        error: null
      },
      theme: 'light',

      // Session actions
      setCurrentSession: async (session) => {
        try {
          set(state => ({
            sessions: {
              ...state.sessions,
              currentId: session.id,
              error: null
            }
          }));

          // Charger les messages si nécessaire
          if (!get().messages.bySession[session.id]) {
            await get().fetchMessages(session.id);
          }
        } catch (error) {
          set(state => ({
            sessions: {
              ...state.sessions,
              error: error instanceof Error ? error.message : 'Failed to set session'
            }
          }));
        }
      },

      fetchSessions: async (userId) => {
        try {
          set(state => ({
            sessions: { ...state.sessions, loading: true, error: null }
          }));

          const response = await apiClient.get<Session[]>(
            API_ENDPOINTS.USER.HISTORY(userId)
          );

          // Convertir le tableau en objet indexé
          const sessionMap = response.reduce<Record<string, Session>>(
            (acc, session) => {
              acc[session.id] = session;
              return acc;
            },
            {}
          );

          set(state => ({
            sessions: {
              ...state.sessions,
              data: sessionMap,
              loading: false
            }
          }));
        } catch (error) {
          set(state => ({
            sessions: {
              ...state.sessions,
              loading: false,
              error: error instanceof Error ? error.message : 'Failed to fetch sessions'
            }
          }));
        }
      },

      createSession: async (userId) => {
        try {
          set(state => ({
            sessions: { ...state.sessions, loading: true, error: null }
          }));

          const response = await apiClient.post<Session>(
            API_ENDPOINTS.SESSION.CREATE,
            { user_id: userId }
          );

          set(state => ({
            sessions: {
              ...state.sessions,
              data: {
                ...state.sessions.data,
                [response.id]: response
              },
              currentId: response.id,
              loading: false
            }
          }));

          return response;
        } catch (error) {
          set(state => ({
            sessions: {
              ...state.sessions,
              loading: false,
              error: error instanceof Error ? error.message : 'Failed to create session'
            }
          }));
          throw error;
        }
      },

      // Message actions
      sendMessage: async (content, sessionId) => {
        try {
          set(state => ({
            messages: { ...state.messages, loading: true, error: null }
          }));

          const optimisticMessage: Message = {
            id: Math.random().toString(),
            content,
            type: 'user',
            timestamp: new Date().toISOString(),
            sessionId
          };

          // Mise à jour optimiste
          set(state => ({
            messages: {
              ...state.messages,
              bySession: {
                ...state.messages.bySession,
                [sessionId]: [
                  ...(state.messages.bySession[sessionId] || []),
                  optimisticMessage
                ]
              }
            }
          }));

          const response = await apiClient.post<Message>(
            API_ENDPOINTS.CHAT.SEND,
            {
              content,
              session_id: sessionId
            }
          );

          // Mise à jour avec la réponse du serveur
          set(state => ({
            messages: {
              ...state.messages,
              bySession: {
                ...state.messages.bySession,
                [sessionId]: [
                  ...(state.messages.bySession[sessionId] || []).filter(
                    m => m.id !== optimisticMessage.id
                  ),
                  response
                ]
              },
              loading: false
            }
          }));
        } catch (error) {
          set(state => ({
            messages: {
              ...state.messages,
              loading: false,
              error: error instanceof Error ? error.message : 'Failed to send message'
            }
          }));
          throw error;
        }
      },

      fetchMessages: async (sessionId) => {
        try {
          set(state => ({
            messages: { ...state.messages, loading: true, error: null }
          }));

          const response = await apiClient.get<Message[]>(
            API_ENDPOINTS.SESSION.HISTORY(sessionId)
          );

          set(state => ({
            messages: {
              ...state.messages,
              bySession: {
                ...state.messages.bySession,
                [sessionId]: response
              },
              loading: false
            }
          }));
        } catch (error) {
          set(state => ({
            messages: {
              ...state.messages,
              loading: false,
              error: error instanceof Error ? error.message : 'Failed to fetch messages'
            }
          }));
        }
      },

      // UI actions
      setTheme: (theme) => set({ theme })
    }),
    {
      name: 'chat-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        theme: state.theme
      })
    }
  )
);

// Hooks utilitaires
export const useCurrentSession = () => {
  const { currentId, data } = useStore(state => state.sessions);
  return currentId ? data[currentId] : null;
};

export const useSessionMessages = (sessionId: string) => {
  return useStore(state => state.messages.bySession[sessionId] || []);
};

export default useStore;
