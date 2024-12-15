// src/App.jsx
import React, { useEffect, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAppService } from './hooks/useAppService';
import { searchIndexer } from './services/search/SearchIndexer';
import { eventBus, EventTypes } from './services/events/EventBus';
import { performanceMonitor } from './services/performance/PerformanceMonitor';

// Composants chargés de manière dynamique
const ChatContainer = React.lazy(() => import('./components/chat/ChatContainer'));
const SearchDialog = React.lazy(() => import('./components/chat/SearchDialog'));
const DocumentViewer = React.lazy(() => import('./components/chat/DocumentViewer'));
const DebugPanel = React.lazy(() => import('./components/debug/DebugPanel'));

// Composants d'interface communs
import {
  LoadingScreen,
  ErrorScreen,
  Toast,
  CommandPalette,
  KeyboardShortcuts
} from './components/common/';

const App = () => {
  const {
    isInitialized,
    isLoading,
    error,
    stats,
    initialize
  } = useAppService();

  useEffect(() => {
    const initializeApp = async () => {
      const perfMark = performanceMonitor.startMeasure('app_initialization');
      
      try {
        // Initialiser les services principaux
        await initialize();

        // Initialiser l'indexeur de recherche
        await searchIndexer.initialize();

        // Mettre à jour les performances
        performanceMonitor.endMeasure(perfMark);
        
        eventBus.emit(EventTypes.SYSTEM.INITIALIZED, {
          duration: perfMark.duration
        });

      } catch (error) {
        console.error('Erreur initialisation:', error);
        eventBus.emit(EventTypes.SYSTEM.ERROR, {
          error,
          context: 'initialization'
        });
      }
    };

    initializeApp();
  }, [initialize]);

  // Gérer le thème
  useEffect(() => {
    const handleThemeChange = (e) => {
      const isDark = e.matches;
      document.documentElement.classList.toggle('dark', isDark);
      eventBus.emit(EventTypes.SYSTEM.THEME_CHANGED, { theme: isDark ? 'dark' : 'light' });
    };

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', handleThemeChange);
    handleThemeChange(mediaQuery);

    return () => mediaQuery.removeEventListener('change', handleThemeChange);
  }, []);

  // Gérer les raccourcis clavier globaux
  useEffect(() => {
    const handleKeyPress = (e) => {
      // Commandes globales
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        eventBus.emit(EventTypes.UI.TOGGLE_COMMAND_PALETTE);
      }
      // Autres raccourcis...
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  // Afficher l'écran de chargement pendant l'initialisation
  if (!isInitialized || isLoading) {
    return <LoadingScreen stats={stats?.initialization} />;
  }

  // Afficher l'écran d'erreur si une erreur critique survient
  if (error?.critical) {
    return <ErrorScreen error={error} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Barre d'état */}
      <StatusBar />

      {/* Contenu principal */}
      <main className="flex-1">
        <Suspense fallback={<LoadingScreen />}>
          <Routes>
            <Route path="/" element={<Navigate to="/chat" replace />} />
            <Route path="/chat" element={<ChatContainer />} />
            <Route path="/session/:sessionId" element={<ChatContainer />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </main>

      {/* Composants d'interface utilisateur globaux */}
      <Suspense fallback={null}>
        <Toast />
        <CommandPalette />
        <KeyboardShortcuts />
        {stats?.debug && <DebugPanel stats={stats} />}
      </Suspense>

      {/* Portails pour les modales et dialogues */}
      <ModalsPortal />
    </div>
  );
};

// Composant de barre d'état
const StatusBar = () => {
  const { isOnline, isSyncing, progressStatus } = useAppService();

  return (
    <div className="sticky top-0 z-50 bg-white dark:bg-gray-800 shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo et titre */}
          <div className="flex items-center">
            <img
              className="h-8 w-8"
              src="/logo.svg"
              alt="Logo"
            />
            <h1 className="ml-2 text-xl font-semibold text-gray-900 dark:text-white">
              Chat App
            </h1>
          </div>

          {/* Indicateurs de statut */}
          <div className="flex items-center space-x-4">
            {/* État de la connexion */}
            <ConnectionStatus isOnline={isOnline} />

            {/* État de la synchronisation */}
            {isSyncing && (
              <div className="flex items-center text-sm text-blue-500">
                <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                <span>Synchronisation...</span>
              </div>
            )}

            {/* Indicateur de progression */}
            {progressStatus && (
              <div className="flex items-center text-sm text-gray-500">
                <div className="w-24 h-2 bg-gray-200 rounded-full mr-2">
                  <div
                    className="h-full bg-blue-500 rounded-full"
                    style={{ width: `${progressStatus.progress}%` }}
                  />
                </div>
                <span>{progressStatus.message}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Composant pour gérer les modales
const ModalsPortal = () => {
  const { activeModals } = useAppService();

  return (
    <>
      {activeModals.search && (
        <Suspense fallback={null}>
          <SearchDialog />
        </Suspense>
      )}
      
      {activeModals.documentViewer && (
        <Suspense fallback={null}>
          <DocumentViewer 
            document={activeModals.documentViewer.document}
            onClose={() => eventBus.emit(EventTypes.UI.CLOSE_MODAL, 'documentViewer')}
          />
        </Suspense>
      )}
    </>
  );
};

export default App;
