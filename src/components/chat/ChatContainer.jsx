import React, { useEffect } from 'react';
import ChatHeader from './ChatHeader';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import { useMessages } from '../../hooks/useMessages';
import { useWebSocket } from '../../hooks/useWebSocket';
import { RefreshCw } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { config } from '../../config';

const ChatContainer = () => {
  const {
    messages,
    sessions,
    isLoading,
    error,
    sessionId,
    sendMessage,
    changeSession,
    loadSessions,
    createNewSession
  } = useMessages();
  
  const { connected } = useWebSocket();
  const { isDark } = useTheme();

  useEffect(() => {
    const initializeChat = async () => {
      console.log('Initialisation du chat...');
      try {
        await loadSessions();
        console.log('Sessions chargées:', sessions);
        
        if (!sessionId && (!sessions || sessions.length === 0)) {
          console.log('Création d\'une nouvelle session...');
          await createNewSession();
        }
      } catch (err) {
        console.error('Erreur d\'initialisation:', err);
      }
    };

    initializeChat();
  }, []);

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center p-8 rounded-lg bg-white dark:bg-gray-800 shadow-lg">
          <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <RefreshCw className="w-4 h-4" />
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen">
      <ChatHeader 
        connected={connected} 
        sessionId={sessionId}
        sessions={sessions}
        onSelectSession={changeSession}
        onNewSession={createNewSession}
      />
      <div className={`flex-1 relative overflow-hidden ${isDark ? 'bg-gray-900' : 'bg-white'}`}>
        <MessageList 
          messages={messages} 
          isLoading={isLoading}
          currentSessionId={sessionId}
        />
      </div>
      <MessageInput 
        onSend={sendMessage}
        isLoading={isLoading}
        disabled={!connected || !sessionId}
      />
    </div>
  );
};

export default ChatContainer;
