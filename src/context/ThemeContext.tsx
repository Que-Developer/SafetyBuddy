import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type ThemeMode = "yellow" | "navy";

export type AppColors = {
  bg: string;
  bgDeep: string;
  card: string;
  cardAlt: string;
  input: string;
  navy: string;
  navySoft: string;
  text: string;
  textMuted: string;
  textDim: string;
  white: string;
  black: string;
  link: string;
  accent: string;
  accentSoft: string;
  danger: string;
  dangerDark: string;
  glow: string;
  glowSoft: string;
  helpBlue: string;
  success: string;
  info: string;
  caution: string;
  urgent: string;
  shadow: string;
  responderBg: string;
  responderCard: string;
  responderMuted: string;
  warmBg: string;
  warmCard: string;
  warmText: string;
  tile: string;
  tileBorder: string;
  bgMid: string;
};

export const YELLOW_THEME: AppColors = {
  bg: "#FFD24C",
  bgDeep: "#F5C842",
  card: "#FFF4C2",
  cardAlt: "#FFE9A0",
  input: "#FFFFFF",
  navy: "#002B5B",
  navySoft: "#0A3A6E",
  text: "#0A0A3D",
  textMuted: "#4A4A6A",
  textDim: "#6B6B85",
  white: "#FFFFFF",
  black: "#000000",
  link: "#002B5B",
  accent: "#002B5B",
  accentSoft: "#FFF4C2",
  danger: "#E63946",
  dangerDark: "#C1121F",
  glow: "#FF4D2E",
  glowSoft: "#FF7A45",
  helpBlue: "#1A3A6E",
  success: "#22C55E",
  info: "#3B82F6",
  caution: "#F59E0B",
  urgent: "#EF4444",
  shadow: "#000000",
  responderBg: "#0B1B3A",
  responderCard: "#162A52",
  responderMuted: "#8A9BB3",
  warmBg: "#FFD24C",
  warmCard: "#FFF4C2",
  warmText: "#0A0A3D",
  tile: "#FFE9A0",
  tileBorder: "rgba(0,43,91,0.12)",
  bgMid: "#FFE27A",
};

export const NAVY_THEME: AppColors = {
  bg: "#002B5B",
  bgDeep: "#001A3A",
  card: "#0A3A6E",
  cardAlt: "#124578",
  input: "#0F335F",
  navy: "#FFD24C",
  navySoft: "#FFE27A",
  text: "#FFFFFF",
  textMuted: "#B8C5D6",
  textDim: "#8A9BB3",
  white: "#FFFFFF",
  black: "#000000",
  link: "#FFD24C",
  accent: "#FFD24C",
  accentSoft: "#0A3A6E",
  danger: "#E63946",
  dangerDark: "#C1121F",
  glow: "#FF4D2E",
  glowSoft: "#FF7A45",
  helpBlue: "#3B82F6",
  success: "#22C55E",
  info: "#60A5FA",
  caution: "#F59E0B",
  urgent: "#EF4444",
  shadow: "#000000",
  responderBg: "#0B1B3A",
  responderCard: "#162A52",
  responderMuted: "#8A9BB3",
  warmBg: "#002B5B",
  warmCard: "#0A3A6E",
  warmText: "#FFFFFF",
  tile: "#124578",
  tileBorder: "rgba(255,210,76,0.2)",
  bgMid: "#0A3A6E",
};

const STORAGE_KEY = "safetybuddy.theme";

type ThemeContextValue = {
  mode: ThemeMode;
  colors: AppColors;
  ready: boolean;
  setMode: (mode: ThemeMode) => Promise<void>;
  hasChosen: boolean;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>("navy");
  const [hasChosen, setHasChosen] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((saved) => {
        if (saved === "yellow" || saved === "navy") {
          setModeState(saved);
          setHasChosen(true);
        }
      })
      .finally(() => setReady(true));
  }, []);

  const setMode = useCallback(async (next: ThemeMode) => {
    setModeState(next);
    setHasChosen(true);
    await AsyncStorage.setItem(STORAGE_KEY, next);
  }, []);

  const value = useMemo(
    () => ({
      mode,
      colors: mode === "navy" ? NAVY_THEME : YELLOW_THEME,
      ready,
      setMode,
      hasChosen,
    }),
    [mode, ready, setMode, hasChosen]
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
