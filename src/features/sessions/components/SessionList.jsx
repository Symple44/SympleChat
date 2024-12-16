// src/components/chat/SessionList.jsx

import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, MessageSquare, Loader2 } from 'lucide-react';
import { useStore } from '../../../store';
import { formatRelativeTime } from '../../../shared/utils/dateFormatter';
import type { Session } from '../../../core/session/types';

interface SessionListProps {
  className?: string;
}

const SessionList: React.FC<SessionListProps> = ({ className = '' }) => {
  const navigate = useNavigate();
  const sessions = useStore(state => state.session.sessions);
  const currentSessionId = useStore(state => state.session.currentSessionId);
  const isLoading = useStore(state => state.session.isLoading);
  const setCurrentSession = useStore(state => state.setCurrentSession);
  const createNewSession = useStore(state => state.createNewSession);
  const loadSessions = useStore(state => state.loadSessions);

  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

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
      const newSession = await createNewSession();
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
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {session.metadata.messageCount} messages
                </span>
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