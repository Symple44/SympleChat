// src/context/ChatContext.jsx
import React, { useEffect } from 'react';
import { createContext, useContext } from 'react';
import { RouterProvider, useNavigate, useLocation, Navigate } from 'react-router-dom';
import ChatContainer from '../components/chat/ChatContainer';
import createAppRouter from '../config/router';
import useSessionNavigation from '../hooks/useSessionNavigation';
import useWebSocket from '../hooks/useWebSocket';
import useMessages from '../hooks/useMessages';

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
    sessions: sessionNav.sessions,
    currentSessionId: sessionNav.currentSessionId,
    isLoading: sessionNav.isLoading || messagesLoading,
    error: sessionNav.error || messagesError,
    changeSession: sessionNav.changeSession,
    createNewSession: sessionNav.createNewSession,
    messages,
    sendMessage,
    connected
  };

  return (
    <ChatContext.Provider value={contextValue}>
      {children}
    </ChatContext.Provider>
  );
};

const AppWrapper = () => {
  const { currentSessionId, sessions, createNewSession } = useChatContext();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const init = async () => {
      if (location.pathname === '/') {
        if (currentSessionId) {
          navigate(`/session/${currentSessionId}`);
        } else if (sessions.length > 0) {
          navigate(`/session/${sessions[0].session_id}`);
        } else {
          const newSessionId = await createNewSession();
          navigate(`/session/${newSessionId}`);
        }
      }
    };

    init();
  }, [location.pathname, currentSessionId, sessions, createNewSession, navigate]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      <ChatContainer />
    </div>
  );
};

const RedirectRoot = () => {
  return <Navigate to="/" replace />;
};

const router = createAppRouter(<AppWrapper />, <RedirectRoot />);

export const ChatProviderWithRouter = () => (
  <RouterProvider router={router} />
);

export default ChatContext;
