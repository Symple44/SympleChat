// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ServiceProvider } from './providers/ServiceProvider';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import App from './App';
import './styles/main.css';

// Configuration des rapports d'erreur globaux
window.onerror = (message, source, lineno, colno, error) => {
  console.error('Erreur globale:', { message, source, lineno, colno, error });
  eventBus.emit(EventTypes.SYSTEM.ERROR, {
    error,
    context: 'window',
    details: { message, source, lineno, colno }
  });
  return false;
};

// Configuration des promesses non gérées
window.onunhandledrejection = (event) => {
  console.error('Promesse non gérée:', event.reason);
  eventBus.emit(EventTypes.SYSTEM.ERROR, {
    error: event.reason,
    context: 'promise'
  });
};

// Mesurer les performances de démarrage
performance.mark('app-init-start');

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <ServiceProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </ServiceProvider>
    </ErrorBoundary>
  </React.StrictMode>,
  () => {
    // Marquer la fin du rendu initial
    performance.mark('app-init-end');
    performance.measure('app-initialization', 'app-init-start', 'app-init-end');
    
    const measure = performance.getEntriesByName('app-initialization')[0];
    console.log(`Application initialisée en ${measure.duration.toFixed(2)}ms`);
  }
);
