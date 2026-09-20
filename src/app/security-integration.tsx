import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "@/context/ThemeContext";
import { useLocale } from "@/i18n/LocaleContext";
import { SECURITY_INTEGRATION } from "@/data/featureData";

export default function SecurityIntegrationScreen() {
  const { colors } = useTheme();
  const { t } = useLocale();

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]} edges={["bottom"]}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={[styles.title, { color: colors.text }]}>
          {SECURITY_INTEGRATION.title}
        </Text>
        <Text style={[styles.summary, { color: colors.textMuted }]}>
          {SECURITY_INTEGRATION.summary}
        </Text>
        <Text style={[styles.concept, { color: colors.caution }]}>
          {t("conceptNote")}
        </Text>

        {SECURITY_INTEGRATION.channels.map((ch) => (
          <View key={ch.name} style={[styles.card, { backgroundColor: colors.card }]}>
            <View style={styles.head}>
              <Ionicons name="shield-checkmark" size={22} color={colors.navy} />
              <Text style={[styles.name, { color: colors.text }]}>{ch.name}</Text>
            </View>
            <Text style={[styles.detail, { color: colors.textMuted }]}>
              {ch.detail}
            </Text>
          </View>
        ))}

        <TouchableOpacity
          style={[styles.cta, { backgroundColor: colors.navy }]}
          onPress={() => router.push("/ResponderDashboard")}
        >
          <Text style={[styles.ctaText, { color: colors.bg }]}>
            Open responder dashboard (demo)
          </Text>
        </TouchableOpacity>

        <Text style={[styles.footer, { color: colors.textDim }]}>
          {SECURITY_INTEGRATION.status}
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { padding: 18, paddingBottom: 40 },
  title: { fontWeight: "900", fontSize: 22 },
  summary: { fontSize: 14, lineHeight: 20, marginTop: 8 },
  concept: { fontSize: 12, fontWeight: "700", marginTop: 8, marginBottom: 14 },
  card: { borderRadius: 14, padding: 14, marginBottom: 10 },
  head: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 6 },
  name: { fontWeight: "800", fontSize: 15, flex: 1 },
  detail: { fontSize: 13, lineHeight: 19 },
  cta: {
    marginTop: 8,
    borderRadius: 14,
    padding: 16,
    alignItems: "center",
  },
  ctaText: { fontWeight: "800" },
  footer: { marginTop: 14, fontSize: 12, lineHeight: 18 },
});
