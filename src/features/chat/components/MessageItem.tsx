// src/features/chat/components/MessageItem.tsx

import React, { memo } from 'react';
import { Bot } from 'lucide-react';
import type { Message } from '../types/chat';

interface MessageItemProps {
  message: Message;
  showTimestamp?: boolean;
  className?: string;
}

const MessageItem: React.FC<MessageItemProps> = ({
  message,
  showTimestamp = true,
  className = ''
}) => {
  const formatTimestamp = (timestamp: string): string => {
    return new Intl.DateTimeFormat('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(timestamp));
  };

  const isUserMessage = message.type === 'user';

  return (
    <div
      className={`flex ${isUserMessage ? 'justify-end' : 'justify-start'} mb-4 ${className}`}
    >
      {!isUserMessage && (
        <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-gradient-to-br from-indigo-500 to-blue-600 mr-2">
          <Bot size={16} className="text-white" />
        </div>
      )}
      
      <div
        className={`max-w-[80%] rounded-lg px-4 py-2 ${
          isUserMessage
            ? 'bg-blue-600 text-white'
            : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
        }`}
      >
        <p className="whitespace-pre-wrap break-words">{message.content}</p>
        
        {showTimestamp && (
          <span className={`text-xs mt-1 block ${
            isUserMessage 
              ? 'text-blue-100 text-right' 
              : 'text-gray-500 dark:text-gray-400'
          }`}>
            {formatTimestamp(message.timestamp)}
          </span>
        )}
        
        {message.metadata?.edited && (
          <span className="text-xs italic mt-1 block text-gray-500 dark:text-gray-400">
            (modifié)
          </span>
        )}
      </div>
    </div>
  );
};

// Mémoisation du composant pour éviter les re-renders inutiles
export default memo(MessageItem, (prevProps, nextProps) => {
  return (
    prevProps.message.id === nextProps.message.id &&
    prevProps.message.content === nextProps.message.content &&
    prevProps.message.timestamp === nextProps.message.timestamp &&
    prevProps.showTimestamp === nextProps.showTimestamp &&
    prevProps.className === nextProps.className
  );
});
