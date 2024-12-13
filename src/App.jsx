// src/App.jsx
import { useEffect } from 'react';
import ChatContainer from './components/chat/ChatContainer';
import { useChatContext } from './context/ChatContext';
import useChat from './hooks/useChat';
import { updatePageTitle } from './utils/pageTitle';


function App() {
  const { currentSessionId } = useChatContext();
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      <Routes>
        {/* Redirection vers la dernière session si pas d'URL spécifique */}
        <Route path="/" element={
          currentSessionId ? 
            <Navigate to={`/session/${currentSessionId}`} replace /> : 
            <ChatContainer />
        } />
        {/* Route pour une session spécifique */}
        <Route path="/session/:sessionId" element={<ChatContainer />} />
      </Routes>
    </div>
  );
}

export default App;
