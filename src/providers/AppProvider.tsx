// src/providers/AppProvider.tsx

import React from 'react';
import { ErrorBoundary } from '../shared/components/ErrorBoundary';
import { ThemeProvider } from './ThemeProvider';
import { ChatProvider } from './ChatProvider';
import { SocketProvider } from './SocketProvider';

interface AppProviderProps {
  children: React.ReactNode;
}

const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <SocketProvider>
          <ChatProvider>
            {children}
          </ChatProvider>
        </SocketProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
};

// Mise à jour du composant racine main.tsx
export const AppRoot: React.FC = () => {
  return (
    <BrowserRouter>
      <AppProvider>
        <Routes>
          <Route path="/" element={<Navigate to="/oweo" />} />
          <Route path="/:userId" element={<App />} />
          <Route path="/:userId/session/:sessionId" element={<App />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AppProvider>
    </BrowserRouter>
  );
};

// Composant ErrorBoundary pour la gestion des erreurs globales
interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, ErrorBoundaryState> {
  state: ErrorBoundaryState = {
    hasError: false,
    error: null
  };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Application error:', error);
    console.error('Error details:', errorInfo);
    // Ici vous pourriez envoyer l'erreur à un service de monitoring
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6">
            <h2 className="text-xl font-semibold text-red-600 dark:text-red-400 mb-4">
              Une erreur est survenue
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              L'application a rencontré une erreur inattendue. Veuillez rafraîchir la page ou réessayer plus tard.
            </p>
            <pre className="bg-gray-100 dark:bg-gray-900 p-4 rounded text-sm overflow-auto mb-4">
              {this.state.error?.message}
            </pre>
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition-colors"
            >
              Rafraîchir la page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default AppProvider;