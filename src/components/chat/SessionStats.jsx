// src/components/chat/SessionStats.jsx
import React from 'react';
import { BarChart2, Clock, MessageSquare, FileText } from 'lucide-react';
import { useStore } from '../../store/globalStore';

const SessionStats = ({ sessionId }) => {
  const messages = useStore(state => state.messages);

  // Calculer les statistiques
  const stats = React.useMemo(() => {
    if (!messages.length) return null;

    const sessionMessages = sessionId 
      ? messages.filter(m => m.sessionId === sessionId)
      : messages;

    const userMessages = sessionMessages.filter(m => m.type === 'user');
    const assistantMessages = sessionMessages.filter(m => m.type === 'assistant');
    
    const firstMessage = sessionMessages[0];
    const lastMessage = sessionMessages[sessionMessages.length - 1];
    const duration = lastMessage && firstMessage
      ? new Date(lastMessage.timestamp) - new Date(firstMessage.timestamp)
      : 0;

    const documentCount = sessionMessages.reduce((count, msg) => 
      count + (msg.documents?.length || 0), 0);

    return {
      totalMessages: sessionMessages.length,
      userMessages: userMessages.length,
      assistantMessages: assistantMessages.length,
      duration,
      documentCount,
      averageResponseTime: calculateAverageResponseTime(sessionMessages)
    };
  }, [messages, sessionId]);

  const calculateAverageResponseTime = (messages) => {
    let totalTime = 0;
    let count = 0;

    for (let i = 1; i < messages.length; i++) {
      if (messages[i].type === 'assistant' && messages[i-1].type === 'user') {
        const responseTime = new Date(messages[i].timestamp) - new Date(messages[i-1].timestamp);
        totalTime += responseTime;
        count++;
      }
    }

    return count > 0 ? totalTime / count : 0;
  };

  if (!stats) return null;

  const formatDuration = (ms) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
      <div className="space-y-2">
        <div className="flex items-center text-gray-500 dark:text-gray-400">
          <MessageSquare className="w-4 h-4 mr-2" />
          <span className="text-sm">Messages</span>
        </div>
        <p className="text-2xl font-semibold text-gray-900 dark:text-white">
          {stats.totalMessages}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {stats.userMessages} utilisateur / {stats.assistantMessages} assistant
        </p>
      </div>

      <div className="space-y-2">
        <div className="flex items-center text-gray-500 dark:text-gray-400">
          <Clock className="w-4 h-4 mr-2" />
          <span className="text-sm">Durée</span>
        </div>
        <p className="text-2xl font-semibold text-gray-900 dark:text-white">
          {formatDuration(stats.duration)}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Temps total de conversation
        </p>
      </div>

      <div className="space-y-2">
        <div className="flex items-center text-gray-500 dark:text-gray-400">
          <BarChart2 className="w-4 h-4 mr-2" />
          <span className="text-sm">Temps de réponse</span>
        </div>
        <p className="text-2xl font-semibold text-gray-900 dark:text-white">
          {formatDuration(stats.averageResponseTime)}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Moyenne de l'assistant
        </p>
      </div>

      <div className="space-y-2">
        <div className="flex items-center text-gray-500 dark:text-gray-400">
          <FileText className="w-4 h-4 mr-2" />
          <span className="text-sm">Documents</span>
        </div>
        <p className="text-2xl font-semibold text-gray-900 dark:text-white">
          {stats.documentCount}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Documents référencés
        </p>
      </div>
    </div>
  );
};

export default SessionStats;
