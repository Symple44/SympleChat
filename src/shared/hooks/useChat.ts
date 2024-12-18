// src/shared/hooks/useChat.ts

import { useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useStore } from '@/store/store';
import { useWebSocket } from './useWebSocket';
import type { Message } from '../types';

interface UseChatReturn {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  sendMessage: (content: string) => Promise<void>;
  clearMessages: () => void;
}

export function useChat(): UseChatReturn {
  const { sessionId } = useParams<{ sessionId: string }>();
  const { 
    messages: allMessages,
    loading,
    error,
    sendMessage: storeSendMessage,
    clearMessages
  } = useStore(state => ({
    messages: state.messages.bySession[sessionId ?? ''] || [],
    loading: state.messages.loading,
    error: state.messages.error,
    sendMessage: state.sendMessage,
    clearMessages: () => state.messages.bySession[sessionId ?? ''] = []
  }));

  const { send: sendSocketMessage } = useWebSocket();

  const sendMessage = useCallback(async (content: string) => {
    if (!sessionId) throw new Error('Session ID required');
    
    try {
      await storeSendMessage(content, sessionId);
      sendSocketMessage('message', {
        type: 'message',
        sessionId,
        content
      });
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }, [sessionId, storeSendMessage, sendSocketMessage]);

  return {
    messages: allMessages,
    isLoading: loading,
    error,
    sendMessage,
    clearMessages
  };
}

export default useChat;
