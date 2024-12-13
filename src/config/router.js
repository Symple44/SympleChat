// src/config/router.js
import { createBrowserRouter } from 'react-router-dom';

export const createAppRouter = (routes) => {
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
    basename: '/',
    strict: true
  });
};
