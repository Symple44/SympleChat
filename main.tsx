// src/main.tsx

import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import AppProvider from './providers/AppProvider';
import { apiClient } from './core/api/client';
import { socketManager } from './core/socket/socket';

// Styles globaux
import './styles/main.css';

// Configuration initiale
async function initializeApp() {
  try {
    // Vérification de la santé de l'API
    const healthCheck = await apiClient.get('/health');
    console.log('API Status:', healthCheck);

    // Initialisation du WebSocket
    socketManager.connect();

    // Rendu de l'application
    ReactDOM.createRoot(document.getElementById('chat-root')!).render(
      <React.StrictMode>
        <BrowserRouter>
          <AppProvider>
            <div id="modal-root" /> {/* Portal container pour les modals */}
            <div id="toast-root" /> {/* Portal container pour les notifications */}
          </AppProvider>
        </BrowserRouter>
      </React.StrictMode>
    );

  } catch (error) {
    console.error('Erreur d\'initialisation:', error);
    
    // Affichage d'une page d'erreur si l'initialisation échoue
    ReactDOM.createRoot(document.getElementById('chat-root')!).render(
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6 text-center">
          <h1 className="text-xl font-semibold text-gray-900 mb-4">
            Erreur de connexion
          </h1>
          <p className="text-gray-600 mb-4">
            Impossible de se connecter au serveur. Veuillez vérifier votre connexion et réessayer.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }
}

// Gestion des erreurs globales non capturées
window.addEventListener('unhandledrejection', (event) => {
  console.error('Promesse non gérée:', event.reason);
});

window.addEventListener('error', (event) => {
  console.error('Erreur globale:', event.error);
});

// Démarrage de l'application
initializeApp();

// Hot Module Replacement (HMR)
if (import.meta.hot) {
  import.meta.hot.accept();
}

// Activation du debugging en développement
if (process.env.NODE_ENV === 'development') {
  // Debug info
  console.log('Mode développement activé');
  console.log('API URL:', import.meta.env.VITE_API_URL);
  console.log('WS URL:', import.meta.env.VITE_WS_HOST);
}

// Export pour les tests
export { initializeApp };