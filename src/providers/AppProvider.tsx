// src/providers/AppProvider.tsx

import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import ErrorBoundary from '@/shared/components/ErrorBoundary';
import { ThemeProvider } from './ThemeProvider';
import { SocketProvider } from './SocketProvider';
import ChatProvider from './ChatProvider';
import MainRouter from '@/routes/MainRouter';

const AppProvider: React.FC = () => {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <ThemeProvider>
          <SocketProvider>
            <ChatProvider>
              <MainRouter />
            </ChatProvider>
          </SocketProvider>
        </ThemeProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
};

export default AppProvider;
