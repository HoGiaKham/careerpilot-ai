'use client';

import { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'light',
  setTheme: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Mặc định luôn luôn là 'light'
  const [theme, setThemeState] = useState<Theme>('light');

  useEffect(() => {
    // Chỉ đọc từ localStorage, nếu chưa có thì mặc định lấy 'light' (tuyệt đối không lấy system preference)
    const savedTheme = (localStorage.getItem('theme') as Theme) || 'light';
    setThemeState(savedTheme);
    applyTheme(savedTheme);
  }, []);

  const applyTheme = (selectedTheme: Theme) => {
    const root = document.documentElement;
    if (selectedTheme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.remove('dark');
      root.classList.add('light');
    }
  };

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem('theme', newTheme);
    applyTheme(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);