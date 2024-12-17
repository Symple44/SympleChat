// src/features/chat/store/chatStore.ts

import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { apiClient } from '../../../core/api/client';
import { API_ENDPOINTS } from '../../../core/api/endpoints';
import type { ChatState, Message, SendMessageOptions } from '../types/chat';

interface ChatStore extends ChatState {
  // Actions
  sendMessage: (content: string, options?: SendMessageOptions) => Promise<Message>;
  setMessages: (messages: Message[]) => void;
  addMessage: (message: Message) => void;
  clearMessages: () => void;
  setError: (error: string | null) => void;
  setLoading: (isLoading: boolean) => void;
  setSessionId: (sessionId: string | null) => void;
  
  // Session actions
  loadSessionMessages: (sessionId: string) => Promise<void>;
}

const initialState: ChatState = {
  messages: [],
  isLoading: false,
  error: null,
  currentSessionId: null
};

export const useChatStore = create<ChatStore>()(
  persist(
    (set) => ({
      ...initialState,

      sendMessage: async (content: string, options?: SendMessageOptions) => {
        const { currentSessionId } = useChatStore.getState();
        const sessionId = options?.sessionId || currentSessionId;

        if (!sessionId) {
          throw new Error('No active session');
        }

        set({ isLoading: true, error: null });

        try {
          // Optimistic update
          const tempMessage: Message = {
            id: crypto.randomUUID(),
            content,
            type: 'user',
            timestamp: new Date().toISOString(),
            sessionId
          };

          set(state => ({
            messages: [...state.messages, tempMessage]
          }));

          // Envoyer la requête
          const response = await apiClient.post<Message>(API_ENDPOINTS.CHAT.SEND, {
            content,
            sessionId,
            metadata: options?.metadata
          });

          // Mettre à jour avec la réponse du serveur
          set(state => ({
            messages: [
              ...state.messages.filter(m => m.id !== tempMessage.id),
              response
            ],
            isLoading: false
          }));

          return response;
          
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to send message';
          set({ error: errorMessage, isLoading: false });
          throw error;
        }
      },

      setMessages: (messages: Message[]) => 
        set({ messages, error: null }),
      
      addMessage: (message: Message) => 
        set(state => ({ 
          messages: [...state.messages, message],
          error: null
        })),
      
      clearMessages: () => set({ messages: [], error: null }),
      
      setError: (error: string | null) => set({ error }),
      
      setLoading: (isLoading: boolean) => set({ isLoading }),
      
      setSessionId: (sessionId: string | null) => set({ currentSessionId: sessionId }),

      loadSessionMessages: async (sessionId: string) => {
        set({ isLoading: true, error: null });

        try {
          const response = await apiClient.get<Message[]>(
            API_ENDPOINTS.SESSION.HISTORY(sessionId)
          );

          set({ 
            messages: response || [],
            currentSessionId: sessionId,
            isLoading: false
          });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to load messages';
          set({ 
            error: errorMessage, 
            isLoading: false,
            messages: []
          });
          throw error;
        }
      }
    }),
    {
      name: 'chat-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        messages: state.messages,
        currentSessionId: state.currentSessionId
      })
    }
  )
);

export default useChatStore;
