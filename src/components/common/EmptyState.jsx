// src/components/common/EmptyState.jsx
import React from 'react';
import { MessageSquare, Plus } from 'lucide-react';

const EmptyState = ({ onNewSession }) => {
  return (
    <div className="flex flex-col items-center justify-center h-full p-8 text-center">
      <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full 
                    flex items-center justify-center mb-4">
        <MessageSquare className="w-8 h-8 text-blue-600 dark:text-blue-400" />
      </div>
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
        Commencez une nouvelle conversation
      </h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 max-w-sm">
        Démarrez une nouvelle session pour interagir avec l'assistant et explorer les documents.
      </p>
      <button
        onClick={onNewSession}
        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white 
                 rounded-lg hover:bg-blue-700 transition-colors"
      >
        <Plus className="w-5 h-5 mr-2" />
        Nouvelle session
      </button>
    </div>
  );
};

export default EmptyState;
