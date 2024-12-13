// src/components/chat/ChatContainer.jsx
import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import ChatHeader from './ChatHeader';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import { useChatContext } from '../../context/ChatContext';

const ChatContainer = () => {
  const { sessionId } = useParams();
  const {
    messages,
    sessions,
    isLoading,
    error,
    currentSessionId,
    connected,
    changeSession,
    createNewSession,
    sendMessage
  } = useChatContext();

  useEffect(() => {
    if (sessionId && sessionId !== currentSessionId) {
      changeSession(sessionId);
    }
  }, [sessionId, currentSessionId]);

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
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
    <>
      <ChatHeader 
        connected={connected}
        currentSessionId={currentSessionId}
        sessions={sessions}
        onSelectSession={changeSession}
        onNewSession={createNewSession}
      />
      <div className="flex-1 relative overflow-hidden">
        <MessageList 
          messages={messages} 
          isLoading={isLoading}
          currentSessionId={currentSessionId}
        />
      </div>
      <MessageInput 
        onSend={sendMessage}
        isLoading={isLoading}
        disabled={!connected || !currentSessionId}
      />
    </>
  );
};

export default ChatContainer;
