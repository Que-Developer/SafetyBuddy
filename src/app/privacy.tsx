import { COLORS } from "@/constants/theme";
import { PRIVACY_SECTIONS } from "@/data/mockData";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function PrivacyScreen() {
  return (
    <SafeAreaView style={styles.safe} edges={["bottom"]}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.heading}>Privacy notice</Text>
        <Text style={styles.intro}>
          SafetyBuddy is built for dignity and privacy. Below is how a production
          deployment would handle your information under POPIA-aligned principles.
        </Text>

        {PRIVACY_SECTIONS.map((section) => (
          <View key={section.title} style={styles.card}>
            <Text style={styles.title}>{section.title}</Text>
            <Text style={styles.body}>{section.body}</Text>
          </View>
        ))}

        <View style={styles.card}>
          <Text style={styles.title}>Reliability & edge cases</Text>
          <Text style={styles.body}>
            If you have no data, emergency numbers remain available for voice
            calls. If GPS is unavailable, the last known or selected campus zone
            is used. If an alert fails to send, the app shows a retry path and
            still offers one-tap calling. Low battery: keep Help and Call
            Security on the first screen. Accidental alerts: hold-to-activate plus
            a cancel window before dispatch.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.title}>Security (production)</Text>
          <Text style={styles.body}>
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
  safe: { flex: 1, backgroundColor: COLORS.bg },
  scroll: { padding: 18, paddingBottom: 40 },
  heading: { color: COLORS.text, fontSize: 24, fontWeight: "900", marginBottom: 8 },
  intro: { color: COLORS.textMuted, fontSize: 14, lineHeight: 21, marginBottom: 16 },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
  },
  title: { color: COLORS.accent, fontWeight: "800", fontSize: 14, marginBottom: 6 },
  body: { color: COLORS.text, opacity: 0.9, fontSize: 13, lineHeight: 20 },
});
