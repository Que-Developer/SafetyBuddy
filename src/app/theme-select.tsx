import { router } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { SafetyBuddyLogo } from "@/components/SafetyBuddyLogo";
import { useTheme, type ThemeMode } from "@/context/ThemeContext";

export default function ThemeSelectScreen() {
  const { setMode, colors } = useTheme();

  const choose = async (mode: ThemeMode) => {
    await setMode(mode);
    router.replace("/login");
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]}>
      <View style={styles.center}>
        <SafetyBuddyLogo size="md" />
        <Text style={[styles.title, { color: colors.text }]}>
          Choose your look
        </Text>
        <Text style={[styles.sub, { color: colors.textMuted }]}>
          Pick a default theme for SafetyBuddy. You can keep yellow or switch to
          navy.
        </Text>

        <TouchableOpacity
          style={[styles.option, { backgroundColor: "#FFD24C", borderColor: "#002B5B" }]}
          onPress={() => choose("yellow")}
        >
          <Text style={[styles.optionTitle, { color: "#002B5B" }]}>Yellow</Text>
          <Text style={[styles.optionSub, { color: "#0A0A3D" }]}>
            Bright campus daytime look
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.option, { backgroundColor: "#002B5B", borderColor: "#FFD24C" }]}
          onPress={() => choose("navy")}
        >
          <Text style={[styles.optionTitle, { color: "#FFD24C" }]}>Navy</Text>
          <Text style={[styles.optionSub, { color: "#B8C5D6" }]}>
            Darker evening-friendly look
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  center: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: "center",
    gap: 12,
  },
  title: {
    marginTop: 28,
    fontSize: 28,
    fontWeight: "900",
    textAlign: "center",
  },
  sub: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
    marginBottom: 12,
  },
  option: {
    borderRadius: 16,
    borderWidth: 2,
    padding: 18,
    marginTop: 4,
  },
  optionTitle: { fontSize: 20, fontWeight: "900" },
  optionSub: { fontSize: 13, marginTop: 4 },
});
