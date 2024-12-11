import { useState, useEffect, useCallback } from 'react';

const API_BASE_URL = '/api';
const DEFAULT_USER_ID = 'oweo';

export const useMessages = (userId = DEFAULT_USER_ID) => {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sessionId, setSessionId] = useState(null);

  // Initialisation de la session et chargement de l'historique
  useEffect(() => {
    const initializeSession = async () => {
      try {
        // Vérifier s'il existe une session en cours
        const savedSessionId = localStorage.getItem('chatSessionId');
        
        if (savedSessionId) {
          setSessionId(savedSessionId);
          await loadSessionHistory(savedSessionId);
        } else {
          // Créer une nouvelle session
          await createNewSession();
        }
      } catch (err) {
        setError('Erreur lors de l\'initialisation de la session');
        console.error('Erreur session:', err);
      }
    };

    initializeSession();
  }, [userId]);

  // Création d'une nouvelle session
  const createNewSession = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}sessions/new?user_id=${userId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId })
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

  // Chargement de l'historique d'une session
  const loadSessionHistory = async (sid) => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_BASE_URL}/history/session/${sid}`);
      
      if (!response.ok) throw new Error('Erreur chargement historique');
      
      const history = await response.json();
      
      // Formatage des messages
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
      setError('Erreur lors du chargement de l\'historique');
      console.error('Erreur chargement historique:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Envoi d'un message
  const sendMessage = useCallback(async (content) => {
    if (!content.trim() || !sessionId) return;

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
          session_id: sessionId,
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
        documents_used: data.documents_used || [],
        confidence_score: data.confidence_score,
        timestamp: new Date().toLocaleTimeString()
      };
      setMessages(prev => [...prev, assistantMessage]);

      // Sauvegarde dans l'historique
      await saveToHistory({
        user_message: userMessage,
        assistant_message: assistantMessage,
        session_id: sessionId
      });

    } catch (err) {
      setError('Erreur lors de l\'envoi du message');
      console.error('Erreur envoi message:', err);
    } finally {
      setIsLoading(false);
    }
  }, [sessionId, userId]);

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
