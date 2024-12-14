// src/components/debug/DebugPanel.jsx
import React, { useState, useEffect } from 'react';
import { analytics } from '../../services/analytics/AnalyticsService';
import { Terminal, XCircle, ChevronUp, ChevronDown } from 'lucide-react';

const DebugPanel = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [stats, setStats] = useState({});
  const [selectedTab, setSelectedTab] = useState('general');
  const [isMinimized, setIsMinimized] = useState(true);

  useEffect(() => {
    const updateStats = () => {
      const events = analytics.getEvents();
      const errors = events.filter(e => e.category === 'error');
      const performance = events.filter(e => e.category === 'performance');

      setStats({
        totalEvents: events.length,
        errorCount: errors.length,
        averageResponseTime: calculateAverageResponseTime(performance),
        sessionCount: new Set(events.map(e => e.sessionId)).size,
        lastError: errors[errors.length - 1]
      });
    };

    updateStats();
    const interval = setInterval(updateStats, 5000);
    return () => clearInterval(interval);
  }, []);

  const calculateAverageResponseTime = (perfEvents) => {
    if (!perfEvents.length) return 0;
    const sum = perfEvents.reduce((acc, curr) => acc + curr.details.duration, 0);
    return Math.round(sum / perfEvents.length);
  };

  if (!config.DEBUG_MODE) return null;

  return (
    <div className={`fixed ${isMinimized ? 'bottom-4 right-4' : 'bottom-0 right-0'} z-50`}>
      {isMinimized ? (
        <button
          onClick={() => setIsMinimized(false)}
          className="bg-gray-800 text-white p-2 rounded-full shadow-lg hover:bg-gray-700"
          title="Ouvrir le panneau de debug"
        >
          <Terminal size={20} />
        </button>
      ) : (
        <div className="bg-gray-800 text-white rounded-tl-lg shadow-xl w-96">
          {/* Header */}
          <div className="flex justify-between items-center p-3 border-b border-gray-700">
            <h3 className="font-semibold flex items-center gap-2">
              <Terminal size={16} />
              Panneau de Debug
            </h3>
            <div className="flex gap-2">
              <button
                onClick={() => setIsMinimized(true)}
                className="p-1 hover:text-gray-300"
              >
                <ChevronDown size={16} />
              </button>
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-1 hover:text-gray-300"
              >
                {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
            </div>
          </div>

          {/* Content */}
          {isOpen && (
            <div className="p-4">
              {/* Tabs */}
              <div className="flex gap-2 mb-4">
                {['general', 'errors', 'performance'].map(tab => (
                  <button
                    key={tab}
                    onClick={() => setSelectedTab(tab)}
                    className={`px-3 py-1 rounded ${
                      selectedTab === tab 
                        ? 'bg-blue-600' 
                        : 'bg-gray-700 hover:bg-gray-600'
                    }`}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </div>

              {/* Stats */}
              <div className="space-y-2">
                {selectedTab === 'general' && (
                  <>
                    <div className="flex justify-between">
                      <span>Total événements:</span>
                      <span>{stats.totalEvents}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Sessions actives:</span>
                      <span>{stats.sessionCount}</span>
                    </div>
                  </>
                )}

                {selectedTab === 'errors' && stats.lastError && (
                  <div className="bg-red-900/30 p-2 rounded">
                    <p className="text-sm font-mono">{stats.lastError.details.error}</p>
                    <p className="text-xs opacity-75 mt-1">
                      {new Date(stats.lastError.timestamp).toLocaleString()}
                    </p>
                  </div>
                )}

                {selectedTab === 'performance' && (
                  <div className="flex justify-between">
                    <span>Temps de réponse moyen:</span>
                    <span>{stats.averageResponseTime}ms</span>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => analytics.clearEvents()}
                  className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-sm"
                >
                  Effacer les logs
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DebugPanel;
