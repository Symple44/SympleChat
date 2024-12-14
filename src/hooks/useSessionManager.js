// src/hooks/useSessionManager.js
import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { config } from '../config';

export const useSessionManager = () => {
  const [sessions, setSessions] = useState([]);
  const [currentSession, setCurrentSession] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Verrou pour éviter les créations multiples
  const [isCreatingSession, setIsCreatingSession] = useState(false);

  const loadSessions = useCallback(async () => {
    if (isLoading) return;

    setIsLoading(true);
    try {
      const response = await fetch(`${config.API.BASE_URL}/api/history/user/${config.CHAT.DEFAULT_USER_ID}`);
      if (!response.ok) throw new Error('Erreur chargement sessions');

      const history = await response.json();
      
      // Traitement des sessions avec déduplication
      const sessionMap = new Map();
      history.forEach(msg => {
        const sessionId = msg.session_id;
        if (!sessionMap.has(sessionId)) {
          sessionMap.set(sessionId, {
            session_id: sessionId,
            timestamp: msg.timestamp,
            first_message: msg.query || msg.response,
            messages: []
          });
        }
        sessionMap.get(sessionId).messages.push(msg);
      });

      const orderedSessions = Array.from(sessionMap.values())
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

      setSessions(orderedSessions);
    } catch (err) {
      console.error('Erreur chargement sessions:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createNewSession = useCallback(async () => {
    if (isCreatingSession) return null;

    setIsCreatingSession(true);
    try {
      const response = await fetch(`${config.API.BASE_URL}/api/sessions/new`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: config.CHAT.DEFAULT_USER_ID })
      });

      if (!response.ok) throw new Error('Erreur création session');

      const { session_id } = await response.json();
      const newSession = {
        session_id,
        timestamp: new Date().toISOString(),
        first_message: "Nouvelle conversation",
        messages: []
      };

      setSessions(prev => [newSession, ...prev]);
      setCurrentSession(newSession);
      navigate(`/session/${session_id}`);
      
      return session_id;
    } catch (err) {
      console.error('Erreur création session:', err);
      setError(err.message);
      return null;
    } finally {
      setIsCreatingSession(false);
    }
  }, [navigate]);

  const changeSession = useCallback(async (sessionId) => {
    if (!sessionId || sessionId === currentSession?.session_id) return;

    setIsLoading(true);
    try {
      // Vérifier si la session existe
      const session = sessions.find(s => s.session_id === sessionId);
      if (!session) throw new Error('Session introuvable');

      setCurrentSession(session);
      navigate(`/session/${sessionId}`);
    } catch (err) {
      console.error('Erreur changement session:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [currentSession, sessions, navigate]);

  // Nettoyage des anciennes sessions (optionnel)
  const cleanupOldSessions = useCallback(async () => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    setSessions(prev => prev.filter(session => 
      new Date(session.timestamp) > thirtyDaysAgo
    ));
  }, []);

  // Gestion des erreurs
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  return {
    sessions,
    currentSession,
    isLoading,
    error,
    loadSessions,
    createNewSession,
    changeSession,
    cleanupOldSessions
  };
};

export default useSessionManager;
