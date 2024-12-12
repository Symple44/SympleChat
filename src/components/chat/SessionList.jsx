// src/components/chat/SessionList.jsx
import React from 'react';
import { BookOpen, BookClosed } from 'lucide-react';

const SessionList = ({ sessions, onSelectSession, onClose }) => {
  return (
    <div className="absolute left-0 top-16 w-64 bg-white dark:bg-gray-800 shadow-lg rounded-r-lg border-r border-t dark:border-gray-700 max-h-[80vh] overflow-y-auto z-50">
      <div className="p-4 border-b dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <BookOpen className="w-5 h-5" />
          Sessions
        </h2>
      </div>
      <div className="p-2">
        {sessions.map((session) => (
          <div
            key={session.session_id}
            onClick={() => onSelectSession(session.session_id)}
            className="p-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg cursor-pointer mb-2 transition-colors"
          >
            <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
              {new Date(session.timestamp).toLocaleDateString('fr-FR', {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
              })}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
              {session.first_message}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

// Modification du ChatHeader.jsx
import React, { useState } from 'react';
import { MessageCircle, Moon, Sun, BookOpen, BookClosed } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import SessionList from './SessionList';

const ChatHeader = ({ connected, sessionId, onSelectSession, sessions }) => {
  const { isDark, toggleTheme } = useTheme();
  const [isSessionListOpen, setIsSessionListOpen] = useState(false);

  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm border-b dark:border-gray-700 px-4 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsSessionListOpen(!isSessionListOpen)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
            title={isSessionListOpen ? "Fermer la liste des sessions" : "Ouvrir la liste des sessions"}
          >
            {isSessionListOpen ? (
              <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            ) : (
              <BookClosed className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            )}
          </button>
          <div className="flex items-center gap-2">
            <MessageCircle className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
              Assistant CM Manager
            </h1>
          </div>
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
      {isSessionListOpen && (
        <SessionList
          sessions={sessions}
          onSelectSession={onSelectSession}
          onClose={() => setIsSessionListOpen(false)}
        />
      )}
    </header>
  );
};

export default ChatHeader;
