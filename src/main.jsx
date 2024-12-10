import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { ChatProvider } from './context/ChatContext';
import Home from './pages/Home';
import App from './App';
import './styles/main.css';
import { ChatProvider } from './context/ChatContext';

const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />
  },
  {
    path: "/chat",
    element: (
      <ChatProvider>
        <App />
      </ChatProvider>
    )
  }
]);

ReactDOM.createRoot(document.getElementById('chat-root')).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
