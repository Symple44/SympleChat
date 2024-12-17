// src/components/chat/SessionList.tsx

import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Plus, MessageSquare, Loader2 } from 'lucide-react';
import { useStore } from '../../../store';
import { useTheme } from '../../../shared/hooks/useTheme';
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
      console.error("Pas d'userId disponible pour le chargement des sessions");
      setError("ID utilisateur non disponible");
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      console.log('Tentative de chargement des sessions pour userId:', userId);
      const response = await apiClient.get<any[]>(
        API_ENDPOINTS.USER.HISTORY(userId)
      );
      console.log('Réponse du serveur (sessions):', response);

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

      console.log('Sessions formatées:', formattedSessions);
      setSessions(formattedSessions);
      setError(null);
    } catch (err) {
      console.error('Erreur détaillée chargement sessions:', err);
      setError('Impossible de charger les sessions');
      setSessions([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    console.log('SessionList monté ou userId changé:', userId);
    void loadSessions();
  }, [userId]);

  const handleSessionSelect = async (session: Session) => {
    console.log('handleSessionSelect appelé avec:', session);
    try {
      setCurrentSession(session);
      const url = `/${userId}/session/${session.id}`;
      console.log('Navigation vers:', url);
      navigate(url);
    } catch (err) {
      console.error('Erreur détaillée sélection session:', err);
      setError('Impossible de sélectionner cette session');
    }
  };

  const handleNewSession = async () => {
    console.log('handleNewSession appelé');
    if (!userId) {
      console.error("Pas d'userId disponible pour la création");
      setError("ID utilisateur non disponible");
      return;
    }

    try {
      setIsLoading(true);
      console.log('Tentative de création de session pour userId:', userId);
      
      const response = await apiClient.post<{ session_id: string }>(
        API_ENDPOINTS.SESSION.CREATE,
        { user_id: userId }
      );
      console.log('Réponse création session:', response);

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

        console.log('Nouvelle session créée:', newSession);
        setSessions(prevSessions => [newSession, ...prevSessions]);
        setCurrentSession(newSession);
        const url = `/${userId}/session/${newSession.id}`;
        console.log('Navigation vers:', url);
        navigate(url);
      }
    } catch (err) {
      console.error('Erreur détaillée création session:', err);
      setError('Impossible de créer une nouvelle session');
    } finally {
      setIsLoading(false);
    }
  };

  console.log('SessionList rendu avec sessions:', sessions);

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
        <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Sessions de chat
        </h1>
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('Clic sur bouton nouvelle session détecté');
            void handleNewSession();
          }}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
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
            onClick={(e) => {
              e.preventDefault();
              console.log('Clic sur bouton réessayer');
              void loadSessions();
            }}
            className="mt-2 text-sm underline cursor-pointer"
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
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Clic sur session détecté:', session.id);
                void handleSessionSelect(session);
              }}
              className={`
                p-4 rounded-lg border transition-all cursor-pointer
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
                      {session.metadata.title || "Nouvelle conversation"}
                    </h3>
                    <p className={`text-sm mt-1 ${
                      isDark ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      {session.metadata.messageCount} messages
                    </p>
                  </div>
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
