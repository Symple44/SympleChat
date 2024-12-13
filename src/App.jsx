// src/App.jsx
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ChatContainer from './components/chat/ChatContainer';
import useChat from './hooks/useChat';
import { updatePageTitle } from './utils/pageTitle';

function App() {
  const navigate = useNavigate();
  const chatProps = useChat();
  
  useEffect(() => {
    updatePageTitle();
  }, []);

  // Effet pour gérer la navigation quand le sessionId change
  useEffect(() => {
    if (chatProps.sessionId) {
      console.log('Navigation vers session:', chatProps.sessionId);
      navigate(`/session/${chatProps.sessionId}`, { replace: true });
    }
  }, [chatProps.sessionId, navigate]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <ChatContainer {...chatProps} />
    </div>
  );
}

export default App;
