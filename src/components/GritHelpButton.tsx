import { useTheme } from "@/context/ThemeContext";
import { useA11y } from "@/hooks/useA11y";
import { useLocale } from "@/i18n/LocaleContext";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

const COUNTDOWN_START = 4;
const TICK_MS = 700;

type Props = {
  onActivated: () => void;
  onCancelled?: () => void;
  silent?: boolean;
};

// Big countdown button. Tap it to cancel before help is sent.
export function GritHelpButton({
  onActivated,
  onCancelled,
  silent = false,
}: Props) {
  const { colors, selectedTheme } = useTheme();
  const { t } = useLocale();
  const a11y = useA11y();
  // Silent / a11y mode uses a shorter countdown.
  const startSeconds = silent ? 2 : COUNTDOWN_START;
  const [seconds, setSeconds] = useState(startSeconds);
  const pulse = useRef(new Animated.Value(1)).current;
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const hasFired = useRef(false);
  const cancelled = useRef(false);
  // Skip the pulse animation when the student wants less motion.
  const reduceMotion = silent || a11y.reduceMotion;

  useEffect(() => {
    if (reduceMotion) {
      pulse.setValue(1);
      return;
    }
    // Soft pulse so the button feels urgent without being noisy.
    const useNative = Platform.OS !== "web";
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1.05,
          duration: 1500,
          useNativeDriver: useNative,
        }),
        Animated.timing(pulse, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: useNative,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [pulse, reduceMotion]);

  useEffect(() => {
    cancelled.current = false;
    hasFired.current = false;
    let remaining = startSeconds;
    setSeconds(remaining);

    // Buzz once when the countdown starts (skipped in silent mode).
    if (!silent && !a11y.reduceMotion) {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      } catch {
        /* web */
      }
    }

    // Tick down; when we hit zero, fire onActivated once.
    intervalRef.current = setInterval(() => {
      if (cancelled.current) return;
      remaining -= 1;
      setSeconds(remaining);
      if (!silent && !a11y.reduceMotion) {
        try {
          Haptics.selectionAsync();
        } catch {
          /* web */
        }
      }
      if (remaining <= 0) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        if (!hasFired.current && !cancelled.current) {
          hasFired.current = true;
          onActivated();
        }
      }
    }, TICK_MS);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [onActivated, startSeconds, silent, a11y.reduceMotion]);

  const handleCancelTap = () => {
    // Student tapped in time — stop the timer before help is sent.
    if (cancelled.current || hasFired.current) return;
    cancelled.current = true;
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (!silent && !a11y.reduceMotion) {
      try {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      } catch {
        /* web */
      }
    }
    onCancelled?.();
  };

  const isDark = selectedTheme === "dark";
  const coreSize = a11y.enabled ? 220 : 200;
  const ringSize = a11y.enabled ? 272 : 248;

  return (
    <Pressable
      onPress={handleCancelTap}
      accessibilityRole="button"
      accessibilityLabel={t("tapToCancelCountdown")}
      accessibilityHint={t("cancelIfAccidental")}
      style={{ minWidth: a11y.hit * 4, minHeight: a11y.hit * 4 }}
    >
      <Animated.View
        style={[
          styles.wrap,
          {
            width: ringSize + 72,
            height: ringSize + 72,
            transform: [{ scale: pulse }],
          },
        ]}
      >
        {!reduceMotion && (
          <>
            <View
              style={[
                styles.glowFar,
                {
                  width: ringSize + 64,
                  height: ringSize + 64,
                  borderRadius: (ringSize + 64) / 2,
                },
              ]}
            />
            <View
              style={[
                styles.glowNear,
                {
                  width: ringSize + 28,
                  height: ringSize + 28,
                  borderRadius: (ringSize + 28) / 2,
                },
              ]}
            />
          </>
        )}
        <View
          style={[
            styles.glowRing,
            {
              width: ringSize,
              height: ringSize,
              borderRadius: ringSize / 2,
            },
            reduceMotion && {
              borderColor: "#64748B",
              shadowOpacity: 0,
              elevation: 0,
            },
          ]}
        >
          <LinearGradient
            colors={
              reduceMotion
                ? ["#1F2937", "#111827", "#0B1220"]
                : isDark
                  ? ["#2A3A55", "#1E2E45", "#152238"]
                  : ["#1E4A88", "#143560", "#0C2348"]
            }
            start={{ x: 0.25, y: 0 }}
            end={{ x: 0.75, y: 1 }}
            style={[
              styles.core,
              {
                width: coreSize,
                height: coreSize,
                borderRadius: coreSize / 2,
              },
            ]}
          >
            <Text
              style={[
                styles.pressLabel,
                { fontSize: 13 * a11y.scale, color: colors.white },
              ]}
            >
              {silent ? t("silentSend") : t("sendingIn")}
            </Text>
            <Text
              style={[
                styles.countdownText,
                { fontSize: 64 * a11y.scale, color: colors.white },
              ]}
            >
              {seconds}
            </Text>
            <Text
              style={[
                styles.tapToCancel,
                { fontSize: 14 * a11y.scale, color: colors.accent },
              ]}
            >
              {t("tapToCancelCountdown")}
            </Text>
          </LinearGradient>
        </View>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: "center", justifyContent: "center" },
  glowFar: {
    position: "absolute",
    backgroundColor: "rgba(255, 55, 30, 0.16)",
  },
  glowNear: {
    position: "absolute",
    backgroundColor: "rgba(255, 75, 40, 0.38)",
    shadowColor: "#FF3B1A",
    shadowOpacity: 1,
    shadowRadius: 28,
    shadowOffset: { width: 0, height: 0 },
  },
  glowRing: {
    borderWidth: 4,
    borderColor: "#FF4D2E",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#FF3B1A",
    shadowOpacity: 0.55,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 0 },
    elevation: 12,
  },
  core: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  pressLabel: {
    fontWeight: "700",
    letterSpacing: 0.4,
    textAlign: "center",
  },
  countdownText: { fontWeight: "900", marginVertical: 4 },
  tapToCancel: { fontWeight: "800", textAlign: "center", marginTop: 4 },
});
