// src/hooks/useMessages.js
import { useState, useEffect } from 'react';

export const useMessages = () => {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const userId = 'oweo';

  const loadMessageHistory = async () => {
    try {
      console.log('Début chargement historique');
      const response = await fetch(`/api/chat/history/${userId}`);

      // Pour debug
      const contentType = response.headers.get('content-type');
      console.log('Content-Type:', contentType);

      if (!response.ok) {
        const text = await response.text();
        console.log('Réponse erreur:', text);
        throw new Error(`Erreur serveur: ${response.status}`);
      }

      const data = await response.json();
      const formattedMessages = data.map(msg => ({
        id: msg.id || Date.now(),
        content: msg.query || msg.response,
        type: msg.query ? 'user' : 'assistant',
        timestamp: new Date(msg.timestamp).toLocaleTimeString()
      }));

      setMessages(formattedMessages);
    } catch (err) {
      console.error('Erreur chargement historique:', err);
      setError('Erreur lors du chargement de l\'historique');
    }
  };

  const sendMessage = async (content) => {
    if (!content.trim() || isLoading) return;

    try {
      setIsLoading(true);

      // Message utilisateur
      const userMessage = {
        id: Date.now(),
        content,
        type: 'user',
        timestamp: new Date().toLocaleTimeString()
      };
      setMessages(prev => [...prev, userMessage]);

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
          query: content,
          language: 'fr'
        })
      });

      if (!response.ok) {
        const text = await response.text();
        console.log('Réponse erreur:', text);
        throw new Error(`Erreur serveur: ${response.status}`);
      }

      const data = await response.json();
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        content: data.response,
        type: 'assistant',
        fragments: data.fragments || [],
        timestamp: new Date().toLocaleTimeString()
      }]);

    } catch (err) {
      console.error('Erreur envoi message:', err);
      setError('Erreur lors de l\'envoi du message');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadMessageHistory();
  }, []);

  return {
    messages,
    isLoading,
    error,
    sendMessage
  };
};
