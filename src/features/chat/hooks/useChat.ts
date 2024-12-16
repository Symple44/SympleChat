// src/features/chat/hooks/useChat.ts

import { useCallback, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useChatStore } from '../store/chatStore';
import { useWebSocket } from '../../../core/socket/socket';
import type { SendMessageOptions } from '../types/chat';

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

  const { connected, send: sendSocketMessage } = useWebSocket();

  // Synchroniser avec l'ID de session de l'URL
  useEffect(() => {
    if (routeSessionId && routeSessionId !== currentSessionId) {
      loadSessionMessages(routeSessionId).catch(error => {
        console.error('Failed to load session:', error);
        setError('Session non valide ou expirée');
        navigate(`/${userId}`);
      });
    }
  }, [routeSessionId, currentSessionId, userId, navigate, loadSessionMessages]);

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
      if (connected) {
        sendSocketMessage({
          type: 'message',
          payload: {
            content,
            userId,
            sessionId: routeSessionId,
            timestamp: new Date().toISOString()
          }
        });
      }

      return result;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }, [userId, routeSessionId, connected, storeSendMessage, sendSocketMessage]);

  // Nettoyage des erreurs
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError(null);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [error, setError]);

  return {
    messages,
    isLoading,
    error,
    connected,
    sessionId: currentSessionId,
    sendMessage,
    sendSocketMessage
  };
}

export default useChat;
