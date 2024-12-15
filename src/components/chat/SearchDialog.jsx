// src/components/chat/SearchDialog.jsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, X, Calendar, Tag, Filter, Clock, 
  MessageCircle, FileText, User, Bot, Trash2,
  ChevronDown, ChevronUp, RefreshCw
} from 'lucide-react';
import { useAppService } from '../../hooks/useAppService';
import { performanceMonitor } from '../../services/performance/PerformanceMonitor';
import { eventBus, EventTypes } from '../../services/events/EventBus';
import { useDebounce } from '../../hooks/useDebounce';

const SearchDialog = ({ onClose }) => {
  const navigate = navigate();
  const [query, setQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [searchHistory, setSearchHistory] = useState([]);
  const [selectedResult, setSelectedResult] = useState(null);
  const debouncedQuery = useDebounce(query, 300);

  const [filters, setFilters] = useState({
    dateRange: {
      start: '',
      end: ''
    },
    type: 'all',
    hasDocuments: false,
    minConfidence: 0,
    onlyRead: false,
    onlyUnread: false,
  });

  const {
    messages,
    sessions,
    isLoading,
    stats,
    searchMessages
  } = useAppService();

  // Recherche avec mesure des performances
  const performSearch = useCallback(async () => {
    const perfMark = performanceMonitor.startMeasure('search');
    
    try {
      const results = await searchMessages(debouncedQuery, filters);
      
      eventBus.emit(EventTypes.SEARCH.COMPLETED, {
        query: debouncedQuery,
        resultCount: results.length,
        duration: performanceMonitor.endMeasure(perfMark)
      });

      return results;
    } catch (error) {
      console.error('Erreur recherche:', error);
      eventBus.emit(EventTypes.SEARCH.ERROR, { error: error.message });
      return [];
    }
  }, [debouncedQuery, filters, searchMessages]);

  // Résultats filtrés et triés
  const filteredResults = useMemo(() => {
    if (!messages) return [];

    return messages.filter(message => {
      // Filtrer par texte
      if (debouncedQuery && !message.content.toLowerCase().includes(debouncedQuery.toLowerCase())) {
        return false;
      }

      // Filtrer par type
      if (filters.type !== 'all' && message.type !== filters.type) {
        return false;
      }

      // Filtrer par documents
      if (filters.hasDocuments && !message.documents?.length) {
        return false;
      }

      // Filtrer par confiance
      if (message.confidence && message.confidence * 100 < filters.minConfidence) {
        return false;
      }

      // Filtrer par date
      if (filters.dateRange.start || filters.dateRange.end) {
        const messageDate = new Date(message.timestamp);
        if (filters.dateRange.start && messageDate < new Date(filters.dateRange.start)) {
          return false;
        }
        if (filters.dateRange.end && messageDate > new Date(filters.dateRange.end)) {
          return false;
        }
      }

      // Filtrer par statut de lecture
      if (filters.onlyRead && !message.read) return false;
      if (filters.onlyUnread && message.read) return false;

      return true;
    }).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }, [messages, debouncedQuery, filters]);

  // Charger l'historique de recherche
  useEffect(() => {
    const loadHistory = async () => {
      try {
        const history = await localStorage.getItem('searchHistory');
        if (history) {
          setSearchHistory(JSON.parse(history));
        }
      } catch (error) {
        console.error('Erreur chargement historique:', error);
      }
    };

    loadHistory();
  }, []);

  // Sauvegarder dans l'historique
  const saveToHistory = useCallback(async (query) => {
    if (!query.trim()) return;

    const newHistory = [
      { query, timestamp: new Date().toISOString() },
      ...searchHistory.filter(h => h.query !== query)
    ].slice(0, 10);

    setSearchHistory(newHistory);
    try {
      await localStorage.setItem('searchHistory', JSON.stringify(newHistory));
    } catch (error) {
      console.error('Erreur sauvegarde historique:', error);
    }
  }, [searchHistory]);

  // Navigation vers un résultat
  const handleResultClick = useCallback((message) => {
    const session = sessions.find(s => s.session_id === message.sessionId);
    if (session) {
      navigate(`/session/${session.session_id}`);
      
      eventBus.emit(EventTypes.SEARCH.RESULT_CLICKED, {
        messageId: message.id,
        sessionId: session.session_id
      });

      onClose();
    }
  }, [sessions, navigate, onClose]);

  // Effacer l'historique
  const clearHistory = useCallback(async () => {
    setSearchHistory([]);
    try {
      await localStorage.removeItem('searchHistory');
      
      eventBus.emit(EventTypes.SEARCH.HISTORY_CLEARED);
    } catch (error) {
      console.error('Erreur suppression historique:', error);
    }
  }, []);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/50 backdrop-blur-sm">
      <div className="container mx-auto h-full p-4 flex items-start justify-center">
        <div className="w-full max-w-3xl bg-white dark:bg-gray-800 rounded-lg shadow-xl mt-16">
          {/* Barre de recherche */}
          <div className="p-4 border-b dark:border-gray-700">
            <div className="flex items-center space-x-2">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Rechercher dans les messages..."
                  className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-700 
                           rounded-lg focus:outline-none focus:ring-2 
                           focus:ring-blue-500"
                  autoFocus
                />
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`p-2 rounded-lg ${
                  showFilters 
                    ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400' 
                    : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <Filter className="w-5 h-5" />
              </button>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Filtres */}
            {showFilters && (
              <div className="mt-4 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {/* Plage de dates */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Période
                    </label>
                    <div className="flex space-x-2">
                      <input
                        type="date"
                        value={filters.dateRange.start}
                        onChange={(e) => setFilters(f => ({
                          ...f,
                          dateRange: { ...f.dateRange, start: e.target.value }
                        }))}
                        className="flex-1 px-3 py-2 bg-gray-100 dark:bg-gray-700 
                                rounded-lg border-0"
                      />
                      <input
                        type="date"
                        value={filters.dateRange.end}
                        onChange={(e) => setFilters(f => ({
                          ...f,
                          dateRange: { ...f.dateRange, end: e.target.value }
                        }))}
                        className="flex-1 px-3 py-2 bg-gray-100 dark:bg-gray-700 
                                rounded-lg border-0"
                      />
                    </div>
                  </div>

                  {/* Type de message */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Type
                    </label>
                    <select
                      value={filters.type}
                      onChange={(e) => setFilters(f => ({ ...f, type: e.target.value }))}
                      className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 
                             rounded-lg border-0"
                    >
                      <option value="all">Tous les messages</option>
                      <option value="user">Messages utilisateur</option>
                      <option value="assistant">Réponses assistant</option>
                    </select>
                  </div>
                </div>

                {/* Autres filtres */}
                <div className="flex flex-wrap gap-4">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={filters.hasDocuments}
                      onChange={(e) => setFilters(f => ({ 
                        ...f, 
                        hasDocuments: e.target.checked 
                      }))}
                      className="rounded border-gray-300 dark:border-gray-600"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      Avec documents
                    </span>
                  </label>

                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      Confiance min:
                    </span>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={filters.minConfidence}
                      onChange={(e) => setFilters(f => ({ 
                        ...f, 
                        minConfidence: parseInt(e.target.value) 
                      }))}
                      className="w-32"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {filters.minConfidence}%
                    </span>
                  </div>

                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={filters.onlyUnread}
                      onChange={(e) => setFilters(f => ({ 
                        ...f, 
                        onlyUnread: e.target.checked,
                        onlyRead: false
                      }))}
                      className="rounded border-gray-300 dark:border-gray-600"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      Non lus uniquement
                    </span>
                  </label>
                </div>
              </div>
            )}
          </div>

          {/* Résultats */}
          <div className="max-h-[60vh] overflow-y-auto">
            {isLoading ? (
              <div className="flex justify-center py-8">
                <RefreshCw className="w-6 h-6 animate-spin text-blue-500" />
              </div>
            ) : filteredResults.length > 0 ? (
              <div className="divide-y dark:divide-gray-700">
                {filteredResults.map((message) => (
                  <div
                    key={message.id}
                    onClick={() => handleResultClick(message)}
                    className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-700 
                             cursor-pointer ${
                      message.id === selectedResult?.id 
                        ? 'bg-blue-50 dark:bg-blue-900/20' 
                        : ''
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        {message.type === 'user' ? (
                          <User className="w-4 h-4 text-blue-500" />
                        ) : (
                          <Bot className="w-4 h-4 text-green-500" />
                        )}
                        <span className="text-sm font-medium">
                          {message.type === 'user' ? 'Vous' : 'Assistant'}
                        </span>
                      </div>
                      <span className="text-xs text-gray-500">
                        {new Date(message.timestamp).toLocaleString()}
                      </span>
                    </div>

                    <p className="text-sm text-gray-900 dark:text-white line-clamp-2">
                      {message.content}
                    </p>

                    {message.documents?.length > 0 && (
                      <div className="mt-2 flex items-center space-x-2 text-xs text-gray-500">
                        <FileText className="w-4 h-4" />
                        <span>{message.documents.length} document(s)</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : query ? (
              <div className="text-center py-8 text-gray-500">
                Aucun résultat trouvé
              </div>
            ) : searchHistory.length > 0 ? (
              <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Recherches récentes
                  </h3>
                  <button
                    onClick={clearHistory}
                    className="text-xs text-gray-500 hover:text-gray-700 
                             dark:hover:text-gray-300 flex items-center space-x-1"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Effacer</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {searchHistory.map((item, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setQuery(item.query);
                        saveToHistory(item.query);
                        }}
                      className="w-full text-left p-2 hover:bg-gray-100 
                               dark:hover:bg-gray-700 rounded-lg flex items-center 
                               justify-between group"
                    >
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          {item.query}
                        </span>
                      </div>
                      <span className="text-xs text-gray-500">
                        {new Date(item.timestamp).toLocaleDateString()}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                Commencez à taper pour rechercher
              </div>
            )}
          </div>

          {/* Statistiques de recherche */}
          {stats?.search && (
            <div className="border-t dark:border-gray-700 p-4">
              <div className="flex items-center justify-between text-xs text-gray-500">
                <div className="space-x-4">
                  <span>{filteredResults.length} résultat(s)</span>
                  <span>Temps: {stats.search.lastQueryTime}ms</span>
                </div>
                {import.meta.env.DEV && (
                  <div className="space-x-4">
                    <span>Cache hits: {stats.search.cacheHits}</span>
                    <span>Index size: {stats.search.indexSize}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Raccourcis clavier */}
          <div className="border-t dark:border-gray-700 px-4 py-2">
            <div className="flex justify-between text-xs text-gray-500">
              <div className="space-x-4">
                <span>
                  <kbd className="px-1 py-0.5 bg-gray-100 dark:bg-gray-700 rounded">
                    ↑
                  </kbd>
                  <kbd className="px-1 py-0.5 bg-gray-100 dark:bg-gray-700 rounded ml-1">
                    ↓
                  </kbd>
                  {' '}pour naviguer
                </span>
                <span>
                  <kbd className="px-1 py-0.5 bg-gray-100 dark:bg-gray-700 rounded">
                    Entrée
                  </kbd>
                  {' '}pour sélectionner
                </span>
                <span>
                  <kbd className="px-1 py-0.5 bg-gray-100 dark:bg-gray-700 rounded">
                    Echap
                  </kbd>
                  {' '}pour fermer
                </span>
              </div>
              {/* Progression de l'indexation en arrière-plan */}
              {stats?.indexing?.inProgress && (
                <div className="flex items-center space-x-2">
                  <RefreshCw className="w-3 h-3 animate-spin" />
                  <span>Indexation en cours... {stats.indexing.progress}%</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Indices visuels de performance */}
      {import.meta.env.DEV && stats?.performance && (
        <div className="fixed bottom-4 right-4 bg-black/75 text-white text-xs rounded-lg px-2 py-1">
          Query time: {stats.performance.lastQueryTime}ms |
          Memory: {Math.round(stats.performance.memoryUsage / 1024 / 1024)}MB
        </div>
      )}
    </div>
  );
};

export default React.memo(SearchDialog);
