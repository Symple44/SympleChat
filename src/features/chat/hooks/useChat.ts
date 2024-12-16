// src/features/chat/hooks/useChat.ts

import { useCallback, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useChatStore } from '../store/chatStore';
import { useWebSocket } from '../../../shared/hooks/useWebSocket';
import type { SendMessageOptions } from '../types/chat';
import type { WebSocketEventType } from '../../../core/socket/types';

export function useChat() {
  const navigate = useNavigate();
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
    loadSessionMessages,
    setError
  } = useChatStore();

  const { isConnected, send: sendSocketMessage } = useWebSocket();

  const sendMessage = useCallback(async (
    content: string, 
    options?: SendMessageOptions
  ) => {
    if (!userId) {
      throw new Error('User ID is required');
    }

    try {
      const result = await storeSendMessage(content, {
        ...options,
        sessionId: routeSessionId
      });

      // Notifier via WebSocket si connecté
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

export default useChat;
