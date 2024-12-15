// src/providers/ServiceProvider.jsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { appService } from '../services/AppService';
import { searchIndexer } from '../services/search/SearchIndexer';
import { wsService } from '../services/WebSocketService';
import { syncService } from '../services/sync/SyncService';
import { queueService } from '../services/queue/QueueService';
import { performanceMonitor } from '../services/performance/PerformanceMonitor';
import { eventBus, EventTypes } from '../services/events/EventBus';

const ServiceContext = createContext(null);

export const ServiceProvider = ({ children }) => {
  const [state, setState] = useState({
    initialized: false,
    loading: true,
    error: null,
    services: {
      app: null,
      search: null,
      websocket: null,
      sync: null,
      queue: null,
      performance: null
    }
  });

  useEffect(() => {
    const initializeServices = async () => {
      const initStart = performance.now();

      try {
        // Initialiser le monitoring des performances en premier
        performanceMonitor.start();

        // Initialiser les services principaux
        await appService.initialize();
        await searchIndexer.initialize();
        await syncService.initialize();
        
        // Configurer WebSocket
        wsService.connect();

        // Configurer les files d'attente
        queueService.initialize();

        // Mettre à jour l'état
        setState({
          initialized: true,
          loading: false,
          services: {
            app: appService,
            search: searchIndexer,
            websocket: wsService,
            sync: syncService,
            queue: queueService,
            performance: performanceMonitor
          }
        });

        const initDuration = performance.now() - initStart;
        console.log(`Services initialisés en ${initDuration.toFixed(2)}ms`);

        eventBus.emit(EventTypes.SYSTEM.INITIALIZED, {
          duration: initDuration,
          services: Object.keys(state.services)
        });

      } catch (error) {
        console.error('Erreur initialisation services:', error);
        setState(prev => ({
          ...prev,
          loading: false,
          error: {
            message: 'Erreur lors de l\'initialisation des services',
            details: error.message,
            critical: true
          }
        }));

        eventBus.emit(EventTypes.SYSTEM.ERROR, {
          error,
          context: 'service_initialization'
        });
      }
    };

    initializeServices();

    // Nettoyage lors du démontage
    return () => {
      performanceMonitor.stop();
      wsService.disconnect();
      syncService.stop();
      queueService.destroy();
      searchIndexer.destroy();
    };
  }, []);

  // Gérer les événements système
  useEffect(() => {
    const handleError = (error) => {
      setState(prev => ({
        ...prev,
        error: {
          message: error.message,
          details: error.details,
          critical: error.critical
        }
      }));
    };

    const handleReconnect = () => {
      syncService.sync();
    };

    eventBus.addEventListener(EventTypes.SYSTEM.ERROR, handleError);
    eventBus.addEventListener(EventTypes.CONNECTION.RESTORED, handleReconnect);

    return () => {
      eventBus.removeEventListener(EventTypes.SYSTEM.ERROR, handleError);
      eventBus.removeEventListener(EventTypes.CONNECTION.RESTORED, handleReconnect);
    };
  }, []);

  // Surveillance des performances
  useEffect(() => {
    const checkPerformance = () => {
      const stats = performanceMonitor.getStats();
      
      if (stats.memory > 90) { // 90% utilisation mémoire
        eventBus.emit(EventTypes.SYSTEM.WARNING, {
          message: 'Utilisation mémoire élevée',
          details: stats
        });
      }
    };

    const interval = setInterval(checkPerformance, 30000); // Vérifier toutes les 30 secondes
    return () => clearInterval(interval);
  }, []);

  return (
    <ServiceContext.Provider 
      value={{
        ...state,
        services: state.services
      }}
    >
      {children}
    </ServiceContext.Provider>
  );
};

// Hook personnalisé pour utiliser les services
export const useServices = () => {
  const context = useContext(ServiceContext);
  if (!context) {
    throw new Error('useServices doit être utilisé dans un ServiceProvider');
  }
  return context;
};

// HOC pour injecter les services dans un composant
export const withServices = (WrappedComponent) => {
  return function WithServicesComponent(props) {
    const services = useServices();
    return <WrappedComponent {...props} services={services} />;
  };
};

export default ServiceProvider;
