// src/config/routes.config.ts

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

export function createRouteConfig(router: any) {
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
          index: true,
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
}

export default ROUTES;
