// src/components/chat/MessageList.jsx
import React from 'react';
import InstructionViewer from './InstructionViewer';

const MessageList = ({ messages }) => {
  const renderMessage = (message) => {
    // Si le message contient des instructions documentées
    if (message.type === 'assistant' && message.content?.steps) {
      return <InstructionViewer instructions={message.content} />;
    }
    
    // Message normal
    return <p className="whitespace-pre-wrap">{message.content}</p>;
  };

  return (
    <div className="flex flex-col gap-4 p-4 overflow-y-auto h-full">
      {messages.map((message) => (
        <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
          <div className={`max-w-[80%] rounded-lg p-4 ${
            message.type === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-100'
          }`}>
            {renderMessage(message)}
            <span className="text-xs opacity-75 mt-2 block">
              {message.timestamp}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default MessageList;
