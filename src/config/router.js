// src/config/router.js
import React from 'react';
import { createBrowserRouter } from 'react-router-dom';
import AppWithProviders from '../components/AppWithProviders';

// Définition des routes de l'application
const routes = [
  {
    path: '/',
    element: <AppWithProviders />,
    children: [
      {
        path: 'session/:sessionId',
        element: <AppWithProviders />
      }
    ]
  }
];

// Configuration du router avec tous les flags futurs
export const createAppRouter = () => {
  return createBrowserRouter(routes, {
    future: {
      v7_startTransition: true,
      v7_normalizeFormMethod: true,
      v7_partialHydration: true,
      v7_prependBasename: true,
      v7_relativeSplatPath: true,
      v7_fetcherPersist: true,
      v7_skipActionErrorRevalidation: true
    },
    basename: '/'
  });
};

export default createAppRouter;
