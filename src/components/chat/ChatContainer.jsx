// src/components/chat/ChatContainer.jsx
import React from 'react';
import ChatHeader from './ChatHeader';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import { useMessages } from '../../hooks/useMessages';
import { useWebSocket } from '../../hooks/useWebSocket';

const ChatContainer = () => {
  const { messages, sendMessage, isLoading } = useMessages();
  const { connected } = useWebSocket();

  return (
    <div className="flex flex-col h-screen">
      <ChatHeader connected={connected} />
      <MessageList messages={messages} />
      <MessageInput 
        onSend={sendMessage} 
        isLoading={isLoading} 
        disabled={!connected} 
      />
    </div>
  );
};

export default ChatContainer;
