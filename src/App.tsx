// src/App.tsx

import React, { useEffect } from 'react';
import { useNavigate, useParams, Outlet } from 'react-router-dom';
import { useStore } from './store';
import { useWebSocket } from './shared/hooks/useWebSocket';
import { updatePageTitle } from './shared/utils/pageTitle';
import { APP_CONFIG } from './config/app.config';

const App: React.FC = () => {
  const navigate = useNavigate();
  const { userId } = useParams<{ userId: string }>();
  const sessionId = useStore(state => state.session.currentSessionId);
  const setError = useStore(state => state.setError);
  const { isConnected } = useWebSocket();

  // Update page title on mount
  useEffect(() => {
    updatePageTitle();
  }, []);

  // Session navigation effect
  useEffect(() => {
    if (sessionId) {
      console.log('Navigation vers session:', sessionId);
      navigate(`/${userId}/session/${sessionId}`, { replace: true });
    }
  }, [sessionId, userId, navigate]);

  // WebSocket connection status effect
  useEffect(() => {
    if (!isConnected) {
      setError('Connexion perdue');
    } else {
      setError(null);
    }
  }, [isConnected, setError]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      <Outlet context={{ userId, sessionId, isConnected }} />
      
      {/* Error Toast Portal Container */}
      <div id="toast-root" className="fixed bottom-4 right-4 z-50" />
      
      {/* Modal Portal Container */}
      <div id="modal-root" className="fixed inset-0 z-50" />
    </div>
  );
};

export default App;
