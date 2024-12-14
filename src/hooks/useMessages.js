// src/hooks/useMessages.js
import { useCallback, useEffect } from 'react';
import useMessageStore from '../services/messages/messageStore';
import { useSessionManager } from './useSessionManager';

export const useMessages = () => {
  const messageStore = useMessageStore();
  const { 
    currentSession,
    sessions,
    isLoading: sessionsLoading,
    loadSessions,
    createNewSession,
    changeSession 
  } = useSessionManager();

  const sendMessage = useCallback(async (content) => {
    if (!content.trim() || messageStore.isLoading) return;
    
    try {
      if (!currentSession) {
        await createNewSession();
      }
      
      await messageStore.sendMessage(content, currentSession?.session_id);
    } catch (error) {
      console.error('Erreur envoi message:', error);
      throw error;
    }
  }, [currentSession, createNewSession, messageStore.isLoading]);

  // Chargement des messages quand la session change
  useEffect(() => {
    if (currentSession?.session_id) {
      messageStore.loadSessionMessages(currentSession.session_id);
    } else {
      messageStore.clearMessages();
    }
  }, [currentSession?.session_id]);

  // Chargement initial des sessions
  useEffect(() => {
    loadSessions();
  }, []);

  return {
    // État des messages
    messages: messageStore.messages,
    isLoading: messageStore.isLoading || sessionsLoading,
    error: messageStore.error,
    
    // État des sessions
    sessions,
    sessionId: currentSession?.session_id,

    // Actions
    sendMessage,
    createNewSession,
    changeSession,
    clearMessages: messageStore.clearMessages,
    loadSessions
  };
};

export default useMessages;
