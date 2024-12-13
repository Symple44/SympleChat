// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { ThemeProvider } from './context/ThemeContext';
import { ChatProviderWithRouter } from './context/ChatContext';
import './styles/main.css';

ReactDOM.createRoot(document.getElementById('chat-root')).render(
  <React.StrictMode>
    <ThemeProvider>
      <ChatProviderWithRouter />
    </ThemeProvider>
  </React.StrictMode>
);
