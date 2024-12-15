// src/hooks/useAppService.js
import { useState, useEffect, useCallback } from 'react';
import { appService } from '../services/AppService';
import { eventBus, EventTypes } from '../services/events/EventBus';

export const useAppService = () => {
  const [state, setState] = useState(appService.state);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    // Initialiser le service si nécessaire
    if (!appService.initialized) {
      appService.initialize().catch(error => {
        console.error('Erreur initialisation AppService:', error);
      });
    }

    // Écouter les changements d'état
    const handleStateChange = (newState) => {
      setState(newState);
    };

    const handleStatsUpdate = () => {
      setStats(appService.getStats());
    };

    // S'abonner aux événements
    const unsubscribeState = eventBus.addEventListener(
      EventTypes.SYSTEM.STATE_CHANGED,
      handleStateChange
    );

    const unsubscribeStats = eventBus.addEventListener(
      EventTypes.SYSTEM.STATS_UPDATED,
      handleStatsUpdate
    );

    // Mettre à jour les stats périodiquement
    const statsInterval = setInterval(handleStatsUpdate, 5000);

    return () => {
      unsubscribeState();
      unsubscribeStats();
      clearInterval(statsInterval);
    };
  }, []);

  // Wrapper les méthodes du service
  const sendMessage = useCallback(async (content, options) => {
    try {
      return await appService.sendMessage(content, options);
    } catch (error) {
      console.error('Erreur envoi message:', error);
      throw error;
    }
  }, []);

  const loadMessages = useCallback(async (sessionId, options) => {
    try {
      return await appService.loadMessages(sessionId, options);
    } catch (error) {
      console.error('Erreur chargement messages:', error);
      throw error;
    }
  }, []);

  return {
    // État
    isOnline: state.isOnline,
    isInitialized: state.isInitialized,
    isSyncing: state.isSyncing,
    error: state.error,
    stats,

    // Méthodes
    sendMessage,
    loadMessages,

    // Stats et monitoring
    getStats: appService.getStats.bind(appService),
    cleanup: appService.cleanup.bind(appService)
  };
};

export default useAppService;
