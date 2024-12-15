// src/components/chat/MessageInput.jsx
import React, { useState, useCallback } from 'react';
import { Send } from 'lucide-react';
import debounce from 'lodash/debounce';

const MessageInput = ({ onSend, isLoading }) => {
  const [message, setMessage] = useState('');

  // Debounce la notification de frappe
  const notifyTyping = useCallback(
    debounce(() => {
      console.log('Utilisateur en train d\'écrire...');
    }, 300),
    []
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!message.trim() || isLoading) return;

    onSend(message);
    setMessage('');
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 bg-white dark:bg-gray-800 border-t dark:border-gray-700">
      <div className="flex space-x-4">
        <input
          type="text"
          value={message}
          onChange={(e) => {
            setMessage(e.target.value);
            notifyTyping();
          }}
          placeholder="Votre message..."
          className="flex-1 px-4 py-2 rounded-lg border dark:border-gray-600 
                   bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                   focus:outline-none focus:ring-2 focus:ring-blue-500"
          maxLength={1000}
        />
        <button
          type="submit"
          disabled={!message.trim() || isLoading}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700
                   disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
        >
          {isLoading ? 
            <span>Envoi...</span> : 
            <>
              <Send className="w-4 h-4 mr-2" />
              <span>Envoyer</span>
            </>
          }
        </button>
      </div>
    </form>
  );
};

export default React.memo(MessageInput);
