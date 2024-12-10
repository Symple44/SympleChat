// src/components/chat/ChatContainer.jsx
import React from 'react';
import { ChatHeader } from './ChatHeader';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { useMessages } from '../../hooks/useMessages';
import { useWebSocket } from '../../hooks/useWebSocket';

export const ChatContainer = () => {
  const { messages, sendMessage, isLoading } = useMessages();
  const { connected } = useWebSocket();

  return (
    <div className="flex flex-col h-screen">
      <ChatHeader connected={connected} />
      <div className="flex-1 overflow-hidden">
        <MessageList messages={messages} />
      </div>
      <MessageInput 
        onSend={sendMessage} 
        isLoading={isLoading} 
        disabled={!connected} 
      />
    </div>
  );
};