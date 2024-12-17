// src/features/chat/hooks/useMessages.ts

import { useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useChatStore } from '../store/chatStore';
import { apiClient } from '../../../core/api/client';
import { API_ENDPOINTS } from '../../../core/api/endpoints';
import type { Message } from '../types/chat';

interface UseMessagesReturn {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  sendMessage: (content: string) => Promise<void>;
  loadMoreMessages: () => Promise<void>;
  clearMessages: () => void;
  setError: (error: string | null) => void;
}

export function useMessages(): UseMessagesReturn {
  const { userId, sessionId } = useParams<{ userId: string; sessionId: string }>();
  const store = useChatStore();

  const loadMoreMessages = useCallback(async () => {
    if (!sessionId || !userId || store.isLoading) return;

    try {
      const lastMessageId = store.messages[0]?.id;
      const response = await apiClient.get<Message[]>(
        API_ENDPOINTS.SESSION.HISTORY(sessionId),
        {
          params: {
            userId,
            before: lastMessageId,
            limit: '20'
          }
        }
      );

      if (response.length > 0) {
        store.setMessages([...response, ...store.messages]);
      }
    } catch (error) {
      console.error('Error loading more messages:', error);
      store.setError('Erreur lors du chargement des messages');
    }
  }, [sessionId, userId, store]);

  return {
    messages: store.messages,
    isLoading: store.isLoading,
    error: store.error,
    sendMessage: async (content: string) => {
      if (!sessionId) throw new Error('Session ID required');
      await store.sendMessage(content, { sessionId });
    },
    loadMoreMessages,
    clearMessages: store.clearMessages,
    setError: store.setError
  };
}

export default useMessages;
