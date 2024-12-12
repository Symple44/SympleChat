// src/hooks/useMessages.js
import { useCallback } from 'react';
import useMessageStore from '../services/messages/messageStore';

export const useMessages = () => {
  const {
    messages,
    isLoading,
    error,
    currentSessionId,
    sendMessage,
    loadSessionMessages,
    clearMessages
  } = useMessageStore();

  const handleSendMessage = useCallback(async (content) => {
    if (!content.trim() || isLoading) return;
    await sendMessage(content);
  }, [isLoading, sendMessage]);

  const handleSessionChange = useCallback(async (sessionId) => {
    if (sessionId === currentSessionId) return;
    clearMessages();
    await loadSessionMessages(sessionId);
  }, [currentSessionId, clearMessages, loadSessionMessages]);

  return {
    messages,
    isLoading,
    error,
    sessionId: currentSessionId,
    sendMessage: handleSendMessage,
    changeSession: handleSessionChange
  };
};

export default useMessages;
