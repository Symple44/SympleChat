// src/context/ChatContext.jsx
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
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
  // Navigation et params
  const navigate = useNavigate();
  const { sessionId: routeSessionId } = useParams();

  // États locaux
  const [error, setError] = useState(null);
  const [selectedDocuments, setSelectedDocuments] = useState([]);

  // Integration WebSocket
  const { connected, sendSocketMessage } = useWebSocket();

  // Store des messages
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

  // Gestion des sessions
  const createNewSession = useCallback(async () => {
    try {
      const newSessionId = await storeCreateNewSession();
      if (newSessionId) {
        navigate(`/session/${newSessionId}`);
        return newSessionId;
      }
    } catch (error) {
      console.error('Erreur création session:', error);
      setError('Erreur lors de la création de la session');
    }
  }, [storeCreateNewSession, navigate]);

  const changeSession = useCallback(async (sessionId) => {
    try {
      if (!sessionId) return;
      await loadSessionMessages(sessionId);
      navigate(`/session/${sessionId}`);
    } catch (error) {
      console.error('Erreur changement session:', error);
      setError('Erreur lors du changement de session');
    }
  }, [loadSessionMessages, navigate]);

  // Gestion des messages
  const sendMessage = useCallback(async (content) => {
    try {
      if (!content.trim() || isLoading) return;

      if (!currentSessionId) {
        await createNewSession();
      }

      const result = await storeSendMessage(content);
      return result;
    } catch (error) {
      console.error('Erreur envoi message:', error);
      setError('Erreur lors de l\'envoi du message');
    }
  }, [currentSessionId, createNewSession, storeSendMessage, isLoading]);

  // Synchronisation avec l'URL
  useEffect(() => {
    const syncWithRoute = async () => {
      if (routeSessionId && routeSessionId !== currentSessionId) {
        await changeSession(routeSessionId);
      }
    };

    syncWithRoute();
  }, [routeSessionId, currentSessionId, changeSession]);

  // Chargement initial des sessions
  useEffect(() => {
    const initializeChat = async () => {
      try {
        await loadSessions();
        
        // Si pas de session active et pas de sessions existantes, en créer une
        if (!currentSessionId && (!sessions || sessions.length === 0)) {
          await createNewSession();
        }
      } catch (error) {
        console.error('Erreur initialisation chat:', error);
        setError('Erreur lors de l\'initialisation du chat');
      }
    };

    initializeChat();
  }, []);

  // Effacer les erreurs après un délai
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // Valeur du contexte
  const contextValue = {
    // État
    messages,
    sessions,
    isLoading,
    error,
    connected,
    currentSessionId,
    selectedDocuments,

    // Actions
    sendMessage,
    createNewSession,
    changeSession,
    loadSessions,
    setError,
    setSelectedDocuments,
    sendSocketMessage,

    // Métadonnées
    userId: config.CHAT.DEFAULT_USER_ID,
    language: config.CHAT.DEFAULT_LANGUAGE,

    // État détaillé pour le débogage
    state: {
      hasActiveSessions: sessions && sessions.length > 0,
      messageCount: messages.length,
      sessionCount: sessions?.length || 0,
      wsConnected: connected
    }
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
