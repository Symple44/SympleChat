// src/features/chat/components/MessageInput.tsx

import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2 } from 'lucide-react';
import { APP_CONFIG } from '@/config/app.config';

interface MessageInputProps {
  onSend: (content: string) => Promise<void>;
  disabled?: boolean;
}

export const MessageInput: React.FC<MessageInputProps> = ({ 
  onSend, 
  disabled = false 
}) => {
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Ajuste automatiquement la hauteur du textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = `${Math.min(scrollHeight, 200)}px`;
    }
  }, [content]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || isLoading || disabled) return;

    try {
      setIsLoading(true);
      await onSend(content);
      setContent('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 bg-white dark:bg-gray-800">
      <div className="max-w-4xl mx-auto flex gap-4">
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => {
              const newContent = e.target.value;
              if (newContent.length <= APP_CONFIG.CHAT.MAX_MESSAGE_LENGTH) {
                setContent(newContent);
              }
            }}
            onKeyDown={handleKeyDown}
            placeholder={disabled ? "Connexion en cours..." : "Votre message..."}
            disabled={disabled || isLoading}
            className="w-full resize-none rounded-lg border dark:border-gray-600 
                     bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                     p-3 focus:outline-none focus:ring-2 focus:ring-blue-500
                     disabled:opacity-50 min-h-[44px] max-h-[200px]"
            rows={1}
          />
          {content.length > 0 && (
            <div className="absolute right-2 bottom-2 text-xs text-gray-500 dark:text-gray-400">
              {content.length}/{APP_CONFIG.CHAT.MAX_MESSAGE_LENGTH}
            </div>
          )}
        </div>
        
        <button
          type="submit"
          disabled={!content.trim() || isLoading || disabled}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 
                   disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2
                   transition-colors min-w-[100px] justify-center"
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
      </div>
    </form>
  );
};

export default MessageInput;
