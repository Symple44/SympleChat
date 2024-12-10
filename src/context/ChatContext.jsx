// src/context/ChatContext.jsx
const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const chatState = useChat();
  
  return (
    <ChatContext.Provider value={chatState}>
      {children}
    </ChatContext.Provider>
  );
};