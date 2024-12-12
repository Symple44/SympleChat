// src/hooks/useMessages.js
import { useState, useEffect, useCallback } from 'react';
import { config } from '../config';

const generateSessionId = () => {
  // Création d'un ID unique basé sur l'appareil et l'heure
  const deviceInfo = window.navigator.userAgent;
  const timestamp = Date.now();
  const randomStr = Math.random().toString(36).substring(7);
  return btoa(`${deviceInfo}-${timestamp}-${randomStr}`).substring(0, 32);
};

export const useMessages = () => {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sessionId, setSessionId] = useState(null);

  // Initialisation de la session
  useEffect(() => {
    const initializeSession = async () => {
      try {
        // Récupération ou génération du sessionId
        const savedSessionId = localStorage.getItem('chatSessionId');
        const currentDeviceId = generateSessionId();
        
        if (savedSessionId && savedSessionId.startsWith(currentDeviceId.substring(0, 10))) {
          setSessionId(savedSessionId);
          await loadSessionHistory(savedSessionId);
        } else {
          const newSessionId = currentDeviceId;
          setSessionId(newSessionId);
          localStorage.setItem('chatSessionId', newSessionId);
          await createNewSession(newSessionId);
        }
      } catch (err) {
        console.error('Erreur initialisation session:', err);
        setError('Erreur lors de l\'initialisation de la session');
      }
    };

    initializeSession();
  }, []);

  // Création d'une nouvelle session
  const createNewSession = async (sid) => {
    try {
      const response = await fetch(`${config.API_BASE_URL}/sessions/new?user_id=${config.DEFAULT_USER_ID}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) throw new Error('Erreur création session');
      return await response.json();
    } catch (err) {
      console.error('Erreur création session:', err);
      setError('Erreur lors de la création de la session');
      return null;
    }
  };

  // Formatage de la date en français
  const formatDate = (timestamp) => {
    return new Intl.DateTimeFormat('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).format(new Date(timestamp));
  };

  // Chargement de l'historique
  const loadSessionHistory = async (sid) => {
    try {
      setIsLoading(true);
      const response = await fetch(`${config.API_BASE_URL}/history/user/${config.DEFAULT_USER_ID}`);
      
      if (!response.ok) throw new Error('Erreur chargement historique');
      
      const history = await response.json();
      
      // Transformation des messages pour inclure à la fois les requêtes et les réponses
      const formattedMessages = history.flatMap(msg => {
        const messages = [];
        
        // Message de l'utilisateur
        if (msg.query) {
          messages.push({
            id: `${msg.id}-query`,
            content: msg.query,
            type: 'user',
            timestamp: formatDate(msg.timestamp)
          });
        }
        
        // Réponse de l'assistant
        if (msg.response) {
          messages.push({
            id: `${msg.id}-response`,
            content: msg.response,
            type: 'assistant',
            fragments: msg.fragments || [],
            documents_used: msg.documents_used || [],
            confidence_score: msg.confidence_score,
            timestamp: formatDate(msg.timestamp)
          });
        }
        
        return messages;
      });

      setMessages(formattedMessages);
    } catch (err) {
      console.error('Erreur chargement historique:', err);
      setError('Erreur lors du chargement de l\'historique');
    } finally {
      setIsLoading(false);
    }
  };

  // Envoi d'un message
  const sendMessage = useCallback(async (content) => {
    if (!content.trim() || isLoading) return;

    try {
      setIsLoading(true);
      
      // Ajout du message utilisateur
      const userMessage = {
        id: Date.now(),
        content,
        type: 'user',
        timestamp: formatDate(new Date())
      };
      setMessages(prev => [...prev, userMessage]);

      // Envoi au backend
      const response = await fetch(`${config.API_BASE_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: config.DEFAULT_USER_ID,
          query: content,
          session_id: sessionId,
          language: 'fr'
        })
      });

      if (!response.ok) throw new Error('Erreur communication serveur');
      
      const data = await response.json();
      
      // Ajout de la réponse de l'assistant
      const assistantMessage = {
        id: Date.now() + 1,
        content: data.response,
        type: 'assistant',
        fragments: data.fragments || [],
        documents_used: data.documents_used || [],
        confidence_score: data.confidence_score,
        timestamp: formatDate(new Date())
      };
      setMessages(prev => [...prev, assistantMessage]);

    } catch (err) {
      console.error('Erreur envoi message:', err);
      setError('Erreur lors de l\'envoi du message');
    } finally {
      setIsLoading(false);
    }
  }, [sessionId, isLoading]);

  return {
    messages,
    isLoading,
    error,
    sessionId,
    sendMessage,
    formatDate
  };
};

export default useMessages;
