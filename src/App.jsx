// src/App.jsx
import ChatContainer from './components/chat/ChatContainer';
import useChat from './hooks/useChat'; 

function App() {
  const chatProps = useChat();
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <ChatContainer {...chatProps} />
    </div>
  );
}

export default App;
