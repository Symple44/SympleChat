// src/hooks/useMessages.js
import { useState, useEffect, useCallback } from 'react';
import { config } from '../config';

export const useMessages = () => {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sessionId, setSessionId] = useState(null);

  // Initialisation de la session
  useEffect(() => {
    const initializeSession = async () => {
      try {
        const savedSessionId = localStorage.getItem('chatSessionId');
        
        if (savedSessionId) {
          setSessionId(savedSessionId);
          await loadSessionHistory(savedSessionId);
        } else {
          await createNewSession();
        }
      } catch (err) {
        setError('Erreur lors de l\'initialisation de la session');
        console.error('Erreur session:', err);
      }
    };

    initializeSession();
  }, []);

  // Création d'une nouvelle session
  const createNewSession = async () => {
    try {
      const response = await fetch(`${config.API_BASE_URL}/sessions/new?user_id=${config.DEFAULT_USER_ID}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) throw new Error('Erreur création session');
      
      const data = await response.json();
      setSessionId(data.session_id);
      localStorage.setItem('chatSessionId', data.session_id);
      
      return data.session_id;
    } catch (err) {
      setError('Erreur lors de la création de la session');
      console.error('Erreur création session:', err);
      return null;
    }
  };

  // Chargement de l'historique
  const loadSessionHistory = async (sid) => {
    try {
      setIsLoading(true);
      console.log('Loading history for session:', sid);
      const url = `${config.API_BASE_URL}/history/user/${config.DEFAULT_USER_ID}`;
      console.log('History URL:', url);
      
      const response = await fetch(url);
      
      if (!response.ok) {
        const text = await response.text();
        console.error('History error response:', text);
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const history = await response.json();
      console.log('History loaded:', history);
      
      const formattedMessages = history.map(msg => ({
        id: msg.id || Date.now(),
        content: msg.query || msg.response,
        type: msg.query ? 'user' : 'assistant',
        fragments: msg.fragments || [],
        documents_used: msg.documents_used || [],
        timestamp: new Date(msg.timestamp).toLocaleTimeString(),
        confidence_score: msg.confidence_score
      }));

      setMessages(formattedMessages);
    } catch (err) {
      console.error('Detailed error loading history:', err);
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
      
      // Ajout du message utilisateur à l'interface
      const userMessage = {
        id: Date.now(),
        content,
        type: 'user',
        timestamp: new Date().toLocaleTimeString()
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

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Erreur API:', errorText);
        throw new Error('Erreur communication serveur');
      }
      
      const data = await response.json();
      console.log('Réponse du serveur:', data);

      // Ajout de la réponse à l'interface
      const assistantMessage = {
        id: Date.now() + 1,
        content: data.response,
        type: 'assistant',
        fragments: data.fragments || [],
        documents_used: data.documents_used || [],
        confidence_score: data.confidence_score,
        timestamp: new Date().toLocaleTimeString()
      };
      setMessages(prev => [...prev, assistantMessage]);

    } catch (err) {
      console.error('Erreur envoi message:', err);
      setError('Erreur lors de l\'envoi du message');
    } finally {
      setIsLoading(false);
    }
  }, [sessionId, isLoading]);

  // Démarrage d'une nouvelle session
  const startNewSession = useCallback(async () => {
    localStorage.removeItem('chatSessionId');
    setMessages([]);
    const newSessionId = await createNewSession();
    if (newSessionId) {
      setSessionId(newSessionId);
    }
  }, []);

  return {
    messages,
    isLoading,
    error,
    sessionId,
    sendMessage,
    startNewSession
  };
};

export default useMessages;
