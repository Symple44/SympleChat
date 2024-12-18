// src/shared/hooks/useTheme.ts

import { useCallback } from 'react';
import { useStore } from '@/store/store';

interface UseThemeReturn {
  isDark: boolean;
  toggleTheme: () => void;
  setTheme: (isDark: boolean) => void;
}

export function useTheme(): UseThemeReturn {
  const theme = useStore(state => state.theme);
  const setStoreTheme = useStore(state => state.setTheme);

  const setTheme = useCallback((isDark: boolean) => {
    setStoreTheme(isDark ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark', isDark);
  }, [setStoreTheme]);

  const toggleTheme = useCallback(() => {
    setTheme(theme === 'light');
  }, [theme, setTheme]);

  return {
    isDark: theme === 'dark',
    toggleTheme,
    setTheme
  };
}

export default useTheme;
