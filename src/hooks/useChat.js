// src/hooks/useChat.js
import { useState, useCallback } from 'react';
import { useWebSocket } from './useWebSocket';
import { useSessionManager } from './useSessionManager';
import useMessageStore from '../services/messages/messageStore';

export default function useChat() {
  const [error, setError] = useState(null);
  const { connected, sendSocketMessage } = useWebSocket();
  const messageStore = useMessageStore();
  const { currentSession, createNewSession } = useSessionManager();

  const handleSendMessage = useCallback(async (content) => {
    try {
      if (!currentSession) {
        await createNewSession();
      }
      
      if (!currentSession?.session_id) {
        throw new Error('Pas de session active');
      }

      await messageStore.sendMessage(content, currentSession.session_id);
    } catch (err) {
      setError('Erreur lors de l\'envoi du message');
      console.error('Erreur envoi message:', err);
    }
  }, [currentSession, createNewSession]);

  return {
    messages: messageStore.messages,
    isLoading: messageStore.isLoading,
    error: error || messageStore.error,
    connected,
    sessionId: currentSession?.session_id,
    sendMessage: handleSendMessage,
    sendSocketMessage
  };
}
