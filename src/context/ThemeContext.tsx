import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';

const THEME_KEY = 'safetybuddy.theme';

// --- THEME COLOR PALETTES ---
const YELLOW_THEME = {
  bg: '#FFD24C',
  text: '#000458',
  textMuted: '#5A5A7A',
  textDim: '#8A8A9A',
  card: '#fce07a',
  cardAlt: '#fce07a',
  input: '#FFFFFF',
  danger: '#E63946',
  dangerDark: '#C1121F',
  white: '#FFFFFF',
  black: '#000000',
  link: '#0A7A6B',
  accent: '#000458',
  navy: '#000458',
  tile: '#FFFFFF',
  tileBorder: 'rgba(0,4,88,0.1)',
  bgDeep: '#000458',
  caution: '#F59E0B',
  success: '#22C55E',
};

const DARK_THEME = {
  ...YELLOW_THEME,
  bg: '#002B5B',
  text: '#FFFFFF',
  textMuted: '#B8C5D6',
  textDim: '#8A9BB3',
  card: '#0A3A6E',
  cardAlt: '#124578',
  input: '#0F335F',
  accent: '#FFD24C',
  navy: '#FFD24C',
  tile: '#0A3A6E',
  tileBorder: 'rgba(255,210,76,0.2)',
  bgDeep: '#001A3A',
  caution: '#F59E0B',
  success: '#22C55E',
};

type ThemeName = 'yellow' | 'dark';

// --- CONTEXT TYPE ---
type ThemeContextType = {
  colors: typeof YELLOW_THEME;
  ready: boolean;
  hasChosen: boolean;
  selectedTheme: ThemeName;
  setTheme: (theme: ThemeName) => void;
};

// --- CREATE CONTEXT ---
const ThemeContext = createContext<ThemeContextType>({
  colors: YELLOW_THEME,
  ready: false,
  hasChosen: false,
  selectedTheme: 'yellow',
  setTheme: () => {},
});

// --- PROVIDER COMPONENT ---
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [hasChosen, setHasChosen] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState<ThemeName>('yellow');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(THEME_KEY);
        if (!cancelled && (stored === 'yellow' || stored === 'dark')) {
          setSelectedTheme(stored);
          setHasChosen(true);
        }
      } finally {
        if (!cancelled) setReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const setTheme = (theme: ThemeName) => {
    setSelectedTheme(theme);
    setHasChosen(true);
    void AsyncStorage.setItem(THEME_KEY, theme);
  };

  const colors = selectedTheme === 'dark' ? DARK_THEME : YELLOW_THEME;

  return (
    <ThemeContext.Provider
      value={{
        colors,
        ready,
        hasChosen,
        selectedTheme,
        setTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

// --- HOOK ---
export function useTheme() {
  return useContext(ThemeContext);
}
