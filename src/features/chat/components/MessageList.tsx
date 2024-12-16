// src/features/chat/components/MessageList.tsx

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Bot } from 'lucide-react';
import DocumentPreview from '../../documents/components/DocumentPreview';
import DocumentViewer from '../../documents/components/DocumentViewer';
import { useTheme } from '../../../shared/hooks/useTheme';
import type { Message, DocumentFragment } from '../types/chat';

interface MessageListProps {
  messages: Message[];
  isLoading: boolean;
  sessionId: string | null;
  className?: string;
}

const MessageList: React.FC<MessageListProps> = ({
  messages,
  isLoading,
  sessionId,
  className = ''
}) => {
  const [selectedDocument, setSelectedDocument] = useState<DocumentFragment | null>(null);
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  const { isDark } = useTheme();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const formatDate = useCallback((timestamp: string): string => {
    return new Intl.DateTimeFormat('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).format(new Date(timestamp));
  }, []);

  const scrollToBottom = useCallback((behavior: ScrollBehavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  }, []);

  useEffect(() => {
    if (!hasScrolledToBottom) {
      scrollToBottom('auto');
      setHasScrolledToBottom(true);
    } else {
      scrollToBottom();
    }
  }, [messages, hasScrolledToBottom, scrollToBottom]);

  const handleScroll = useCallback(() => {
    if (!containerRef.current) return;
    
    const { scrollHeight, scrollTop, clientHeight } = containerRef.current;
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
    setHasScrolledToBottom(isNearBottom);
  }, []);

  return (
    <>
      <div 
        ref={containerRef}
        onScroll={handleScroll}
        className={`h-full overflow-y-auto px-4 py-4 ${className}`}
      >
        {messages.map((msg) => (
          <div key={msg.id} className="mb-3">
            {msg.type === 'user' ? (
              <div className="flex justify-end">
                <div className="max-w-[80%]">
                  <div className="bg-blue-500/90 text-white rounded-xl px-4 py-2">
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                    <span className="text-xs opacity-75 block text-right mt-1">
                      {formatDate(msg.timestamp)}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-start">
                <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-gradient-to-br from-indigo-500 to-blue-600">
                  <Bot size={16} className="text-white" />
                </div>
                <div className="max-w-[80%] ml-3">
                  <div className={`rounded-xl px-4 py-2 ${
                    isDark 
                      ? 'bg-gray-800/90 text-gray-100' 
                      : 'bg-gray-100/90 text-gray-900'
                  }`}>
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                    
                    {msg.fragments && msg.fragments.length > 0 && (
                      <div className="mt-3 space-y-2">
                        {msg.fragments.map((doc, index) => (
                          <DocumentPreview
                            key={index}
                            document={doc}
                            onClick={() => setSelectedDocument(doc)}
                          />
                        ))}
                      </div>
                    )}

                    <div className="mt-1 flex justify-between items-center text-xs opacity-75">
                      <span>{formatDate(msg.timestamp)}</span>
                      {msg.confidence !== undefined && (
                        <span>Confiance: {(msg.confidence * 100).toFixed(0)}%</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-center py-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 dark:border-blue-400" />
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {selectedDocument && (
        <DocumentViewer 
          document={selectedDocument} 
          onClose={() => setSelectedDocument(null)} 
        />
      )}
    </>
  );
};

export default MessageList;
