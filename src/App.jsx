// src/App.jsx
import { Outlet, useNavigate, useParams } from 'react-router-dom';
import { useEffect } from 'react';
import ChatContainer from './components/chat/ChatContainer';
import { useChatContext } from './context/ChatContext';

function App() {
  const { currentSessionId } = useChatContext();
  const navigate = useNavigate();
  const params = useParams();

  useEffect(() => {
    if (!params.sessionId && currentSessionId) {
      navigate(`/session/${currentSessionId}`);
    }
  }, [currentSessionId, params.sessionId, navigate]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      <ChatContainer />
      <Outlet />
    </div>
  );
}

export default App;
