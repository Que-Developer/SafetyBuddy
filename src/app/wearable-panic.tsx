import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "@/context/ThemeContext";
import { useLocale } from "@/i18n/LocaleContext";
import { WEARABLE_CONCEPT } from "@/data/featureData";

export default function WearablePanicScreen() {
  const { colors } = useTheme();
  const { t } = useLocale();

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]} edges={["bottom"]}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={[styles.hero, { backgroundColor: colors.card }]}>
          <View style={[styles.watch, { borderColor: colors.navy }]}>
            <Ionicons name="watch-outline" size={48} color={colors.navy} />
          </View>
          <Text style={[styles.title, { color: colors.text }]}>
            {WEARABLE_CONCEPT.title}
          </Text>
          <Text style={[styles.summary, { color: colors.textMuted }]}>
            {WEARABLE_CONCEPT.summary}
          </Text>
          <Text style={[styles.concept, { color: colors.caution }]}>
            {t("conceptNote")}
          </Text>
        </View>

        <Text style={[styles.section, { color: colors.navy }]}>CAPABILITIES</Text>
        {WEARABLE_CONCEPT.capabilities.map((c) => (
          <View key={c} style={[styles.row, { backgroundColor: colors.card }]}>
            <Ionicons name="checkmark-circle" size={20} color={colors.success} />
            <Text style={[styles.rowText, { color: colors.text }]}>{c}</Text>
          </View>
        ))}

        <Text style={[styles.section, { color: colors.navy }]}>PAIRING STEPS</Text>
        {WEARABLE_CONCEPT.pairingSteps.map((step, i) => (
          <View key={step} style={[styles.row, { backgroundColor: colors.card }]}>
            <View style={[styles.num, { backgroundColor: colors.navy }]}>
              <Text style={{ color: colors.bg, fontWeight: "900" }}>{i + 1}</Text>
            </View>
            <Text style={[styles.rowText, { color: colors.text }]}>{step}</Text>
          </View>
        ))}

        <TouchableOpacity
          style={[styles.cta, { backgroundColor: colors.navy }]}
          onPress={() => router.push("/(tabs)/panic")}
        >
          <Text style={[styles.ctaText, { color: colors.bg }]}>
            Try Help on phone (same flow)
          </Text>
        </TouchableOpacity>

        <Text style={[styles.footer, { color: colors.textDim }]}>
          {WEARABLE_CONCEPT.status}
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { padding: 18, paddingBottom: 40 },
  hero: { borderRadius: 16, padding: 18, alignItems: "center", marginBottom: 16 },
  watch: {
    width: 96,
    height: 96,
    borderRadius: 28,
    borderWidth: 3,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  title: { fontWeight: "900", fontSize: 20, textAlign: "center" },
  summary: { fontSize: 14, lineHeight: 20, textAlign: "center", marginTop: 8 },
  concept: { fontSize: 12, fontWeight: "700", marginTop: 10, textAlign: "center" },
  section: {
    fontWeight: "800",
    fontSize: 12,
    letterSpacing: 0.8,
    marginBottom: 8,
    marginTop: 8,
  },
  row: {
    flexDirection: "row",
    gap: 10,
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
    alignItems: "flex-start",
  },
  rowText: { flex: 1, fontSize: 13, lineHeight: 19 },
  num: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  cta: {
    marginTop: 12,
    borderRadius: 14,
    padding: 16,
    alignItems: "center",
  },
  ctaText: { fontWeight: "800" },
  footer: { marginTop: 14, fontSize: 12, lineHeight: 18 },
});
