import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { apiClient } from '@/core/api/client';
import { API_ENDPOINTS } from '@/core/api/endpoints';
import { APP_CONFIG } from '@/config/app.config';

// Types
interface Message {
  id: string;
  content: string;
  type: 'user' | 'assistant';
  timestamp: string;
  sessionId: string;
  metadata?: Record<string, any>;
  documents?: any[];
  fragments?: any[];
  confidence?: number;
}

interface Session {
  id: string;
  userId: string;
  status: 'active' | 'archived' | 'deleted';
  metadata: {
    title?: string;
    messageCount: number;
    createdAt: string;
    updatedAt: string;
    language: string;
  };
}

interface StoreState {
  sessions: {
    data: Record<string, Session>;
    currentId: string | null;
    loading: boolean;
    error: string | null;
  };
  messages: {
    bySession: Record<string, Message[]>;
    loading: boolean;
    error: string | null;
  };
  theme: 'light' | 'dark';
}

interface StoreActions {
  // Sessions
  setCurrentSession: (session: Session) => Promise<void>;
  fetchSessions: (userId: string) => Promise<void>;
  createSession: (userId: string) => Promise<Session>;
  archiveSession: (sessionId: string) => Promise<void>;

  // Messages
  sendMessage: (content: string, sessionId: string) => Promise<void>;
  fetchMessages: (sessionId: string) => Promise<void>;

  // UI
  setTheme: (theme: 'light' | 'dark') => void;
  setError: (error: string | null) => void;
}

export const useStore = create<StoreState & StoreActions>()(
  persist(
    (set, get) => ({
      // Initial state
      sessions: {
        data: {},
        currentId: null,
        loading: false,
        error: null,
      },
      messages: {
        bySession: {},
        loading: false,
        error: null,
      },
      theme: 'light',

      // Sessions actions
      setCurrentSession: async (session) => {
        try {
          set(state => ({
            sessions: {
              ...state.sessions,
              currentId: session.id,
              error: null,
            }
          }));

          await get().fetchMessages(session.id);
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
              loading: false,
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

          const newSession: Session = {
            ...response,
            metadata: {
              title: "Nouvelle conversation",
              messageCount: 0,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              language: 'fr'
            }
          };

          set(state => ({
            sessions: {
              ...state.sessions,
              data: {
                ...state.sessions.data,
                [newSession.id]: newSession
              },
              currentId: newSession.id,
              loading: false,
            }
          }));

          return newSession;
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

      archiveSession: async (sessionId) => {
        try {
          const session = get().sessions.data[sessionId];
          if (!session) throw new Error('Session not found');

          const updatedSession = {
            ...session,
            status: 'archived' as const
          };

          set(state => ({
            sessions: {
              ...state.sessions,
              data: {
                ...state.sessions.data,
                [sessionId]: updatedSession
              }
            }
          }));

          // Appel API pour archiver côté serveur
          await apiClient.put(API_ENDPOINTS.SESSION.GET(sessionId), {
            status: 'archived'
          });
        } catch (error) {
          set(state => ({
            sessions: {
              ...state.sessions,
              error: error instanceof Error ? error.message : 'Failed to archive session'
            }
          }));
          throw error;
        }
      },

      // Messages actions
      sendMessage: async (content, sessionId) => {
        try {
          set(state => ({
            messages: { ...state.messages, loading: true, error: null }
          }));

          const optimisticMessage: Message = {
            id: crypto.randomUUID(),
            content,
            type: 'user',
            timestamp: new Date().toISOString(),
            sessionId
          };

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

          const response = await apiClient.post<Message>(API_ENDPOINTS.CHAT.SEND, {
            user_id: APP_CONFIG.CHAT.DEFAULT_USER_ID,
            query: content,
            session_id: sessionId,
            language: APP_CONFIG.CHAT.DEFAULT_LANGUAGE
          });

          set(state => ({
            messages: {
              ...state.messages,
              bySession: {
                ...state.messages.bySession,
                [sessionId]: [
                  ...(state.messages.bySession[sessionId] || [])
                    .filter(m => m.id !== optimisticMessage.id),
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
          throw error;
        }
      },

      // UI actions
      setTheme: (theme) => {
        set({ theme });
        document.documentElement.classList.toggle('dark', theme === 'dark');
      },

      setError: (error) => set(state => ({
        messages: { ...state.messages, error },
        sessions: { ...state.sessions, error }
      }))
    }),
    {
      name: 'chat-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        theme: state.theme,
        sessions: {
          currentId: state.sessions.currentId
        }
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
