// src/config/routes.config.ts

import { RouteObject } from 'react-router-dom';
import { createElement } from 'react';
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
    element: createElement(Navigate, { 
      to: `/${defaultUserId}`, 
      replace: true 
    })
  },
  {
    path: '/:userId',
    element: createElement(App),
    children: [
      {
        path: '',
        element: createElement(SessionList)
      },
      {
        path: 'session/:sessionId',
        element: createElement(ChatContainer)
      }
    ]
  },
  {
    path: '*',
    element: createElement(Navigate, { 
      to: '/', 
      replace: true 
    })
  }
];

export default ROUTES;
