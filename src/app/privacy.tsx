import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "@/context/ThemeContext";
import {
  fetchPrivacySections,
  type PrivacySection,
} from "@/services/campusApi";

export default function PrivacyScreen() {
  const { colors } = useTheme();
  const [sections, setSections] = useState<PrivacySection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPrivacySections()
      .then(setSections)
      .catch((e) =>
        setError(e instanceof Error ? e.message : "Failed to load privacy notice")
      )
      .finally(() => setLoading(false));
  }, []);

  return (
    <SafeAreaView
      style={[styles.safe, { backgroundColor: colors.bg }]}
      edges={["bottom"]}
    >
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={[styles.heading, { color: colors.text }]}>
          Privacy notice
        </Text>
        <Text style={[styles.intro, { color: colors.textMuted }]}>
          SafetyBuddy is built for dignity and privacy. Below is how a production
          deployment would handle your information under POPIA-aligned principles.
        </Text>

        {loading ? (
          <ActivityIndicator color={colors.navy} style={{ marginTop: 12 }} />
        ) : null}
        {error ? (
          <Text style={{ color: colors.textMuted, marginBottom: 12 }}>{error}</Text>
        ) : null}
        {!loading && !error && sections.length === 0 ? (
          <Text style={{ color: colors.textMuted, marginBottom: 12 }}>
            No privacy sections available.
          </Text>
        ) : null}

        {sections.map((section) => (
          <View
            key={section.id}
            style={[styles.card, { backgroundColor: colors.card }]}
          >
            <Text style={[styles.title, { color: colors.accent }]}>
              {section.title}
            </Text>
            <Text style={[styles.body, { color: colors.text }]}>
              {section.body}
            </Text>
          </View>
        ))}

        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <Text style={[styles.title, { color: colors.accent }]}>
            Reliability & edge cases
          </Text>
          <Text style={[styles.body, { color: colors.text }]}>
            If you have no data, emergency numbers remain available for voice
            calls. If GPS is unavailable, the last known or selected campus zone
            is used. If an alert fails to send, the app shows a retry path and
            still offers one-tap calling. Low battery: keep Help and Call
            Security on the first screen. Accidental alerts: hold-to-activate plus
            a cancel window before dispatch.
          </Text>
        </View>

        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <Text style={[styles.title, { color: colors.accent }]}>
            Security (production)
          </Text>
          <Text style={[styles.body, { color: colors.text }]}>
            Official university authentication, encrypted communication, secure
            storage, audit logs, and restricted access to sensitive emergency
            records would be required before live student use.
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
  body: { opacity: 0.9, fontSize: 13, lineHeight: 20 },
});
