import React, { useState, useRef, useEffect } from 'react';
import { Bot } from 'lucide-react';
import DocumentPreview from './DocumentPreview';
import DocumentViewer from './DocumentViewer';
import { useTheme } from '../../context/ThemeContext';

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
      <div className={`h-full overflow-y-auto px-4 py-4`}>
        <div className="w-full">
          {messages.map((msg) => (
            <div key={msg.id} className="mb-3">
              {msg.type === 'user' ? (
                // Message utilisateur
                <div className="flex justify-start">
                  <div className="max-w-[80%]">
                    <div className="bg-blue-600 text-white rounded-xl px-4 py-2">
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                      <span className="text-xs opacity-75 block text-right mt-1">
                        {formatDate(msg.timestamp)}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                // Message assistant
                <div className="flex items-start pl-8">
                  <div className="flex items-start">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-gradient-to-br from-indigo-500 to-blue-600">
                      <Bot size={16} className="text-white" />
                    </div>
                    <div className="max-w-[80%] ml-3">
                      <div className={`rounded-xl px-4 py-2 ${
                        isDark 
                          ? 'bg-gray-800 text-gray-100' 
                          : 'bg-gray-100 text-gray-900'
                      }`}>
                        <p className="whitespace-pre-wrap">{msg.content}</p>
                        
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

                        <div className="mt-1 flex justify-between items-center text-xs opacity-75">
                          <span>{formatDate(msg.timestamp)}</span>
                          {msg.confidence && (
                            <span>Confiance: {(msg.confidence * 100).toFixed(0)}%</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-center py-3">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400"></div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Bandeau d'information en bas */}
        <div className="fixed bottom-16 right-4">
          <div className={`px-3 py-1 rounded-lg text-xs font-mono shadow-sm ${
            isDark 
              ? 'bg-gray-800 text-gray-300 border border-gray-700' 
              : 'bg-white text-gray-600 border border-gray-200'
          }`}>
            Session: {currentSessionId || 'Aucune'}
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
