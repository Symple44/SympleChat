// src/services/messages/messageStore.js
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { config } from '../../config';

// Helper pour construire les URLs d'API correctement
const buildApiUrl = (endpoint) => {
  return `${config.API.BASE_URL}${endpoint}`;
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
      setError: (error) => set({ error }),
      setLoading: (isLoading) => set({ isLoading }),
      setCurrentSession: (sessionId) => set({ currentSessionId: sessionId }),
      clearMessages: () => set({ messages: [] }),
      
      // Gestion des sessions
      loadSessions: async () => {
        set({ isLoading: true, error: null });
        try {
          const response = await fetch(
            buildApiUrl(`/history/user/${config.CHAT.DEFAULT_USER_ID}`)
          );
          
          if (!response.ok) throw new Error('Erreur chargement historique');
          
          const history = await response.json();
          
          // Grouper par session
          const sessionGroups = history.reduce((groups, msg) => {
            if (!groups[msg.session_id]) {
              groups[msg.session_id] = {
                messages: [],
                timestamp: msg.timestamp
              };
            }
            groups[msg.session_id].messages.push(msg);
            if (new Date(msg.timestamp) > new Date(groups[msg.session_id].timestamp)) {
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
          const response = await fetch(
            buildApiUrl('/sessions/new'), 
            {
              method: 'POST',
              headers: config.API.HEADERS,
              body: JSON.stringify({ user_id: config.CHAT.DEFAULT_USER_ID })
            }
          );

          if (!response.ok) throw new Error('Erreur création session');
          
          const data = await response.json();
          const newSession = {
            session_id: data.session_id,
            timestamp: new Date().toISOString(),
            first_message: "Nouvelle conversation"
          };
          
          set(state => ({
            sessions: [newSession, ...state.sessions],
            currentSessionId: data.session_id,
            messages: []
          }));
          
          return data.session_id;
        } catch (error) {
          console.error('Erreur création session:', error);
          set({ error: error.message });
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      loadSessionMessages: async (sessionId) => {
        set({ isLoading: true, error: null });
        try {
          const response = await fetch(
            buildApiUrl(`/history/session/${sessionId}`)
          );
          
          if (!response.ok) throw new Error('Erreur chargement messages');
          
          const messages = await response.json();
          set({ 
            messages: messages.map(msg => ({
              id: msg.id || Date.now(),
              content: msg.query || msg.response,
              type: msg.query ? 'user' : 'assistant',
              timestamp: msg.timestamp,
              documents: msg.documents_used || [],
              fragments: msg.fragments || [],
              confidence: msg.confidence_score
            })),
            currentSessionId: sessionId 
          });
        } catch (error) {
          console.error('Erreur chargement messages:', error);
          set({ error: error.message });
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      sendMessage: async (content) => {
        const { currentSessionId } = get();
        set({ isLoading: true, error: null });

        try {
          // Ajout du message utilisateur
          const userMessage = {
            id: Date.now(),
            content,
            type: 'user',
            timestamp: new Date().toISOString()
          };
          set(state => ({
            messages: [...state.messages, userMessage]
          }));

          // Envoi au serveur
          const response = await fetch(
            buildApiUrl('/chat'),
            {
              method: 'POST',
              headers: config.API.HEADERS,
              body: JSON.stringify({
                user_id: config.CHAT.DEFAULT_USER_ID,
                query: content,
                session_id: currentSessionId,
                language: config.CHAT.DEFAULT_LANGUAGE
              })
            }
          );

          if (!response.ok) throw new Error('Erreur envoi message');
          
          const responseData = await response.json();

          // Ajout de la réponse
          const assistantMessage = {
            id: Date.now() + 1,
            content: responseData.response,
            type: 'assistant',
            timestamp: new Date().toISOString(),
            documents: responseData.documents_used || [],
            fragments: responseData.fragments || [],
            confidence: responseData.confidence_score
          };
          
          set(state => ({
            messages: [...state.messages, assistantMessage]
          }));

          // Mise à jour des sessions
          await get().loadSessions();

          return responseData;
        } catch (error) {
          console.error('Erreur envoi message:', error);
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
