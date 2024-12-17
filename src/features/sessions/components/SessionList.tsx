// src/features/sessions/components/SessionList.tsx

import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Plus, MessageSquare, Loader2 } from 'lucide-react';
import { useStore } from '@/store';
import { useTheme } from '@/shared/hooks/useTheme';
import { apiClient } from '@/core/api/client';
import { API_ENDPOINTS } from '@/core/api/endpoints';
import { APP_CONFIG } from '@/config/app.config';
import type { Session } from '@/core/session/types';

const SessionList: React.FC = () => {
  const navigate = useNavigate();
  const { userId } = useParams<{ userId: string }>();
  const { isDark } = useTheme();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const sessions = useStore(state => state.session.sessions);
  const currentSessionId = useStore(state => state.session.currentSessionId);
  const setCurrentSession = useStore(state => state.setCurrentSession);
  const setSessions = useStore(state => state.setSessions);

  const debug = (message: string, data?: any) => {
    if (APP_CONFIG.UI.DEBUG) {
      console.log(`[SessionList] ${message}`, data || '');
    }
  };

  const loadSessions = async () => {
  if (!userId) {
    setError("ID utilisateur non disponible");
    setIsLoading(false);
    return;
  }

  try {
    debug('Chargement des sessions pour', userId);
    setIsLoading(true);
    
    const response = await apiClient.get<Array<{
      id: string;
      query: string;
      response: string;
      timestamp: string;
      additional_data: any;
    }>>(API_ENDPOINTS.USER.HISTORY(userId));

    debug('Données brutes reçues:', response);

    const formattedSessions: Session[] = response.map(item => ({
      id: item.id,  // Utilisation directe de l'ID fourni par l'API
      userId,
      status: 'active',
      metadata: {
        title: item.query || "Nouvelle conversation",
        messageCount: 1,
        createdAt: item.timestamp,
        updatedAt: item.timestamp,
        language: 'fr'
      }
    }));

    debug('Sessions formatées:', formattedSessions);
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

  const handleSessionSelect = async (session: Session) => {
    debug('Clic sur la session', session);
    try {
      setError(null);
      debug('Mise à jour session courante');
      await setCurrentSession(session);
      
      const path = `/${userId}/session/${session.id}`;
      debug('Navigation vers', path);
      navigate(path, { replace: true });
    } catch (err) {
      console.error('Erreur sélection session:', err);
      setError('Impossible de sélectionner cette session');
    }
  };

  const handleNewSession = async () => {
    debug('Création nouvelle session');
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

      debug('Réponse création session:', response);

      if (!response?.session_id) {
        throw new Error('ID de session non reçu');
      }

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

      debug('Nouvelle session créée:', newSession);
      setSessions(prevSessions => [newSession, ...prevSessions]);
      await setCurrentSession(newSession);
      
      const path = `/${userId}/session/${newSession.id}`;
      debug('Navigation vers', path);
      navigate(path, { replace: true });
    } catch (err) {
      console.error('Erreur création session:', err);
      setError('Impossible de créer une nouvelle session');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadSessions();
  }, [userId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Sessions de chat
        </h1>
        <button
          type="button"
          onClick={() => void handleNewSession()}
          className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg 
                   hover:bg-blue-700 active:bg-blue-800 transform active:scale-95
                   transition-all duration-150 ease-in-out cursor-pointer select-none
                   focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
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
            className="mt-2 text-sm underline hover:text-red-800 
                     dark:hover:text-red-300 focus:outline-none"
          >
            Réessayer
          </button>
        </div>
      )}

      <div className="space-y-4">
        {sessions.map((session) => (
          <button
            key={session.id}
            type="button"
            onClick={() => void handleSessionSelect(session)}
            onKeyPress={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                void handleSessionSelect(session);
              }
            }}
            className={`w-full p-4 rounded-lg border group relative
              transition-all duration-150 ease-in-out
              transform hover:scale-[1.01] active:scale-[0.99]
              focus:outline-none focus:ring-2 focus:ring-blue-500
              cursor-pointer select-none
              ${session.id === currentSessionId
                ? isDark
                  ? 'border-blue-700 bg-blue-900/20'
                  : 'border-blue-500 bg-blue-50'
                : isDark
                  ? 'border-gray-700 hover:border-blue-700 hover:bg-gray-800'
                  : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
              }
            `}
          >
            <div className="flex items-start space-x-3">
              <MessageSquare className={`w-5 h-5 mt-1 transition-colors
                ${isDark ? 'text-blue-400' : 'text-blue-500'}
                group-hover:text-blue-600
              `} />
              <div className="text-left">
                <h3 className={`font-medium transition-colors
                  ${isDark ? 'text-white' : 'text-gray-900'}
                  group-hover:text-blue-600
                `}>
                  {session.metadata.title || "Nouvelle conversation"}
                </h3>
                <p className={`text-sm mt-1
                  ${isDark ? 'text-gray-400' : 'text-gray-500'}
                `}>
                  {session.metadata.messageCount} messages
                </p>
              </div>
            </div>
          </button>
        ))}

        {sessions.length === 0 && (
          <div className="text-center mt-8">
            <MessageSquare className={`w-12 h-12 mx-auto mb-4 opacity-50 ${
              isDark ? 'text-gray-400' : 'text-gray-500'
            }`} />
            <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>
              Aucune session de chat
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SessionList;
