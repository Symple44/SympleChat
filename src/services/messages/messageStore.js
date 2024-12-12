// src/services/messages/messageStore.js
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { config } from '../../config';

const apiClient = {
  async sendMessage(content, sessionId) {
    const response = await fetch(`${config.API.BASE_URL}${config.API.ENDPOINTS.CHAT}`, {
      method: 'POST',
      headers: config.API.HEADERS,
      body: JSON.stringify({
        user_id: config.CHAT.DEFAULT_USER_ID,
        query: content,
        session_id: sessionId,
        language: config.CHAT.DEFAULT_LANGUAGE
      })
    });

    if (!response.ok) {
      throw new Error('Erreur lors de l\'envoi du message');
    }

    return response.json();
  },

  async getMessageHistory(sessionId) {
    const response = await fetch(`${config.API.BASE_URL}${config.API.ENDPOINTS.HISTORY}/session/${sessionId}`);
    if (!response.ok) {
      throw new Error('Erreur lors du chargement de l\'historique');
    }
    return response.json();
  },

  async getUserSessions() {
    const response = await fetch(
      `${config.API.BASE_URL}${config.API.ENDPOINTS.HISTORY}/user/${config.CHAT.DEFAULT_USER_ID}`
    );
    if (!response.ok) {
      throw new Error('Erreur lors du chargement des sessions');
    }
    return response.json();
  },

  async createNewSession() {
    const response = await fetch(
      `${config.API.BASE_URL}${config.API.ENDPOINTS.SESSIONS}/new?user_id=${config.CHAT.DEFAULT_USER_ID}`,
      {
        method: 'POST',
        headers: config.API.HEADERS
      }
    );
    if (!response.ok) {
      throw new Error('Erreur lors de la création de la session');
    }
    return response.json();
  }
};

const formatMessage = (message) => {
  // Pour un nouveau message utilisateur
  if (message.type === 'user') {
    return {
      id: Date.now(),
      content: message.content,
      type: 'user',
      timestamp: new Date().toISOString()
    };
  }

  // Pour une réponse de l'assistant via l'API
  if (message.response) {
    return {
      id: Date.now(),
      content: message.response,
      type: 'assistant',
      timestamp: new Date(message.timestamp || Date.now()).toISOString(),
      documents: message.documents_used || [],
      fragments: message.fragments || [],
      confidence: message.confidence_score
    };
  }

  // Pour un message de l'historique
  return {
    id: message.id || Date.now(),
    content: message.query || message.response || message.content,
    type: message.query ? 'user' : 'assistant',
    timestamp: new Date(message.timestamp || Date.now()).toISOString(),
    documents: message.documents_used || [],
    fragments: message.fragments || [],
    confidence: message.confidence_score
  };
};

const useMessageStore = create(
  persist(
    (set, get) => ({
      messages: [],
      sessions: [],
      isLoading: false,
      error: null,
      currentSessionId: null,

      // Actions de base
      setMessages: (messages) => set({ messages }),
      setSessions: (sessions) => set({ sessions }),
      
      addMessage: (message) => set((state) => ({
        messages: [...state.messages, formatMessage(message)]
      })),

      clearMessages: () => set({ messages: [] }),
      
      setError: (error) => set({ error }),
      setLoading: (isLoading) => set({ isLoading }),
      setCurrentSession: (sessionId) => set({ currentSessionId: sessionId }),

      // Gestion des sessions
      loadSessions: async () => {
        set({ isLoading: true, error: null });
        try {
          const history = await apiClient.getUserSessions();
          const sessionGroups = history.reduce((groups, msg) => {
            if (!groups[msg.session_id]) {
              groups[msg.session_id] = {
                messages: [],
                timestamp: null
              };
            }
            groups[msg.session_id].messages.push(msg);
            if (!groups[msg.session_id].timestamp || 
                new Date(msg.timestamp) > new Date(groups[msg.session_id].timestamp)) {
              groups[msg.session_id].timestamp = msg.timestamp;
            }
            return groups;
          }, {});

          const sessions = Object.entries(sessionGroups).map(([sessionId, data]) => ({
            session_id: sessionId,
            timestamp: data.timestamp,
            first_message: data.messages.find(m => m.query)?.query || "Nouvelle conversation"
          }));

          sessions.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
          set({ sessions });
        } catch (error) {
          console.error('Erreur chargement sessions:', error);
          set({ error: error.message });
        } finally {
          set({ isLoading: false });
        }
      },

      createNewSession: async () => {
        set({ isLoading: true, error: null });
        try {
          const response = await apiClient.createNewSession();
          const newSession = {
            session_id: response.session_id,
            timestamp: new Date().toISOString(),
            first_message: "Nouvelle conversation"
          };
          set((state) => ({
            sessions: [newSession, ...state.sessions],
            currentSessionId: response.session_id,
            messages: []
          }));
          return response.session_id;
        } catch (error) {
          console.error('Erreur création session:', error);
          set({ error: error.message });
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      // Gestion des messages
      sendMessage: async (content) => {
        const { currentSessionId } = get();
        set({ isLoading: true, error: null });

        try {
          // Ajout du message utilisateur
          const userMessage = {
            content,
            type: 'user'
          };
          get().addMessage(userMessage);

          // Envoi et réception de la réponse
          const response = await apiClient.sendMessage(content, currentSessionId);
          
          // Ajout de la réponse de l'assistant
          const assistantMessage = {
            content: response.response,
            type: 'assistant',
            documents: response.documents_used,
            fragments: response.fragments,
            confidence: response.confidence_score,
            timestamp: new Date().toISOString()
          };
          get().addMessage(assistantMessage);

          // Mise à jour des sessions
          await get().loadSessions();

          return response;
        } catch (error) {
          console.error('Erreur envoi message:', error);
          set({ error: error.message });
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      loadSessionMessages: async (sessionId) => {
        set({ isLoading: true, error: null });
        try {
          const messages = await apiClient.getMessageHistory(sessionId);
          set({ 
            messages: messages.map(formatMessage),
            currentSessionId: sessionId 
          });
        } catch (error) {
          console.error('Erreur chargement messages:', error);
          set({ error: error.message });
          throw error;
        } finally {
          set({ isLoading: false });
        }
      }
    }),
    {
      name: 'chat-storage',
      partialize: (state) => ({ 
        messages: state.messages,
        currentSessionId: state.currentSessionId,
        sessions: state.sessions
      })
    }
  )
);

export default useMessageStore;
