// src/providers/ChatProvider.tsx

import React, { createContext, useContext, useCallback, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useStore } from '../store';
import { useSocket } from './SocketProvider';
import type { ChatContextValue } from '../features/chat/types/chat';
import type { Session } from '../core/session/types';

interface ExtendedChatContextValue extends ChatContextValue {
  handleSessionSelect: (session: Session) => Promise<void>;
  handleNewSession: () => Promise<void>;
}

const ChatContext = createContext<ExtendedChatContextValue | null>(null);

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const { userId } = useParams<{ userId?: string }>();
  const [isProcessing, setIsProcessing] = useState(false);
  const { send } = useSocket();

  const {
    chat: { messages, isLoading, error },
    session: { currentSessionId },
    sendMessage: storeSendMessage,
    setCurrentSession: storeSetCurrentSession,
    setSessions: storeSetsessions
  } = useStore();

  const handleSessionSelect = useCallback(async (session: Session) => {
    if (isProcessing) return;
    
    try {
      setIsProcessing(true);
      console.log('Sélection session:', session.id);
      
      await storeSetCurrentSession(session);
      
      if (userId) {
        navigate(`/${userId}/session/${session.id}`);
      }
    } catch (error) {
      console.error('Erreur sélection session:', error);
      throw error;
    } finally {
      setIsProcessing(false);
    }
  }, [userId, navigate, storeSetCurrentSession, isProcessing]);

  const handleNewSession = useCallback(async () => {
    if (isProcessing || !userId) return;

    try {
      setIsProcessing(true);
      console.log('Création nouvelle session...');

      const response = await fetch('/api/sessions/new', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId })
      });

      if (!response.ok) {
        throw new Error('Erreur création session');
      }

      const { session_id } = await response.json();

      const newSession: Session = {
        id: session_id,
        userId,
        status: 'active',
        metadata: {
          title: "Nouvelle conversation",
          messageCount: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          language: 'fr'
        }
      };

      console.log('Nouvelle session créée:', newSession);

      storeSetsessions((prev: Session[]) => [newSession, ...prev]);
      await storeSetCurrentSession(newSession);
      navigate(`/${userId}/session/${newSession.id}`);
    } catch (error) {
      console.error('Erreur création session:', error);
      throw error;
    } finally {
      setIsProcessing(false);
    }
  }, [userId, navigate, storeSetsessions, storeSetCurrentSession, isProcessing]);

  const sendMessage = useCallback(async (content: string) => {
    if (!userId || !currentSessionId) return;

    try {
      await storeSendMessage(content, currentSessionId);
      
      send('message', {
        content,
        userId,
        sessionId: currentSessionId,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Erreur envoi message:', error);
      throw error;
    }
  }, [userId, currentSessionId, storeSendMessage, send]);

  const value: ExtendedChatContextValue = {
    messages,
    isLoading: isLoading || isProcessing,
    error,
    currentSessionId,
    sendMessage,
    handleSessionSelect,
    handleNewSession
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
};

export default ChatProvider;
