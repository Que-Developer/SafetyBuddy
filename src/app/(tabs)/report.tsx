import React, { createContext, useContext, useState } from 'react';

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

  // --- NEW KEYS for the Report screen ---
  tile: '#FFFFFF',          // tile background for inputs/selects (white)
  tileBorder: 'rgba(0,4,88,0.1)', // border lines between dropdown items
  bgDeep: '#000458',        // dark text on bright accent buttons (submit)
};

const DARK_THEME = {
  ...YELLOW_THEME,
  bg: '#1a2332',
  text: '#FFFFFF',
  textMuted: '#B0B0C0',
  textDim: '#8A8A9A',
  card: '#23304a',
  cardAlt: '#2A3A55',
  input: '#2A3A55',
  navy: '#4ade80',
  accent: '#4ade80',

  // Dark mode versions
  tile: '#23304a',          // darker tile inside dark theme
  tileBorder: 'rgba(255,255,255,0.1)',
  bgDeep: '#1a2332',        // dark text on green accent buttons
};

// --- CONTEXT TYPE ---
type ThemeContextType = {
  colors: typeof YELLOW_THEME;
  ready: boolean;
  hasChosen: boolean;
  selectedTheme: 'yellow' | 'dark';
  setTheme: (theme: 'yellow' | 'dark') => void;
};

// --- CREATE CONTEXT ---
const ThemeContext = createContext<ThemeContextType>({
  colors: YELLOW_THEME,
  ready: true,
  hasChosen: false,
  selectedTheme: 'yellow',
  setTheme: () => {},
});

// --- PROVIDER ---
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [hasChosen, setHasChosen] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState<'yellow' | 'dark'>('yellow');

  const setTheme = (theme: 'yellow' | 'dark') => {
    setSelectedTheme(theme);
    setHasChosen(true);
  };

  const colors = selectedTheme === 'dark' ? DARK_THEME : YELLOW_THEME;

  return (
    <ThemeContext.Provider
      value={{
        colors,
        ready: true,
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