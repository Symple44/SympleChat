// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { ChatProvider } from './context/ChatContext';
import App from './App';
import './styles/main.css';

// Vérification de l'état du système au démarrage
async function checkSystemHealth() {
  try {
    const health = await api.checkHealth();
    console.log('System health:', health);
  } catch (error) {
    console.error('System health check failed:', error);
  }
}

// Point d'entrée de l'application
ReactDOM.createRoot(document.getElementById('chat-root')).render(
  <React.StrictMode>
    <ChatProvider>
      <App />
    </ChatProvider>
  </React.StrictMode>
);

// Vérification initiale de l'état du système
checkSystemHealth();