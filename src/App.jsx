// src/App.jsx
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ChatContainer from './components/chat/ChatContainer';
import { useSessionManager } from './hooks/useSessionManager';
import { updatePageTitle } from './utils/pageTitle';

function App() {
  const navigate = useNavigate();
  const { currentSession, loadSessions, createNewSession } = useSessionManager();

  // Mise à jour du titre
  useEffect(() => {
    updatePageTitle();
  }, []);

  // Initialisation
  useEffect(() => {
    const initialize = async () => {
      await loadSessions();
      if (!currentSession) {
        const newSessionId = await createNewSession();
        if (newSessionId) {
          navigate(`/session/${newSessionId}`, { replace: true });
        }
      }
    };

    initialize();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      <ChatContainer />
    </div>
  );
}

export default App;
