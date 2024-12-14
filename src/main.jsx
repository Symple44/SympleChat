// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { ChatProvider } from './context/ChatContext';
import ErrorBoundary from './components/ErrorBoundary';
import App from './App';
import './styles/main.css';

// Gestionnaire d'erreurs non capturées
window.onerror = function(msg, url, lineNo, columnNo, error) {
  console.error('Erreur globale:', { msg, url, lineNo, columnNo, error });
  return false;
};

// Gestionnaire de rejets de promesses non gérés
window.onunhandledrejection = function(event) {
  console.error('Promesse rejetée non gérée:', event.reason);
};

ReactDOM.createRoot(document.getElementById('chat-root')).render(
  <React.StrictMode>
    <ErrorBoundary>
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
    </ErrorBoundary>
  </React.StrictMode>
);
