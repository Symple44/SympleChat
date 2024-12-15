// config/router.js
import { createBrowserRouter } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import App from '../App';
import { NotFoundView } from '../views/NotFoundView';

export const createAppRouter = (AppComponent, RedirectComponent) => {
  const routes = [
    {
      path: '/',
      element: AppComponent
    },
    {
      path: 'session/:sessionId',
      element: AppComponent
    },
    {
      path: '*',
      element: RedirectComponent
    }
  ];

  return createBrowserRouter(routes);
};

export default createAppRouter;
