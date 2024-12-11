// src/components/chat/MessageList.jsx
import React, { useState } from 'react';
import DocumentPreview from './DocumentPreview';
import DocumentViewer from './DocumentViewer';

const MessageList = ({ messages }) => {
  const [selectedDocument, setSelectedDocument] = useState(null);

  return (
    <div className={`max-w-[80%] rounded-lg p-4 ${ message.type === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white' }`}>
      <div className="h-full overflow-y-auto px-4 py-6">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex mb-4 ${
              message.type === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-4 ${
                message.type === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-900'
              }`}
            >
              <p className="whitespace-pre-wrap">{message.content}</p>
              {message.type === 'assistant' && message.fragments && message.fragments.length > 0 && (
                <div className="mt-4">
                  {message.fragments.map((doc, index) => (
                    <DocumentPreview
                      key={index}
                      document={doc}
                      onClick={() => setSelectedDocument(doc)}
                    />
                  ))}
                </div>
              )}
              <span className="text-xs opacity-75 mt-2 block">
                {message.timestamp}
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
    </div>
  );
};

export default MessageList;
