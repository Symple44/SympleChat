import { useState, useEffect } from 'react';

export const useMessages = () => {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const userId = 'oweo';

  const loadMessageHistory = async () => {
    try {
      console.log('Chargement historique...');
      const response = await fetch(`/api/history/user/${userId}`);
      
      // Log pour debug
      console.log('Status:', response.status);
      console.log('Content-Type:', response.headers.get('content-type'));

      if (!response.ok) {
        const text = await response.text();
        console.error('Réponse erreur:', text);
        throw new Error(`Server error: ${response.status}`);
      }

      const data = await response.json();
      console.log('Data reçue:', data);

      const formattedMessages = data.map(msg => ({
        id: msg.id || Date.now(),
        content: msg.query || msg.response,
        type: msg.query ? 'user' : 'assistant',
        timestamp: new Date(msg.timestamp).toLocaleTimeString()
      }));

      setMessages(formattedMessages);
    } catch (err) {
      console.error('Erreur détaillée:', err);
      setError('Erreur lors du chargement de l\'historique');
    }
  };

  const sendMessage = async (content) => {
    if (!content.trim() || isLoading) return;

    try {
      setIsLoading(true);
      
      // Ajout du message utilisateur immédiatement
      const userMessage = {
        id: Date.now(),
        content,
        type: 'user',
        timestamp: new Date().toLocaleTimeString()
      };
      setMessages(prev => [...prev, userMessage]);

      console.log('Envoi message:', { content });
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
      console.log('Réponse reçue:', data);

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
