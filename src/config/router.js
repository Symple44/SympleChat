// src/config/router.js
import { createBrowserRouter, Navigate } from 'react-router-dom';

export const createAppRouter = (AppComponent) => {
  const routes = [
    {
      path: '/',
      element: AppComponent,
    },
    {
      path: '/session',
      element: <Navigate to="/" replace />
    },
    {
      path: '/session/:sessionId',
      element: AppComponent
    },
    {
      // Capture toutes les autres routes non définies
      path: '*',
      element: <Navigate to="/" replace />
    }
  ];

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
