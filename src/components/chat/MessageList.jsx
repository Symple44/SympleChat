import React, { useState, useRef, useEffect } from 'react';
import { Bot, User } from 'lucide-react';
import DocumentPreview from './DocumentPreview';
import DocumentViewer from './DocumentViewer';
import { useTheme } from '../../context/ThemeContext';

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
            <div className={`flex items-start gap-3 ${
              msg.type === 'user' ? 'flex-row-reverse' : 'flex-row'
            }`}>
              {/* Icône */}
              <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                msg.type === 'user' 
                  ? 'bg-blue-100 text-blue-600' 
                  : 'bg-gray-100 text-gray-600'
              }`}>
                {msg.type === 'user' ? <User size={20} /> : <Bot size={20} />}
              </div>

              {/* Message */}
              <div className={`flex-1 max-w-[80%] ${
                msg.type === 'user' ? 'ml-auto' : 'mr-auto'
              }`}>
                <div className={`rounded-lg p-4 ${
                  msg.type === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white dark:bg-gray-800 shadow-sm'
                }`}>
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                  
                  {/* Documents et fragments */}
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

                  {/* Timestamp et score de confiance */}
                  <div className="mt-2 flex justify-between items-center text-xs opacity-75">
                    <span>{formatDate(msg.timestamp)}</span>
                    {msg.type === 'assistant' && msg.confidence && (
                      <span>
                        Confiance: {(msg.confidence * 100).toFixed(0)}%
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
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
