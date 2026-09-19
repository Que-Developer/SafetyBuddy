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
  accent: '#000458',       // <-- Used for icons & highlights
  navy: '#000458',
  tile: '#FFFFFF',
  tileBorder: 'rgba(0,4,88,0.1)',
  bgDeep: '#000458',
  caution: '#F59E0B',
  success: '#22C55E',
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
  accent: '#4ade80',       // Green highlight in dark mode (readable on navy)
  navy: '#4ade80',
  tile: '#23304a',
  tileBorder: 'rgba(255,255,255,0.1)',
  bgDeep: '#1a2332',
  caution: '#F59E0B',
  success: '#22C55E',
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
// hasChosen starts as false, which makes the splash screen go to /theme-select first.
const ThemeContext = createContext<ThemeContextType>({
  colors: YELLOW_THEME,
  ready: true,
  hasChosen: false,
  selectedTheme: 'yellow',
  setTheme: () => {},
});

// --- PROVIDER COMPONENT ---
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [hasChosen, setHasChosen] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState<'yellow' | 'dark'>('yellow');

  // Called from the Theme Selection page when user taps Continue
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