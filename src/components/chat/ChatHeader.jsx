// src/components/chat/ChatHeader.jsx
import React, { useState } from 'react';
import { MessageCircle, Moon, Sun, Book, BookOpen, Plus } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { config } from '../../config';

const ChatHeader = ({ connected, sessionId, sessions, onSelectSession, onNewSession }) => {
  const { isDark, toggleTheme } = useTheme();
  const [showSessions, setShowSessions] = useState(false);

  const handleNewSession = async () => {
    try {
      await onNewSession();
      setShowSessions(false);
    } catch (error) {
      console.error('Erreur création nouvelle session:', error);
    }
  };

  const handleSessionSelect = async (sid) => {
    try {
      await onSelectSession(sid);
      setShowSessions(false);
    } catch (error) {
      console.error('Erreur sélection session:', error);
    }
  };

  return (
    <header className="relative bg-white dark:bg-gray-800 shadow-sm border-b dark:border-gray-700 px-4 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setShowSessions(!showSessions)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            title={showSessions ? "Fermer les sessions" : "Voir les sessions"}
          >
            {showSessions ? (
              <BookOpen className="w-5 h-5 text-blue-600" />
            ) : (
              <Book className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            )}
          </button>
          
          <div className="flex items-center space-x-2">
            <MessageCircle className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
              Assistant {config.APP.NAME}
            </h1>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
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

      {/* Liste des sessions */}
      {showSessions && (
        <div className="absolute left-0 top-full mt-1 w-64 bg-white dark:bg-gray-800 shadow-lg rounded-lg border dark:border-gray-700 max-h-[70vh] overflow-y-auto z-50">
          <div className="p-3 border-b dark:border-gray-700 flex justify-between items-center">
            <h2 className="font-medium text-gray-900 dark:text-white">
              Sessions ouvertes
            </h2>
            <button
              onClick={handleNewSession}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
              title="Nouvelle session"
            >
              <Plus className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </button>
          </div>
          <div className="divide-y dark:divide-gray-700">
            {sessions && sessions.length > 0 ? (
              sessions.map((session) => (
                <div
                  key={session.session_id}
                  onClick={() => handleSessionSelect(session.session_id)}
                  className={`p-3 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer 
                    ${session.session_id === sessionId ? 'bg-blue-50 dark:bg-blue-900' : ''}`}
                >
                  <p className="text-sm text-gray-900 dark:text-white mb-1">
                    {new Date(session.timestamp).toLocaleString('fr-FR', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                    {session.first_message}
                  </p>
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                Aucune session
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default ChatHeader;
