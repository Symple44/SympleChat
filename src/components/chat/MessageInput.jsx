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
    <div className="border-t dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
      <form onSubmit={handleSubmit}>
        <div className="flex space-x-4">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="flex-1 rounded-lg border dark:border-gray-600 px-4 py-2
                     bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                     focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Votre message..."
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg
                     hover:bg-blue-700 disabled:opacity-50"
            disabled={isLoading || disabled}
          >
            Envoyer
          </button>
        </div>
      </form>
    </div>
  );
};

export default MessageInput;
