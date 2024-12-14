// src/hooks/useSessionCleanup.js
import { useEffect } from 'react';
import { config } from '../config';

export const useSessionCleanup = (sessions, setSessions) => {
  useEffect(() => {
    const cleanup = () => {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - config.SESSIONS.CLEANUP_DAYS);

      // Filtrer les sessions anciennes
      const updatedSessions = sessions.filter(session => 
        new Date(session.timestamp) > cutoffDate
      );

      // Limiter le nombre total de sessions
      if (updatedSessions.length > config.SESSIONS.MAX_SESSIONS) {
        updatedSessions.sort((a, b) => 
          new Date(b.timestamp) - new Date(a.timestamp)
        );
        updatedSessions.length = config.SESSIONS.MAX_SESSIONS;
      }

      if (updatedSessions.length < sessions.length) {
        setSessions(updatedSessions);
      }
    };

    // Exécuter le nettoyage toutes les 24 heures
    const interval = setInterval(cleanup, 24 * 60 * 60 * 1000);
    cleanup(); // Exécuter immédiatement au montage

    return () => clearInterval(interval);
  }, [sessions, setSessions]);
};
