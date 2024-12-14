// src/services/messages/messageStore.js
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { config } from '../../config';

const useMessageStore = create(
  persist(
    (set, get) => ({
      messages: [],
      isLoading: false,
      error: null,

      clearMessages: () => set({ messages: [] }),
      setError: (error) => set({ error }),

      loadSessionMessages: async (sessionId) => {
        if (get().isLoading || !sessionId) return;

        set({ isLoading: true, error: null });
        try {
          const response = await fetch(
            `${config.API.BASE_URL}/api/history/session/${sessionId}`
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
            isLoading: false
          });
        } catch (error) {
          console.error('Erreur chargement messages:', error);
          set({ error: error.message, isLoading: false });
        }
      },

      addMessage: (message) => set(state => ({
        messages: [...state.messages, {
          id: Date.now(),
          timestamp: new Date().toISOString(),
          ...message
        }]
      })),

      sendMessage: async (content, sessionId) => {
        if (!content.trim() || !sessionId || get().isLoading) return null;

        set({ isLoading: true, error: null });
        
        try {
          // Ajout immédiat du message utilisateur
          get().addMessage({
            content,
            type: 'user'
          });

          const response = await fetch(`${config.API.BASE_URL}/api/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              user_id: config.CHAT.DEFAULT_USER_ID,
              query: content,
              session_id: sessionId,
              language: config.CHAT.DEFAULT_LANGUAGE
            })
          });

          if (!response.ok) throw new Error('Erreur envoi message');

          const responseData = await response.json();

          get().addMessage({
            content: responseData.response,
            type: 'assistant',
            documents: responseData.documents_used || [],
            fragments: responseData.fragments || [],
            confidence: responseData.confidence_score
          });

          set({ isLoading: false });
          return responseData;
        } catch (error) {
          console.error('Erreur envoi message:', error);
          set({ error: error.message, isLoading: false });
          throw error;
        }
      }
    }),
    {
      name: 'chat-messages',
      partialize: (state) => ({ messages: state.messages })
    }
  )
);

export default useMessageStore;
