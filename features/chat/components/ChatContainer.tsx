// src/features/chat/components/ChatContainer.tsx

import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { RefreshCw } from 'lucide-react';
import { useStore } from '../../../store';
import ChatHeader from './ChatHeader';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import { useTheme } from '../../../shared/hooks/useTheme';
import { socketManager } from '../../../core/socket/socket';
import type { Message } from '../types/chat';

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
  const addMessage = useStore(state => state.addMessage);
  const setError = useStore(state => state.setError);
  const setCurrentSession = useStore(state => state.setCurrentSession);

  // WebSocket connection handling
  useEffect(() => {
    const handleConnect = () => {
      console.log('WebSocket connected');
    };

    const handleDisconnect = () => {
      console.log('WebSocket disconnected');
    };

    const handleMessage = (message: Message) => {
      addMessage(message);
    };

    socketManager.config.onConnect = handleConnect;
    socketManager.config.onDisconnect = handleDisconnect;
    socketManager.config.onMessage = handleMessage;

    if (!socketManager.isConnected) {
      socketManager.connect();
    }

    return () => {
      socketManager.disconnect();
    };
  }, [addMessage]);

  const handleSendMessage = async (content: string) => {
    if (!currentSessionId) {
      setError('Aucune session active');
      return;
    }

    try {
      const message: Message = {
        id: crypto.randomUUID(),
        content,
        type: 'user',
        timestamp: new Date().toISOString(),
        sessionId: currentSessionId
      };

      addMessage(message);

      // Send via WebSocket if connected
      if (socketManager.isConnected) {
        socketManager.send({
          type: 'message',
          payload: {
            content,
            sessionId: currentSessionId,
            timestamp: new Date().toISOString()
          }
        });
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur d\'envoi du message';
      setError(errorMessage);
      console.error('Error sending message:', err);
    }
  };

  const handleNewSession = async () => {
    try {
      // Navigate to sessions list
      navigate('/');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur de création de session';
      setError(errorMessage);
      console.error('Error creating session:', err);
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
        connected={socketManager.isConnected}
        sessionId={currentSessionId}
        sessions={sessions}
        onSelectSession={setCurrentSession}
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
        onSend={handleSendMessage}
        isLoading={isLoading}
        disabled={!socketManager.isConnected || !currentSessionId}
      />
    </div>
  );
};

export default ChatContainer;