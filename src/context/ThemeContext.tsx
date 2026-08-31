import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type ThemeMode = 'system' | 'light' | 'dark';
export type ResolvedTheme = 'light' | 'dark';

interface ThemeContextType {
  themeMode: ThemeMode;
  resolvedTheme: ResolvedTheme;
  setThemeMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
  isSystem: boolean;
}

const STORAGE_KEY = 'omnisinais_theme_mode_v1';

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Get initial theme mode from storage or default to 'system'
  const [themeMode, setThemeModeState] = useState<ThemeMode>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === 'light' || saved === 'dark' || saved === 'system') {
        return saved;
      }
    } catch (e) {
      console.warn('Error reading theme from localStorage', e);
    }
    return 'system';
  });

  // Calculate the resolved theme based on current system media query
  const getSystemTheme = (): ResolvedTheme => {
    if (typeof window === 'undefined' || !window.matchMedia) {
      return 'dark';
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  };

  const [systemTheme, setSystemTheme] = useState<ResolvedTheme>(getSystemTheme);

  // Resolved theme
  const resolvedTheme: ResolvedTheme = themeMode === 'system' ? systemTheme : themeMode;

  // Listen to system media query changes
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e: MediaQueryListEvent | MediaQueryList) => {
      const newSystemTheme: ResolvedTheme = e.matches ? 'dark' : 'light';
      setSystemTheme(newSystemTheme);
    };

    // Initial check
    setSystemTheme(mediaQuery.matches ? 'dark' : 'light');

    // Modern and legacy event listener support
    try {
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    } catch (e) {
      try {
        mediaQuery.addListener(handleChange);
        return () => mediaQuery.removeListener(handleChange);
      } catch (err) {
        console.warn('Could not attach mediaQuery listener', err);
      }
    }
  }, []);

  // Apply theme class and data-theme to HTML root
  useEffect(() => {
    const root = document.documentElement;
    if (resolvedTheme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
      root.setAttribute('data-theme', 'dark');
      root.style.colorScheme = 'dark';
      
      // Update theme-color meta tag
      const metaTheme = document.querySelector('meta[name="theme-color"]');
      if (metaTheme) {
        metaTheme.setAttribute('content', '#020617');
      }
    } else {
      root.classList.remove('dark');
      root.classList.add('light');
      root.setAttribute('data-theme', 'light');
      root.style.colorScheme = 'light';

      // Update theme-color meta tag
      const metaTheme = document.querySelector('meta[name="theme-color"]');
      if (metaTheme) {
        metaTheme.setAttribute('content', '#4f46e5');
      }
    }
  }, [resolvedTheme]);

  const setThemeMode = (mode: ThemeMode) => {
    setThemeModeState(mode);
    try {
      localStorage.setItem(STORAGE_KEY, mode);
    } catch (e) {
      console.warn('Error saving theme to localStorage', e);
    }
  };

  const toggleTheme = () => {
    if (themeMode === 'system') {
      setThemeMode('light');
    } else if (themeMode === 'light') {
      setThemeMode('dark');
    } else {
      setThemeMode('system');
    }
  };

  return (
    <ThemeContext.Provider
      value={{
        themeMode,
        resolvedTheme,
        setThemeMode,
        toggleTheme,
        isSystem: themeMode === 'system',
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
