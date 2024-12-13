// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { ThemeProvider } from './context/ThemeContext';
import { ChatProviderWithRouter } from './context/ChatContext';
import App from './App';
import './styles/main.css';

// Ajouter un gestionnaire d'erreurs global
window.onerror = function(message, source, lineno, colno, error) {
  console.error('Erreur globale:', { message, source, lineno, colno, error });
  return false;
};

// Ajouter un gestionnaire pour les rejets de promesses non gérés
window.addEventListener('unhandledrejection', event => {
  console.error('Promesse rejetée non gérée:', event.reason);
});

// Création et rendu de l'application
ReactDOM.createRoot(document.getElementById('chat-root')).render(
  <React.StrictMode>
    <ThemeProvider>
      <ChatProviderWithRouter>
        <App />
      </ChatProviderWithRouter>
    </ThemeProvider>
  </React.StrictMode>
);
