// src/features/chat/store/chatStore.ts

import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { apiClient } from '../../../core/api/client';
import { API_ENDPOINTS } from '../../../core/api/endpoints';
import type { ChatState, Message, SendMessageOptions } from '../types/chat';

interface ChatStore extends ChatState {
  sendMessage: (content: string, options?: SendMessageOptions) => Promise<void>;
  setMessages: (messages: Message[]) => void;
  addMessage: (message: Message) => void;
  clearMessages: () => void;
  setError: (error: string | null) => void;
  setLoading: (isLoading: boolean) => void;
  setSessionId: (sessionId: string | null) => void;
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
    (set, get) => ({
      ...initialState,

      sendMessage: async (content: string, options?: SendMessageOptions) => {
        const currentSessionId = get().currentSessionId;
        const sessionId = options?.sessionId || currentSessionId;

        if (!sessionId) {
          throw new Error('No active session');
        }

        set({ isLoading: true, error: null });

        try {
          const newMessage: Message = {
            id: crypto.randomUUID(),
            content,
            type: 'user',
            timestamp: new Date().toISOString(),
            sessionId
          };

          // Optimistic update
          set(state => ({
            messages: [...state.messages, newMessage]
          }));

          // Send to server
          const apiResponse = await apiClient.post<Message>(API_ENDPOINTS.CHAT.SEND, {
            content,
            sessionId,
            metadata: options?.metadata
          });

          // Update with server response
          set(state => ({
            messages: [
              ...state.messages.filter(m => m.id !== newMessage.id),
              apiResponse
            ],
            isLoading: false
          }));

        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to send message';
          set({ error: errorMessage, isLoading: false });
          throw error;
        }
      },

      setMessages: (messages) => 
        set({ messages, error: null }),
      
      addMessage: (message) => 
        set(state => ({ 
          messages: [...state.messages, message],
          error: null
        })),
      
      clearMessages: () => 
        set({ messages: [], error: null }),
      
      setError: (error) => 
        set({ error }),
      
      setLoading: (isLoading) => 
        set({ isLoading }),
      
      setSessionId: (sessionId) => 
        set({ currentSessionId: sessionId }),

      loadSessionMessages: async (sessionId: string) => {
        set({ isLoading: true, error: null });

        try {
          const messages = await apiClient.get<Message[]>(
            API_ENDPOINTS.SESSION.HISTORY(sessionId)
          );

          set({ 
            messages: messages || [],
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
