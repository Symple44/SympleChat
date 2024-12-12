// src/hooks/useMessages.js
import { useCallback, useEffect } from 'react';
import useMessageStore from '../services/messages/messageStore';

export const useMessages = () => {
  const store = useMessageStore();
  
  const loadSessions = useCallback(async () => {
    try {
      await store.loadSessions();
    } catch (error) {
      console.error('Erreur lors du chargement des sessions:', error);
    }
  }, [store.loadSessions]);

  const sendMessage = useCallback(async (content) => {
    if (!content.trim() || store.isLoading) return;
    await store.sendMessage(content);
  }, [store.isLoading, store.sendMessage]);

  const changeSession = useCallback(async (sessionId) => {
    if (sessionId === store.currentSessionId) return;
    store.clearMessages();
    await store.loadSessionMessages(sessionId);
  }, [store.currentSessionId, store.clearMessages, store.loadSessionMessages]);

  // Chargement initial des sessions
  useEffect(() => {
    console.log('Initialisation des sessions...');
    loadSessions();
  }, []);

  return {
    messages: store.messages,
    sessions: store.sessions,
    isLoading: store.isLoading,
    error: store.error,
    sessionId: store.currentSessionId,
    sendMessage,
    changeSession,
    loadSessions,
    createNewSession: store.createNewSession
  };
};

export default useMessages;
