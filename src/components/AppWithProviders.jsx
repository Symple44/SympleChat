// src/components/AppWithProviders.jsx
import React from 'react';
import ChatContainer from './chat/ChatContainer';
import { ChatProvider } from '../context/ChatContext';

const AppWithProviders = () => {
  return (
    <ChatProvider>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
        <ChatContainer />
      </div>
    </ChatProvider>
  );
};

export default AppWithProviders;
