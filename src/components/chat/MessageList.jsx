import React, { useState, useRef, useEffect } from 'react';
import { Bot, User } from 'lucide-react';
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
      <div className="h-full overflow-y-auto px-4 py-6">
        {messages.map((msg) => (
          <div key={msg.id} className="mb-6">
            {msg.type === 'user' ? (
              // Message utilisateur
              <div className="flex justify-end items-start gap-3">
                <div className="max-w-[80%]">
                  <div className="bg-blue-600 text-white rounded-lg p-4">
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                    <span className="text-xs opacity-75 block text-right mt-2">
                      {formatDate(msg.timestamp)}
                    </span>
                  </div>
                </div>
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <User size={20} className="text-blue-600" />
                </div>
              </div>
            ) : (
              // Message assistant (réponse)
              <div className="flex items-start gap-3 pl-8">
                <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
                  <Bot size={20} className="text-indigo-600" />
                </div>
                <div className="max-w-[80%]">
                  <div className="bg-gray-50 dark:bg-gray-700 shadow-sm rounded-lg p-4">
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                    
                    {msg.fragments?.length > 0 && (
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

                    <div className="mt-2 flex justify-between items-center text-xs text-gray-500">
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
          <div className="flex justify-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        )}
        
        <div ref={messagesEndRef} />

        {/* Panneau de débogage */}
        <div className="fixed bottom-20 left-0 right-0 bg-gray-100 dark:bg-gray-800 p-2 text-xs font-mono border-t dark:border-gray-700">
          <div className="container mx-auto flex justify-between">
            <span>Utilisateur: {config.CHAT.DEFAULT_USER_ID}</span>
            <span>Session: {currentSessionId || 'Aucune session'}</span>
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
