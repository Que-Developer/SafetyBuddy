import { useTheme } from "@/context/ThemeContext";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Platform,
  StyleSheet,
  Text,
  View,
} from "react-native";

const COUNTDOWN_START = 5; // seconds
const TICK_MS = 500;      // 1 second per tick

type Props = {
  onActivated: () => void;
  onCancelled?: () => void;
};

export function GritHelpButton({ onActivated, onCancelled }: Props) {
  const { colors } = useTheme();
  const [seconds, setSeconds] = useState(COUNTDOWN_START);
  const pulse = useRef(new Animated.Value(1)).current;
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const hasFired = useRef(false);

  // --- PULSE ANIMATION ---
  useEffect(() => {
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
  }, [pulse]);

  // --- AUTO-START COUNTDOWN ON MOUNT ---
  useEffect(() => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {}

    let remaining = COUNTDOWN_START;

    intervalRef.current = setInterval(() => {
      remaining -= 1;

      // Tick haptic on each second
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch {}

      if (remaining <= 0) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        intervalRef.current = null;
        if (!hasFired.current) {
          hasFired.current = true;
          try {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          } catch {}
          onActivated();
        }
        return;
      }

      setSeconds(remaining);
    }, TICK_MS);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [onActivated]);

  // Called from outside by a Cancel button (in the parent screen)
  // We expose this via onCancelled — parent triggers via key change or state.

  return (
    <Animated.View
      style={[styles.wrap, { transform: [{ scale: pulse }] }]}
    >
      {/* Glow halo */}
      <View style={styles.glowFar} />
      <View style={styles.glowNear} />
      <View style={styles.glowRing}>
        <LinearGradient
          colors={
            colors.bg === "#1a2332"
              ? ["#2A3A55", "#1E2E45", "#152238"]
              : ["#1E4A88", "#143560", "#0C2348"]
          }
          start={{ x: 0.25, y: 0 }}
          end={{ x: 0.75, y: 1 }}
          style={styles.core}
        >
          <Text style={styles.pressLabel}>SENDING IN</Text>
          <Text style={styles.countdownText}>{seconds}</Text>
          <Text style={styles.tapToCancel}>CANCEL BELOW</Text>
        </LinearGradient>
      </View>
    </Animated.View>
  );
}

const CORE = 200;
const RING = 248;

const styles = StyleSheet.create({
  wrap: {
    width: RING + 72,
    height: RING + 72,
    alignItems: "center",
    justifyContent: "center",
  },
  glowFar: {
    position: "absolute",
    width: RING + 64,
    height: RING + 64,
    borderRadius: (RING + 64) / 2,
    backgroundColor: "rgba(255, 55, 30, 0.16)",
  },
  glowNear: {
    position: "absolute",
    width: RING + 28,
    height: RING + 28,
    borderRadius: (RING + 28) / 2,
    backgroundColor: "rgba(255, 75, 40, 0.38)",
    shadowColor: "#FF3B1A",
    shadowOpacity: 1,
    shadowRadius: 28,
    shadowOffset: { width: 0, height: 0 },
    elevation: 18,
  },
  glowRing: {
    width: RING,
    height: RING,
    borderRadius: RING / 2,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 18,
    borderColor: "#FF4E2A",
    backgroundColor: "transparent",
    shadowColor: "#FF5A28",
    shadowOpacity: 0.95,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 0 },
  },
  core: {
    width: CORE,
    height: CORE,
    borderRadius: CORE / 2,
    alignItems: "center",
    justifyContent: "center",
  },
  pressLabel: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "600",
    letterSpacing: 1.5,
    marginBottom: 2,
    textTransform: "uppercase",
  },
  countdownText: {
    color: "#FFFFFF",
    fontSize: 90,
    fontWeight: "900",
    lineHeight: 96,
    letterSpacing: 2,
  },
  tapToCancel: {
    color: "#FFD1D1",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1.2,
    marginTop: 2,
    textTransform: "uppercase",
  },
});