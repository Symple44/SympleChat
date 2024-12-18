// src/shared/hooks/useSession.ts

import { useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useStore } from '@/store/store';
import type { Session } from '../types';

interface UseSessionReturn {
  currentSession: Session | null;
  sessions: Session[];
  isLoading: boolean;
  error: string | null;
  createSession: () => Promise<void>;
  selectSession: (session: Session) => Promise<void>;
  archiveSession: (sessionId: string) => Promise<void>;
  fetchSessions: () => Promise<void>;
}

export function useSession(): UseSessionReturn {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  
  const { 
    sessions,
    currentSession,
    loading,
    error,
    createSession: storeCreateSession,
    setCurrentSession,
    fetchSessions: storeFetchSessions,
    archiveSession: storeArchiveSession
  } = useStore(state => ({
    sessions: Object.values(state.sessions.data),
    currentSession: state.sessions.currentId 
      ? state.sessions.data[state.sessions.currentId]
      : null,
    loading: state.sessions.loading,
    error: state.sessions.error,
    createSession: state.createSession,
    setCurrentSession: state.setCurrentSession,
    fetchSessions: state.fetchSessions,
    archiveSession: state.archiveSession
  }));

  const createSession = useCallback(async () => {
    if (!userId) throw new Error('User ID required');
    
    try {
      const newSession = await storeCreateSession(userId);
      await setCurrentSession(newSession);
      navigate(`/${userId}/session/${newSession.id}`);
    } catch (error) {
      console.error('Error creating session:', error);
      throw error;
    }
  }, [userId, storeCreateSession, setCurrentSession, navigate]);

  const selectSession = useCallback(async (session: Session) => {
    try {
      await setCurrentSession(session);
      navigate(`/${userId}/session/${session.id}`);
    } catch (error) {
      console.error('Error selecting session:', error);
      throw error;
    }
  }, [userId, setCurrentSession, navigate]);

  const archiveSession = useCallback(async (sessionId: string) => {
    try {
      await storeArchiveSession(sessionId);
      // Optionellement rediriger vers la liste des sessions
      if (currentSession?.id === sessionId) {
        navigate(`/${userId}`);
      }
    } catch (error) {
      console.error('Error archiving session:', error);
      throw error;
    }
  }, [userId, currentSession, storeArchiveSession, navigate]);

  const fetchSessions = useCallback(async () => {
    if (!userId) throw new Error('User ID required');
    await storeFetchSessions(userId);
  }, [userId, storeFetchSessions]);

  return {
    currentSession,
    sessions,
    isLoading: loading,
    error,
    createSession,
    selectSession,
    archiveSession,
    fetchSessions
  };
}

export default useSession;
