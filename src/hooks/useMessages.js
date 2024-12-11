// src/hooks/useMessages.js
import { useState, useEffect } from 'react';
import { formatTimestamp } from '../utils/dateFormatter';

const API_BASE_URL = 'http://192.168.0.15:8000/api';

export const useMessages = () => {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const userId = 'oweo';

const sendMessage = async (content) => {
  if (!content.trim() || isLoading) return;

  // Création du message utilisateur
  const userMessage = {
    id: Date.now(),
    content,
    type: 'user',
    timestamp: new Date().toISOString(),
  };

  setMessages(prev => [...prev, userMessage]);
  setIsLoading(true);

  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_id: userId,
        query: content,
        session_id: null, // Si nous voulons gérer les sessions
        language: 'fr',
        application: null, // Si nous voulons filtrer par application
        context: {} // Pour le contexte supplémentaire si nécessaire
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    // Création du message assistant
    const assistantMessage = {
      id: Date.now(),
      content: data.response,
      type: 'assistant',
      fragments: data.fragments || [],
      timestamp: new Date().toISOString(),
      documents_used: data.documents_used || []
    };

    setMessages(prev => [...prev, assistantMessage]);

    // Sauvegarder dans l'historique
    await saveToHistory({
      user_message: userMessage,
      assistant_message: assistantMessage,
      documents: data.documents_used,
      confidence_score: data.confidence_score
    });

  } catch (error) {
    console.error('Erreur envoi message:', error);
  } finally {
    setIsLoading(false);
  }
};

// Fonction pour sauvegarder dans l'historique
const saveToHistory = async (chatData) => {
  try {
    const response = await fetch('/api/chat/save', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_id: userId,
        session_id: null,
        user_message: {
          content: chatData.user_message.content,
          timestamp: chatData.user_message.timestamp
        },
        assistant_message: {
          content: chatData.assistant_message.content,
          timestamp: chatData.assistant_message.timestamp,
          documents_used: chatData.documents,
          confidence_score: chatData.confidence_score
        }
      })
    });

    if (!response.ok) {
      throw new Error('Erreur de sauvegarde dans l\'historique');
    }
  } catch (error) {
    console.error('Erreur sauvegarde historique:', error);
  }
};

const loadMessageHistory = async () => {
  try {
    const response = await fetch(`/api/chat/history/${userId}`);
    if (!response.ok) throw new Error('Erreur chargement historique');
    
    const data = await response.json();
    
    // Transformation des données d'historique en format message
    const formattedMessages = data.flatMap(item => ([
      {
        id: Date.now() + '-user',
        content: item.query,
        type: 'user',
        timestamp: item.timestamp
      },
      {
        id: Date.now() + '-assistant',
        content: item.response,
        type: 'assistant',
        fragments: item.fragments || [],
        documents_used: item.documents_used || [],
        timestamp: item.timestamp
      }
    ]));

    setMessages(formattedMessages);
  } catch (error) {
    console.error('Erreur chargement historique:', error);
  }
};
    if (!content.trim() || isLoading) return;

    const newMessage = {
      id: Date.now(),
      content,
      type: 'user',
      timestamp: formatTimestamp(new Date())
    };

    setMessages(prev => [...prev, newMessage]);
    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/chat`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          user_id: userId,
          query: content,
          language: 'fr'
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Réponse du serveur:", data);

      setMessages(prev => [...prev, {
        id: Date.now(),
        content: data.response,
        type: 'assistant',
        fragments: data.fragments,
        timestamp: formatTimestamp(new Date())
      }]);
    } catch (error) {
      console.error('Erreur envoi message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadMessageHistory();
  }, []);

  return { messages, sendMessage, isLoading };
};
