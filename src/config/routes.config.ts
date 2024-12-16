// src/config/routes.config.ts

// src/config/routes.config.ts

import { RouteObject } from 'react-router-dom';
import { Navigate } from 'react-router-dom';
import type { ReactElement } from 'react';
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

interface AppRouteObject extends RouteObject {
  children?: AppRouteObject[];
}

const defaultUserId = 'oweo';

export const routes: AppRouteObject[] = [
  {
    path: ROUTES.HOME,
    element: React.createElement(Navigate, { to: `/${defaultUserId}`, replace: true })
  },
  {
    path: ROUTES.USER,
    element: React.createElement(App),
    children: [
      {
        path: '',
        element: React.createElement(SessionList)
      },
      {
        path: 'session/:sessionId',
        element: React.createElement(ChatContainer)
      }
    ]
  },
  {
    path: '*',
    element: React.createElement(Navigate, { to: ROUTES.HOME, replace: true })
  }
];

export const createRouteConfig = (): AppRouteObject[] => routes;

export default ROUTES;
