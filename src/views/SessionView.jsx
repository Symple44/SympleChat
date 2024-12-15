// src/views/SessionView.jsx
import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../store/globalStore';
import { ChatContainer } from '../components/chat/ChatContainer';
import { SessionStats } from '../components/chat/SessionStats';
import { DocumentGraph } from '../components/chat/DocumentGraph';
import { ConversationExport } from '../components/chat/ConversationExport';

export const SessionView = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const { 
    currentSession, 
    changeSession, 
    isLoading,
    error 
  } = useStore();

  useEffect(() => {
    const loadSession = async () => {
      if (sessionId && (!currentSession || currentSession.session_id !== sessionId)) {
        try {
          await changeSession(sessionId);
        } catch (error) {
          console.error('Erreur chargement session:', error);
          navigate('/', { replace: true });
        }
      }
    };

    loadSession();
  }, [sessionId, currentSession, changeSession, navigate]);

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="h-full flex">
      {/* Chat principal */}
      <div className="flex-1 overflow-hidden">
        <ChatContainer />
      </div>

      {/* Panneau latéral */}
      <div className="w-96 border-l border-gray-200 dark:border-gray-700 p-4 overflow-y-auto">
        <div className="space-y-6">
          <SessionStats sessionId={sessionId} />
          <DocumentGraph />
          <ConversationExport />
        </div>
      </div>
    </div>
  );
};