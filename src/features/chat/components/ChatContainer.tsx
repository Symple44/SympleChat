// src/features/chat/components/ChatContainer.tsx

import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useStore, useCurrentSession, useSessionMessages } from '@/store/store';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { Loader2 } from 'lucide-react';
import { useTheme } from '@/shared/hooks/useTheme';
import type { Message } from '@/types/message';

const ChatContainer: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const { isDark } = useTheme();

  // Store state
  const currentSession = useCurrentSession();
  const messages = sessionId ? useSessionMessages(sessionId) : [];
  const { 
    sendMessage, 
    fetchMessages 
  } = useStore(state => ({
    sendMessage: state.sendMessage,
    fetchMessages: state.fetchMessages
  }));
  const isLoading = useStore(state => state.messages.loading);
  const error = useStore(state => state.messages.error);

  useEffect(() => {
    if (sessionId) {
      fetchMessages(sessionId);
    }
  }, [sessionId, fetchMessages]);

  const handleSendMessage = async (content: string) => {
    if (!sessionId) return;
    try {
      await sendMessage(content, sessionId);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  if (!sessionId || !currentSession) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-500 dark:text-gray-400">
          Aucune session sélectionnée
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center p-4">
          <p className="text-red-500 dark:text-red-400 mb-4">
            {error}
          </p>
          <button
            onClick={() => fetchMessages(sessionId)}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 
                     transition-colors"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Header avec titre de la session */}
      <div className="border-b dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
        <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
          {currentSession.metadata.title || "Nouvelle conversation"}
        </h1>
      </div>

      {/* Liste des messages */}
      <div className="flex-1 overflow-hidden relative">
        <MessageList
          messages={messages}
          isLoading={isLoading}
        />
        
        {isLoading && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2">
            <div className="bg-white dark:bg-gray-800 shadow-lg rounded-full px-4 py-2 
                          flex items-center space-x-2">
              <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
              <span className="text-sm text-gray-600 dark:text-gray-300">
                Chargement...
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Input pour envoyer des messages */}
      <div className="border-t dark:border-gray-700">
        <MessageInput
          onSend={handleSendMessage}
          disabled={isLoading}
        />
      </div>
    </div>
  );
};

export default ChatContainer;
