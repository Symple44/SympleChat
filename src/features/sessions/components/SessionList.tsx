// src/components/chat/SessionList.tsx

import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, MessageSquare, Loader2, Archive } from 'lucide-react';
import { useStore } from '../../../store';
import { useTheme } from '../../../shared/hooks/useTheme';
import { formatRelativeTime } from '../../../shared/utils/dateFormatter';
import type { Session } from '../../../core/session/types';

interface SessionListProps {
  className?: string;
}

const SessionList: React.FC<SessionListProps> = ({ className = '' }) => {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const [listError, setListError] = useState<string | null>(null);
  
  const sessions = useStore(state => state.session.sessions);
  const currentSessionId = useStore(state => state.session.currentSessionId);
  const isLoading = useStore(state => state.session.isLoading);
  const setCurrentSession = useStore(state => state.setCurrentSession);
  const setSessions = useStore(state => state.setSessions);

  const fetchSessions = useCallback(async () => {
    try {
      const response = await fetch('/api/sessions');
      const data = await response.json();
      setSessions(data);
      setListError(null);
    } catch (error: unknown) {
      console.error('Erreur chargement sessions:', error);
      setListError(error instanceof Error ? error.message : 'Erreur de chargement');
    }
  }, [setSessions]);

  useEffect(() => {
    void fetchSessions();
  }, [fetchSessions]);

  const handleSessionSelect = async (session: Session) => {
    try {
      await setCurrentSession(session);
      navigate(`/session/${session.id}`);
    } catch (error) {
      console.error('Erreur sélection session:', error);
    }
  };

  const handleNewSession = async () => {
    try {
      const response = await fetch('/api/sessions', { method: 'POST' });
      const newSession = await response.json();
      setSessions([...sessions, newSession]);
      navigate(`/session/${newSession.id}`);
    } catch (error) {
      console.error('Erreur création session:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (listError) {
    return (
      <div className="max-w-2xl mx-auto p-4 text-center">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-600 dark:text-red-400">{listError}</p>
          <button
            onClick={() => void fetchSessions()}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
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
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Sessions de chat
        </h1>
        <button
          onClick={handleNewSession}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>Nouvelle session</span>
        </button>
      </div>

      {sessions.length > 0 ? (
        <div className="space-y-4">
          {sessions.map((session) => (
            <div
              key={session.id}
              onClick={() => handleSessionSelect(session)}
              className={`
                p-4 rounded-lg border cursor-pointer transition-all
                ${session.id === currentSessionId
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700'
                }
              `}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <MessageSquare className="w-5 h-5 mt-1 text-blue-500" />
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">
                      {session.metadata.title || "Nouvelle conversation"}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {formatRelativeTime(session.metadata.createdAt)}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {session.metadata.messageCount} messages
                  </span>
                  {session.status === 'archived' && (
                    <Archive className="w-4 h-4 text-gray-400" />
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center text-gray-500 dark:text-gray-400 mt-8">
          <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>Aucune session de chat</p>
          <p className="text-sm mt-2">
            Commencez une nouvelle conversation en cliquant sur le bouton ci-dessus
          </p>
        </div>
      )}
    </div>
  );
};

export default SessionList;
