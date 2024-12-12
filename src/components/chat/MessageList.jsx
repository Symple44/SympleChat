// src/components/chat/MessageList.jsx
import React, { useState, useRef, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import DocumentPreview from './DocumentPreview';
import DocumentViewer from './DocumentViewer';
import { useTheme } from '../../context/ThemeContext';
import { config } from '../../config';

const MessageList = ({ messages, isLoading }) => {
  const [selectedDocument, setSelectedDocument] = useState(null);
  const { isDark } = useTheme();
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const formatDate = (timestamp) => {
    return new Intl.DateTimeFormat('fr-FR', config.CHAT.DATE_FORMAT_OPTIONS)
      .format(new Date(timestamp));
  };

  return (
    <>
      <div className="h-full overflow-y-auto px-4 py-6">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex mb-6 ${
              msg.type === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-4 ${
                msg.type === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm'
              }`}
            >
              <p className="whitespace-pre-wrap">{msg.content}</p>
              
              {msg.type === 'assistant' && msg.fragments?.length > 0 && (
                <div className="mt-4 space-y-2">
                  {msg.fragments.map((doc, index) => (
                    <DocumentPreview
                      key={index}
                      document={doc}
                      onClick={() => setSelectedDocument(doc)}
                    />
                  ))}
                </div>
              )}

              <div className="mt-2 flex justify-between items-center text-xs opacity-75">
                <span>{formatDate(msg.timestamp)}</span>
                {msg.type === 'assistant' && msg.confidence && (
                  <span className="ml-2">
                    Confiance: {(msg.confidence * 100).toFixed(0)}%
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-center py-4">
            <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
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
