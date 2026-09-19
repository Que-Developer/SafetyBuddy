import { router } from "expo-router";
import { useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS } from "@/constants/theme";
import {
  loadRole,
  ROLE_LABELS,
  saveRole,
  type AppRole,
} from "@/services/role";

const ROLES: AppRole[] = [
  "student",
  "campus_security",
  "student_support",
  "administrator",
];

export default function RoleSelectScreen() {
  const [role, setRole] = useState<AppRole>("student");

  useEffect(() => {
    loadRole().then(setRole);
  }, []);

  const choose = async (next: AppRole) => {
    setRole(next);
    await saveRole(next);
    if (next === "campus_security") {
      router.replace("/ResponderDashboard");
    } else if (next === "administrator") {
      router.replace("/admin");
    } else if (next === "student_support") {
      router.replace("/support");
    } else {
      router.replace("/(tabs)/home");
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={["bottom"]}>
      <View style={styles.content}>
        <Text style={styles.title}>Choose demo role</Text>
        <Text style={styles.sub}>
          Demonstration only. In production, roles are assigned through official
          university authentication — not self-selected.
        </Text>

        {ROLES.map((r) => (
          <TouchableOpacity
            key={r}
            style={[styles.card, role === r && styles.cardOn]}
            onPress={() => choose(r)}
          >
            <Text style={styles.cardText}>{ROLE_LABELS[r]}</Text>
            <Text style={styles.cardHint}>Sample account · {r}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  content: { flex: 1, padding: 20 },
  title: { color: COLORS.white, fontSize: 24, fontWeight: "900", marginBottom: 8 },
  sub: { color: COLORS.textMuted, fontSize: 14, lineHeight: 20, marginBottom: 18 },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "transparent",
  },
  cardOn: { borderColor: COLORS.accent },
  cardText: { color: COLORS.white, fontWeight: "800", fontSize: 16 },
  cardHint: { color: COLORS.textMuted, fontSize: 12, marginTop: 4 },
});
