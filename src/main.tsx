// src/main.tsx

import React from 'react';
import ReactDOM from 'react-dom/client';
import AppProvider from './providers/AppProvider';
import { apiClient } from './core/api/client';
import { socketManager } from './core/socket/socket';

// Styles globaux
import './styles/main.css';

const ErrorDisplay: React.FC<{ error: string }> = ({ error }) => (
  <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
    <div className="max-w-md w-full bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6 text-center">
      <h1 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
        Erreur de connexion
      </h1>
      <p className="text-gray-600 dark:text-gray-300 mb-4">
        {error}
      </p>
      <button
        onClick={() => window.location.reload()}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
      >
        Réessayer
      </button>
    </div>
  </div>
);

async function initializeApp() {
  let root: ReactDOM.Root | null = null;
  
  try {
    root = ReactDOM.createRoot(
      document.getElementById('chat-root') as HTMLElement
    );

    // Vérification de la santé de l'API
    await apiClient.get('/health');

    // Initialisation du WebSocket
    socketManager.connect();

    // Rendu de l'application
    root.render(
      <React.StrictMode>
        <AppProvider />
      </React.StrictMode>
    );

  } catch (error) {
    console.error('Erreur d\'initialisation:', error);
    
    const errorMessage = error instanceof Error 
      ? error.message 
      : 'Impossible de se connecter au serveur. Veuillez vérifier votre connexion et réessayer.';
    
    if (root) {
      root.render(<ErrorDisplay error={errorMessage} />);
    }
  }
}

// Démarrage de l'application
initializeApp();

// Hot Module Replacement (HMR)
if (import.meta.hot) {
  import.meta.hot.accept();
}
