// src/components/ErrorBoundary.jsx
import React from 'react';
import { RefreshCw } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Erreur capturée:', error, errorInfo);
  }

  handleRefresh = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
          <div className="text-center p-8 rounded-lg bg-white dark:bg-gray-800 shadow-lg max-w-md">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Une erreur est survenue
            </h2>
            <p className="text-red-600 dark:text-red-400 mb-6">
              {this.state.error?.message || 'Une erreur inattendue s\'est produite'}
            </p>
            <button
              onClick={this.handleRefresh}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <RefreshCw className="w-4 h-4" />
              Rafraîchir l'application
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
