// src/components/chat/ChatContainer.jsx
import React from 'react';
import ChatHeader from './ChatHeader';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import { useMessages } from '../../hooks/useMessages';
import { useWebSocket } from '../../hooks/useWebSocket';
import { useTheme } from '../../context/ThemeContext';
import { RefreshCw } from 'lucide-react';

const ChatContainer = () => {
  const { isDark } = useTheme();
  const {
    messages,
    sessions,
    isLoading,
    error,
    sendMessage,
    sessionId,
    selectSession,
    retryInitialization,
    startNewSession
  } = useMessages();
  const { connected } = useWebSocket();

  const handleNewSession = async () => {
    await startNewSession();
  };

  const renderError = () => {
    if (!error) return null;

    return (
      <div className="absolute inset-0 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center p-4">
          <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
          <button
            onClick={retryInitialization}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Réessayer
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-screen">
      <ChatHeader 
        connected={connected} 
        sessionId={sessionId}
        sessions={sessions}
        onSelectSession={selectSession}
        onNewSession={handleNewSession}
      />
      <div className="flex-1 relative overflow-hidden bg-gray-50 dark:bg-gray-900">
        {renderError()}
        {!error && (
          <MessageList 
            messages={messages} 
            error={error}
            isLoading={isLoading}
          />
        )}
      </div>
      <MessageInput 
        onSend={sendMessage}
        isLoading={isLoading}
        disabled={!connected || !!error}
      />
    </div>
  );
};

export default ChatContainer;
