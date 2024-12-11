// src/hooks/useSession.js
import { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config';

export const useSession = (userId) => {
  const [sessionId, setSessionId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const createNewSession = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/chat/session/new`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId })
      });
      
      if (!response.ok) throw new Error('Erreur création session');
      
      const data = await response.json();
      setSessionId(data.session_id);
      localStorage.setItem('chatSessionId', data.session_id);
      return data.session_id;
    } catch (error) {
      console.error('Erreur création session:', error);
      return null;
    }
  };

  const loadSessionHistory = async (sessionId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/chat/session/${sessionId}/history`);
      if (!response.ok) throw new Error('Erreur chargement historique');
      return await response.json();
    } catch (error) {
      console.error('Erreur chargement historique:', error);
      return [];
    }
  };

  useEffect(() => {
    const initSession = async () => {
      const savedSessionId = localStorage.getItem('chatSessionId');
      if (savedSessionId) {
        setSessionId(savedSessionId);
        setIsLoading(false);
      } else {
        await createNewSession();
        setIsLoading(false);
      }
    };
    
    initSession();
  }, [userId]);

  return {
    sessionId,
    isLoading,
    createNewSession,
    loadSessionHistory
  };
};
