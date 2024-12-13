// src/context/ChatContext.jsx
import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import useMessageStore from '../services/messages/messageStore';
import { useWebSocket } from '../hooks/useWebSocket';
import { config } from '../config';

const ChatContext = createContext(null);

export const useChatContext = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChatContext must be used within a ChatProvider');
  }
  return context;
};

export function ChatProvider({ children }) {
  const navigate = useNavigate();
  const { sessionId: routeSessionId } = useParams();
  const [error, setError] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isCreatingInitialSession, setIsCreatingInitialSession] = useState(false);
  const initializationRef = useRef(false);

  const { connected, sendSocketMessage } = useWebSocket();

  const store = useMessageStore();
  const {
    messages,
    sessions,
    isLoading,
    currentSessionId,
    loadSessions,
    createNewSession: storeCreateNewSession,
    loadSessionMessages,
    sendMessage: storeSendMessage
  } = store;

  // Création de session sans navigation automatique
  const createNewSession = useCallback(async () => {
    if (isCreatingInitialSession) return null;

    try {
      setIsCreatingInitialSession(true);
      const newSessionId = await storeCreateNewSession();
      
      if (newSessionId) {
        console.log('Nouvelle session créée:', newSessionId);
        return newSessionId;
      }
      
      return null;
    } catch (error) {
      console.error('Erreur création session:', error);
      setError('Erreur lors de la création de la session');
      return null;
    } finally {
      setIsCreatingInitialSession(false);
    }
  }, [storeCreateNewSession]);

  // Changement de session
  const changeSession = useCallback(async (sessionId) => {
    try {
      if (!sessionId || isLoading) return;
      
      console.log('Changement vers session:', sessionId);
      await loadSessionMessages(sessionId);
    } catch (error) {
      console.error('Erreur changement session:', error);
      setError('Erreur lors du changement de session');
    }
  }, [loadSessionMessages, isLoading]);

  // Gestion des messages
  const sendMessage = useCallback(async (content) => {
    if (!content.trim() || isLoading) return;
    
    try {
      const result = await storeSendMessage(content);
      return result;
    } catch (error) {
      console.error('Erreur envoi message:', error);
      setError('Erreur lors de l\'envoi du message');
    }
  }, [storeSendMessage, isLoading]);

  // Initialisation unique au démarrage
  useEffect(() => {
    const initialize = async () => {
      // Éviter les réinitialisations multiples
      if (initializationRef.current || isInitialized) return;
      
      try {
        initializationRef.current = true;
        console.log('Initialisation du chat...');
        
        await loadSessions();
        
        // Vérification et création de session initiale si nécessaire
        if (!currentSessionId && (!sessions || sessions.length === 0)) {
          const newSessionId = await createNewSession();
          
          if (newSessionId) {
            navigate(`/session/${newSessionId}`, { replace: true });
          }
        }
        
        setIsInitialized(true);
      } catch (error) {
        console.error('Erreur initialisation:', error);
        setError('Erreur lors de l\'initialisation');
      } finally {
        initializationRef.current = false;
      }
    };

    initialize();
  }, [
    isInitialized, 
    loadSessions, 
    currentSessionId, 
    sessions, 
    createNewSession, 
    navigate
  ]);

  // Gestion de la route
  useEffect(() => {
    const syncWithRoute = async () => {
      // Conditions pour éviter les appels superflus
      if (!isInitialized || 
          !routeSessionId || 
          isLoading || 
          isCreatingInitialSession) return;

      if (routeSessionId && routeSessionId !== currentSessionId) {
        await changeSession(routeSessionId);
      }
    };

    syncWithRoute();
  }, [
    isInitialized, 
    routeSessionId, 
    currentSessionId, 
    changeSession, 
    isLoading,
    isCreatingInitialSession
  ]);

  // Nettoyage des erreurs
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const contextValue = {
    messages,
    sessions,
    isLoading,
    error,
    connected,
    currentSessionId,
    sendMessage,
    createNewSession,
    changeSession,
    loadSessions,
    setError,
    sendSocketMessage,
    isInitialized,
    userId: config.CHAT.DEFAULT_USER_ID
  };

  return (
    <ChatContext.Provider value={contextValue}>
      {children}
      {error && (
        <div className="fixed bottom-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}
    </ChatContext.Provider>
  );
}

export default ChatContext;
