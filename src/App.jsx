// src/App.jsx
import { Routes, Route, Navigate } from 'react-router-dom';
import ChatContainer from './components/chat/ChatContainer';
import { useChatContext } from './context/ChatContext';

function App() {
  const { currentSessionId } = useChatContext();
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      <Routes>
        <Route path="/" element={
          currentSessionId ? 
            <Navigate to={`/session/${currentSessionId}`} replace /> : 
            <ChatContainer />
        } />
        <Route path="/session/:sessionId" element={<ChatContainer />} />
      </Routes>
    </div>
  );
}

export default App;
