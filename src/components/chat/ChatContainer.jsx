// src/components/chat/ChatContainer.jsx
import React from 'react';
import ChatHeader from './ChatHeader';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import { useMessages } from '../../hooks/useMessages';
import { useWebSocket } from '../../hooks/useWebSocket';

// src/components/chat/ChatContainer.jsx
const ChatContainer = () => {
  const { isDark } = useTheme();
  const { messages, sendMessage, isLoading } = useMessages();
  const { connected } = useWebSocket();

  return (
    <div className="flex flex-col h-screen">
      <ChatHeader connected={connected} />
      <div className="flex-1 relative overflow-hidden bg-gray-50 dark:bg-gray-900">
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
export default ChatContainer;
