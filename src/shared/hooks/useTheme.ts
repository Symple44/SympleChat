// src/shared/hooks/useTheme.ts

import { useState, useEffect, useCallback } from 'react';

interface UseThemeReturn {
  isDark: boolean;
  toggleTheme: () => void;
  setTheme: (isDark: boolean) => void;
  systemTheme: 'dark' | 'light';
}

export function useTheme(): UseThemeReturn {
  const [isDark, setIsDark] = useState(() => {
    const stored = localStorage.getItem('theme');
    if (stored) return stored === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  const [systemTheme, setSystemTheme] = useState<'dark' | 'light'>(
    window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e: MediaQueryListEvent) => {
      setSystemTheme(e.matches ? 'dark' : 'light');
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  const toggleTheme = useCallback(() => {
    setIsDark(prev => !prev);
  }, []);

  const setTheme = useCallback((dark: boolean) => {
    setIsDark(dark);
  }, []);

  return {
    isDark,
    toggleTheme,
    setTheme,
    systemTheme
  };
}

export default useTheme;
