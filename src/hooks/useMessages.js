// src/hooks/useMessages.js
import { useState, useEffect } from 'react';
import { formatTimestamp } from '../utils/dateFormatter';

export const useMessages = () => {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const userId = 'oweo';

  useEffect(() => {
    loadMessageHistory();
  }, []);

  const loadMessageHistory = async () => {
    try {
      const response = await fetch(`/api/chat/history/${userId}`);
      if (!response.ok) throw new Error('Erreur chargement historique');
      
      const data = await response.json();
      const formattedMessages = data.map(msg => ({
        id: msg.id || Date.now(),
        content: msg.query || msg.response,
        type: msg.query ? 'user' : 'assistant',
        timestamp: formatTimestamp(msg.timestamp)
      }));
      
      setMessages(formattedMessages);
    } catch (error) {
      console.error('Erreur chargement historique:', error);
    }
  };

  const sendMessage = async (content) => {
    if (!content.trim() || isLoading) return;

    const newMessage = {
      id: Date.now(),
      content,
      type: 'user',
      timestamp: formatTimestamp(new Date())
    };

    setMessages(prev => [...prev, newMessage]);
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          user_id: userId,
          query: content
        })
      });

      if (!response.ok) throw new Error('Erreur envoi message');

      const data = await response.json();
      setMessages(prev => [...prev, {
        id: Date.now(),
        content: data.response,
        type: 'assistant',
        timestamp: formatTimestamp(new Date())
      }]);
    } catch (error) {
      console.error('Erreur envoi message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return { messages, sendMessage, isLoading };
};