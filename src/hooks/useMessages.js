// src/hooks/useMessages.js
import { useState, useEffect } from 'react';
import { config } from '../config';

const formatMessage = (message) => {
  // Si c'est un message de l'historique
  if (message.query || message.response) {
    return {
      id: message.id || Date.now(),
      content: message.query || message.response,
      type: message.query ? 'user' : 'assistant',
      timestamp: message.timestamp || new Date().toISOString(),
      documents: message.documents_used || [],
      fragments: message.fragments || [],
      confidence: message.confidence_score
    };
  }
  
  // Si c'est un nouveau message
  return {
    id: message.id || Date.now(),
    content: message.content,
    type: message.type,
    timestamp: message.timestamp || new Date().toISOString(),
    documents: message.documents || [],
    fragments: message.fragments || [],
    confidence: message.confidence
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
        const formattedMessages = data.map(formatMessage);
        setMessages(formattedMessages);
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
      
      // Ajouter le message de l'utilisateur immédiatement
      const userMessage = formatMessage({
        content,
        type: 'user',
        timestamp: new Date().toISOString()
      });
      setMessages(prev => [...prev, userMessage]);

      // Envoyer au serveur
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
      
      // Ajouter la réponse de l'assistant
      const assistantMessage = formatMessage({
        content: data.response,
        type: 'assistant',
        documents: data.documents_used,
        fragments: data.fragments,
        confidence: data.confidence_score,
        timestamp: new Date().toISOString()
      });
      
      setMessages(prev => [...prev, assistantMessage]);
      
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
