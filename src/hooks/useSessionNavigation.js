// src/hooks/useSessionNavigation.js
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { config } from '../config';

export const useSessionNavigation = () => {
  const [sessions, setSessions] = useState([]);
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  const loadSessions = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(
        `${config.API.BASE_URL}${config.API.ENDPOINTS.HISTORY}/user/${config.CHAT.DEFAULT_USER_ID}`
      );
      
      if (!response.ok) throw new Error('Erreur lors du chargement des sessions');
      
      const history = await response.json();
      
      // Grouper les messages par session
      const sessionGroups = history.reduce((groups, msg) => {
        if (!groups[msg.session_id]) {
          groups[msg.session_id] = {
            session_id: msg.session_id,
            messages: [],
            timestamp: msg.timestamp,
            first_message: msg.query || msg.response
          };
        }
        groups[msg.session_id].messages.push(msg);
        if (new Date(msg.timestamp) > new Date(groups[msg.session_id].timestamp)) {
          groups[msg.session_id].timestamp = msg.timestamp;
        }
        return groups;
      }, {});

      // Convertir en tableau et trier par date décroissante
      const sortedSessions = Object.values(sessionGroups).sort(
        (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
      );

      setSessions(sortedSessions);

      // Si pas de session active dans l'URL
      if (!location.pathname.includes('/session/')) {
        if (sortedSessions.length > 0) {
          // Utiliser la dernière session
          const latestSession = sortedSessions[0];
          setCurrentSessionId(latestSession.session_id);
          navigate(`/session/${latestSession.session_id}`);
        } else {
          // Créer une nouvelle session si aucune n'existe
          createNewSession();
        }
      }
    } catch (err) {
      console.error('Erreur chargement sessions:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const createNewSession = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(
        `${config.API.BASE_URL}${config.API.ENDPOINTS.SESSIONS}/new?user_id=${config.CHAT.DEFAULT_USER_ID}`,
        { method: 'POST' }
      );
      
      if (!response.ok) throw new Error('Erreur lors de la création de la session');
      
      const { session_id } = await response.json();
      setCurrentSessionId(session_id);
      navigate(`/session/${session_id}`);
      await loadSessions();
      return session_id;
    } catch (err) {
      console.error('Erreur création session:', err);
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const changeSession = async (sessionId) => {
    if (sessionId === currentSessionId) return;
    setCurrentSessionId(sessionId);
    navigate(`/session/${sessionId}`);
  };

  // Initialisation et synchronisation avec l'URL
  useEffect(() => {
    const initializeSession = async () => {
      const sessionMatch = location.pathname.match(/\/session\/([^/]+)/);
      if (sessionMatch) {
        setCurrentSessionId(sessionMatch[1]);
      }
      await loadSessions();
    };

    initializeSession();
  }, [location.pathname]);

  return {
    sessions,
    currentSessionId,
    isLoading,
    error,
    changeSession,
    createNewSession,
    loadSessions
  };
};

export default useSessionNavigation;
