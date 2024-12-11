// src/components/chat/ChatHeader.jsx
import React from 'react';
import { MessageCircle, Moon, Sun } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const ChatHeader = ({ connected }) => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm border-b dark:border-gray-700 px-4 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageCircle className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          <h1 className="text-lg font-semibold text-gray-900 dark:text-white">Assistant CM Manager</h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${
              connected ? 'bg-green-500' : 'bg-red-500'
            }`} />
            <span className="text-sm text-gray-600 dark:text-gray-300">
              {connected ? 'Connecté' : 'Déconnecté'}
            </span>
          </div>
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            {isDark ? (
              <Sun className="w-5 h-5 text-yellow-500" />
            ) : (
              <Moon className="w-5 h-5 text-gray-600" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};

export default ChatHeader;
