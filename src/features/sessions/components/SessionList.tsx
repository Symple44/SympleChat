// src/features/sessions/components/SessionList.tsx

import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Plus, MessageSquare, Loader2 } from 'lucide-react';
import { useStore } from '@/store/store';
import { useTheme } from '@/shared/hooks/useTheme';
import type { Session } from '@/types/session';

const SessionList: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { isDark } = useTheme();

  const { 
    sessions,
    currentId,
    loading,
    error,
    fetchSessions,
    createSession,
    setCurrentSession
  } = useStore(state => ({
    sessions: Object.values(state.sessions.data),
    currentId: state.sessions.currentId,
    loading: state.sessions.loading,
    error: state.sessions.error,
    fetchSessions: state.fetchSessions,
    createSession: state.createSession,
    setCurrentSession: state.setCurrentSession
  }));

  useEffect(() => {
    if (userId) {
      void fetchSessions(userId);
    }
  }, [userId, fetchSessions]);

  const handleSessionSelect = async (session: Session) => {
    if (!userId) return;

    try {
      await setCurrentSession(session);
      navigate(`/${userId}/session/${session.id}`);
    } catch (error) {
      console.error('Error selecting session:', error);
    }
  };

  const handleNewSession = async () => {
    if (!userId) return;

    try {
      const session = await createSession(userId);
      await handleSessionSelect(session);
    } catch (error) {
      console.error('Error creating session:', error);
    }
  };

  if (loading) {
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
          onClick={() => void handleNewSession()}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white 
                   rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>Nouvelle session</span>
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-100 dark:bg-red-900/20 rounded-lg">
          <p className="text-red-600 dark:text-red-400">{error}</p>
          <button
            onClick={() => void fetchSessions(userId!)}
            className="mt-2 text-sm text-red-500 hover:text-red-600 dark:text-red-400"
          >
            Réessayer
          </button>
        </div>
      )}

      <div className="space-y-4">
        {sessions.length > 0 ? (
          sessions.map((session) => (
            <button
              key={session.id}
              onClick={() => void handleSessionSelect(session)}
              className={`w-full p-4 rounded-lg border transition-all
                ${session.id === currentId
                  ? isDark
                    ? 'border-blue-500 bg-blue-900/20'
                    : 'border-blue-500 bg-blue-50'
                  : isDark
                    ? 'border-gray-700 hover:border-blue-500 hover:bg-gray-800'
                    : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                }`}
            >
              <div className="flex items-start space-x-3">
                <MessageSquare className="w-5 h-5 mt-1 text-blue-500" />
                <div className="text-left">
                  <h3 className={`font-medium ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}>
                    {session.metadata.title || "Nouvelle conversation"}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {session.metadata.messageCount} messages
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                    {new Date(session.metadata.updatedAt).toLocaleDateString('fr-FR')}
                  </p>
                </div>
              </div>
            </button>
          ))
        ) : (
          <div className="text-center py-8">
            <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-500 dark:text-gray-400">
              Aucune session disponible
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SessionList;
