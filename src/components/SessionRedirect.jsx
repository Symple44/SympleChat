// src/components/SessionRedirect.jsx
import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSessionManager } from '../hooks/useSessionManager';

const SessionRedirect = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const { sessions, loadSessions, createNewSession } = useSessionManager();

  useEffect(() => {
    const init = async () => {
      if (!sessions.length) {
        await loadSessions();
      }

      if (sessionId) {
        const sessionExists = sessions.some(s => s.session_id === sessionId);
        if (!sessionExists) {
          // Rediriger vers une nouvelle session si celle de l'URL n'existe pas
          const newSessionId = await createNewSession();
          if (newSessionId) {
            navigate(`/session/${newSessionId}`, { replace: true });
          } else {
            navigate('/', { replace: true });
          }
        }
      } else if (sessions.length > 0) {
        // Rediriger vers la session la plus récente
        navigate(`/session/${sessions[0].session_id}`, { replace: true });
      } else {
        // Créer une nouvelle session si aucune n'existe
        const newSessionId = await createNewSession();
        if (newSessionId) {
          navigate(`/session/${newSessionId}`, { replace: true });
        }
      }
    };

    init();
  }, [sessionId, sessions, loadSessions, createNewSession, navigate]);

  return null;
};

export default SessionRedirect;
