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

const sortMessagesByTimestamp = (messages) => {
  return [...messages].sort((a, b) => {
    const timestampA = new Date(a.originalTimestamp).getTime();
    const timestampB = new Date(b.originalTimestamp).getTime();
    return timestampA - timestampB;
  });
};

export const useMessages = () => {
  const [messages, setMessages] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sessionId, setSessionId] = useState(null);

  // Charger la liste des sessions
  const loadSessions = async () => {
    try {
      const response = await fetch(`${config.API_BASE_URL}/history/user/${config.DEFAULT_USER_ID}`);
      if (!response.ok) throw new Error('Erreur chargement sessions');
      
      const history = await response.json();
      
      // Grouper les messages par session et extraire la première question
      const sessionMap = history.reduce((acc, msg) => {
        if (!acc[msg.session_id]) {
          acc[msg.session_id] = {
            session_id: msg.session_id,
            timestamp: msg.timestamp,
            first_message: msg.query || "Nouvelle conversation",
            messages: []
          };
        }
        acc[msg.session_id].messages.push(msg);
        return acc;
      }, {});

      // Convertir en tableau et trier par date
      const sessionList = Object.values(sessionMap).sort(
        (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
      );

      setSessions(sessionList);
    } catch (err) {
      console.error('Erreur chargement sessions:', err);
    }
  };

  // Initialisation
  useEffect(() => {
    const initializeSession = async () => {
      try {
        await loadSessions();
        const savedSessionId = localStorage.getItem('chatSessionId');
        if (savedSessionId) {
          setSessionId(savedSessionId);
          await loadSessionHistory(savedSessionId);
        } else {
          const newSessionId = generateSessionId();
          setSessionId(newSessionId);
          localStorage.setItem('chatSessionId', newSessionId);
          await createNewSession(newSessionId);
        }
      } catch (err) {
        setError('Erreur lors de l\'initialisation');
      }
    };

    initializeSession();
  }, []);

  // Sélection d'une session
  const selectSession = async (sid) => {
    try {
      setIsLoading(true);
      setSessionId(sid);
      localStorage.setItem('chatSessionId', sid);
      await loadSessionHistory(sid);
    } catch (err) {
      console.error('Erreur sélection session:', err);
      setError('Erreur lors du changement de session');
    } finally {
      setIsLoading(false);
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
        const timestamp = new Date(msg.timestamp);
        
        // Message de l'utilisateur
        if (msg.query) {
          messages.push({
            id: `${msg.id}-query`,
            content: msg.query,
            type: 'user',
            timestamp: formatDate(timestamp),
            originalTimestamp: timestamp // Garder le timestamp original pour le tri
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
            timestamp: formatDate(timestamp),
            originalTimestamp: new Date(timestamp.getTime() + 1000) // Ajouter 1 seconde pour garder l'ordre
          });
        }
        
        return messages;
      });

      // Tri des messages par ordre chronologique croissant
      const sortedMessages = sortMessagesByTimestamp(formattedMessages);
      setMessages(sortedMessages);
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
      const currentTime = new Date();
      
      // Ajout du message utilisateur
      const userMessage = {
        id: Date.now(),
        content,
        type: 'user',
        timestamp: formatDate(currentTime),
        originalTimestamp: currentTime
      };
      setMessages(prev => sortMessagesByTimestamp([...prev, userMessage]));

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
      const responseTime = new Date();
      
      // Ajout de la réponse de l'assistant
      const assistantMessage = {
        id: Date.now() + 1,
        content: data.response,
        type: 'assistant',
        fragments: data.fragments || [],
        documents_used: data.documents_used || [],
        confidence_score: data.confidence_score,
        timestamp: formatDate(responseTime),
        originalTimestamp: responseTime
      };
      setMessages(prev => sortMessagesByTimestamp([...prev, assistantMessage]));

    } catch (err) {
      console.error('Erreur envoi message:', err);
      setError('Erreur lors de l\'envoi du message');
    } finally {
      setIsLoading(false);
    }
  }, [sessionId, isLoading]);

  return {
    messages,
    sessions,
    isLoading,
    error,
    sessionId,
    sendMessage,
    formatDate,
    selectSession
  };
};

export default useMessages;
