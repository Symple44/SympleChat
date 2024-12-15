// hooks/useSessionNavigation.js
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export const useSessionNavigation = () => {
  const [sessions, setSessions] = useState([]);
  const [currentSession, setCurrentSession] = useState(null);
  const navigate = useNavigate();

  const loadSessions = async () => {
    // Charger les sessions
  };

  const changeSession = (sessionId) => {
    setCurrentSession(sessionId);
    navigate(`/session/${sessionId}`);
  };

  return { sessions, currentSession, changeSession };
};
