import React, { createContext, useContext, useState, useEffect } from 'react';

interface ThemeContextType {
  isDark: boolean;
  toggleDark: () => void;
  isHighContrast: boolean;
  toggleHighContrast: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDark, setIsDark] = useState<boolean>(() => {
    return localStorage.getItem('cbe_theme') === 'dark';
  });

  const [isHighContrast, setIsHighContrast] = useState<boolean>(() => {
    return localStorage.getItem('cbe_contrast') === 'true';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
      localStorage.setItem('cbe_theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('cbe_theme', 'light');
    }
  }, [isDark]);

  useEffect(() => {
    const root = document.documentElement;
    if (isHighContrast) {
      root.classList.add('high-contrast');
      localStorage.setItem('cbe_contrast', 'true');
    } else {
      root.classList.remove('high-contrast');
      localStorage.setItem('cbe_contrast', 'false');
    }
  }, [isHighContrast]);

  const toggleDark = () => setIsDark((prev) => !prev);
  const toggleHighContrast = () => setIsHighContrast((prev) => !prev);

  return (
    <ThemeContext.Provider value={{ isDark, toggleDark, isHighContrast, toggleHighContrast }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
};
