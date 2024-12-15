// src/features/chat/components/MessageInput.tsx

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Send, Loader2, PaperclipIcon } from 'lucide-react';

interface MessageInputProps {
  onSend: (message: string) => Promise<void>;
  isLoading: boolean;
  disabled: boolean;
  maxLength?: number;
  className?: string;
  placeholder?: string;
}

const MessageInput: React.FC<MessageInputProps> = ({
  onSend,
  isLoading,
  disabled,
  maxLength = 1000,
  className = '',
  placeholder = "Votre message..."
}) => {
  const [message, setMessage] = useState<string>('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Ajuster automatiquement la hauteur du textarea
  const adjustTextareaHeight = useCallback(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }, []);

  useEffect(() => {
    adjustTextareaHeight();
  }, [message, adjustTextareaHeight]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isLoading || disabled) return;

    try {
      await onSend(message);
      setMessage('');
      // Réinitialiser la hauteur du textarea
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    } catch (error) {
      console.error('Erreur envoi message:', error);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void handleSubmit(e);
    }
  };

  return (
    <div className={`border-t dark:border-gray-700 bg-white dark:bg-gray-800 p-4 ${className}`}>
      <form 
        onSubmit={handleSubmit} 
        className="max-w-3xl mx-auto flex space-x-4 items-end"
      >
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => {
              setMessage(e.target.value);
              adjustTextareaHeight();
            }}
            onKeyDown={handleKeyDown}
            maxLength={maxLength}
            rows={1}
            className="w-full rounded-lg border dark:border-gray-600 px-4 py-2
                     bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                     focus:outline-none focus:ring-2 focus:ring-blue-500
                     disabled:opacity-50 disabled:cursor-not-allowed
                     resize-none min-h-[42px] max-h-[200px]"
            placeholder={disabled ? "Connexion en cours..." : placeholder}
            disabled={disabled || isLoading}
          />
          {message.length > 0 && (
            <div className="absolute right-2 bottom-2 text-xs text-gray-500 dark:text-gray-400">
              {message.length}/{maxLength}
            </div>
          )}
        </div>
        <button
          type="submit"
          disabled={!message.trim() || isLoading || disabled}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg
                   hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed
                   flex items-center gap-2 min-w-[120px] justify-center h-[42px]"
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
