import { router } from "expo-router";
import { useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "@/context/ThemeContext";
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
  const { colors } = useTheme();
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
    <SafeAreaView
      style={[styles.safe, { backgroundColor: colors.bg }]}
      edges={["bottom"]}
    >
      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.text }]}>
          Choose demo role
        </Text>
        <Text style={[styles.sub, { color: colors.textMuted }]}>
          Demonstration only. In production, roles are assigned through official
          university authentication — not self-selected.
        </Text>

        {ROLES.map((r) => (
          <TouchableOpacity
            key={r}
            style={[
              styles.card,
              { backgroundColor: colors.card },
              role === r && { borderColor: colors.accent },
            ]}
            onPress={() => choose(r)}
          >
            <Text style={[styles.cardText, { color: colors.text }]}>
              {ROLE_LABELS[r]}
            </Text>
            <Text style={[styles.cardHint, { color: colors.textMuted }]}>
              Sample account · {r}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { flex: 1, padding: 20 },
  title: { fontSize: 24, fontWeight: "900", marginBottom: 8 },
  sub: { fontSize: 14, lineHeight: 20, marginBottom: 18 },
  card: {
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "transparent",
  },
  cardText: { fontWeight: "800", fontSize: 16 },
  cardHint: { fontSize: 12, marginTop: 4 },
});
