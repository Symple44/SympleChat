// src/components/chat/ChatContainer.jsx
import React from 'react';
import ChatHeader from './ChatHeader';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import { useMessages } from '../../hooks/useMessages';
import { useWebSocket } from '../../hooks/useWebSocket';
import { useTheme } from '../../context/ThemeContext';

const ChatContainer = () => {
  const { isDark } = useTheme();
  const {
    messages,
    sessions,
    isLoading,
    error,
    sendMessage,
    sessionId,
    selectSession
  } = useMessages();
  const { connected } = useWebSocket();

  return (
    <div className="flex flex-col h-screen">
      <ChatHeader 
        connected={connected} 
        sessionId={sessionId}
        sessions={sessions}
        onSelectSession={selectSession}
      />
      <div className="flex-1 relative overflow-hidden bg-gray-50 dark:bg-gray-900">
        <MessageList 
          messages={messages} 
          error={error}
        />
      </div>
      <MessageInput 
        onSend={sendMessage}
        isLoading={isLoading}
        disabled={!connected}
      />
    </div>
  );
};

export default ChatContainer;
