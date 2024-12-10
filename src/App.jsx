// src/App.jsx
const App = () => {
  return (
    <ChatProvider>
      <div className="h-screen flex flex-col">
        <ChatHeader />
        <MessageList />
        <MessageInput />
      </div>
    </ChatProvider>
  );
};