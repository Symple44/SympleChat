// src/services/messages/messageStore.js
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { apiClient } from '../api/client';

const useMessageStore = create(
  persist(
    (set, get) => ({
      messages: [],
      isLoading: false,
      error: null,
      currentSessionId: null,

      // Actions
      setMessages: (messages) => set({ messages }),
      
      addMessage: (message) => set((state) => ({
        messages: [...state.messages, formatMessage(message)]
      })),

      clearMessages: () => set({ messages: [] }),

      setError: (error) => set({ error }),

      setLoading: (isLoading) => set({ isLoading }),

      setCurrentSession: (sessionId) => set({ currentSessionId: sessionId }),

      // Async actions
      sendMessage: async (content) => {
        const { currentSessionId } = get();
        set({ isLoading: true, error: null });

        try {
          // Ajouter immédiatement le message utilisateur
          const userMessage = {
            id: Date.now(),
            content,
            type: 'user',
            timestamp: new Date().toISOString()
          };
          get().addMessage(userMessage);

          // Envoyer à l'API
          const response = await apiClient.sendMessage(content, currentSessionId);
          
          // Ajouter la réponse
          const assistantMessage = {
            id: Date.now() + 1,
            content: response.response,
            type: 'assistant',
            documents: response.documents_used,
            fragments: response.fragments,
            confidence: response.confidence_score,
            timestamp: new Date().toISOString()
          };
          get().addMessage(assistantMessage);

          return response;
        } catch (error) {
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
          set({ error: error.message });
          throw error;
        } finally {
          set({ isLoading: false });
        }
      }
    }),
    {
      name: 'chat-messages',
      partialize: (state) => ({ 
        messages: state.messages,
        currentSessionId: state.currentSessionId 
      })
    }
  )
);

// Utilitaire de formatage des messages
const formatMessage = (message) => ({
  id: message.id || Date.now(),
  content: message.query || message.response || message.content,
  type: message.query ? 'user' : 'assistant',
  timestamp: new Date(message.timestamp).toISOString(),
  documents: message.documents_used || [],
  fragments: message.fragments || [],
  confidence: message.confidence_score
});

export default useMessageStore;