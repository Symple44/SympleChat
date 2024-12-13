//src/hooks/useChat.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { ChatProvider } from './context/ChatContext';
import App from './App';
import './styles/main.css';

ReactDOM.createRoot(document.getElementById('chat-root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <ChatProvider>
          <Routes>
            <Route path="/" element={<App />} />
            <Route path="/session/:sessionId" element={<App />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </ChatProvider>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
);
