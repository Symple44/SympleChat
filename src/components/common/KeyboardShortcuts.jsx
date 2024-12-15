// src/components/common/KeyboardShortcuts.jsx
import { useEffect } from 'react';
import { useStore } from '../../store/globalStore';
import { eventBus, EventTypes } from '../../services/events/EventBus';

const SHORTCUTS = {
  COMMAND_PALETTE: { key: 'k', modifier: true },
  NEW_SESSION: { key: 'n', modifier: true },
  SEARCH: { key: 'f', modifier: true },
  TOGGLE_THEME: { key: 'j', modifier: true },
  SAVE_SESSION: { key: 's', modifier: true },
  HELP: { key: '/', modifier: false },
  ESCAPE_ACTIONS: { key: 'Escape', modifier: false },
  SEND_MESSAGE: { key: 'Enter', modifier: false },
  NEXT_SESSION: { key: ']', modifier: true },
  PREVIOUS_SESSION: { key: '[', modifier: true },
  TOGGLE_SIDEBAR: { key: 'b', modifier: true },
  QUICK_EXPORT: { key: 'e', modifier: true }
};

const KeyboardShortcuts = () => {
  const {
    theme,
    setTheme,
    sessions,
    currentSession,
    createSession,
    changeSession,
    toggleCommandPalette,
    toggleSearchDialog,
    toggleSidebar,
    exportConversation,
    addToast
  } = useStore();

  useEffect(() => {
    const handleKeyPress = (event) => {
      const modifier = event.metaKey || event.ctrlKey;
      
      // Fonction pour vérifier si un raccourci correspond
      const matchesShortcut = (shortcut) => {
        return event.key.toLowerCase() === shortcut.key.toLowerCase() && 
               (!shortcut.modifier || modifier);
      };

      // Éviter les raccourcis dans les champs de texte
      if (event.target.tagName === 'INPUT' || 
          event.target.tagName === 'TEXTAREA') {
        // Permettre uniquement Echap et Entrée
        if (!['Escape', 'Enter'].includes(event.key)) {
          return;
        }
      }

      // Gestion des raccourcis
      try {
        if (matchesShortcut(SHORTCUTS.COMMAND_PALETTE)) {
          event.preventDefault();
          toggleCommandPalette();
          eventBus.emit(EventTypes.SHORTCUT.USED, { shortcut: 'command_palette' });
        }
        else if (matchesShortcut(SHORTCUTS.NEW_SESSION)) {
          event.preventDefault();
          createSession();
          addToast({
            type: 'info',
            message: 'Nouvelle session créée',
            duration: 3000
          });
        }
        else if (matchesShortcut(SHORTCUTS.SEARCH)) {
          event.preventDefault();
          toggleSearchDialog();
        }
        else if (matchesShortcut(SHORTCUTS.TOGGLE_THEME)) {
          event.preventDefault();
          const newTheme = theme === 'dark' ? 'light' : 'dark';
          setTheme(newTheme);
          addToast({
            type: 'info',
            message: `Thème ${newTheme} activé`,
            duration: 2000
          });
        }
        else if (matchesShortcut(SHORTCUTS.NEXT_SESSION)) {
          event.preventDefault();
          if (sessions.length > 0 && currentSession) {
            const currentIndex = sessions.findIndex(
              s => s.session_id === currentSession.session_id
            );
            const nextSession = sessions[(currentIndex + 1) % sessions.length];
            changeSession(nextSession.session_id);
          }
        }
        else if (matchesShortcut(SHORTCUTS.PREVIOUS_SESSION)) {
          event.preventDefault();
          if (sessions.length > 0 && currentSession) {
            const currentIndex = sessions.findIndex(
              s => s.session_id === currentSession.session_id
            );
            const prevSession = sessions[
              (currentIndex - 1 + sessions.length) % sessions.length
            ];
            changeSession(prevSession.session_id);
          }
        }
        else if (matchesShortcut(SHORTCUTS.TOGGLE_SIDEBAR)) {
          event.preventDefault();
          toggleSidebar();
        }
        else if (matchesShortcut(SHORTCUTS.QUICK_EXPORT)) {
          event.preventDefault();
          if (currentSession) {
            exportConversation();
            addToast({
              type: 'success',
              message: 'Session exportée',
              duration: 3000
            });
          }
        }
        else if (matchesShortcut(SHORTCUTS.HELP)) {
          event.preventDefault();
          eventBus.emit(EventTypes.UI.SHOW_HELP);
        }
        else if (matchesShortcut(SHORTCUTS.ESCAPE_ACTIONS)) {
          // Fermer les modales ouvertes
          eventBus.emit(EventTypes.UI.CLOSE_ALL_MODALS);
        }
      } catch (error) {
        console.error('Erreur raccourci:', error);
        addToast({
          type: 'error',
          message: 'Erreur lors de l\'exécution du raccourci',
          duration: 3000
        });
      }
    };

    window.addEventListener('keydown', handleKeyPress);

    // Nettoyer l'écouteur
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [
    theme,
    setTheme,
    sessions,
    currentSession,
    createSession,
    changeSession,
    toggleCommandPalette,
    toggleSearchDialog,
    toggleSidebar,
    exportConversation,
    addToast
  ]);

  return null; // Composant invisible
};

// Composant d'aide pour afficher les raccourcis disponibles
export const ShortcutsHelp = () => (
  <div className="grid grid-cols-2 gap-4">
    {Object.entries(SHORTCUTS).map(([name, shortcut]) => (
      <div key={name} className="flex items-center justify-between">
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {name.split('_').join(' ').toLowerCase()}
        </span>
        <kbd className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-800 
                     rounded border border-gray-200 dark:border-gray-700">
          {shortcut.modifier ? '⌘/' : ''}{shortcut.key}
        </kbd>
      </div>
    ))}
  </div>
);

export default KeyboardShortcuts;
