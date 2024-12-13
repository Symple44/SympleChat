import React from 'react';
import ReactDOM from 'react-dom/client';
import { ThemeProvider } from './context/ThemeContext';
import { ChatProvider } from './context/ChatContext';
import App from './App';
import './styles/main.css';
import { ChatProviderWithRouter } from './context/ChatContext';

ReactDOM.createRoot(document.getElementById('chat-root')).render(
  <React.StrictMode>
    <ThemeProvider>
      <ChatProviderWithRouter>
        <App />
      </ChatProviderWithRouter>
    </ThemeProvider>
  </React.StrictMode>
);
