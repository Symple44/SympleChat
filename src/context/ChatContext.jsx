// src/context/ChatContext.jsx
import { createContext, useContext } from 'react';
import useSessionNavigation from '../hooks/useSessionNavigation';
import useMessages from '../hooks/useMessages';
import useWebSocket from '../hooks/useWebSocket';
import { BrowserRouter as Router } from 'react-router-dom';

const ChatContext = createContext(null);

export const useChatContext = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChatContext must be used within a ChatProvider');
  }
  return context;
};

export const ChatProvider = ({ children }) => {
  const sessionNav = useSessionNavigation();
  const { connected } = useWebSocket();
  const { 
    messages, 
    isLoading: messagesLoading, 
    error: messagesError,
    sendMessage
  } = useMessages(sessionNav.currentSessionId);

  const contextValue = {
    // État des sessions
    sessions: sessionNav.sessions,
    currentSessionId: sessionNav.currentSessionId,
    isLoading: sessionNav.isLoading || messagesLoading,
    error: sessionNav.error || messagesError,
    
    // Actions sur les sessions
    changeSession: sessionNav.changeSession,
    createNewSession: sessionNav.createNewSession,
    
    // État et actions des messages
    messages,
    sendMessage,
    
    // État de la connexion
    connected
  };

  return (
    <ChatContext.Provider value={contextValue}>
      {children}
    </ChatContext.Provider>
  );
};

// Wrapper pour fournir le Router
export const ChatProviderWithRouter = ({ children }) => (
  <Router>
    <ChatProvider>{children}</ChatProvider>
  </Router>
);

export default ChatContext;
