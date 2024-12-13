// src/components/chat/MessageList.jsx
import React, { useState, useRef, useEffect } from 'react';
import { Bot } from 'lucide-react';
import DocumentPreview from './DocumentPreview';
import DocumentViewer from './DocumentViewer';
import { useTheme } from '../../context/ThemeContext';
import { config } from '../../config';

const MessageList = ({ messages, isLoading, currentSessionId }) => {
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
    return new Intl.DateTimeFormat('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).format(new Date(timestamp));
  };

  return (
    <>
      <div className="h-full overflow-y-auto px-4 py-4">
        <div className="w-full max-w-3xl mx-auto">
          {messages.map((msg) => (
            <div key={msg.id} className="mb-4">
              {msg.type === 'user' ? (
                <div className="flex justify-end">
                  <div className="max-w-[80%]">
                    <div className="bg-blue-600 text-white rounded-lg px-4 py-2">
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                      <span className="text-xs opacity-75 block text-right mt-1">
                        {formatDate(msg.timestamp)}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-start">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center bg-blue-100 dark:bg-blue-900 mr-2">
                    <Bot className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="max-w-[80%]">
                    <div className="bg-gray-100 dark:bg-gray-800 rounded-lg px-4 py-2">
                      <p className="whitespace-pre-wrap text-gray-900 dark:text-gray-100">
                        {msg.content}
                      </p>
                      
                      {msg.fragments?.length > 0 && (
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

                      <div className="mt-1 flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
                        <span>{formatDate(msg.timestamp)}</span>
                        {msg.confidence && (
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
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Info session */}
        <div className="fixed bottom-20 right-4">
          <div className="px-3 py-1 rounded text-xs bg-white dark:bg-gray-800 shadow-sm border dark:border-gray-700">
            <span className="text-gray-500 dark:text-gray-400">
              Session: {currentSessionId || 'Aucune'}
            </span>
          </div>
        </div>
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
