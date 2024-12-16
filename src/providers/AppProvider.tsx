// src/providers/AppProvider.tsx

import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ErrorBoundary from '../shared/components/ErrorBoundary';
import { ThemeProvider } from './ThemeProvider';
import { SocketProvider } from './SocketProvider';
import { ChatProvider } from './ChatProvider';
import { routes } from '../config/routes.config';

const AppProvider: React.FC<{ children?: React.ReactNode }> = () => {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <ThemeProvider>
          <SocketProvider>
            <ChatProvider>
              <Routes>
                {routes.map((route, idx) => (
                  <Route
                    key={route.path || idx}
                    path={route.path}
                    element={route.element}
                  >
                    {route.children?.map((childRoute, childIdx) => (
                      <Route
                        key={childRoute.path || childIdx}
                        path={childRoute.path}
                        element={childRoute.element}
                      />
                    ))}
                  </Route>
                ))}
              </Routes>
            </ChatProvider>
          </SocketProvider>
        </ThemeProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
};

export default AppProvider;
