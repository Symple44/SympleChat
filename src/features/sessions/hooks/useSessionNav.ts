// src/features/sessions/hooks/useSessionNav.ts

import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { apiClient } from '../../../core/api/client';
import { API_ENDPOINTS } from '../../../core/api/endpoints';

interface Session {
  session_id: string;
  timestamp: string;
  first_message: string;
  message_count: number;
}

interface UseSessionNavReturn {
  sessions: Session[];
  currentSessionId: string | null;
  isLoading: boolean;
  error: string | null;
  changeSession: (sessionId: string) => Promise<void>;
  createNewSession: () => Promise<string>;
  loadSessions: () => Promise<void>;
}

export function useSessionNav(): UseSessionNavReturn {
  const navigate = useNavigate();
  const { userId, sessionId: routeSessionId } = useParams<{ 
    userId: string;
    sessionId: string;
  }>();
  
  const [sessions, setSessions] = useState<Session[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const formatSessionData = (msg: Session) => ({
  session_id: msg.id,
  timestamp: msg.metadata.createdAt,
  first_message: msg.metadata.title || "Nouvelle conversation",
  message_count: msg.metadata.messageCount
  });
  
  const loadSessions = useCallback(async () => {
    if (!userId) return;

    try {
      setIsLoading(true);
      setError(null);

      const response = await apiClient.get<Session[]>(
        API_ENDPOINTS.USER.HISTORY(userId)
      );

      // Grouper les messages par session et extraire les informations pertinentes
      const sessionMap = response.reduce<Record<string, Session>>((acc, msg) => {
        const sessionData = formatSessionData(msg);
        if (!acc[sessionId]) {
          acc[sessionId] = {
            session_id: sessionId,
            timestamp: msg.timestamp,
            first_message: msg.query || "Nouvelle conversation",
            message_count: 1
          };
        } else {
          acc[sessionId].message_count++;
          if (new Date(msg.timestamp) > new Date(acc[sessionId].timestamp)) {
            acc[sessionId].timestamp = msg.timestamp;
          }
        }
        return acc;
      }, {});

      // Convertir en tableau et trier par date décroissante
      const sortedSessions = Object.values(sessionMap).sort(
        (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );

      setSessions(sortedSessions);

      // Si pas de session active dans l'URL et qu'il y a des sessions existantes
      if (!routeSessionId && sortedSessions.length > 0) {
        const latestSession = sortedSessions[0];
        setCurrentSessionId(latestSession.session_id);
        navigate(`/${userId}/session/${latestSession.session_id}`);
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur de chargement des sessions';
      console.error('Erreur chargement sessions:', err);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [userId, routeSessionId, navigate]);

  const createNewSession = async (): Promise<string> => {
    if (!userId) {
      throw new Error('UserId requis');
    }

    try {
      setIsLoading(true);
      setError(null);

      const response = await apiClient.post<{ session_id: string }>(
        API_ENDPOINTS.SESSION.CREATE,
        { user_id: userId }
      );

      const newSessionId = response.session_id;
      setCurrentSessionId(newSessionId);
      navigate(`/${userId}/session/${newSessionId}`);

      // Recharger les sessions pour inclure la nouvelle
      await loadSessions();

      return newSessionId;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur de création de session';
      console.error('Erreur création session:', err);
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const changeSession = async (sessionId: string): Promise<void> => {
    if (sessionId === currentSessionId) return;

    try {
      setIsLoading(true);
      setError(null);
      
      // Vérifier que la session existe
      const sessionExists = sessions.some(s => s.session_id === sessionId);
      if (!sessionExists) {
        throw new Error('Session invalide');
      }

      setCurrentSessionId(sessionId);
      navigate(`/${userId}/session/${sessionId}`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur de changement de session';
      console.error('Erreur changement session:', err);
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Initialisation et synchronisation avec l'URL
  useEffect(() => {
    if (userId) {
      loadSessions();
    }
  }, [userId, loadSessions]);

  // Synchronisation avec le sessionId de l'URL
  useEffect(() => {
    if (routeSessionId && routeSessionId !== currentSessionId) {
      setCurrentSessionId(routeSessionId);
    }
  }, [routeSessionId]);

  return {
    sessions,
    currentSessionId,
    isLoading,
    error,
    changeSession,
    createNewSession,
    loadSessions
  };
}

export default useSessionNav;
