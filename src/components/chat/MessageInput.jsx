// src/components/chat/MessageInput.jsx
import React, { useState, useCallback } from 'react';
import { Send, Loader2 } from 'lucide-react';
import { config } from '../../config';

const MessageInput = ({ onSend, isLoading, disabled }) => {
  const [message, setMessage] = useState('');

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    if (!message.trim() || isLoading || disabled) return;

    try {
      await onSend(message);
      setMessage('');
    } catch (error) {
      console.error('Erreur envoi message:', error);
    }
  }, [message, isLoading, disabled, onSend]);

  return (
    <div className="border-t dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
      <form onSubmit={handleSubmit} className="flex space-x-4">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          maxLength={config.CHAT.MAX_MESSAGE_LENGTH}
          className="flex-1 rounded-lg border dark:border-gray-600 px-4 py-2
                   bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                   focus:outline-none focus:ring-2 focus:ring-blue-500
                   disabled:opacity-50 disabled:cursor-not-allowed"
          placeholder="Votre message..."
          disabled={disabled || isLoading}
        />
        <button
          type="submit"
          disabled={!message.trim() || isLoading || disabled}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg
                   hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed
                   flex items-center gap-2 min-w-[120px] justify-center"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Envoi...</span>
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              <span>Envoyer</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default MessageInput;
