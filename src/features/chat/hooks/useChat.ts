// src/features/chat/hooks/useChat.ts

import { useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useChatStore } from '../store/chatStore';
import { useWebSocket } from '../../../shared/hooks/useWebSocket';
import type { SendMessageOptions } from '../types/chat';

export function useChat() {
  const { userId, sessionId: routeSessionId } = useParams<{ 
    userId: string; 
    sessionId: string; 
  }>();

  const {
    messages,
    isLoading,
    error,
    currentSessionId,
    sendMessage: storeSendMessage,
  } = useChatStore();

  const { isConnected, send: sendSocketMessage } = useWebSocket();

  const sendMessage = useCallback(async (
    content: string, 
    options?: SendMessageOptions
  ) => {
    if (!userId || !routeSessionId) {
      throw new Error('User ID and Session ID are required');
    }

    try {
      const result = await storeSendMessage(content, {
        ...options,
        sessionId: routeSessionId
      });

      if (isConnected) {
        sendSocketMessage('message', {
          content,
          userId,
          sessionId: routeSessionId,
          timestamp: new Date().toISOString()
        });
      }

      return result;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }, [userId, routeSessionId, isConnected, storeSendMessage, sendSocketMessage]);

  return {
    messages,
    isLoading,
    error,
    isConnected,
    sessionId: currentSessionId,
    sendMessage
  };
}
