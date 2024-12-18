// src/features/chat/components/MessageList.tsx

import React, { useRef, useEffect } from 'react';
import { Bot } from 'lucide-react';
import { useTheme } from '@/shared/hooks/useTheme';
import type { Message } from '@/types/message';

interface MessageListProps {
  messages: Message[];
  isLoading?: boolean;
}

export const MessageList: React.FC<MessageListProps> = ({ 
  messages,
  isLoading 
}) => {
  const { isDark } = useTheme();
  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (endOfMessagesRef.current) {
      endOfMessagesRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const formatTimestamp = (timestamp: string): string => {
    return new Date(timestamp).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="h-full overflow-y-auto p-4 space-y-4">
      {messages.map((message) => (
        <div
          key={message.id}
          className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
        >
          {message.type === 'assistant' && (
            <div className="w-8 h-8 rounded-full flex items-center justify-center 
                          bg-gradient-to-br from-blue-500 to-blue-600 mr-2">
              <Bot className="w-4 h-4 text-white" />
            </div>
          )}

          <div className={`max-w-[70%] rounded-lg px-4 py-2
            ${message.type === 'user' 
              ? 'bg-blue-500 text-white' 
              : `${isDark ? 'bg-gray-800' : 'bg-white'} 
                 ${isDark ? 'text-gray-100' : 'text-gray-900'}`
            }`}
          >
            <div className="whitespace-pre-wrap break-words">
              {message.content}
            </div>
            
            <div className={`text-xs mt-1 
              ${message.type === 'user'
                ? 'text-blue-100'
                : isDark ? 'text-gray-400' : 'text-gray-500'
              }`}
            >
              {formatTimestamp(message.timestamp)}
            </div>

            {message.metadata?.edited && (
              <span className="text-xs italic mt-1 text-gray-400">
                (modifié)
              </span>
            )}
          </div>
        </div>
      ))}

      {/* Scrolling anchor */}
      <div ref={endOfMessagesRef} />
    </div>
  );
};

export default MessageList;
