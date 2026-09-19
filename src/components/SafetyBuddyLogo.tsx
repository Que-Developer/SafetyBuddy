import { StyleSheet, Text, View } from "react-native";
import { COLORS } from "@/constants/theme";

type Props = { size?: "sm" | "md" | "lg" };

export function SafetyBuddyLogo({ size = "lg" }: Props) {
  const scale = size === "sm" ? 0.55 : size === "md" ? 0.75 : 1;

  return (
    <View style={[styles.frame, { transform: [{ scale }] }]}>
      <View style={styles.shield}>
        <Text style={styles.safety}>SAFETY</Text>
        <Text style={styles.buddy}>BUDDY</Text>
        <View style={styles.ribbon}>
          <Text style={styles.ribbonText}>CAMPUS SECURITY APP</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    backgroundColor: COLORS.white,
    padding: 18,
    borderRadius: 8,
    borderWidth: 3,
    borderColor: COLORS.navy,
    alignItems: "center",
  },
  shield: {
    borderWidth: 3,
    borderColor: COLORS.navy,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 22,
    alignItems: "center",
    backgroundColor: COLORS.white,
    minWidth: 220,
  },
  safety: {
    color: COLORS.navy,
    fontSize: 34,
    fontWeight: "900",
    letterSpacing: 1,
  },
  buddy: {
    color: COLORS.bg,
    fontSize: 34,
    fontWeight: "900",
    letterSpacing: 1,
    textShadowColor: COLORS.navy,
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 1,
    // outline effect via navy border simulation
    marginTop: -2,
  },
  ribbon: {
    marginTop: 10,
    backgroundColor: COLORS.navy,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 4,
  },
  ribbonText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.2,
  },
});
