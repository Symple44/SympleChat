// src/views/ChatView.jsx
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/globalStore';
import { ChatContainer } from '../components/chat/ChatContainer';
import { EmptyState } from '../components/common/EmptyState';

export const ChatView = () => {
  const navigate = useNavigate();
  const { sessions, createSession, isLoading } = useStore();

  useEffect(() => {
    const initializeChat = async () => {
      // Si pas de session active et sessions existent, rediriger vers la dernière
      if (sessions.length > 0) {
        const lastSession = sessions[0];
        navigate(`/session/${lastSession.session_id}`, { replace: true });
      }
    };

    initializeChat();
  }, [sessions, navigate]);

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
      </div>
    );
  }

  if (sessions.length === 0) {
    return <EmptyState onNewSession={createSession} />;
  }

  return <ChatContainer />;
};