// src/features/chat/hooks/useMessages.ts

import { useCallback, useEffect } from 'react';
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
    const response = await apiClient.get<Message[]>(API_ENDPOINTS.CHAT.HISTORY, {
      params: {
        sessionId,
        userId,
        before: lastMessageId,
        limit: '20'
      }
    });

    if (response.length > 0) {
      store.setMessages([...response, ...store.messages]);
    }
  } catch (error) {
    console.error('Error loading more messages:', error);
    store.setError('Erreur lors du chargement des messages');
  }
}, [sessionId, userId, store]);

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || !sessionId || store.isLoading) {
      return;
    }

    try {
      const newMessage: Message = {
        id: crypto.randomUUID(),
        content,
        type: 'user',
        sessionId,
        timestamp: new Date().toISOString()
      };

      // Optimistic update
      store.addMessage(newMessage);

      const response = await apiClient.post<Message>(API_ENDPOINTS.CHAT.SEND, {
        content,
        sessionId,
        userId
      });

      // Add assistant response
      store.addMessage(response);
    } catch (error) {
      console.error('Error sending message:', error);
      store.setError('Erreur lors de l\'envoi du message');
      throw error;
    }
  }, [sessionId, userId, store]);

  // Charger l'historique initial
  useEffect(() => {
    if (sessionId && userId) {
      store.loadSessionMessages(sessionId).catch(error => {
        console.error('Error loading session messages:', error);
      });
    }
  }, [sessionId, userId]);

  // Nettoyer les messages lors du démontage
  useEffect(() => {
    return () => {
      if (!sessionId) {
        store.clearMessages();
      }
    };
  }, [sessionId]);

  return {
    messages: store.messages,
    isLoading: store.isLoading,
    error: store.error,
    sendMessage,
    loadMoreMessages,
    clearMessages: store.clearMessages,
    setError: store.setError
  };
}

export default useMessages;
