import { useTheme } from "@/context/ThemeContext";
import { StyleSheet, Text, View } from "react-native";

type Props = { size?: "sm" | "md" | "lg" };

/** Brand mark — always yellow shield on white (not theme-dependent). */
export function SafetyBuddyLogo({ size = "lg" }: Props) {
  const { colors } = useTheme();
  const scale = size === "sm" ? 0.55 : size === "md" ? 0.75 : 1;
  const brandYellow = "#FFD24C";
  const brandNavy = "#000458";

  return (
    <View style={[styles.frame, { transform: [{ scale }], borderColor: brandNavy }]}>
      <View style={[styles.shield, { borderColor: brandNavy }]}>
        <Text style={[styles.safety, { color: brandNavy }]}>SAFETY</Text>
        <Text
          style={[
            styles.buddy,
            { color: brandYellow, textShadowColor: brandNavy },
          ]}
        >
          BUDDY
        </Text>
        <View style={[styles.ribbon, { backgroundColor: brandNavy }]}>
          <Text style={[styles.ribbonText, { color: colors.white }]}>
            CAMPUS SECURITY APP
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    backgroundColor: "#FFFFFF",
    padding: 18,
    borderRadius: 8,
    borderWidth: 3,
    alignItems: "center",
  },
  shield: {
    borderWidth: 3,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 22,
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    minWidth: 220,
  },
  safety: {
    fontSize: 34,
    fontWeight: "900",
    letterSpacing: 1,
  },
  buddy: {
    fontSize: 34,
    fontWeight: "900",
    letterSpacing: 1,
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 1,
    marginTop: -2,
  },
  ribbon: {
    marginTop: 10,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 4,
  },
  ribbonText: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.2,
  },
});
