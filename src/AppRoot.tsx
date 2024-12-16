// src/AppRoot.tsx

import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useStore } from './store';
import App from './App';
import SessionList from './features/sessions/components/SessionList';
import ChatContainer from './features/chat/components/ChatContainer';
import ErrorBoundary from './shared/components/ErrorBoundary';
import { ThemeProvider } from './providers/ThemeProvider';
import { ChatProvider } from './providers/ChatProvider';
import { SocketProvider } from './providers/SocketProvider';
import { apiClient } from './core/api/client';
import { APP_CONFIG } from './config/app.config';

const AppContent: React.FC = () => {
  const setError = useStore(state => state.setError);

  // Vérification initiale de la santé de l'API
  useEffect(() => {
    const checkApiHealth = async () => {
      try {
        await apiClient.get('/health');
      } catch (error) {
        setError('Impossible de se connecter au serveur');
      }
    };

    void checkApiHealth();
  }, [setError]);

  return (
    <Routes>
      <Route path="/" element={<Navigate to={`/${APP_CONFIG.CHAT.DEFAULT_USER_ID}`} replace />} />
      
      <Route path="/:userId" element={<App />}>
        <Route index element={<SessionList />} />
        <Route path="session/:sessionId" element={<ChatContainer />} />
      </Route>
      
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

const AppRoot: React.FC = () => {
  return (
    <React.StrictMode>
      <ErrorBoundary>
        <BrowserRouter>
          <ThemeProvider>
            <SocketProvider>
              <ChatProvider>
                <AppContent />
              </ChatProvider>
            </SocketProvider>
          </ThemeProvider>
        </BrowserRouter>
      </ErrorBoundary>
    </React.StrictMode>
  );
};

// Gestion des erreurs globales non capturées
if (process.env.NODE_ENV !== 'production') {
  window.onerror = (message, source, lineno, colno, error) => {
    console.error('Global error:', { message, source, lineno, colno, error });
  };

  window.onunhandledrejection = (event) => {
    console.error('Unhandled promise rejection:', event.reason);
  };
}

export default AppRoot;