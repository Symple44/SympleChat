// src/hooks/useMessages.js
import { useState, useEffect } from 'react';
import { formatTimestamp } from '../utils/dateFormatter';

const API_BASE_URL = 'http://192.168.0.15:8000/api';

export const useMessages = () => {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const userId = 'oweo';

  const loadMessageHistory = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/chat/history/${userId}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log("Réponse historique:", data);
      
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
      const response = await fetch(`${API_BASE_URL}/chat`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          user_id: userId,
          query: content,
          language: 'fr'
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Réponse du serveur:", data);

      setMessages(prev => [...prev, {
        id: Date.now(),
        content: data.response,
        type: 'assistant',
        fragments: data.fragments,
        timestamp: formatTimestamp(new Date())
      }]);
    } catch (error) {
      console.error('Erreur envoi message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadMessageHistory();
  }, []);

  return { messages, sendMessage, isLoading };
};
