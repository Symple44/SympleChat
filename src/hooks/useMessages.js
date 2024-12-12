// src/hooks/useMessages.js
import { useState, useEffect, useCallback } from 'react';
import { config } from '../config';

export const useMessages = () => {
  const [messages, setMessages] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Formatage de la date en français
  const formatDate = useCallback((timestamp) => {
    return new Intl.DateTimeFormat('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).format(new Date(timestamp));
  }, []);

  // Création d'une nouvelle session
  const createNewSession = useCallback(async () => {
    try {
      const response = await fetch(`${config.API_BASE_URL}/sessions/new?user_id=${config.DEFAULT_USER_ID}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) throw new Error('Erreur création session');
      
      const data = await response.json();
      return data.session_id;
    } catch (err) {
      console.error('Erreur création session:', err);
      throw err;
    }
  }, []);

  // Chargement de l'historique d'une session spécifique
  const loadSessionHistory = useCallback(async (sid) => {
    try {
      const response = await fetch(`${config.API_BASE_URL}/history/session/${sid}`);
      if (!response.ok) throw new Error('Erreur chargement historique');
      
      const history = await response.json();
      const formattedMessages = history.map(msg => ({
        id: msg.id,
        content: msg.query || msg.response,
        type: msg.query ? 'user' : 'assistant',
        timestamp: formatDate(msg.timestamp),
        fragments: msg.fragments || [],
        documents_used: msg.documents_used || [],
        confidence_score: msg.confidence_score
      }));

      setMessages(formattedMessages);
    } catch (err) {
      console.error('Erreur chargement historique:', err);
      throw err;
    }
  }, [formatDate]);

  // Chargement de toutes les sessions
  const loadSessions = useCallback(async () => {
    try {
      const response = await fetch(`${config.API_BASE_URL}/history/user/${config.DEFAULT_USER_ID}`);
      if (!response.ok) throw new Error('Erreur chargement sessions');
      
      const history = await response.json();
      
      // Groupe les messages par session_id
      const sessionGroups = history.reduce((groups, msg) => {
        if (!groups[msg.session_id]) {
          groups[msg.session_id] = {
            messages: [],
            timestamp: null
          };
        }
        groups[msg.session_id].messages.push(msg);
        // Garde le timestamp le plus récent pour la session
        if (!groups[msg.session_id].timestamp || new Date(msg.timestamp) > new Date(groups[msg.session_id].timestamp)) {
          groups[msg.session_id].timestamp = msg.timestamp;
        }
        return groups;
      }, {});

      // Transforme les groupes en liste de sessions
      const sessionList = Object.entries(sessionGroups).map(([sid, data]) => {
        const firstMessage = data.messages.find(m => m.query)?.query || "Nouvelle conversation";
        return {
          session_id: sid,
          timestamp: data.timestamp,
          first_message: firstMessage
        };
      });

      // Trie les sessions par date décroissante
      sessionList.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      
      setSessions(sessionList);
    } catch (err) {
      console.error('Erreur chargement sessions:', err);
      throw err;
    }
  }, []);

  // Démarrage d'une nouvelle session
  const startNewSession = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Créer une nouvelle session sur le serveur
      const newSessionId = await createNewSession();
      
      // Mettre à jour l'état local
      setSessionId(newSessionId);
      setMessages([]);
      localStorage.setItem('chatSessionId', newSessionId);

      // Ajouter la nouvelle session à la liste
      setSessions(prev => [{
        session_id: newSessionId,
        timestamp: new Date().toISOString(),
        first_message: "Nouvelle conversation"
      }, ...prev]);

      return newSessionId;
    } catch (err) {
      console.error('Erreur création nouvelle session:', err);
      setError('Erreur lors de la création de la nouvelle session');
    } finally {
      setIsLoading(false);
    }
  }, [createNewSession]);

  // Sélection d'une session
  const selectSession = useCallback(async (sid) => {
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
  }, [loadSessionHistory]);

  // Envoi d'un message
  const sendMessage = useCallback(async (content) => {
    if (!content.trim() || isLoading) return;

    try {
      setIsLoading(true);
      
      // Ajoute le message utilisateur localement
      const userMessage = {
        id: Date.now(),
        content,
        type: 'user',
        timestamp: formatDate(new Date())
      };
      setMessages(prev => [...prev, userMessage]);

      // Envoie au serveur
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
      
      // Ajoute la réponse localement
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

      // Met à jour la liste des sessions
      await loadSessions();
    } catch (err) {
      console.error('Erreur envoi message:', err);
      setError('Erreur lors de l\'envoi du message');
    } finally {
      setIsLoading(false);
    }
  }, [sessionId, isLoading, formatDate, loadSessions]);

  // Initialisation
  useEffect(() => {
    const initialize = async () => {
      try {
        setIsLoading(true);
        
        // Charge d'abord toutes les sessions
        await loadSessions();
        
        // Vérifie s'il y a une session sauvegardée
        const savedSessionId = localStorage.getItem('chatSessionId');
        if (savedSessionId) {
          await selectSession(savedSessionId);
        } else {
          // Crée une nouvelle session si nécessaire
          await startNewSession();
        }
        
        setIsInitialized(true);
      } catch (err) {
        console.error('Erreur initialisation:', err);
        setError('Erreur de connexion au serveur. Veuillez réessayer.');
      } finally {
        setIsLoading(false);
      }
    };

    initialize();
  }, [loadSessions, selectSession, startNewSession]);

  return {
    messages,
    sessions,
    isLoading,
    error,
    sessionId,
    sendMessage,
    selectSession,
    startNewSession,
    isInitialized
  };
};

export default useMessages;
