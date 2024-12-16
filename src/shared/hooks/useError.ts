// src/shared/hooks/useError.ts

import { useState, useCallback, useEffect, useRef } from 'react';

interface ErrorOptions {
  timeout?: number;
  autoReset?: boolean;
  onError?: (error: string) => void;
}

interface UseErrorReturn {
  error: string | null;
  setError: (message: string | null) => void;
  clearError: () => void;
  isError: boolean;
  hasError: (error: string) => boolean;
}

export function useError(options: ErrorOptions = {}): UseErrorReturn {
  const {
    timeout = 5000,
    autoReset = true,
    onError
  } = options;

  const [error, setErrorState] = useState<string | null>(null);
  const timeoutRef = useRef<number | null>(null);

  const clearError = useCallback(() => {
    setErrorState(null);
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const setError = useCallback((message: string | null) => {
    setErrorState(message);
    
    if (message && onError) {
      onError(message);
    }

    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    if (message && autoReset) {
      timeoutRef.current = window.setTimeout(clearError, timeout);
    }
  }, [timeout, autoReset, onError, clearError]);

  const hasError = useCallback((errorMessage: string): boolean => {
    return error === errorMessage;
  }, [error]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    error,
    setError,
    clearError,
    isError: error !== null,
    hasError
  };
}

export default useError;
