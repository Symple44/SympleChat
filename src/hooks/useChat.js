// src/hooks/useChat.js
import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useWebSocket } from './useWebSocket';
import { useMessages } from './useMessages';

export default function useChat() {
  const [error, setError] = useState(null);
  const { connected, sendSocketMessage } = useWebSocket();
  const { messages, sendMessage, isLoading, sessionId, createNewSession, changeSession } = useMessages();
  const { sessionId: routeSessionId } = useParams();

  // Synchroniser avec l'ID de session de l'URL si présent
  useEffect(() => {
    const syncSession = async () => {
      if (routeSessionId && routeSessionId !== sessionId) {
        try {
          await changeSession(routeSessionId);
        } catch (err) {
          console.error('Erreur synchronisation session:', err);
          setError('Session invalide ou expirée');
        }
      }
    };

    syncSession();
  }, [routeSessionId, sessionId, changeSession]);

  const handleSendMessage = useCallback(async (content) => {
    try {
      if (!sessionId) {
        // Créer une nouvelle session si nécessaire
        await createNewSession();
      }
      await sendMessage(content);
    } catch (err) {
      setError('Erreur lors de l\'envoi du message');
    }
  }, [sessionId, createNewSession, sendMessage]);

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
    sessionId,
    sendMessage: handleSendMessage,
    sendSocketMessage,
    createNewSession,
    changeSession
  };
}
