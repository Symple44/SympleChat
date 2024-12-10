// src/components/chat/MessageItem.jsx
const MessageItem = ({ message }) => (
  <div className={`flex ${message.isUser ? 'justify-end' : 'justify-start'} mb-4`}>
    <div className={`max-w-[80%] rounded-lg p-4 ${
      message.isUser ? 'bg-blue-600 text-white' : 'bg-gray-100'
    }`}>
      <p>{message.content}</p>
      <span className="text-xs opacity-75">{message.timestamp}</span>
    </div>
  </div>
);