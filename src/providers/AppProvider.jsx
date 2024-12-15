// src/providers/AppProvider.jsx
import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useStore } from '../store/globalStore';
import { eventBus, EventTypes } from '../services/events/EventBus';
import { performanceMonitor } from '../services/performance/PerformanceMonitor';
import { wsService } from '../services/WebSocketService';
import { dbCache } from '../services/storage/IndexedDBCache';
import { syncService } from '../services/sync/SyncService';
import { queueService } from '../services/queue/QueueService';
import KeyboardShortcuts from '../components/common/KeyboardShortcuts';
import Toast from '../components/common/Toast';
import ErrorBoundary from '../components/common/ErrorBoundary';

export const AppProvider = ({ children }) => {
  const location = useLocation();
  const {
    setTheme,
    addToast,
    setConnected,
    setError,
    initializeStore
  } = useStore();

  // Initialisation des services
  useEffect(() => {
    const initializeServices = async () => {
      try {
        // Démarrer le moniteur de performance
        performanceMonitor.start({
          onThresholdExceeded: (metric) => {
            addToast({
              type: 'warning',
              message: `Performance dégradée: ${metric.name} (${metric.value}ms)`,
              duration: 5000
            });
          }
        });

        // Initialiser la base de données
        await dbCache.initialize();

        // Initialiser le service de synchronisation
        syncService.initialize({
          onSyncStarted: () => {
            addToast({
              type: 'info',
              message: 'Synchronisation en cours...',
              duration: 2000
            });
          },
          onSyncCompleted: () => {
            addToast({
              type: 'success',
              message: 'Synchronisation terminée',
              duration: 2000
            });
          }
        });

        // Initialiser le store
        await initializeStore();

        // Configuration du thème
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        setTheme(prefersDark ? 'dark' : 'light');

        // Écouter les changements de thème système
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        mediaQuery.addEventListener('change', (e) => {
          setTheme(e.matches ? 'dark' : 'light');
        });

        // Initialiser les files d'attente
        queueService.initialize();

        // Connecter WebSocket
        wsService.connect();

        console.log('Services initialisés avec succès');
      } catch (error) {
        console.error('Erreur initialisation services:', error);
        setError('Erreur lors de l\'initialisation des services');
      }
    };

    initializeServices();

    // Nettoyage
    return () => {
      performanceMonitor.stop();
      wsService.disconnect();
      syncService.stop();
    };
  }, []);

  // Gestion des événements WebSocket
  useEffect(() => {
    const handleWebSocketStatus = (status) => {
      setConnected(status === 'connected');
      addToast({
        type: status === 'connected' ? 'success' : 'warning',
        message: status === 'connected' ? 'Connecté au serveur' : 'Déconnecté du serveur',
        duration: 3000
      });
    };

    wsService.onStatusChange(handleWebSocketStatus);

    return () => {
      wsService.offStatusChange(handleWebSocketStatus);
    };
  }, [setConnected, addToast]);

  // Gestion de la navigation
  useEffect(() => {
    const handleRouteChange = () => {
      performanceMonitor.measure('page_navigation', () => {
        // Mesurer le temps de chargement de la page
        const timing = performance.now();
        return timing;
      });

      // Nettoyer les modales et notifications
      eventBus.emit(EventTypes.UI.CLOSE_ALL_MODALS);
    };

    handleRouteChange();
  }, [location]);

  // Gestion des erreurs globales
  useEffect(() => {
    const handleGlobalError = (error) => {
      console.error('Erreur globale:', error);
      setError(error.message);
      addToast({
        type: 'error',
        title: 'Erreur',
        message: error.message,
        duration: 5000
      });
    };

    window.addEventListener('error', handleGlobalError);
    window.addEventListener('unhandledrejection', (event) => {
      handleGlobalError(event.reason);
    });

    return () => {
      window.removeEventListener('error', handleGlobalError);
      window.removeEventListener('unhandledrejection', handleGlobalError);
    };
  }, [setError, addToast]);

  // Surveillance de la connexion réseau
  useEffect(() => {
    const handleOnline = () => {
      addToast({
        type: 'success',
        message: 'Connexion Internet rétablie',
        duration: 3000
      });
      syncService.sync();
    };

    const handleOffline = () => {
      addToast({
        type: 'warning',
        message: 'Connexion Internet perdue',
        duration: 3000
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [addToast]);

  return (
    <ErrorBoundary>
      <div className={useStore(state => state.theme)}>
        {children}
        <KeyboardShortcuts />
        <Toast />
      </div>
    </ErrorBoundary>
  );
};

// HOC utilitaire pour envelopper les composants avec le Provider
export const withAppProvider = (Component) => {
  return function WithAppProviderWrapper(props) {
    return (
      <AppProvider>
        <Component {...props} />
      </AppProvider>
    );
  };
};

export default AppProvider;
