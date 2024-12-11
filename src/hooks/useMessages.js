// src/hooks/useMessages.js
import { useState, useEffect } from 'react';

const API_BASE_URL = '/api';
const DEFAULT_USER_ID = 'oweo';

export const useMessages = (userId = DEFAULT_USER_ID) => {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Chargement initial de l'historique
  useEffect(() => {
    loadMessageHistory();
  }, []);

  // Chargement de l'historique
  const loadMessageHistory = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_BASE_URL}/chat/history/${userId}`);
      if (!response.ok) throw new Error('Erreur chargement historique');
      
      const data = await response.json();
      
      // Formatage des messages de l'historique
      const formattedMessages = data.map(msg => ({
        id: msg.id || Date.now(),
        content: msg.query || msg.response,
        type: msg.query ? 'user' : 'assistant',
        fragments: msg.fragments || [],
        documents_used: msg.documents_used || [],
        timestamp: new Date(msg.timestamp).toLocaleTimeString()
      }));

      setMessages(formattedMessages);
    } catch (err) {
      console.error('Erreur chargement historique:', err);
      setError('Erreur lors du chargement de l\'historique');
    } finally {
      setIsLoading(false);
    }
  };

  // Envoi d'un message
  const sendMessage = async (content) => {
    if (!content.trim() || isLoading) return;

    try {
      setIsLoading(true);
      
      // Ajout du message utilisateur à l'interface
      const userMessage = {
        id: Date.now(),
        content,
        type: 'user',
        timestamp: new Date().toLocaleTimeString()
      };
      setMessages(prev => [...prev, userMessage]);

      // Envoi au backend
      const response = await fetch(`${API_BASE_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          query: content,
          language: 'fr'
        })
      });

      if (!response.ok) throw new Error('Erreur communication serveur');
      
      const data = await response.json();

      // Ajout de la réponse à l'interface
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

  return {
    messages,
    isLoading,
    error,
    sendMessage
  };
};
