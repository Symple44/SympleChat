// src/App.jsx
import { useEffect } from 'react';
import ChatContainer from './components/chat/ChatContainer';
import useChat from './hooks/useChat';
import { updatePageTitle } from './utils/pageTitle';

function App() {
  const chatProps = useChat();
  
  useEffect(() => {
    updatePageTitle();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <ChatContainer {...chatProps} />
    </div>
  );
}

export default App;
