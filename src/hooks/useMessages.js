import { useState, useEffect } from 'react';

export const useMessages = () => {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const userId = 'oweo';

  const loadMessageHistory = async () => {
    try {
      const response = await fetch(`/api/chat/history/${userId}`);
      
      // Log pour debug
      const contentType = response.headers.get('content-type');
      console.log('Content-Type:', contentType);
      
      if (!response.ok) {
        const text = await response.text();
        console.error('Response error:', text);
        throw new Error(`Server responded with ${response.status}: ${text}`);
      }

      const data = await response.json();
      setMessages(data.map(msg => ({
        id: msg.id || Date.now(),
        content: msg.query || msg.response,
        type: msg.query ? 'user' : 'assistant',
        timestamp: new Date(msg.timestamp).toLocaleTimeString()
      })));
    } catch (err) {
      console.error('Erreur détaillée:', err);
      setError(err.message);
    }
  };

  const sendMessage = async (content) => {
    if (!content.trim() || isLoading) return;

    try {
      setIsLoading(true);
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

      // Log pour debug
      const contentType = response.headers.get('content-type');
      console.log('Response Content-Type:', contentType);

      if (!response.ok) {
        const text = await response.text();
        console.error('Server response:', text);
        throw new Error(`Server error: ${response.status}`);
      }

      const data = await response.json();
      
      const newMessages = [
        // Message utilisateur
        {
          id: Date.now(),
          content: content,
          type: 'user',
          timestamp: new Date().toLocaleTimeString()
        },
        // Réponse assistant
        {
          id: Date.now() + 1,
          content: data.response,
          type: 'assistant',
          fragments: data.fragments || [],
          timestamp: new Date().toLocaleTimeString()
        }
      ];

      setMessages(prev => [...prev, ...newMessages]);

    } catch (err) {
      console.error('Erreur détaillée:', err);
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
