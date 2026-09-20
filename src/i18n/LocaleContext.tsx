import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Localization from "expo-localization";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { I18nManager } from "react-native";
import { LOCALES, TRANSLATIONS } from "./locales";
import type { LocaleCode, TranslationKey } from "./types";

const STORAGE_KEY = "safetybuddy.locale";

// Holds the active language and the t() helper used across the app.

type LocaleContextValue = {
  locale: LocaleCode;
  ready: boolean;
  setLocale: (code: LocaleCode) => Promise<void>;
  t: (key: TranslationKey) => string;
  isRtl: boolean;
  locales: typeof LOCALES;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

function detectDeviceLocale(): LocaleCode {
  // Fall back to English if the phone language isn't one we ship.
  const tag = Localization.getLocales()?.[0]?.languageCode?.toLowerCase() ?? "en";
  const match = LOCALES.find((l) => l.code === tag || tag.startsWith(l.code));
  return match?.code ?? "en";
}

function applyRtl(rtl: boolean) {
  // Flip layout direction for Arabic (and any other RTL locale).
  if (I18nManager.isRTL !== rtl) {
    I18nManager.allowRTL(rtl);
    I18nManager.forceRTL(rtl);
  }
}

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<LocaleCode>("en");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Prefer a saved choice; otherwise use the device language.
    AsyncStorage.getItem(STORAGE_KEY)
      .then((saved) => {
        let code: LocaleCode;
        if (saved && TRANSLATIONS[saved as LocaleCode]) {
          code = saved as LocaleCode;
        } else {
          code = detectDeviceLocale();
        }
        setLocaleState(code);
        applyRtl(!!LOCALES.find((l) => l.code === code)?.rtl);
      })
      .finally(() => setReady(true));
  }, []);

  const setLocale = useCallback(async (code: LocaleCode) => {
    // Update RTL first so the next render already uses the right direction.
    const rtl = !!LOCALES.find((l) => l.code === code)?.rtl;
    applyRtl(rtl);
    setLocaleState(code);
    await AsyncStorage.setItem(STORAGE_KEY, code);
  }, []);

  const isRtl = !!LOCALES.find((l) => l.code === locale)?.rtl;

  const t = useCallback(
    // Look up a string; English is the backup if a key is missing.
    (key: TranslationKey) =>
      TRANSLATIONS[locale]?.[key] ?? TRANSLATIONS.en[key] ?? key,
    [locale]
  );

  const value = useMemo(
    () => ({ locale, ready, setLocale, t, isRtl, locales: LOCALES }),
    [locale, ready, setLocale, t, isRtl]
  );

  return (
    <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
  );
}

export function useLocale() {
  // t("someKey") → translated string for the active language.
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error("useLocale must be used within LocaleProvider");
  return ctx;
}
