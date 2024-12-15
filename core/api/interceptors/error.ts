// src/core/api/interceptors/error.ts

interface ErrorInterceptorConfig {
  onError?: (error: Error) => void;
  onNetworkError?: (error: Error) => void;
  onApiError?: (error: { status: number; message: string }) => void;
}

export class ErrorInterceptor {
  private config: ErrorInterceptorConfig;

  constructor(config: ErrorInterceptorConfig = {}) {
    this.config = config;
  }

  handleError(error: unknown): never {
    if (error instanceof Error) {
      // Erreur réseau
      if (error.name === 'NetworkError') {
        this.config.onNetworkError?.(error);
        throw error;
      }

      // Erreur générique
      this.config.onError?.(error);
      throw error;
    }

    // Erreur API
    if (typeof error === 'object' && error !== null && 'status' in error) {
      const apiError = error as { status: number; message: string };
      this.config.onApiError?.(apiError);
      throw new Error(`API Error: ${apiError.message}`);
    }

    // Erreur inconnue
    throw new Error('Unknown error occurred');
  }
}

export const errorInterceptor = new ErrorInterceptor({
  onError: (error) => {
    console.error('Application error:', error);
  },
  onNetworkError: (error) => {
    console.error('Network error:', error);
  },
  onApiError: (error) => {
    console.error(`API error (${error.status}):`, error.message);
  }
});

export default errorInterceptor;
