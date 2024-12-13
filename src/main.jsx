import React from 'react';
import ReactDOM from 'react-dom/client';
import { ThemeProvider } from './context/ThemeContext';
import { ChatProviderWithRouter } from './context/ChatContext';
import App from './App';
import './styles/main.css';

ReactDOM.createRoot(document.getElementById('chat-root')).render(
  <React.StrictMode>
    <ThemeProvider>
      <ChatProviderWithRouter>
        <App />
      </ChatProviderWithRouter>
    </ThemeProvider>
  </React.StrictMode>
);
