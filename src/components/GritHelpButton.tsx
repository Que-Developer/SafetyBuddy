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

const HOLD_MS = 3000;

type Props = {
  onActivated: () => void;
};

/**
 * GRIT-style panic button: dark navy core, PRESS TO GET / HELP,
 * thick soft red–orange glow ring, hold-to-activate.
 */
export function GritHelpButton({ onActivated }: Props) {
  const [holding, setHolding] = useState(false);
  const [progress, setProgress] = useState(0);
  const pulse = useRef(new Animated.Value(1)).current;
  const holdTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const holdStart = useRef<number | null>(null);

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

  const clearHold = () => {
    if (holdTimer.current) clearInterval(holdTimer.current);
    holdTimer.current = null;
    holdStart.current = null;
    setHolding(false);
    setProgress(0);
  };

  const startHold = async () => {
    setHolding(true);
    holdStart.current = Date.now();
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {
      /* web */
    }

    holdTimer.current = setInterval(() => {
      if (!holdStart.current) return;
      const elapsed = Date.now() - holdStart.current;
      const p = Math.min(1, elapsed / HOLD_MS);
      setProgress(p);
      if (p >= 1) {
        clearHold();
        onActivated();
      }
    }, 40);
  };

  return (
    <Pressable
      onPressIn={startHold}
      onPressOut={clearHold}
      accessibilityRole="button"
      accessibilityLabel="Hold for 3 seconds to send emergency help request"
    >
      <Animated.View
        style={[styles.wrap, { transform: [{ scale: pulse }] }]}
      >
        {/* Layered soft halo — matches GRIT red/orange glow */}
        <View style={styles.glowFar} />
        <View style={styles.glowNear} />
        <View style={styles.glowRing}>
          <LinearGradient
            colors={["#1E4A88", "#143560", "#0C2348"]}
            start={{ x: 0.25, y: 0 }}
            end={{ x: 0.75, y: 1 }}
            style={styles.core}
          >
            {holding ? (
              <>
                <Text style={styles.pressLabel}>HOLD TO SEND</Text>
                <Text style={styles.helpText}>{Math.round(progress * 100)}%</Text>
                <View style={styles.progressTrack}>
                  <View
                    style={[styles.progressFill, { width: `${progress * 100}%` }]}
                  />
                </View>
              </>
            ) : (
              <>
                <Text style={styles.pressLabel}>PRESS TO GET</Text>
                <Text style={styles.helpText}>HELP</Text>
              </>
            )}
          </LinearGradient>
        </View>
      </Animated.View>
    </Pressable>
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
    // Thick vivid ring like GRIT
    borderWidth: 18,
    borderColor: "#FF4E2A",
    backgroundColor: "transparent",
    // Soften ring edge
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
  helpText: {
    color: "#FFFFFF",
    fontSize: 46,
    fontWeight: "900",
    letterSpacing: 2,
    textTransform: "uppercase",
  },
  progressTrack: {
    marginTop: 14,
    width: 110,
    height: 5,
    borderRadius: 3,
    backgroundColor: "rgba(255,255,255,0.22)",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#FF5A28",
  },
});
