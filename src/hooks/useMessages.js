// src/hooks/useMessages.js
import { useState, useEffect } from 'react';

export const useMessages = () => {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const userId = 'oweo';

  const loadMessageHistory = async () => {
    console.log('Chargement historique...');
    try {
      // Modifié pour correspondre à la route existante
      const response = await fetch('/api/chat/history/oweo', {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      });

      console.log('Status:', response.status);
      console.log('Headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const text = await response.text();
        console.error('Réponse erreur:', text);
        throw new Error(`Server error: ${response.status}`);
      }

      const data = await response.json();
      console.log('Data reçue:', data);

      const formattedMessages = data.map(msg => ({
        id: msg.id || Date.now(),
        content: msg.content || msg.response,  // Adapté selon la structure de ta réponse
        type: msg.type || (msg.query ? 'user' : 'assistant'),
        timestamp: new Date(msg.timestamp).toLocaleTimeString()
      }));

      setMessages(formattedMessages);
    } catch (err) {
      console.error('Erreur détaillée:', err);
      setError(err.message);
    }
  };

  const sendMessage = async (content) => {
    if (!content.trim() || isLoading) return;

    try {
      setIsLoading(true);

      const userMessage = {
        id: Date.now(),
        content,
        type: 'user',
        timestamp: new Date().toLocaleTimeString()
      };
      setMessages(prev => [...prev, userMessage]);

      // Modifié pour utiliser le proxy configuré
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          user_id: userId,
          query: content,
          language: 'fr'
        })
      });

      if (!response.ok) {
        const text = await response.text();
        console.error('Réponse erreur:', text);
        throw new Error(`Server error: ${response.status}`);
      }

      const data = await response.json();
      
      const assistantMessage = {
        id: Date.now() + 1,
        content: data.response,
        type: 'assistant',
        fragments: data.fragments || [],
        timestamp: new Date().toLocaleTimeString()
      };

      setMessages(prev => [...prev, assistantMessage]);
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
    sendMessage,
    isLoading,
    error
  };
};
