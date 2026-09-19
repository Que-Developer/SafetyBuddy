import { Ionicons } from "@expo/vector-icons";
import { Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS } from "@/constants/theme";
import { EMERGENCY_CONTACTS, SUPPORT_SERVICES } from "@/data/mockData";

function dial(number: string) {
  Linking.openURL(`tel:${number.replace(/\s/g, "")}`);
}

export default function EmergencyScreen() {
  return (
    <SafeAreaView style={styles.safe} edges={["bottom"]}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.intro}>
          Quick access to campus security, residence support, and wellness
          services. One tap places a real phone call on your device.
        </Text>

        {EMERGENCY_CONTACTS.map((c) => (
          <TouchableOpacity
            key={c.id}
            style={styles.card}
            onPress={() => dial(c.number)}
          >
            <View style={styles.icon}>
              <Ionicons name="call" size={20} color={COLORS.bgDeep} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.title}>{c.label}</Text>
              <Text style={styles.number}>{c.number}</Text>
            </View>
            <Text style={styles.tap}>TAP TO CALL</Text>
          </TouchableOpacity>
        ))}

        <Text style={styles.section}>More support</Text>
        {SUPPORT_SERVICES.map((s) => (
          <View key={s.id} style={styles.supportCard}>
            <Text style={styles.title}>{s.title}</Text>
            <Text style={styles.detail}>{s.detail}</Text>
            <Text style={styles.action}>{s.action}</Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  scroll: { padding: 18, paddingBottom: 40 },
  intro: { color: COLORS.textMuted, fontSize: 14, lineHeight: 21, marginBottom: 16 },
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: COLORS.card,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
  },
  icon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  title: { color: COLORS.text, fontWeight: "800", fontSize: 15 },
  number: { color: COLORS.textMuted, marginTop: 2, fontSize: 13 },
  tap: { color: COLORS.accent, fontWeight: "800", fontSize: 10, letterSpacing: 0.6 },
  section: {
    color: COLORS.text,
    fontWeight: "800",
    fontSize: 16,
    marginTop: 12,
    marginBottom: 10,
  },
  supportCard: {
    backgroundColor: COLORS.cardAlt,
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
  },
  detail: { color: COLORS.textMuted, fontSize: 13, marginTop: 4, lineHeight: 18 },
  action: { color: COLORS.accent, fontWeight: "700", marginTop: 6, fontSize: 13 },
});
