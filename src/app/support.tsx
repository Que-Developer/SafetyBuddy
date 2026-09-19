import { Ionicons } from "@expo/vector-icons";
import { Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS } from "@/constants/theme";
import { SUPPORT_SERVICES } from "@/data/mockData";

const GREEN = "#16A34A";

const SERVICE_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  "SUP-1": "chatbubbles", // Student Counselling
  "SUP-2": "people-circle", // Peer Support Network
  "SUP-3": "medkit", // Campus Health Clinic
  "SUP-4": "call", // 24/7 Crisis Line
};

export default function SupportScreen() {
  return (
    <SafeAreaView style={styles.safe} edges={["bottom"]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <Text style={styles.heroTitle}>You are not alone</Text>
          <Text style={styles.heroBody}>
            After an incident — or anytime you need help — campus and mental
            health support is available. Reach out when you are ready.
          </Text>
        </View>

        {SUPPORT_SERVICES.map((service) => {
          const icon = SERVICE_ICONS[service.id] ?? "heart";
          return (
            <View key={service.id} style={styles.card}>
              <View style={styles.iconWrap}>
                <Ionicons name={icon} size={22} color={GREEN} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.cardTitle}>{service.title}</Text>
                <Text style={styles.cardDetail}>{service.detail}</Text>
                <Text style={styles.cardAction}>{service.action}</Text>
              </View>
            </View>
          );
        })}

        <TouchableOpacity
          style={styles.callButton}
          onPress={() => Linking.openURL("tel:0800567567")}
        >
          <Ionicons name="call" size={20} color={COLORS.white} />
          <Text style={styles.callButtonText}>Call crisis support</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  scroll: { padding: 18, paddingBottom: 40 },
  hero: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  heroTitle: {
    color: COLORS.text,
    fontWeight: "800",
    fontSize: 22,
    marginBottom: 8,
  },
  heroBody: { color: COLORS.textMuted, fontSize: 14, lineHeight: 20 },
  card: {
    flexDirection: "row",
    gap: 12,
    backgroundColor: COLORS.cardAlt,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    alignItems: "center",
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(22,163,74,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  cardTitle: { color: COLORS.text, fontWeight: "800", fontSize: 15, marginBottom: 4 },
  cardDetail: { color: COLORS.textMuted, fontSize: 13, lineHeight: 18, marginBottom: 4 },
  cardAction: { color: GREEN, fontWeight: "700", fontSize: 13 },
  callButton: {
    marginTop: 10,
    backgroundColor: GREEN,
    borderRadius: 14,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  callButtonText: { color: COLORS.white, fontWeight: "800", fontSize: 15 },
});
