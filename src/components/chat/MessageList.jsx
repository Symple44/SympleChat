// src/components/chat/MessageList.jsx
import React, { useState, useRef, useEffect } from 'react';
import DocumentPreview from './DocumentPreview';
import DocumentViewer from './DocumentViewer';
import { useTheme } from '../../context/ThemeContext';

const MessageList = ({ messages, error }) => {
  const [selectedDocument, setSelectedDocument] = useState(null);
  const { isDark } = useTheme();
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <>
      <div className="h-full overflow-y-auto px-4 py-6">
        {error && (
          <div className="bg-red-100 dark:bg-red-900 border-red-400 text-red-700 dark:text-red-200 px-4 py-3 rounded relative my-4">
            {error}
          </div>
        )}
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
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white'
              }`}
            >
              <p className="whitespace-pre-wrap">{msg.content}</p>
              {msg.type === 'assistant' && msg.fragments && msg.fragments.length > 0 && (
                <div className="mt-4">
                  {msg.fragments.map((doc, index) => (
                    <DocumentPreview
                      key={index}
                      document={doc}
                      onClick={() => setSelectedDocument(doc)}
                    />
                  ))}
                </div>
              )}
              <span className="text-xs opacity-75 mt-2 block text-right">
                {msg.timestamp}
              </span>
            </div>
          </div>
        ))}
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
