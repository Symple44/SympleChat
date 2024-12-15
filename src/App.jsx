// src/App.jsx
import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAppService } from './hooks/useAppService';
import { performanceMonitor } from './services/performance/PerformanceMonitor';
import AppProvider from './providers/AppProvider';
import ChatContainer from './components/chat/ChatContainer';
//import LoadingScreen from './components/common/LoadingScreen';
//import ErrorScreen from './components/common/ErrorScreen';
//import MaintenanceScreen from './components/common/MaintenanceScreen';
import DebugPanel from './components/debug/DebugPanel';
import Toast from './components/common/Toast';
import CommandPalette from './components/common/CommandPalette';
import KeyboardShortcuts from './components/common/KeyboardShortcuts';

const AppContent = () => {
  const {
    isInitialized,
    isOnline,
    isSyncing,
    error,
    stats
  } = useAppService();

  useEffect(() => {
    const perfMark = performanceMonitor.startMeasure('app_render');

    return () => {
      performanceMonitor.endMeasure(perfMark);
    };
  }, []);

  // Afficher l'écran de chargement pendant l'initialisation
 // if (!isInitialized) {
 //   return <LoadingScreen message="Initialisation de l'application..." />;
  //}

  // Afficher l'écran d'erreur si une erreur critique survient
  //if (error?.critical) {
  //  return <ErrorScreen error={error} />;
  //}

  // Afficher l'écran de maintenance si nécessaire
  //if (stats?.maintenance) {
  //  return <MaintenanceScreen details={stats.maintenance} />;
  //}

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Barre de statut réseau */}
      {!isOnline && (
        <div className="bg-yellow-500 text-white px-4 py-2 text-center">
          Mode hors ligne - Les modifications seront synchronisées lorsque la connexion sera rétablie
        </div>
      )}

      {/* Indicateur de synchronisation */}
      {isSyncing && (
        <div className="bg-blue-500 text-white px-4 py-2 text-center">
          Synchronisation en cours...
        </div>
      )}

      {/* Routes principales */}
      <Routes>
        <Route path="/" element={<Navigate to="/chat" replace />} />
        <Route path="/chat" element={<ChatContainer />} />
        <Route path="/session/:sessionId" element={<ChatContainer />} />
        <Route path="*" element={<Navigate to="/chat" replace />} />
      </Routes>

      {/* Composants globaux */}
      <Toast />
      <CommandPalette />
      <KeyboardShortcuts />

      {/* Panel de debug en mode développement */}
      {import.meta.env.DEV && <DebugPanel stats={stats} />}
    </div>
  );
};

const App = () => {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
};

export default App;
