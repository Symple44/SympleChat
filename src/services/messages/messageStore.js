// src/services/messages/messageStore.js
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { config } from '../../config';

// Helper pour les appels API
const apiCall = async (endpoint, options = {}) => {
  const url = `${config.API.BASE_URL}${endpoint}`;
  const defaultHeaders = {
    'Content-Type': 'application/json',
    ...config.API.HEADERS
  };

  console.log(`Making API call to: ${url}`, options);

  const response = await fetch(url, {
    headers: defaultHeaders,
    ...options
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`API Error (${response.status}):`, errorText);
    throw new Error(errorText || 'Erreur API');
  }

  return response.json();
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
      clearMessages: () => set({ messages: [] }),
      setError: (error) => set({ error }),
      
      // Gestion des sessions
      loadSessions: async () => {
        set({ isLoading: true, error: null });
        try {
          const history = await apiCall(
            `/history/user/${config.CHAT.DEFAULT_USER_ID}`
          );
          
          const sessionGroups = history.reduce((groups, msg) => {
            if (!groups[msg.session_id]) {
              groups[msg.session_id] = {
                messages: [],
                timestamp: msg.timestamp,
                session_id: msg.session_id
              };
            }
            groups[msg.session_id].messages.push(msg);
            
            if (new Date(msg.timestamp) > new Date(groups[msg.session_id].timestamp)) {
              groups[msg.session_id].timestamp = msg.timestamp;
            }
            return groups;
          }, {});

          const sessions = Object.values(sessionGroups).map(group => ({
            session_id: group.session_id,
            timestamp: group.timestamp,
            first_message: group.messages.find(m => m.query)?.query || "Nouvelle conversation"
          }));

          sessions.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
          set({ sessions });
          console.log('Sessions chargées:', sessions);

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
          console.log('Création nouvelle session...');
          
          const data = await apiCall('/sessions/new', {
            method: 'POST',
            body: JSON.stringify({
              user_id: config.CHAT.DEFAULT_USER_ID
            })
          });

          console.log('Réponse création session:', data);

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
          const messages = await apiCall(`/history/session/${sessionId}`);
          
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
        } finally {
          set({ isLoading: false });
        }
      },

      sendMessage: async (content) => {
        const { currentSessionId } = get();
        set({ isLoading: true, error: null });

        try {
          const userMessage = {
            id: Date.now(),
            content,
            type: 'user',
            timestamp: new Date().toISOString()
          };
          
          set(state => ({
            messages: [...state.messages, userMessage]
          }));

          const responseData = await apiCall('/chat', {
            method: 'POST',
            body: JSON.stringify({
              user_id: config.CHAT.DEFAULT_USER_ID,
              query: content,
              session_id: currentSessionId,
              language: config.CHAT.DEFAULT_LANGUAGE
            })
          });

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
