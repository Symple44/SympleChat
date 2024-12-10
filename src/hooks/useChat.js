// src/hooks/useChat.js
import { useState, useEffect, useCallback, useRef } from 'react';
import { api } from '../services/api';

export function useChat() {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const abortControllerRef = useRef(null);

  // Chargement initial de l'historique
  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      setIsLoading(true);
      const history = await api.getHistory();
      setMessages(history.map(msg => ({
        id: msg.id || Date.now(),
        content: msg.query || msg.response,
        type: msg.query ? 'user' : 'assistant',
        timestamp: new Date(msg.timestamp).toLocaleTimeString()
      })));
    } catch (err) {
      setError('Erreur lors du chargement de l\'historique');
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async (content, useStream = false) => {
    if (!content.trim() || isLoading) return;

    // Ajout immédiat du message utilisateur
    const userMessage = {
      id: Date.now(),
      content,
      type: 'user',
      timestamp: new Date().toLocaleTimeString()
    };
    setMessages(prev => [...prev, userMessage]);

    try {
      setIsLoading(true);
      setError(null);

      if (useStream) {
        setIsStreaming(true);
        let responseContent = '';
        
        for await (const chunk of api.streamMessage(content)) {
          if (chunk.token) {
            responseContent += chunk.token;
            setMessages(prev => {
              const lastMessage = prev[prev.length - 1];
              if (lastMessage.type === 'assistant') {
                return [...prev.slice(0, -1), { ...lastMessage, content: responseContent }];
              }
              return [...prev, {
                id: Date.now(),
                content: responseContent,
                type: 'assistant',
                timestamp: new Date().toLocaleTimeString()
              }];
            });
          }
        }
      } else {
        const response = await api.sendMessage(content);
        setMessages(prev => [...prev, {
          id: Date.now(),
          content: response.response,
          type: 'assistant',
          timestamp: new Date().toLocaleTimeString()
        }]);
      }
    } catch (err) {
      setError('Erreur lors de l\'envoi du message');
      console.error(err);
    } finally {
      setIsLoading(false);
      setIsStreaming(false);
    }
  };

  const cancelStream = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsStreaming(false);
      setIsLoading(false);
    }
  }, []);

  return {
    messages,
    isLoading,
    error,
    isStreaming,
    sendMessage,
    cancelStream
  };
}