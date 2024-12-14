// src/context/ChatContext.jsx
import React, { createContext, useContext, useState, useCallback } from 'react';
import { useSessionManager } from '../hooks/useSessionManager';
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
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const { connected, sendSocketMessage } = useWebSocket();
  const sessionManager = useSessionManager();
  
  const sendMessage = useCallback(async (content) => {
    if (!content.trim() || isLoading || !sessionManager.currentSession) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(`${config.API.BASE_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: config.CHAT.DEFAULT_USER_ID,
          query: content,
          session_id: sessionManager.currentSession.session_id,
          language: config.CHAT.DEFAULT_LANGUAGE
        })
      });

      if (!response.ok) throw new Error('Erreur envoi message');

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Erreur envoi message:', error);
      setError('Erreur lors de l\'envoi du message');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, sessionManager.currentSession]);

  const contextValue = {
    ...sessionManager,
    isLoading,
    error,
    connected,
    sendMessage,
    sendSocketMessage,
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
