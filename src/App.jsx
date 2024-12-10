// src/App.jsx
import { ChatContainer } from './components/chat/ChatContainer.jsx';
import { useChat } from './hooks/useChat.js';

function App() {
  const chatProps = useChat();
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <ChatContainer {...chatProps} />
    </div>
  );
}

export default App;
