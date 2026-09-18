import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS } from "@/constants/theme";

export default function ReportSuccessScreen() {
  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <View style={styles.content}>
        <View style={styles.checkCircle}>
          <Ionicons name="checkmark" size={48} color={COLORS.white} />
        </View>

        <Text style={styles.title}>Concern shared</Text>
        <Text style={styles.subtitle}>
          Thank you. Your safety concern was recorded. Campus teams can use this
          information to improve safety — you do not have to manage the next
          steps alone.
        </Text>

        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={() => router.replace("/support")}
        >
          <Ionicons name="heart" size={18} color={COLORS.bgDeep} />
          <Text style={styles.primaryBtnText}>Go to Support Services</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryBtn}
          onPress={() => router.replace("/(tabs)/home")}
        >
          <Text style={styles.secondaryBtnText}>Return to Home</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
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
    backgroundColor: COLORS.success,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
  },
  title: {
    color: COLORS.text,
    fontSize: 26,
    fontWeight: "800",
    marginBottom: 10,
  },
  subtitle: {
    color: COLORS.textMuted,
    fontSize: 15,
    lineHeight: 22,
    textAlign: "center",
    marginBottom: 28,
  },
  primaryBtn: {
    width: "100%",
    backgroundColor: COLORS.accent,
    borderRadius: 14,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginBottom: 10,
  },
  primaryBtnText: { color: COLORS.white, fontWeight: "800", fontSize: 15 },
  secondaryBtn: {
    width: "100%",
    backgroundColor: COLORS.tile,
    borderRadius: 14,
    padding: 16,
    alignItems: "center",
  },
  secondaryBtnText: { color: COLORS.text, fontWeight: "800", fontSize: 15 },
});
