// src/components/chat/EmojiPicker.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Search, X, Clock, Smile, Heart, Coffee, Globe } from 'lucide-react';
import { useServices } from '../../providers/ServiceProvider';
import { eventBus, EventTypes } from '../../services/events/EventBus';

const CATEGORIES = {
  recent: {
    icon: Clock,
    label: 'Récents'
  },
  smileys: {
    icon: Smile,
    label: 'Émoticônes'
  },
  emotions: {
    icon: Heart,
    label: 'Émotions'
  },
  activities: {
    icon: Coffee,
    label: 'Activités'
  },
  symbols: {
    icon: Globe,
    label: 'Symboles'
  }
};

const EmojiPicker = ({ onSelect, onClose }) => {
  const { services } = useServices();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('recent');
  const [emojis, setEmojis] = useState([]);
  const [recentEmojis, setRecentEmojis] = useState([]);
  const [loading, setLoading] = useState(true);

  // Charger les emojis récents depuis le stockage local
  useEffect(() => {
    const loadRecentEmojis = async () => {
      try {
        const stored = await services.app.getStoredData('recentEmojis');
        if (stored) {
          setRecentEmojis(JSON.parse(stored));
        }
      } catch (error) {
        console.error('Erreur chargement emojis récents:', error);
      }
    };

    loadRecentEmojis();
  }, [services.app]);

  // Charger les emojis de la catégorie sélectionnée
  useEffect(() => {
    const loadEmojis = async () => {
      setLoading(true);
      try {
        if (category === 'recent') {
          setEmojis(recentEmojis);
          return;
        }

        const categoryEmojis = await services.app.loadEmojis(category);
        setEmojis(categoryEmojis);
      } catch (error) {
        console.error('Erreur chargement emojis:', error);
        services.app.showToast({
          type: 'error',
          message: 'Erreur lors du chargement des emojis'
        });
      } finally {
        setLoading(false);
      }
    };

    loadEmojis();
  }, [category, recentEmojis, services.app]);

  // Gérer la sélection d'un emoji
  const handleSelect = useCallback(async (emoji) => {
    // Mettre à jour les emojis récents
    const updated = [emoji, ...recentEmojis.filter(e => e !== emoji)].slice(0, 20);
    setRecentEmojis(updated);

    try {
      await services.app.storeData('recentEmojis', JSON.stringify(updated));
    } catch (error) {
      console.error('Erreur sauvegarde emojis récents:', error);
    }

    onSelect(emoji);
    eventBus.emit(EventTypes.MESSAGE.EMOJI_SELECTED, { emoji });
  }, [recentEmojis, services.app, onSelect]);

  // Filtrer les emojis selon la recherche
  const filteredEmojis = search
    ? emojis.filter(emoji => 
        emoji.keywords.some(keyword => 
          keyword.toLowerCase().includes(search.toLowerCase())
        )
      )
    : emojis;

  return (
    <div className="absolute bottom-full right-0 mb-2 bg-white dark:bg-gray-800 
                  rounded-lg shadow-xl border dark:border-gray-700 w-72">
      {/* Barre de recherche */}
      <div className="p-2 border-b dark:border-gray-700">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 
                         w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher un emoji..."
            className="w-full pl-8 pr-4 py-2 text-sm bg-gray-100 
                     dark:bg-gray-700 rounded-lg focus:outline-none
                     focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Catégories */}
      <div className="flex overflow-x-auto p-2 border-b dark:border-gray-700">
        {Object.entries(CATEGORIES).map(([key, { icon: Icon, label }]) => (
          <button
            key={key}
            onClick={() => setCategory(key)}
            className={`flex-shrink-0 p-2 rounded-lg mr-1 ${
              category === key 
                ? 'bg-blue-100 dark:bg-blue-900' 
                : 'hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
            title={label}
          >
            <Icon className="w-5 h-5" />
          </button>
        ))}
      </div>

      {/* Grille d'emojis */}
      <div className="p-2 h-64 overflow-y-auto">
        {loading ? (
          <div className="h-full flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-2 
                         border-blue-500 border-t-transparent" />
          </div>
        ) : filteredEmojis.length > 0 ? (
          <div className="grid grid-cols-8 gap-1">
            {filteredEmojis.map((emoji, index) => (
              <button
                key={index}
                onClick={() => handleSelect(emoji.char)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                title={emoji.name}
              >
                {emoji.char}
              </button>
            ))}
          </div>
        ) : (
          <div className="h-full flex items-center justify-center text-gray-500">
            {search ? 'Aucun résultat' : 'Aucun emoji disponible'}
          </div>
        )}
      </div>

      {/* Pied avec bouton de fermeture */}
      <div className="p-2 border-t dark:border-gray-700 flex justify-end">
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
          title="Fermer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default React.memo(EmojiPicker);
