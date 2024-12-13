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
        // Verrou pour éviter les appels multiples
        if (get().isLoading) return get().sessions;

        set({ isLoading: true, error: null });
        try {
          const history = await apiCall(
            `/history/user/${config.CHAT.DEFAULT_USER_ID}`
          );
          
          // Utiliser un Map pour un suivi plus précis des sessions
          const sessionMap = new Map();
          
          // Traiter chaque message pour construire les sessions
          history.forEach(msg => {
            if (!sessionMap.has(msg.session_id)) {
              sessionMap.set(msg.session_id, {
                session_id: msg.session_id,
                timestamp: msg.timestamp,
                messages: [],
                first_message: null
              });
            }
            
            const sessionData = sessionMap.get(msg.session_id);
            sessionData.messages.push(msg);
            
            // Mettre à jour le timestamp le plus récent
            if (!sessionData.timestamp || 
                new Date(msg.timestamp) > new Date(sessionData.timestamp)) {
              sessionData.timestamp = msg.timestamp;
            }
            
            // Définir le premier message si pas encore défini
            if (!sessionData.first_message && msg.query) {
              sessionData.first_message = msg.query;
            }
          });
          
          // Convertir la Map en tableau de sessions
          const sessions = Array.from(sessionMap.values()).map(session => ({
            session_id: session.session_id,
            timestamp: session.timestamp,
            first_message: session.first_message || "Nouvelle conversation",
            message_count: session.messages.length
          }));

          // Trier par timestamp le plus récent
          sessions.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
          
          set({ 
            sessions, 
            isLoading: false 
          });
          
          console.log('Sessions chargées:', sessions);
          return sessions;

        } catch (error) {
          console.error('Erreur chargement sessions:', error);
          set({ 
            error: error.message, 
            isLoading: false 
          });
          return [];
        }
      },

      createNewSession: async () => {
        // Verrou pour éviter les créations multiples
        if (get().isLoading) return null;

        set({ isLoading: true, error: null });
        try {
          console.log('Création nouvelle session...');
          
          const response = await apiCall('/sessions/new', {
            method: 'POST',
            body: JSON.stringify({
              user_id: config.CHAT.DEFAULT_USER_ID
            })
          });

          console.log('Réponse création session:', response);

          if (!response.session_id) {
            throw new Error('Pas de session_id dans la réponse');
          }

          const newSession = {
            session_id: response.session_id,
            timestamp: new Date().toISOString(),
            first_message: "Nouvelle conversation"
          };
          
          set({
            sessions: [newSession, ...get().sessions],
            currentSessionId: newSession.session_id,
            messages: [],
            isLoading: false
          });
          
          console.log('Nouvelle session créée avec ID:', newSession.session_id);
          
          return newSession.session_id;
        } catch (error) {
          console.error('Erreur création session:', error);
          set({ 
            error: error.message, 
            isLoading: false 
          });
          return null;
        }
      },

      loadSessionMessages: async (sessionId) => {
        // Verrou et validation des paramètres
        if (get().isLoading || !sessionId) return;

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
            currentSessionId: sessionId,
            isLoading: false
          });
          
        } catch (error) {
          console.error('Erreur chargement messages:', error);
          set({ 
            error: error.message, 
            isLoading: false 
          });
        }
      },

      sendMessage: async (content) => {
        const { currentSessionId } = get();
        
        // Vérification des paramètres
        if (!content || !currentSessionId) return null;
        
        // Verrou pour éviter les envois multiples
        if (get().isLoading) return null;

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
            messages: [...state.messages, assistantMessage],
            isLoading: false
          }));

          return responseData;
        } catch (error) {
          console.error('Erreur envoi message:', error);
          set({ 
            error: error.message, 
            isLoading: false 
          });
          throw error;
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
