// src/features/sessions/components/SessionList.tsx

import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Plus, MessageSquare, Loader2 } from 'lucide-react';
import { useStore } from '../../../store';
import { useTheme } from '../../../shared/hooks/useTheme';
import { useChat } from '../../../providers/ChatProvider';
import { apiClient } from '../../../core/api/client';
import { API_ENDPOINTS } from '../../../core/api/endpoints';
import type { Session } from '../../../core/session/types';

const SessionList: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const { isDark } = useTheme();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const sessions = useStore(state => state.session.sessions);
  const currentSessionId = useStore(state => state.session.currentSessionId);
  const setSessions = useStore(state => state.setSessions);
  
  // Utilisation du contexte Chat
  const { handleSessionSelect, handleNewSession } = useChat();

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

  const onSessionClick = async (session: Session) => {
    try {
      await handleSessionSelect(session);
    } catch (err) {
      setError('Impossible de sélectionner cette session');
    }
  };

  const onNewSessionClick = async () => {
    try {
      await handleNewSession();
    } catch (err) {
      setError('Impossible de créer une nouvelle session');
    }
  };

  // ... reste du code de rendu inchangé ...

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Sessions de chat
        </h1>
        <button
          onClick={() => void onNewSessionClick()}
          className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg 
                   hover:bg-blue-700 active:bg-blue-800 transform active:scale-95
                   transition-all duration-150 ease-in-out cursor-pointer
                   disabled:opacity-50 disabled:cursor-not-allowed
                   focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          disabled={isLoading}
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
            onClick={() => void onSessionClick(session)}
            className={`w-full p-4 rounded-lg border group
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
      </div>
    </div>
  );
};

export default SessionList;
