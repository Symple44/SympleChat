// src/hooks/useMessages.js
import { useState, useEffect, useCallback } from 'react';
import { config } from '../config';

const generateSessionId = () => {
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
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);

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

  // Création d'une nouvelle session
  const createNewSession = async () => {
    try {
      const newSessionId = generateSessionId();
      const response = await fetch(`${config.API_BASE_URL}/sessions/new?user_id=${config.DEFAULT_USER_ID}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) {
        throw new Error('Erreur création session');
      }

      const data = await response.json();
      setSessionId(newSessionId);
      localStorage.setItem('chatSessionId', newSessionId);
      return newSessionId;
    } catch (err) {
      console.error('Erreur création session:', err);
      throw err;
    }
  };

  // Chargement des sessions
  const loadSessions = async () => {
  try {
    const response = await fetch(`${config.API_BASE_URL}/history/user/${config.DEFAULT_USER_ID}`);
    if (!response.ok) {
      throw new Error('Erreur chargement sessions');
    }
    
    const history = await response.json();
    
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

    const sessionList = Object.values(sessionMap).sort(
      (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
    );

    setSessions(sessionList);
    return sessionList;
  } catch (err) {
    console.error('Erreur chargement sessions:', err);
    throw err;
  }
};

      const sessionList = Object.values(sessionMap).sort(
        (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
      );

      setSessions(sessionList);
      return sessionList;
    } catch (err) {
      console.error('Erreur chargement sessions:', err);
      throw err;
    }
  };

  // Chargement de l'historique d'une session
  const loadSessionHistory = async (sid) => {
    try {
      setIsLoading(true);
      const response = await fetch(`${config.API_BASE_URL}/history/user/${config.DEFAULT_USER_ID}`);
      
      if (!response.ok) {
        throw new Error('Erreur chargement historique');
      }
      
      const history = await response.json();
      
      // Transformation des messages pour inclure à la fois les requêtes et les réponses
      const formattedMessages = history.flatMap(msg => {
        if (msg.session_id !== sid) return [];
        
        const messages = [];
        const timestamp = new Date(msg.timestamp);
        
        // Message de l'utilisateur
        if (msg.query) {
          messages.push({
            id: `${msg.id}-query`,
            content: msg.query,
            type: 'user',
            timestamp: formatDate(timestamp),
            originalTimestamp: timestamp
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
            originalTimestamp: new Date(timestamp.getTime() + 1000)
          });
        }
        
        return messages;
      });

      const sortedMessages = sortMessagesByTimestamp(formattedMessages);
      setMessages(sortedMessages);
    } catch (err) {
      console.error('Erreur chargement historique:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Initialisation avec retry
  const initializeWithRetry = async (retryCount = 3, delay = 1000) => {
    for (let i = 0; i < retryCount; i++) {
      try {
        setIsLoading(true);
        setError(null);

        if (i > 0) {
          await new Promise(resolve => setTimeout(resolve, delay));
        }

        await loadSessions();

        const savedSessionId = localStorage.getItem('chatSessionId');
        if (savedSessionId) {
          setSessionId(savedSessionId);
          await loadSessionHistory(savedSessionId);
        } else {
          await createNewSession();
        }

        setIsInitialized(true);
        setError(null);
        return true;

      } catch (err) {
        console.error(`Tentative ${i + 1}/${retryCount} échouée:`, err);
        if (i === retryCount - 1) {
          setError('Erreur de connexion au serveur. Veuillez réessayer.');
          throw err;
        }
      } finally {
        setIsLoading(false);
      }
    }
    return false;
  };

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

      // Mise à jour de la liste des sessions
      await loadSessions();
    } catch (err) {
      console.error('Erreur envoi message:', err);
      setError('Erreur lors de l\'envoi du message');
    } finally {
      setIsLoading(false);
    }
  }, [sessionId, isLoading]);

  // Effet d'initialisation
  useEffect(() => {
    initializeWithRetry().catch(err => {
      console.error('Erreur finale d\'initialisation:', err);
      setError('Erreur de connexion au serveur. Veuillez réessayer.');
    });
  }, []);

   const startNewSession = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Créer une nouvelle session
      const newSessionId = generateSessionId();
      await createNewSession(newSessionId);

      // Réinitialiser les messages
      setMessages([]);
      setSessionId(newSessionId);
      localStorage.setItem('chatSessionId', newSessionId);

      // Créer un objet pour la nouvelle session
      const newSession = {
        session_id: newSessionId,
        timestamp: new Date().toISOString(),
        first_message: "Nouvelle conversation",
        messages: []
      };

      // Ajouter la nouvelle session au début de la liste
      setSessions(prevSessions => [newSession, ...prevSessions]);
      
      return newSessionId;
    } catch (err) {
      console.error('Erreur création nouvelle session:', err);
      setError('Erreur lors de la création de la nouvelle session');
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    messages,
    sessions,
    isLoading,
    error,
    sessionId,
    sendMessage,
    selectSession,
    isInitialized,
    retryInitialization: () => initializeWithRetry(),
    formatDate,
    startNewSession 
  };
};

export default useMessages;
