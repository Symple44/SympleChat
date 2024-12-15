// src/components/chat/SessionBadge.jsx
import React from 'react';
import { Clock } from 'lucide-react';

const SessionBadge = ({ session, isActive }) => {
  const getTimeDifference = (timestamp) => {
    const now = new Date();
    const sessionTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now - sessionTime) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'À l\'instant';
    if (diffInMinutes < 60) return `${diffInMinutes}min`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h`;
    return `${Math.floor(diffInMinutes / 1440)}j`;
  };

  return (
    <div className={`flex items-center px-2 py-1 rounded-full text-xs
      ${isActive 
        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' 
        : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'}`}
    >
      <Clock className="w-3 h-3 mr-1" />
      <span>{getTimeDifference(session.timestamp)}</span>
      {session.messageCount && (
        <span className="ml-1 px-1.5 py-0.5 bg-white dark:bg-gray-700 rounded-full text-xs">
          {session.messageCount}
        </span>
      )}
    </div>
  );
};

export default SessionBadge;
