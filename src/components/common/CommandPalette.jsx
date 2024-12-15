// src/components/common/CommandPalette.jsx 
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Command, Search, X, Plus, Sun, Moon, Settings, 
  Download, Trash2, RefreshCw, MessageSquare, 
  FileText, HelpCircle, Archive, ChevronRight 
} from 'lucide-react';
import { useStore } from '../../store/globalStore';
import { eventBus, EventTypes } from '../../services/events/EventBus';

const CommandPalette = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const navigate = useNavigate();

  const {
    theme,
    setTheme,
    sessions,
    currentSession,
    createSession,
    changeSession,
    clearStore,
    exportConversation,
    addToast
  } = useStore();

  const getCommands = () => [
    {
      id: 'new-session',
      label: 'Nouvelle session',
      keywords: 'créer nouveau chat conversation',
      icon: Plus,
      shortcut: ['⌘', 'N'],
      action: async () => {
        const sessionId = await createSession();
        if (sessionId) {
          navigate(`/session/${sessionId}`);
          addToast({
            type: 'success',
            message: 'Nouvelle session créée'
          });
        }
        setIsOpen(false);
      }
    },
    {
      id: 'switch-theme',
      label: `Passer en mode ${theme === 'dark' ? 'clair' : 'sombre'}`,
      keywords: 'thème mode sombre clair dark light',
      icon: theme === 'dark' ? Sun : Moon,
      shortcut: ['⌘', 'J'],
      action: () => {
        const newTheme = theme === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);
        addToast({
          type: 'info',
          message: `Mode ${newTheme === 'dark' ? 'sombre' : 'clair'} activé`
        });
        setIsOpen(false);
      }
    },
    {
      id: 'export',
      label: 'Exporter la conversation',
      keywords: 'sauvegarder télécharger export download',
      icon: Download,
      shortcut: ['⌘', 'E'],
      action: async () => {
        if (currentSession) {
          await exportConversation();
          addToast({
            type: 'success',
            message: 'Conversation exportée'
          });
        }
        setIsOpen(false);
      }
    },
    {
      id: 'clear-history',
      label: 'Effacer l\'historique',
      keywords: 'supprimer nettoyer vider clear',
      icon: Trash2,
      danger: true,
      action: () => {
        clearStore();
        addToast({
          type: 'success',
          message: 'Historique effacé'
        });
        setIsOpen(false);
      }
    },
    {
      id: 'search',
      label: 'Rechercher',
      keywords: 'chercher trouver find',
      icon: Search,
      shortcut: ['⌘', 'K'],
      action: () => {
        eventBus.emit(EventTypes.UI.TOGGLE_SEARCH);
        setIsOpen(false);
      }
    },
    {
      type: 'separator',
      id: 'recent-sessions'
    },
    // Sessions récentes
    ...sessions.slice(0, 5).map(session => ({
      id: session.session_id,
      label: `Session: ${session.first_message || 'Nouvelle conversation'}`,
      keywords: session.first_message,
      icon: MessageSquare,
      subtext: new Date(session.timestamp).toLocaleString(),
      action: () => {
        changeSession(session.session_id);
        navigate(`/session/${session.session_id}`);
        setIsOpen(false);
      }
    })),
    {
      type: 'separator',
      id: 'help'
    },
    {
      id: 'help',
      label: 'Aide',
      keywords: 'aide help documentation',
      icon: HelpCircle,
      shortcut: ['?'],
      action: () => {
        eventBus.emit(EventTypes.UI.TOGGLE_HELP);
        setIsOpen(false);
      }
    }
  ];

  const filteredCommands = getCommands().filter(command => {
    if (command.type === 'separator') return true;
    return (
      command.label.toLowerCase().includes(query.toLowerCase()) ||
      command.keywords?.toLowerCase().includes(query.toLowerCase())
    );
  });

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsOpen(true);
      } else if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleKeyDown = (e) => {
    const commands = filteredCommands.filter(cmd => cmd.type !== 'separator');
    
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(i => (i + 1) % commands.length);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(i => (i - 1 + commands.length) % commands.length);
        break;
      case 'Enter':
        e.preventDefault();
        const selectedCommand = commands[selectedIndex];
        if (selectedCommand) {
          selectedCommand.action();
        }
        break;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-500 bg-opacity-25 backdrop-blur-sm">
      <div className="min-h-screen px-4 text-center">
        <div className="inline-block w-full max-w-2xl my-8 text-left align-middle bg-white dark:bg-gray-800 rounded-xl shadow-xl transition-all">
          <div className="relative">
            <div className="flex items-center px-4 py-3 border-b dark:border-gray-700">
              <Command className="w-5 h-5 text-gray-400" />
              <input
                type="text"
                className="w-full px-4 py-1 text-sm bg-transparent focus:outline-none text-gray-900 dark:text-white placeholder-gray-500"
                placeholder="Rechercher une commande..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                autoFocus
              />
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="max-h-96 overflow-y-auto">
              {filteredCommands.map((command, index) => {
                if (command.type === 'separator') {
                  return (
                    <div key={command.id} className="px-4 py-2 text-xs text-gray-500 border-t dark:border-gray-700">
                      {command.label}
                    </div>
                  );
                }

                const Icon = command.icon;
                return (
                  <button
                    key={command.id}
                    className={`w-full px-4 py-3 flex items-center justify-between hover:bg-gray-100 dark:hover:bg-gray-700
                      ${index === selectedIndex ? 'bg-blue-50 dark:bg-blue-900' : ''}
                      ${command.danger ? 'text-red-600 dark:text-red-400' : ''}`}
                    onClick={command.action}
                  >
                    <div className="flex items-center space-x-3">
                      <Icon className="w-5 h-5" />
                      <div>
                        <div className="text-sm">{command.label}</div>
                        {command.subtext && (
                          <div className="text-xs text-gray-500">{command.subtext}</div>
                        )}
                      </div>
                    </div>
                    {command.shortcut && (
                      <div className="flex items-center space-x-1">
                        {command.shortcut.map((key, i) => (
                          <kbd
                            key={i}
                            className="px-2 py-1 text-xs rounded bg-gray-100 dark:bg-gray-700 text-gray-500"
                          >
                            {key}
                          </kbd>
                        ))}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommandPalette;
