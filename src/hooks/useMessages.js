// src/hooks/useMessages.js
import { useState, useEffect } from 'react';
import { config } from '../config';

const formatMessage = (message) => {
  return {
    id: message.id || Date.now(),
    content: message.query || message.response || message.content,
    type: message.query ? 'user' : 'assistant',
    timestamp: message.timestamp || new Date().toISOString(),
    documents: message.documents_used || [],
    fragments: message.fragments || [],
    confidence: message.confidence_score
  };
};

export const useMessages = (sessionId) => {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadSessionMessages = async () => {
      if (!sessionId) return;
      
      setIsLoading(true);
      try {
        const response = await fetch(
          `${config.API.BASE_URL}${config.API.ENDPOINTS.HISTORY}/session/${sessionId}`
        );
        
        if (!response.ok) throw new Error('Erreur chargement messages');
        
        const data = await response.json();
        setMessages(data.map(formatMessage));
      } catch (err) {
        console.error('Erreur chargement messages:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    loadSessionMessages();
  }, [sessionId]);

  const sendMessage = async (content) => {
    if (!sessionId || !content.trim() || isLoading) return;

    try {
      setIsLoading(true);
      
      // Ajout du message utilisateur
      const userMessage = formatMessage({
        content,
        type: 'user',
        timestamp: new Date().toISOString()
      });
      setMessages(prev => [...prev, userMessage]);

      // Envoi au serveur
      const response = await fetch(`${config.API.BASE_URL}${config.API.ENDPOINTS.CHAT}`, {
        method: 'POST',
        headers: config.API.HEADERS,
        body: JSON.stringify({
          user_id: config.CHAT.DEFAULT_USER_ID,
          query: content,
          session_id: sessionId,
          language: config.CHAT.DEFAULT_LANGUAGE
        })
      });

      if (!response.ok) throw new Error('Erreur envoi message');
      
      const data = await response.json();
      setMessages(prev => [...prev, formatMessage({
        content: data.response,
        type: 'assistant',
        documents: data.documents_used,
        fragments: data.fragments,
        confidence: data.confidence_score,
        timestamp: new Date().toISOString()
      })]);
    } catch (err) {
      console.error('Erreur envoi message:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    messages,
    isLoading,
    error,
    sendMessage
  };
};

export default useMessages;
