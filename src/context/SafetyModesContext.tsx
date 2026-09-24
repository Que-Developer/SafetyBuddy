import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Battery from "expo-battery";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

const STORAGE_KEY = "safetybuddy.safetyModes";

export type SafetyModes = {
  accessibilityMode: boolean;
  lowDataMode: boolean;
  batteryAwareMode: boolean;
  silentPanicMode: boolean;
  anonymousDefault: boolean;
};

const DEFAULTS: SafetyModes = {
  accessibilityMode: false,
  lowDataMode: false,
  batteryAwareMode: true,
  silentPanicMode: false,
  anonymousDefault: true,
};

type SafetyModesContextValue = SafetyModes & {
  ready: boolean;
  batteryLevel: number | null;
  batteryLow: boolean;
  effectiveLowData: boolean;
  setMode: <K extends keyof SafetyModes>(key: K, value: SafetyModes[K]) => Promise<void>;
  scale: number;
  iconSize: number;
  minTouch: number;
};

const SafetyModesContext = createContext<SafetyModesContextValue | null>(null);

export function SafetyModesProvider({ children }: { children: ReactNode }) {
  const [modes, setModes] = useState<SafetyModes>(DEFAULTS);
  const [ready, setReady] = useState(false);
  const [batteryLevel, setBatteryLevel] = useState<number | null>(null);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (!raw) return;
        try {
          setModes({ ...DEFAULTS, ...JSON.parse(raw) });
        } catch {
          /* ignore corrupt */
        }
      })
      .finally(() => setReady(true));
  }, []);

  useEffect(() => {
    let sub: Battery.Subscription | null = null;
    (async () => {
      try {
        const level = await Battery.getBatteryLevelAsync();
        if (level >= 0) setBatteryLevel(level);
        sub = Battery.addBatteryLevelListener(
          (event: { batteryLevel: number }) => {
            setBatteryLevel(event.batteryLevel);
          }
        );
      } catch {
        setBatteryLevel(null);
      }
    })();
    return () => sub?.remove();
  }, []);

  const setMode = useCallback(
    async <K extends keyof SafetyModes>(key: K, value: SafetyModes[K]) => {
      setModes((prev) => {
        const next = { ...prev, [key]: value };
        AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        return next;
      });
    },
    []
  );

  const batteryLow =
    modes.batteryAwareMode && batteryLevel !== null && batteryLevel <= 0.2;

  const effectiveLowData = modes.lowDataMode || batteryLow;
  /** Larger readable text when accessibility mode is on. */
  const scale = modes.accessibilityMode ? 1.3 : 1;
  const iconSize = modes.accessibilityMode ? 28 : 22;
  const minTouch = modes.accessibilityMode ? 52 : 44;

  const value = useMemo(
    () => ({
      ...modes,
      ready,
      batteryLevel,
      batteryLow,
      effectiveLowData,
      setMode,
      scale,
      iconSize,
      minTouch,
    }),
    [
      modes,
      ready,
      batteryLevel,
      batteryLow,
      effectiveLowData,
      setMode,
      scale,
      iconSize,
      minTouch,
    ]
  );

  return (
    <SafetyModesContext.Provider value={value}>
      {children}
    </SafetyModesContext.Provider>
  );
}

export function useSafetyModes() {
  const ctx = useContext(SafetyModesContext);
  if (!ctx) throw new Error("useSafetyModes must be used within SafetyModesProvider");
  return ctx;
}
