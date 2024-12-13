// src/context/ChatContext.jsx
import { createContext, useContext } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import ChatContainer from '../components/chat/ChatContainer';
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

const ChatProvider = ({ children }) => {
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

const AppWithProviders = () => {
  return (
    <ChatProvider>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
        <ChatContainer />
      </div>
    </ChatProvider>
  );
};

const router = createBrowserRouter([
  {
    path: '/',
    element: <AppWithProviders />,
    children: [
      {
        path: 'session/:sessionId',
        element: <AppWithProviders />
      }
    ]
  }
], {
  future: {
    v7_startTransition: true,
    v7_normalizeFormMethod: true,
    v7_partialHydration: true,
    v7_fetcherPersist: true,
    v7_relativeSplatPath: true,
    v7_prependBasename: true,
    v7_skipActionErrorRevalidation: true
  }
});

export const ChatProviderWithRouter = () => (
  <RouterProvider router={router} />
);

export { ChatProvider };
export default ChatContext;
