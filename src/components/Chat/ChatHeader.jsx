// src/components/chat/ChatHeader.jsx
import { MessageCircle } from 'lucide-react';

export const ChatHeader = ({ connected }) => {
  return (
    <header className="bg-white shadow-sm border-b px-4 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageCircle className="w-6 h-6 text-blue-600" />
          <h1 className="text-lg font-semibold">Assistant CM Manager</h1>
        </div>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${
            connected ? 'bg-green-500' : 'bg-red-500'
          }`} />
          <span className="text-sm text-gray-600">
            {connected ? 'Connecté' : 'Déconnecté'}
          </span>
        </div>
      </div>
    </header>
  );
};