import { useSafetyModes } from "@/context/SafetyModesContext";
import { useTheme } from "@/context/ThemeContext";

/**
 * Shared accessibility tokens for large text, clear icons,
 * stronger contrast, and WCAG-friendly hit targets.
 */
export function useA11y() {
  const modes = useSafetyModes();
  const { colors, selectedTheme } = useTheme();
  const on = modes.accessibilityMode;

  return {
    enabled: on,
    scale: modes.scale,
    /** Preferred icon size (pt). */
    icon: on ? 28 : 22,
    /** Minimum touch target (pt). */
    hit: on ? 52 : 44,
    /** Body / UI text sizes. */
    title: 22 * modes.scale,
    body: 15 * modes.scale,
    caption: 13 * modes.scale,
    /** High-contrast text — muted never too faint when a11y is on. */
    text: colors.text,
    muted: on
      ? selectedTheme === "dark"
        ? "#E2EAF4"
        : "#1E1E3A"
      : colors.textMuted,
    dim: on
      ? selectedTheme === "dark"
        ? "#C5D2E3"
        : "#3A3A5A"
      : colors.textDim,
    /** Prefer reduced motion (pulse / haptics) when a11y or silent. */
    reduceMotion: on || modes.silentPanicMode,
    /** Tab / chrome sizing. */
    tabLabel: on ? 13 : 11,
    tabBarHeight: on ? 84 : 72,
    fontWeight: on ? ("800" as const) : ("700" as const),
  };
}
