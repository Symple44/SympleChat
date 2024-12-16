// src/config/routes.config.tsx
import React from 'react';
import { RouteObject } from 'react-router-dom';
import { Navigate } from 'react-router-dom';
import App from '../App';
import SessionList from '../features/sessions/components/SessionList';
import ChatContainer from '../features/chat/components/ChatContainer';

export const ROUTES = {
  HOME: '/',
  USER: '/:userId',
  SESSION: '/:userId/session/:sessionId',
  
  helpers: {
    getUserPath: (userId: string): string => `/${userId}`,
    getSessionPath: (userId: string, sessionId: string): string => 
      `/${userId}/session/${sessionId}`
  }
} as const;

type AppRouteObject = Omit<RouteObject, 'children'> & {
  children?: AppRouteObject[];
};

const defaultUserId = 'oweo';

export const routes: AppRouteObject[] = [
  {
    path: ROUTES.HOME,
    element: <Navigate to={`/${defaultUserId}`} replace />
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

export const createRouteConfig = (): AppRouteObject[] => routes;

export default ROUTES;
