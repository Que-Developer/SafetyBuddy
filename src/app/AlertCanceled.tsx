import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "@/context/ThemeContext";

export default function AlertCanceledScreen() {
  const router = useRouter();
  const { colors } = useTheme();

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.bg }]}
      edges={["top", "bottom"]}
    >
      <View style={styles.content}>
        <View style={styles.greenCircle}>
          <Ionicons name="checkmark" size={50} color="#FFF" />
        </View>

        <Text style={[styles.title, { color: colors.text }]}>Alert cancelled</Text>
        <Text style={[styles.subtitle, { color: colors.textMuted }]}>
          You can send another alert at any time. If you still feel unsure,
          Call campus security or open More Help — support is available.
        </Text>

        <TouchableOpacity
          style={[styles.homeButton, { backgroundColor: colors.accent }]}
          onPress={() => router.replace("/(tabs)/home")}
        >
          <Text style={[styles.homeButtonText, { color: colors.bg }]}>
            Return to Home
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondary}
          onPress={() => router.replace("/support")}
        >
          <Text style={[styles.secondaryText, { color: colors.accent }]}>
            Talk to support services
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 30,
  },
  greenCircle: {
    backgroundColor: "#4ade80",
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 40,
    lineHeight: 22,
  },
  homeButton: {
    paddingVertical: 18,
    paddingHorizontal: 40,
    borderRadius: 30,
    width: "100%",
    alignItems: "center",
  },
  homeButtonText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  secondary: { marginTop: 14 },
  secondaryText: {
    fontWeight: "700",
    textDecorationLine: "underline",
  },
});
