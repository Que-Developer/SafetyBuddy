import { useTheme } from "@/context/ThemeContext";
import { useLocale } from "@/i18n/LocaleContext";
import { PRIVACY_SECTIONS } from "@/data/mockData";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function PrivacyScreen() {
  const { colors } = useTheme();
  const { t } = useLocale();

  return (
    <SafeAreaView
      style={[styles.safe, { backgroundColor: colors.bg }]}
      edges={["bottom"]}
    >
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={[styles.heading, { color: colors.text }]}>
          {t("privacyNoticeTitle")}
        </Text>
        <Text style={[styles.intro, { color: colors.textMuted }]}>
          {t("privacyIntro")}
        </Text>

        {PRIVACY_SECTIONS.map((section) => (
          <View
            key={section.title}
            style={[styles.card, { backgroundColor: colors.card }]}
          >
            <Text style={[styles.title, { color: colors.navy }]}>
              {section.title}
            </Text>
            <Text style={[styles.body, { color: colors.text }]}>
              {section.body}
            </Text>
          </View>
        ))}

        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <Text style={[styles.title, { color: colors.navy }]}>
            {t("privacyReliabilityTitle")}
          </Text>
          <Text style={[styles.body, { color: colors.text }]}>
            {t("privacyReliabilityBody")}
          </Text>
        </View>

        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <Text style={[styles.title, { color: colors.navy }]}>
            {t("privacySecurityTitle")}
          </Text>
          <Text style={[styles.body, { color: colors.text }]}>
            {t("privacySecurityBody")}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { padding: 18, paddingBottom: 40 },
  heading: { fontSize: 24, fontWeight: "900", marginBottom: 8 },
  intro: { fontSize: 14, lineHeight: 21, marginBottom: 16 },
  card: {
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
  },
  title: { fontWeight: "800", fontSize: 14, marginBottom: 6 },
  body: { opacity: 0.95, fontSize: 13, lineHeight: 20 },
});
