import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "@/context/ThemeContext";
import { useLocale } from "@/i18n/LocaleContext";
import { SAFE_ROUTES } from "@/data/featureData";

const LIGHT_COLOR = {
  Good: "#22C55E",
  Fair: "#F59E0B",
  Poor: "#EF4444",
} as const;

export default function SafeRoutesScreen() {
  const { colors } = useTheme();
  const { t } = useLocale();

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]} edges={["bottom"]}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={[styles.intro, { color: colors.textMuted }]}>
          {t("safeRoutesIntro")}
        </Text>

        {SAFE_ROUTES.map((r) => (
          <View key={r.id} style={[styles.card, { backgroundColor: colors.card }]}>
            <View style={styles.top}>
              <Text style={[styles.name, { color: colors.text }]}>{r.name}</Text>
              <View
                style={[
                  styles.pill,
                  { backgroundColor: LIGHT_COLOR[r.lighting] + "33" },
                ]}
              >
                <Text style={{ color: LIGHT_COLOR[r.lighting], fontWeight: "800", fontSize: 11 }}>
                  {r.lighting} light
                </Text>
              </View>
            </View>
            <Text style={[styles.meta, { color: colors.textMuted }]}>
              {r.from} → {r.to} · ~{r.minutes} min
            </Text>
            <Text style={[styles.notes, { color: colors.text }]}>{r.notes}</Text>
            <TouchableOpacity
              style={[styles.cta, { backgroundColor: colors.navy }]}
              onPress={() => router.push("/(tabs)/map")}
            >
              <Ionicons name="navigate" size={16} color={colors.bg} />
              <Text style={[styles.ctaText, { color: colors.bg }]}>
                {t("walkWithMe")}
              </Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { padding: 18, paddingBottom: 40 },
  intro: { fontSize: 14, lineHeight: 20, marginBottom: 14 },
  card: { borderRadius: 14, padding: 14, marginBottom: 12 },
  top: { flexDirection: "row", justifyContent: "space-between", gap: 8 },
  name: { fontWeight: "900", fontSize: 16, flex: 1 },
  pill: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4, alignSelf: "flex-start" },
  meta: { fontSize: 12, marginTop: 6 },
  notes: { fontSize: 13, lineHeight: 19, marginTop: 8 },
  cta: {
    marginTop: 12,
    borderRadius: 12,
    padding: 12,
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  ctaText: { fontWeight: "800" },
});
