// src/providers/ChatProvider.tsx

// src/providers/ChatProvider.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import { socketManager } from '../core/socket/socket';
import type { Message, ChatContextValue } from '../features/chat/types/chat';

const ChatContext = createContext<ChatContextValue | null>(null);

interface ChatProviderProps {
  children: React.ReactNode;
}

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};

export const ChatProvider: React.FC<ChatProviderProps> = ({ children }) => {
  const navigate = useNavigate();
  const { userId, sessionId: routeSessionId } = useParams<{ 
    userId?: string; 
    sessionId?: string; 
  }>();
  const [error, setError] = useState<string | null>(null);

  const {
    messages,
    isLoading,
    currentSessionId,
    sendMessage: storeSendMessage,
    loadSessionMessages,
    clearMessages
  } = useStore();

  useEffect(() => {
    if (routeSessionId && routeSessionId !== currentSessionId && !isLoading) {
      loadSessionMessages(routeSessionId).catch(error => {
        console.error('Erreur chargement session:', error);
        setError('Session invalide ou expirée');
        if (userId) {
          navigate(`/${userId}`);
        }
      });
    }
  }, [routeSessionId, currentSessionId, userId, isLoading, navigate, loadSessionMessages]);

  const handleSendMessage = async (content: string) => {
    if (!userId || !routeSessionId) {
      throw new Error('Session invalide');
    }

    try {
      const message = await storeSendMessage(content, {
        metadata: {
          timestamp: new Date().toISOString()
        }
      });

      if (socketManager.isConnected) {
        socketManager.send({
          type: 'message',
          payload: {
            content,
            sessionId: routeSessionId,
            timestamp: new Date().toISOString()
          }
        });
      }

      return message;
    } catch (error) {
      console.error('Erreur envoi message:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erreur lors de l\'envoi du message';
      setError(errorMessage);
      throw error;
    }
  };

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const value: ChatContextValue = {
    messages,
    isLoading,
    error,
    currentSessionId,
    sendMessage: handleSendMessage,
    clearMessages,
    setError
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
      {error && (
        <div className="fixed bottom-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}
    </ChatContext.Provider>
  );
};

export default ChatProvider;
