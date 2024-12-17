// src/providers/AppProvider.tsx

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ErrorBoundary from '@/shared/components/ErrorBoundary';
import { ThemeProvider } from './ThemeProvider';
import { SocketProvider } from './SocketProvider';
import ChatProvider from './ChatProvider';
import App from '@/App';
import SessionList from '@/features/sessions/components/SessionList';
import ChatContainer from '@/features/chat/components/ChatContainer';
import { APP_CONFIG } from '@/config/app.config';

const AppProvider: React.FC = () => {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <ThemeProvider>
          <SocketProvider>
            <ChatProvider>
              <Routes>
                <Route 
                  path="/" 
                  element={<Navigate to={`/${APP_CONFIG.CHAT.DEFAULT_USER_ID}`} replace />} 
                />
                <Route path="/:userId" element={<App />}>
                  <Route index element={<SessionList />} />
                  <Route path="session/:sessionId" element={<ChatContainer />} />
                </Route>
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </ChatProvider>
          </SocketProvider>
        </ThemeProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
};

export default AppProvider;
