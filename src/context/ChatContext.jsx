// src/context/ChatContext.jsx
import { createContext, useContext } from 'react';
import { 
  createBrowserRouter, 
  RouterProvider,
  createRoutesFromElements,
  Route
} from 'react-router-dom';
import useSessionNavigation from '../hooks/useSessionNavigation';
import useWebSocket from '../hooks/useWebSocket';
import useMessages from '../hooks/useMessages';
import App from '../App';

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

// Création du routeur avec les future flags
const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="*" element={<App />} />
  ),
  {
    future: {
      v7_startTransition: true,
      v7_relativeSplatPath: true
    }
  }
);

export const ChatProviderWithRouter = ({ children }) => (
  <RouterProvider router={router}>
    <ChatProvider>{children}</ChatProvider>
  </RouterProvider>
);

export default ChatContext;
