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

const STORAGE_KEY = "safetybuddy.theme";

// Campus yellow (default) and a darker navy option.
export const YELLOW_THEME = {
  bg: "#FFD24C",
  text: "#000458",
  textMuted: "#5A5A7A",
  textDim: "#8A8A9A",
  card: "#fce07a",
  cardAlt: "#fce07a",
  input: "#FFFFFF",
  danger: "#E63946",
  dangerDark: "#C1121F",
  white: "#FFFFFF",
  black: "#000000",
  link: "#0A7A6B",
  accent: "#000458",
  navy: "#000458",
  tile: "#FFFFFF",
  tileBorder: "rgba(0,4,88,0.1)",
  bgDeep: "#000458",
  caution: "#F59E0B",
  success: "#22C55E",
  info: "#3B82F6",
};

export const DARK_THEME = {
  // Same keys as yellow, but navy background / yellow accents.
  ...YELLOW_THEME,
  bg: "#002B5B",
  text: "#FFFFFF",
  textMuted: "#B8C5D6",
  textDim: "#8A9BB3",
  card: "#0A3A6E",
  cardAlt: "#124578",
  input: "#0F335F",
  accent: "#FFD24C",
  navy: "#FFD24C",
  tile: "#0A3A6E",
  tileBorder: "rgba(255,210,76,0.2)",
  bgDeep: "#001A3A",
  caution: "#F59E0B",
  success: "#22C55E",
  info: "#60A5FA",
};

export type AppThemeColors = typeof YELLOW_THEME;
export type SelectedTheme = "yellow" | "dark";

type ThemeContextType = {
  colors: AppThemeColors;
  ready: boolean;
  hasChosen: boolean;
  selectedTheme: SelectedTheme;
  setTheme: (theme: SelectedTheme) => void;
  // Label color for buttons that use the accent fill.
  onAccent: string;
};

const ThemeContext = createContext<ThemeContextType>({
  colors: YELLOW_THEME,
  ready: false,
  hasChosen: false,
  selectedTheme: "yellow",
  setTheme: () => {},
  onAccent: YELLOW_THEME.bg,
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [hasChosen, setHasChosen] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState<SelectedTheme>("yellow");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Restore the last theme the user picked.
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (!raw) return;
        try {
          const parsed = JSON.parse(raw) as {
            selectedTheme?: SelectedTheme;
            hasChosen?: boolean;
          };
          if (parsed.selectedTheme === "yellow" || parsed.selectedTheme === "dark") {
            setSelectedTheme(parsed.selectedTheme);
          }
          if (parsed.hasChosen) setHasChosen(true);
        } catch {
          /* ignore corrupt */
        }
      })
      .finally(() => setReady(true));
  }, []);

  const setTheme = useCallback((theme: SelectedTheme) => {
    // Remember the choice so splash can skip theme-select next time.
    setSelectedTheme(theme);
    setHasChosen(true);
    AsyncStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ selectedTheme: theme, hasChosen: true })
    );
  }, []);

  const colors = selectedTheme === "dark" ? DARK_THEME : YELLOW_THEME;
  // Button label color that sits on the navy/accent fill.
  const onAccent = colors.bg;

  const value = useMemo(
    () => ({
      colors,
      ready,
      hasChosen,
      selectedTheme,
      setTheme,
      onAccent,
    }),
    [colors, ready, hasChosen, selectedTheme, setTheme, onAccent]
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  // Screens pull colors from here instead of hard-coding hex values.
  return useContext(ThemeContext);
}
