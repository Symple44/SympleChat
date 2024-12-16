// src/features/sessions/hooks/useSessionNav.ts

import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { apiClient } from '../../../core/api/client';
import { API_ENDPOINTS } from '../../../core/api/endpoints';

interface SessionData {
  id: string;
  timestamp: string;
  title: string;
  messageCount: number;
  userId: string;
  status: 'active' | 'archived' | 'deleted';
  metadata: {
    createdAt: string;
    updatedAt: string;
    title?: string;
    messageCount: number;
  };
}

interface UseSessionNavReturn {
  sessions: SessionData[];
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

  const [sessions, setSessions] = useState<SessionData[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const processSessionData = useCallback((sessions: SessionData[]) => {
    return sessions.reduce<Record<string, SessionData>>((acc, session) => {
      const sessionId = session.id;
      if (!acc[sessionId]) {
        acc[sessionId] = {
          id: sessionId,
          userId: session.userId,
          timestamp: session.metadata.createdAt,
          title: session.metadata.title || "Nouvelle conversation",
          messageCount: session.metadata.messageCount,
          status: session.status,
          metadata: session.metadata
        };
      } else {
        acc[sessionId].messageCount = session.metadata.messageCount;
        if (new Date(session.metadata.updatedAt) > new Date(acc[sessionId].timestamp)) {
          acc[sessionId].timestamp = session.metadata.updatedAt;
        }
      }
      return acc;
    }, {});
  }, []);

  const loadSessions = useCallback(async () => {
    if (!userId) return;

    try {
      setIsLoading(true);
      setError(null);

      const response = await apiClient.get<SessionData[]>(
        API_ENDPOINTS.USER.HISTORY(userId)
      );

      const processedSessions = processSessionData(response);
      const sortedSessions = Object.values(processedSessions).sort(
        (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );

      setSessions(sortedSessions);

      if (!routeSessionId && sortedSessions.length > 0) {
        const latestSession = sortedSessions[0];
        setCurrentSessionId(latestSession.id);
        navigate(`/${userId}/session/${latestSession.id}`);
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur de chargement des sessions';
      console.error('Erreur chargement sessions:', err);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [userId, routeSessionId, navigate, processSessionData]);

  const createNewSession = async (): Promise<string> => {
    if (!userId) {
      throw new Error('UserId requis');
    }

    try {
      setIsLoading(true);
      setError(null);

      const response = await apiClient.post<{ session_id: string }>(
        API_ENDPOINTS.SESSION.CREATE,
        { userId }
      );

      const newSessionId = response.session_id;
      setCurrentSessionId(newSessionId);
      navigate(`/${userId}/session/${newSessionId}`);

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
      
      const sessionExists = sessions.some(s => s.id === sessionId);
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

  useEffect(() => {
    if (userId) {
      void loadSessions();
    }
  }, [userId, loadSessions]);

  useEffect(() => {
    if (routeSessionId && routeSessionId !== currentSessionId) {
      setCurrentSessionId(routeSessionId);
    }
  }, [routeSessionId, currentSessionId]);

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
