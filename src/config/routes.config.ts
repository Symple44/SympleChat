// src/config/routes.config.ts

import { RouteObject } from 'react-router-dom';
import { Navigate } from 'react-router-dom';
import App from '../App';
import SessionList from '../features/sessions/components/SessionList';
import ChatContainer from '../features/chat/components/ChatContainer';
import { APP_CONFIG } from './app.config';

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

const defaultUserId = APP_CONFIG.CHAT.DEFAULT_USER_ID;

export const routes: RouteObject[] = [
  {
    path: '/',
    element: <Navigate to={`/${defaultUserId}`} replace />
  },
  {
    path: '/:userId',
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
    element: <Navigate to="/" replace />
  }
];

export default ROUTES;
