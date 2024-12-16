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

  // Charger les sessions
  useEffect(() => {
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
            language: 'fr' // Langue par défaut
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

    void loadSessions();
  }, [userId, setSessions]);

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
            language: 'fr' // Langue par défaut
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

  const handleSessionSelect = async (session: Session) => {
    if (!userId) {
      setError("ID utilisateur non disponible");
      return;
    }

    try {
      setCurrentSession(session);
      navigate(`/${userId}/session/${session.id}`);
    } catch (err) {
      console.error('Erreur sélection session:', err);
      setError('Impossible de sélectionner cette session');
    }
  };

  useEffect(() => {
    void fetchSessions();
  }, [fetchSessions]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto p-4 text-center">
        <div className={`border rounded-lg p-4 ${
          isDark 
            ? 'bg-red-900/20 border-red-800 text-red-400'
            : 'bg-red-50 border-red-200 text-red-600'
        }`}>
          <p>{error}</p>
          <button
            onClick={() => void fetchSessions()}
            className={`mt-4 px-4 py-2 rounded-lg ${
              isDark 
                ? 'bg-red-700 hover:bg-red-600'
                : 'bg-red-600 hover:bg-red-700'
            } text-white`}
          >
            Réessayer
          </button>
        </div>
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

      {Array.isArray(sessions) && sessions.length > 0 ? (
        <div className="space-y-4">
          {sessions.map((session) => (
            <div
              key={session.id}
              onClick={() => void handleSessionSelect(session)}
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
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <MessageSquare className={`w-5 h-5 mt-1 ${
                    isDark ? 'text-blue-400' : 'text-blue-500'
                  }`} />
                  <div>
                    <h3 className={`font-medium ${
                      isDark ? 'text-white' : 'text-gray-900'
                    }`}>
                      {session.metadata?.title || "Nouvelle conversation"}
                    </h3>
                    {session.metadata?.createdAt && (
                      <p className={`text-sm mt-1 ${
                        isDark ? 'text-gray-400' : 'text-gray-500'
                      }`}>
                        {formatRelativeTime(session.metadata.createdAt)}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <span className={`text-sm ${
                    isDark ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    {session.metadata?.messageCount || 0} messages
                  </span>
                  {session.status === 'archived' && (
                    <Archive className={`w-4 h-4 ${
                      isDark ? 'text-gray-500' : 'text-gray-400'
                    }`} />
                  )}
                </div>
              </div>
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
