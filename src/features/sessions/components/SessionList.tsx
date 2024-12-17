// src/components/chat/SessionList.tsx

import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Plus, MessageSquare, Loader2, Archive } from 'lucide-react';
import { useStore } from '../../../store';
import { useTheme } from '../../../shared/hooks/useTheme';
import { formatRelativeTime } from '../../../shared/utils/dateFormatter';
import { apiClient } from '../../../core/api/client';
import { API_ENDPOINTS } from '../../../core/api/endpoints';
import type { Session } from '../../../core/session/types';

interface SessionListProps {
  className?: string;
}

const SessionList: React.FC<SessionListProps> = ({ className = '' }) => {
  const navigate = useNavigate();
  const { userId } = useParams<{ userId: string }>();
  const { isDark } = useTheme();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const sessions = useStore(state => state.session.sessions);
  const currentSessionId = useStore(state => state.session.currentSessionId);
  const setCurrentSession = useStore(state => state.setCurrentSession);
  const setSessions = useStore(state => state.setSessions);

  const loadSessions = async () => {
    if (!userId) {
      setError("ID utilisateur non disponible");
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const response = await apiClient.get<any[]>(
        API_ENDPOINTS.USER.HISTORY(userId)
      );

      const formattedSessions: Session[] = response.map(history => ({
        id: history.session_id,
        userId,
        status: 'active',
        metadata: {
          title: history.query || "Nouvelle conversation",
          messageCount: 1,
          createdAt: history.timestamp,
          updatedAt: history.timestamp,
          language: 'fr'
        }
      }));

      setSessions(formattedSessions);
      setError(null);
    } catch (err) {
      console.error('Erreur chargement sessions:', err);
      setError('Impossible de charger les sessions');
      setSessions([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadSessions();
  }, [userId]);

  const handleNewSession = async () => {
    if (!userId) {
      setError("ID utilisateur non disponible");
      return;
    }

    try {
      setIsLoading(true);
      const response = await apiClient.post<{ session_id: string }>(
        API_ENDPOINTS.SESSION.CREATE,
        { user_id: userId }
      );

      if (response && response.session_id) {
        const newSession: Session = {
          id: response.session_id,
          userId,
          status: 'active',
          metadata: {
            title: "Nouvelle conversation",
            messageCount: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            language: 'fr'
          }
        };

        setSessions(prevSessions => [newSession, ...prevSessions]);
        setCurrentSession(newSession);
        navigate(`/${userId}/session/${newSession.id}`);
      }
    } catch (err) {
      console.error('Erreur création session:', err);
      setError('Impossible de créer une nouvelle session');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className={`max-w-2xl mx-auto p-4 ${className}`}>
      <div className="flex justify-between items-center mb-6">
        <h1 className={`text-2xl font-bold ${
          isDark ? 'text-white' : 'text-gray-900'
        }`}>
          Sessions de chat
        </h1>
        <button
          onClick={() => void handleNewSession()}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>Nouvelle session</span>
        </button>
      </div>

      {error && (
        <div className={`mb-4 p-4 rounded-lg ${
          isDark ? 'bg-red-900/20 text-red-400' : 'bg-red-50 text-red-600'
        }`}>
          <p>{error}</p>
          <button
            onClick={() => void loadSessions()}
            className="mt-2 text-sm underline"
          >
            Réessayer
          </button>
        </div>
      )}

      {sessions.length > 0 ? (
        <div className="space-y-4">
          {sessions.map((session) => (
            <div
              key={session.id}
              onClick={() => navigate(`/${userId}/session/${session.id}`)}
              className={`
                p-4 rounded-lg border cursor-pointer transition-all
                ${session.id === currentSessionId
                  ? isDark
                    ? 'border-blue-700 bg-blue-900/20'
                    : 'border-blue-500 bg-blue-50'
                  : isDark
                    ? 'border-gray-700 hover:border-blue-700'
                    : 'border-gray-200 hover:border-blue-300'
                }
              `}
            >
              {/* ... session content ... */}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center mt-8">
          <MessageSquare className={`w-12 h-12 mx-auto mb-4 opacity-50 ${
            isDark ? 'text-gray-400' : 'text-gray-500'
          }`} />
          <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>
            Aucune session de chat
          </p>
          <p className={`text-sm mt-2 ${
            isDark ? 'text-gray-500' : 'text-gray-600'
          }`}>
            Commencez une nouvelle conversation en cliquant sur le bouton ci-dessus
          </p>
        </div>
      )}
    </div>
  );
};

export default SessionList;
