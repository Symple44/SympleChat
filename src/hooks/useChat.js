// src/hooks/useChat.js
import { useState, useEffect, useCallback } from 'react';
import { useWebSocket } from './useWebSocket';
import { useMessages } from './useMessages';

// Changez l'export pour être par défaut
export default function useChat() {
  const [error, setError] = useState(null);
  const { connected, sendSocketMessage } = useWebSocket();
  const { messages, sendMessage, isLoading } = useMessages();

  const handleSendMessage = useCallback(
    async (content) => {
      try {
        await sendMessage(content);
      } catch (err) {
        setError('Erreur lors de l\'envoi du message');
      }
    },
    [sendMessage]
  );

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  return {
    messages,
    isLoading,
    error,
    connected,
    sendMessage: handleSendMessage,
    sendSocketMessage,
  };
}
