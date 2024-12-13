// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { ThemeProvider } from './context/ThemeContext';
import { ChatProviderWithRouter } from './context/ChatContext';
import './styles/main.css';

// Gestionnaire d'erreurs global
window.onerror = function(message, source, lineno, colno, error) {
  console.error('Erreur globale:', { message, source, lineno, colno, error });
  return false;
};

// Gestionnaire pour les rejets de promesses non gérés
window.addEventListener('unhandledrejection', event => {
  console.error('Promesse rejetée non gérée:', event.reason);
});

ReactDOM.createRoot(document.getElementById('chat-root')).render(
  <React.StrictMode>
    <ThemeProvider>
      <ChatProviderWithRouter />
    </ThemeProvider>
  </React.StrictMode>
);
