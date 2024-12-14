// src/components/chat/ChatContainer.jsx
import React from 'react';
import ChatHeader from './ChatHeader';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import { useMessages } from '../../hooks/useMessages';
import { useWebSocket } from '../../hooks/useWebSocket';
import { useTheme } from '../../context/ThemeContext';

const ChatContainer = () => {
  const {
    messages,
    sessions,
    isLoading,
    error,
    sessionId,
    sendMessage,
    createNewSession,
    changeSession
  } = useMessages();
  
  const { connected } = useWebSocket();
  const { isDark } = useTheme();

  return (
    <div className="flex flex-col h-screen">
      <ChatHeader 
        connected={connected}
        sessions={sessions}
        currentSessionId={sessionId}
        onNewSession={createNewSession}
        onSelectSession={changeSession}
      />
      
      <div className={`flex-1 relative overflow-hidden ${isDark ? 'bg-gray-900' : 'bg-white'}`}>
        <MessageList 
          messages={messages}
          isLoading={isLoading}
          currentSessionId={sessionId}
        />
      </div>

      <MessageInput 
        onSend={sendMessage}
        isLoading={isLoading}
        disabled={!connected || !sessionId}
      />

      {error && (
        <div className="fixed bottom-20 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded shadow-lg">
          {error}
        </div>
      )}
    </div>
  );
};

export default ChatContainer;
