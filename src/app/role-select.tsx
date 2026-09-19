
import GlassPanel from "@/components/GlassPanel";
import { toast } from "@/components/toast";
import { useTheme } from "@/context/ThemeContext";
import {
  loadRole,
  ROLE_LABELS,
  saveRole,
  type AppRole,
} from "@/services/role";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const ROLES: AppRole[] = [
  "student",
  "campus_security",
  "student_support",
  "administrator",
];

const ROLE_ICONS: Record<AppRole, keyof typeof Ionicons.glyphMap> = {
  student: "school-outline",
  campus_security: "shield-outline",
  student_support: "heart-outline",
  administrator: "settings-outline",
};

export default function RoleSelectScreen() {
  const { colors } = useTheme();
  const [role, setRole] = useState<AppRole>("student");

  useEffect(() => {
    loadRole().then(setRole);
  }, []);

  const choose = async (next: AppRole) => {
    setRole(next);
    await saveRole(next);
    toast.success(ROLE_LABELS[next]);
    if (next === "campus_security") {
      router.replace("/ResponderDashboard");
    } else if (next === "administrator") {
      router.replace("/admin");
    } else if (next === "student_support") {
      router.replace("/support");
    } else {
      router.replace("/(tabs)/panic");
    }
  };

  return (
    <SafeAreaView
      style={[styles.safe, { backgroundColor: colors.bg }]}
      edges={["bottom"]}
    >
      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.text }]}>Role</Text>

        {ROLES.map((r) => (
          <GlassPanel
            key={r}
            radius={14}
            style={[
              styles.card,
              role === r ? { borderColor: colors.accent, borderWidth: 1.5 } : null,
            ]}
          >
            <TouchableOpacity
              style={styles.cardInner}
              onPress={() => choose(r)}
              activeOpacity={0.85}
            >
              <View style={styles.iconWrap}>
                <Ionicons
                  name={ROLE_ICONS[r]}
                  size={20}
                  color={colors.navy}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.cardText, { color: colors.text }]}>
                  {ROLE_LABELS[r]}
                </Text>
              </View>
              <Ionicons
                name="chevron-forward-outline"
                size={18}
                color={colors.textMuted}
              />
            </TouchableOpacity>
          </GlassPanel>
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { flex: 1, padding: 20 },
  title: { fontSize: 24, fontWeight: "900", marginBottom: 16 },
  card: { marginBottom: 10 },
  cardInner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 16,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.45)",
    alignItems: "center",
    justifyContent: "center",
  },
  cardText: { fontWeight: "800", fontSize: 16 },
});
