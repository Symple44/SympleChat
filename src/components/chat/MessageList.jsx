// src/components/chat/MessageList.jsx
import React, { useState } from 'react';
import DocumentPreview from './DocumentPreview';
import DocumentViewer from './DocumentViewer';
import { useTheme } from '../../context/ThemeContext';

const MessageList = ({ messages }) => {
  const [selectedDocument, setSelectedDocument] = useState(null);
  const { isDark } = useTheme();

  return (
    <>
      <div className="h-full overflow-y-auto px-4 py-6">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex mb-4 ${
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
              <span className="text-xs opacity-75 mt-2 block">
                {msg.timestamp}
              </span>
            </div>
          </div>
        ))}
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
