// src/config/routes.config.ts

import { Navigate } from 'react-router-dom';
import React from 'react';
import App from '../App';
import SessionList from '../features/sessions/components/SessionList';
import ChatContainer from '../features/chat/components/ChatContainer';

export const ROUTES = {
  HOME: '/',
  USER: '/:userId',
  SESSION: '/:userId/session/:sessionId',
  
  helpers: {
    getUserPath: (userId: string) => `/${userId}`,
    getSessionPath: (userId: string, sessionId: string) => 
      `/${userId}/session/${sessionId}`
  }
} as const;

interface RouteConfig {
  path: string;
  element: React.ReactNode;
  children?: RouteConfig[];
}

export const createRouteConfig = (): RouteConfig[] => {
  return [
    {
      path: ROUTES.HOME,
      element: <Navigate to="/oweo" replace />
    },
    {
      path: ROUTES.USER,
      element: <App />,
      children: [
        {
          path: '',
          element: <SessionList />
        },
        {
          path: 'session/:sessionId',
          element: <ChatContainer />
        }
      ]
    },
    {
      path: '*',
      element: <Navigate to={ROUTES.HOME} replace />
    }
  ];
};

export default ROUTES;
