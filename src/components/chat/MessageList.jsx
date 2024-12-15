// src/components/chat/MessageList.jsx
import React, { useRef, useEffect } from 'react';
import { Bot, User } from 'lucide-react';

const MessageList = ({ messages }) => {
  const bottomRef = useRef(null);

  useEffect(() => {
    // Scroll automatique vers le bas
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Garder seulement les 100 derniers messages pour la performance
  const displayMessages = messages.slice(-100);

  return (
    <div className="flex-1 overflow-y-auto p-4">
      {displayMessages.map((message) => (
        <div
          key={message.id}
          className={`flex items-start space-x-3 mb-4 ${
            message.type === 'user' ? 'flex-row-reverse' : ''
          }`}
        >
          {/* Avatar */}
          <div className={`flex-shrink-0 rounded-full p-2 ${
            message.type === 'user' 
              ? 'bg-blue-100 dark:bg-blue-900' 
              : 'bg-green-100 dark:bg-green-900'
          }`}>
            {message.type === 'user' 
              ? <User className="w-4 h-4 text-blue-600" />
              : <Bot className="w-4 h-4 text-green-600" />}
          </div>

          {/* Message */}
          <div className={`flex max-w-[80%] ${
            message.type === 'user' ? 'flex-row-reverse' : ''
          }`}>
            <div className={`rounded-lg px-4 py-2 ${
              message.type === 'user'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white'
            }`}>
              <p className="whitespace-pre-wrap">{message.content}</p>
              <span className="text-xs opacity-70 mt-1 block">
                {new Date(message.timestamp).toLocaleTimeString()}
              </span>
            </div>
          </div>
        </div>
      ))}
      <div ref={bottomRef} />
    </div>
  );
};

export default React.memo(MessageList);
