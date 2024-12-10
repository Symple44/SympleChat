// src/components/chat/MessageInput.jsx
import React, { useState } from 'react';
import { Send } from 'lucide-react';

const MessageInput = ({ onSend, isLoading, disabled }) => {
  const [message, setMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!message.trim() || isLoading || disabled) return;
    
    onSend(message);
    setMessage('');
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 border-t bg-white">
      <div className="flex gap-2">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Votre message..."
          className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
          disabled={isLoading || disabled}
        />
        <button
          type="submit"
          disabled={isLoading || disabled || !message.trim()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
    </form>
  );
};

export default MessageInput;
