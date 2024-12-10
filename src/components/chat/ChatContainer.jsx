// src/components/chat/ChatContainer.jsx
import React from 'react';
import ChatHeader from './ChatHeader.jsx';
import MessageList from './MessageList.jsx';
import MessageInput from './MessageInput.jsx';
import { useMessages } from '../../hooks/useMessages.js';
import { useWebSocket } from '../../hooks/useWebSocket.js';

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