// src/components/chat/SessionList.jsx
import React from 'react';
import { BookOpen, BookClosed } from 'lucide-react';

const SessionList = ({ sessions, onSelectSession, onClose }) => {
  return (
    <div className="absolute left-0 top-16 w-64 bg-white dark:bg-gray-800 shadow-lg rounded-r-lg border-r border-t dark:border-gray-700 max-h-[80vh] overflow-y-auto z-50">
      <div className="p-4 border-b dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Sessions
        </h2>
      </div>
      {sessions?.length > 0 ? (
        <div className="p-2">
          {sessions.map((session) => (
            <div
              key={session.session_id}
              onClick={() => {
                onSelectSession(session.session_id);
                onClose?.();
              }}
              className="p-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg cursor-pointer mb-2 transition-colors"
            >
              <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                {new Date(session.timestamp).toLocaleString('fr-FR', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                {session.first_message}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-4 text-center text-gray-500 dark:text-gray-400">
          Aucune session
        </div>
      )}
    </div>
  );
};
