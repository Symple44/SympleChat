// src/shared/components/ErrorBoundary.tsx

import { Component, ErrorInfo, ReactNode } from 'react';
import { RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Erreur attrapée par ErrorBoundary:', error);
    console.error('Détails de l\'erreur:', errorInfo);
    
    this.setState({
      error,
      errorInfo
    });
  }

  private handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
    window.location.reload();
  };

  private renderError = () => {
    const { error, errorInfo } = this.state;

    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6">
          <h2 className="text-xl font-semibold text-red-600 dark:text-red-400 mb-4">
            Une erreur est survenue
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            L'application a rencontré une erreur inattendue. 
            Veuillez rafraîchir la page ou réessayer plus tard.
          </p>
          
          {(error || errorInfo) && (
            <div className="mb-4">
              {error && (
                <pre className="bg-gray-100 dark:bg-gray-900 p-4 rounded text-sm overflow-auto mb-2">
                  {error.message}
                </pre>
              )}
              {errorInfo?.componentStack && (
                <details className="mt-2">
                  <summary className="text-sm text-gray-500 dark:text-gray-400 cursor-pointer">
                    Détails techniques
                  </summary>
                  <pre className="mt-2 bg-gray-100 dark:bg-gray-900 p-4 rounded text-xs overflow-auto">
                    {errorInfo.componentStack}
                  </pre>
                </details>
              )}
            </div>
          )}

          <div className="flex space-x-4">
            <button
              onClick={this.handleReset}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition-colors flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Rafraîchir la page
            </button>
          </div>
        </div>
      </div>
    );
  };

  public render() {
    if (this.state.hasError) {
      return this.props.fallback || this.renderError();
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
