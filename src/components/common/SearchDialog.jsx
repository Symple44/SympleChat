// src/components/common/SearchDialog.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, X, Calendar, Tag, Filter, Clock, MessageCircle, 
  FileText, ThumbsUp, ThumbsDown 
} from 'lucide-react';
import { useStore } from '../../store/globalStore';
import { performanceMonitor } from '../../services/performance/PerformanceMonitor';
import { dbCache } from '../../services/storage/IndexedDBCache';

const SearchDialog = ({ onClose }) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchHistory, setSearchHistory] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    date: '',
    type: 'all',
    hasDocuments: false,
    minConfidence: 0,
    dateRange: {
      start: '',
      end: ''
    }
  });

  const { messages, sessions, changeSession } = useStore();

  // Charger l'historique des recherches
  useEffect(() => {
    const loadHistory = async () => {
      try {
        const history = await dbCache.getSearchHistory();
        setSearchHistory(history.slice(-5)); // Garder les 5 dernières recherches
      } catch (error) {
        console.error('Erreur chargement historique:', error);
      }
    };
    loadHistory();
  }, []);

  // Fonction de recherche
  const performSearch = useCallback(async (searchQuery = query) => {
    if (!searchQuery.trim() && !filters.hasDocuments) return;

    const perfMark = performanceMonitor.startMeasure('search');
    setIsSearching(true);

    try {
      // Filtrer les messages
      const filteredMessages = messages.filter(message => {
        // Recherche textuelle
        const matchesQuery = searchQuery.trim() 
          ? message.content.toLowerCase().includes(searchQuery.toLowerCase())
          : true;

        // Filtre par type
        const matchesType = filters.type === 'all' 
          ? true 
          : message.type === filters.type;

        // Filtre par documents
        const matchesDocuments = filters.hasDocuments 
          ? message.documents?.length > 0 
          : true;

        // Filtre par confiance
        const matchesConfidence = message.confidence 
          ? message.confidence * 100 >= filters.minConfidence 
          : true;

        // Filtre par date
        let matchesDate = true;
        if (filters.dateRange.start && filters.dateRange.end) {
          const messageDate = new Date(message.timestamp);
          const start = new Date(filters.dateRange.start);
          const end = new Date(filters.dateRange.end);
          matchesDate = messageDate >= start && messageDate <= end;
        }

        return matchesQuery && matchesType && matchesDocuments && 
               matchesConfidence && matchesDate;
      });

      setResults(filteredMessages);

      // Sauvegarder la recherche dans l'historique
      if (searchQuery.trim()) {
        await dbCache.saveSearchHistory({
          query: searchQuery,
          timestamp: new Date().toISOString(),
          filters: { ...filters }
        });
      }
    } catch (error) {
      console.error('Erreur recherche:', error);
    } finally {
      setIsSearching(false);
      performanceMonitor.endMeasure(perfMark);
    }
  }, [query, filters, messages]);

  // Debounce la recherche
  useEffect(() => {
    const handler = setTimeout(() => performSearch(), 300);
    return () => clearTimeout(handler);
  }, [query, filters, performSearch]);

  const handleResultClick = (message) => {
    const session = sessions.find(s => 
      s.session_id === message.sessionId
    );
    if (session) {
      changeSession(session.session_id);
      navigate(`/session/${session.session_id}`);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-500 bg-opacity-25 backdrop-blur-sm">
      <div className="min-h-screen px-4 text-center">
        <div className="inline-block w-full max-w-3xl my-8 text-left align-middle bg-white dark:bg-gray-800 rounded-xl shadow-xl transition-all">
          {/* Barre de recherche */}
          <div className="flex items-center p-4 border-b dark:border-gray-700">
            <Search className="w-5 h-5 text-gray-400" />
            <input
              type="text"
              className="w-full px-4 py-2 bg-transparent focus:outline-none text-gray-900 dark:text-white"
              placeholder="Rechercher dans les messages..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoFocus
            />
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`p-2 rounded-lg ${
                showFilters ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'
              }`}
            >
              <Filter className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg ml-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Filtres */}
          {showFilters && (
            <div className="p-4 bg-gray-50 dark:bg-gray-900 space-y-4">
              <div className="grid grid-cols-2 gap-4">
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
                      className="flex-1 px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600"
                    />
                    <input
                      type="date"
                      value={filters.dateRange.end}
                      onChange={(e) => setFilters(f => ({
                        ...f,
                        dateRange: { ...f.dateRange, end: e.target.value }
                      }))}
                      className="flex-1 px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Type
                  </label>
                  <select
                    value={filters.type}
                    onChange={(e) => setFilters(f => ({ ...f, type: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600"
                  >
                    <option value="all">Tous les messages</option>
                    <option value="user">Messages utilisateur</option>
                    <option value="assistant">Réponses assistant</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center space-x-4">
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
              </div>
            </div>
          )}

          {/* Historique des recherches */}
          {searchHistory.length > 0 && !query && (
            <div className="px-4 py-2 border-b dark:border-gray-700">
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <Clock className="w-4 h-4" />
                <span>Recherches récentes</span>
              </div>
              <div className="mt-2 space-y-1">
                {searchHistory.map((item, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setQuery(item.query);
                      setFilters(item.filters);
                    }}
                    className="w-full text-left px-2 py-1 hover:bg-gray-100 
                             dark:hover:bg-gray-700 rounded text-sm"
                  >
                    {item.query}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Résultats */}
          <div className="max-h-[60vh] overflow-y-auto">
            {isSearching ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
              </div>
            ) : results.length > 0 ? (
              <div className="divide-y dark:divide-gray-700">
                {results.map((message) => (
                  <div
                    key={message.id}
                    onClick={() => handleResultClick(message)}
                    className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        {message.type === 'user' ? (
                          <MessageCircle className="w-4 h-4 text-blue-500" />
                        ) : (
                          <img
                            src="/bot-avatar.png"
                            alt="Assistant"
                            className="w-4 h-4 rounded-full"
                          />
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
                      <div className="mt-2 flex items-center space-x-2">
                        <FileText className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-500">
                          {message.documents.length} document(s)
                        </span>
                      </div>
                    )}
                    {message.confidence && (
                      <div className="mt-2 flex items-center space-x-2">
                        {message.confidence >= 0.7 ? (
                          <ThumbsUp className="w-4 h-4 text-green-500" />
                        ) : (
                          <ThumbsDown className="w-4 h-4 text-yellow-500" />
                        )}
                        <span className="text-sm text-gray-500">
                          Confiance: {(message.confidence * 100).toFixed(0)}%
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                {query ? 'Aucun résultat trouvé' : 'Commencez à taper pour rechercher'}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchDialog;
