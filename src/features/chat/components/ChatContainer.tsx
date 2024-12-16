// src/features/chat/components/ChatContainer.tsx

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { RefreshCw } from 'lucide-react';
import { useStore } from '../../../store';
import { useWebSocket } from '../../../shared/hooks/useWebSocket';
import { useTheme } from '../../../shared/hooks/useTheme';
import ChatHeader from './ChatHeader';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import type { Session } from '../../../core/session/types';

interface ChatContainerProps {
  className?: string;
}

const ChatContainer: React.FC<ChatContainerProps> = ({ className = '' }) => {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  
  // Store selectors
  const messages = useStore(state => state.chat.messages);
  const isLoading = useStore(state => state.chat.isLoading);
  const error = useStore(state => state.chat.error);
  const currentSessionId = useStore(state => state.session.currentSessionId);
  const sessions = useStore(state => state.session.sessions);
  
  // Store actions
  const setCurrentSession = useStore(state => state.setCurrentSession);
  const sendMessage = useStore(state => state.sendMessage);
  const setError = useStore(state => state.setError);

  // WebSocket connection
  const { isConnected } = useWebSocket();

  const handleSelectSession = (session: Session) => {
    setCurrentSession(session);
  };

  const handleNewSession = async () => {
    try {
      navigate('/');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Erreur création session');
    }
  };

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center p-8 rounded-lg bg-white dark:bg-gray-800 shadow-lg">
          <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <RefreshCw className="w-4 h-4" />
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col h-screen ${className}`}>
      <ChatHeader 
        connected={isConnected}
        sessionId={currentSessionId}
        sessions={sessions}
        onSelectSession={handleSelectSession}
        onNewSession={handleNewSession}
      />
      
      <div className={`flex-1 relative overflow-hidden ${
        isDark ? 'bg-gray-900' : 'bg-white'
      }`}>
        <MessageList 
          messages={messages} 
          isLoading={isLoading}
          sessionId={currentSessionId}
        />
      </div>

      <MessageInput 
        onSend={sendMessage}
        isLoading={isLoading}
        disabled={!isConnected || !currentSessionId}
      />
    </div>
  );
};

export default ChatContainer;
