// src/App.tsx

import React, { useEffect } from 'react';
import { useNavigate, useParams, Outlet } from 'react-router-dom';
import { useStore } from './store';
import { useWebSocket } from './shared/hooks/useWebSocket';
import { updatePageTitle } from './shared/utils/pageTitle';

const App: React.FC = () => {
  const navigate = useNavigate();
  const { userId } = useParams<{ userId: string }>();
  const sessionId = useStore(state => state.session.currentSessionId);
  const setError = useStore(state => state.setError);
  const { isConnected } = useWebSocket();

  useEffect(() => {
    updatePageTitle();
  }, []);

  useEffect(() => {
    if (sessionId) {
      console.log('Navigation vers session:', sessionId);
      navigate(`/${userId}/session/${sessionId}`, { replace: true });
    }
  }, [sessionId, userId, navigate]);

  useEffect(() => {
    if (!isConnected) {
      setError('Connexion perdue');
    } else {
      setError(null);
    }
  }, [isConnected, setError]);

  // Voici la modification à faire dans le return
  return (
    <>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
        <Outlet context={{ userId, sessionId, isConnected }} />
      </div>
      
      {/* Portail pour les toasts */}
      <div id="toast-root" className="fixed bottom-4 right-4 z-40" />
      
      {/* Portail pour les modals */}
      <div id="modal-root" className="fixed inset-0 z-30" />
    </>
  );
};

export default App;
