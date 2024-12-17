// src/providers/ChatProvider.tsx

import React, { createContext, useContext, useCallback, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useStore } from '@/store';
import { useSocket } from './SocketProvider';
import type { ChatContextValue } from '@/features/chat/types/chat';
import type { Session } from '@/core/session/types';
import { apiClient } from '@/core/api/client';
import { API_ENDPOINTS } from '@/core/api/endpoints';

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

const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const { userId } = useParams<{ userId?: string }>();
  const [isProcessing, setIsProcessing] = useState(false);
  const { send } = useSocket();

  const {
    messages,
    isLoading,
    error,
    currentSessionId,
    sendMessage: storeSendMessage,
    setCurrentSession: storeSetCurrentSession,
    setSessions: storeSetsessions
  } = useStore((state) => ({
    messages: state.chat.messages,
    isLoading: state.chat.isLoading,
    error: state.chat.error,
    currentSessionId: state.session.currentSessionId,
    sendMessage: state.sendMessage,
    setCurrentSession: state.setCurrentSession,
    setSessions: state.setSessions
  }));

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

      const response = await apiClient.post<{ session_id: string }>(
        API_ENDPOINTS.SESSION.CREATE,
        { userId }
      );

      const newSession: Session = {
        id: response.session_id,
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

      storeSetsessions((prevSessions: Session[]) => [newSession, ...prevSessions]);
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

  const value = {
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
