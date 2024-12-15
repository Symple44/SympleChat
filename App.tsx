// src/App.tsx

import React, { useEffect } from 'react';
import { useNavigate, useParams, Outlet } from 'react-router-dom';
import { useStore } from './store';
import useChat from './features/chat/hooks/useChat';
import { updatePageTitle } from './shared/utils/pageTitle';
import { APP_CONFIG } from './config/app.config';

const App: React.FC = () => {
  const navigate = useNavigate();
  const { userId } = useParams<{ userId: string }>();
  const chatProps = useChat();
  const setError = useStore(state => state.setError);
  
  useEffect(() => {
    updatePageTitle();
  }, []);

  useEffect(() => {
    if (chatProps.sessionId) {
      console.log('Navigation vers session:', chatProps.sessionId);
      navigate(`/${userId}/session/${chatProps.sessionId}`, { replace: true });
    }
  }, [chatProps.sessionId, userId, navigate]);

  // Gestion des erreurs globales
  useEffect(() => {
    if (chatProps.error) {
      setError(chatProps.error);
    }
  }, [chatProps.error, setError]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      <Outlet context={chatProps} />
    </div>
  );
};

export default App;
