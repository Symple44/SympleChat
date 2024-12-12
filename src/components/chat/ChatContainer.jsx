import React, { useEffect } from 'react';
import ChatHeader from './ChatHeader';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import { useMessages } from '../../hooks/useMessages';
import { useWebSocket } from '../../hooks/useWebSocket';
import { RefreshCw } from 'lucide-react';
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

  // Chargement initial des sessions et création d'une nouvelle session si nécessaire
  useEffect(() => {
    const initializeChat = async () => {
      console.log('Initialisation du chat...');
      try {
        await loadSessions();
        console.log('Sessions chargées:', sessions);
        
        // Si pas de session active et pas de sessions existantes, en créer une nouvelle
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

  // Debug info
  console.log('État actuel:', {
    sessionsCount: sessions?.length || 0,
    currentSessionId: sessionId,
    messagesCount: messages?.length || 0,
    connected,
    isLoading
  });

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center p-8 rounded-lg bg-white shadow-lg">
          <p className="text-red-600 mb-4">{error}</p>
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
      <div className="flex-1 relative overflow-hidden bg-gray-50">
        <MessageList 
          messages={messages} 
          isLoading={isLoading}
          currentSessionId={sessionId}
        />
        {/* Debug panel */}
        <div className="fixed bottom-20 left-0 right-0 bg-gray-100 p-2 text-xs font-mono border-t">
          <div className="container mx-auto flex justify-between items-center">
            <span>User: {config.CHAT.DEFAULT_USER_ID}</span>
            <span>Sessions: {sessions?.length || 0}</span>
            <span>Session ID: {sessionId || 'Aucune'}</span>
            <span>Connected: {connected ? 'Oui' : 'Non'}</span>
          </div>
        </div>
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
