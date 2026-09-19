import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useRef } from "react";
import {
  Animated,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

type Props = {
  onActivated: () => void;
};

/**
 * GRIT-style panic button: dark navy core, PRESS TO GET / HELP.
 * One tap activates — calls campus security immediately.
 */
export function GritHelpButton({ onActivated }: Props) {
  const pulse = useRef(new Animated.Value(1)).current;

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

  const handlePress = async () => {
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } catch {
      /* web */
    }
    onActivated();
  };

  return (
    <Pressable
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityLabel="Press once to call campus security"
    >
      <Animated.View style={[styles.wrap, { transform: [{ scale: pulse }] }]}>
        <View style={styles.glowFar} />
        <View style={styles.glowNear} />
        <View style={styles.glowRing}>
          <LinearGradient
            colors={["#1E4A88", "#143560", "#0C2348"]}
            start={{ x: 0.25, y: 0 }}
            end={{ x: 0.75, y: 1 }}
            style={styles.core}
          >
            <Text style={styles.pressLabel}>PRESS TO GET</Text>
            <Text style={styles.helpText}>HELP</Text>
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
  helpText: {
    color: "#FFFFFF",
    fontSize: 46,
    fontWeight: "900",
    letterSpacing: 2,
    textTransform: "uppercase",
  },
});
