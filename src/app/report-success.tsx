import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "@/context/ThemeContext";

export default function ReportSuccessScreen() {
  const { colors } = useTheme();

  return (
    <SafeAreaView
      style={[styles.safe, { backgroundColor: colors.bg }]}
      edges={["top", "bottom"]}
    >
      <View style={styles.content}>
        <View style={[styles.checkCircle, { backgroundColor: colors.success }]}>
          <Ionicons name="checkmark" size={48} color={colors.white} />
        </View>

        <Text style={[styles.title, { color: colors.text }]}>Concern shared</Text>
        <Text style={[styles.subtitle, { color: colors.textMuted }]}>
          Thank you. Your safety concern was recorded. Campus teams can use this
          information to improve safety — you do not have to manage the next
          steps alone.
        </Text>

        <TouchableOpacity
          style={[styles.primaryBtn, { backgroundColor: colors.accent }]}
          onPress={() => router.replace("/support")}
        >
          <Ionicons name="heart" size={18} color={colors.bg} />
          <Text style={[styles.primaryBtnText, { color: colors.bg }]}>
            Go to Support Services
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.secondaryBtn, { backgroundColor: colors.tile }]}
          onPress={() => router.replace("/(tabs)/home")}
        >
          <Text style={[styles.secondaryBtnText, { color: colors.text }]}>
            Return to Home
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  checkCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: "center",
    marginBottom: 28,
  },
  primaryBtn: {
    width: "100%",
    borderRadius: 14,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginBottom: 10,
  },
  primaryBtnText: { fontWeight: "800", fontSize: 15 },
  secondaryBtn: {
    width: "100%",
    borderRadius: 14,
    padding: 16,
    alignItems: "center",
  },
  secondaryBtnText: { fontWeight: "800", fontSize: 15 },
});
