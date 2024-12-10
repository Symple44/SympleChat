// src/components/chat/MessageList.jsx
const MessageList = ({ messages }) => (
  <div className="flex-1 overflow-y-auto p-4">
    {messages.map((message) => (
      <MessageItem key={message.id} message={message} />
    ))}
  </div>
);