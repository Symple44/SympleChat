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
  }, []);

  const sendMessage = useCallback(async (content) => {
    if (!content.trim() || store.isLoading) return;
    
    try {
      await store.sendMessage(content);
    } catch (error) {
      console.error('Erreur envoi message:', error);
      throw error;
    }
  }, [store.isLoading, store.sendMessage]);

  const changeSession = useCallback(async (sessionId) => {
    if (sessionId === store.currentSessionId) return;
    try {
      store.clearMessages();
      await store.loadSessionMessages(sessionId);
    } catch (error) {
      console.error('Erreur changement session:', error);
      throw error;
    }
  }, [store.currentSessionId]);

  const createNewSession = useCallback(async () => {
    try {
      const newSessionId = await store.createNewSession();
      return newSessionId;
    } catch (error) {
      console.error('Erreur création session:', error);
      throw error;
    }
  }, []);

  const clearSessionHistory = useCallback(async () => {
    try {
      store.clearMessages();
    } catch (error) {
      console.error('Erreur nettoyage historique:', error);
    }
  }, []);

  // Chargement initial des sessions
  useEffect(() => {
    const initializeChat = async () => {
      try {
        console.log('Initialisation du chat...');
        await loadSessions();
        
        // Si pas de session active et pas de sessions existantes, en créer une
        if (!store.currentSessionId && (!store.sessions || store.sessions.length === 0)) {
          console.log('Création d\'une nouvelle session...');
          await createNewSession();
        }
      } catch (error) {
        console.error('Erreur initialisation:', error);
      }
    };

    initializeChat();
  }, []);

  // Recharger les sessions quand le sessionId change
  useEffect(() => {
    if (store.currentSessionId) {
      loadSessions();
    }
  }, [store.currentSessionId]);

  return {
    // État des messages et sessions
    messages: store.messages,
    sessions: store.sessions,
    isLoading: store.isLoading,
    error: store.error,
    sessionId: store.currentSessionId,

    // Actions sur les messages
    sendMessage,
    clearSessionHistory,

    // Actions sur les sessions
    changeSession,
    createNewSession,
    loadSessions,

    // État détaillé pour le débogage
    state: {
      hasActiveSessions: store.sessions && store.sessions.length > 0,
      activeSessionId: store.currentSessionId,
      messageCount: store.messages.length,
      sessionCount: store.sessions?.length || 0
    }
  };
};

export default useMessages;
