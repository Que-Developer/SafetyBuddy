import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "@/context/ThemeContext";
import {
  fetchSupportServices,
  type SupportService,
} from "@/services/campusApi";

const GREEN = "#16A34A";

const SERVICE_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  "SUP-1": "chatbubbles",
  "SUP-2": "people-circle",
  "SUP-3": "medkit",
  "SUP-4": "call",
  chatbubbles: "chatbubbles",
  "people-circle": "people-circle",
  medkit: "medkit",
  call: "call",
  heart: "heart",
};

function resolveIcon(
  service: SupportService
): keyof typeof Ionicons.glyphMap {
  if (service.iconKey && SERVICE_ICONS[service.iconKey]) {
    return SERVICE_ICONS[service.iconKey];
  }
  return SERVICE_ICONS[service.id] ?? "heart";
}

export default function SupportScreen() {
  const { colors } = useTheme();
  const [services, setServices] = useState<SupportService[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSupportServices()
      .then(setServices)
      .catch((e) =>
        setError(e instanceof Error ? e.message : "Failed to load support services")
      )
      .finally(() => setLoading(false));
  }, []);

  return (
    <SafeAreaView
      style={[styles.safe, { backgroundColor: colors.bg }]}
      edges={["bottom"]}
    >
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={[styles.hero, { backgroundColor: colors.card }]}>
          <Text style={[styles.heroTitle, { color: colors.text }]}>
            You are not alone
          </Text>
          <Text style={[styles.heroBody, { color: colors.textMuted }]}>
            After an incident — or anytime you need help — campus and mental
            health support is available. Reach out when you are ready.
          </Text>
        </View>

        {loading ? (
          <ActivityIndicator color={colors.navy} style={{ marginTop: 12 }} />
        ) : null}
        {error ? (
          <Text style={{ color: colors.textMuted, marginBottom: 12 }}>{error}</Text>
        ) : null}
        {!loading && !error && services.length === 0 ? (
          <Text style={{ color: colors.textMuted, marginBottom: 12 }}>
            No support services available.
          </Text>
        ) : null}

        {services.map((service) => {
          const icon = resolveIcon(service);
          return (
            <View
              key={service.id}
              style={[styles.card, { backgroundColor: colors.cardAlt }]}
            >
              <View style={styles.iconWrap}>
                <Ionicons name={icon} size={22} color={GREEN} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.cardTitle, { color: colors.text }]}>
                  {service.title}
                </Text>
                <Text style={[styles.cardDetail, { color: colors.textMuted }]}>
                  {service.detail}
                </Text>
                <Text style={styles.cardAction}>{service.action}</Text>
              </View>
            </View>
          );
        })}

        <TouchableOpacity
          style={styles.callButton}
          onPress={() => Linking.openURL("tel:0800567567")}
        >
          <Ionicons name="call" size={20} color={colors.white} />
          <Text style={[styles.callButtonText, { color: colors.white }]}>
            Call crisis support
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { padding: 18, paddingBottom: 40 },
  hero: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  heroTitle: {
    fontWeight: "800",
    fontSize: 22,
    marginBottom: 8,
  },
  heroBody: { fontSize: 14, lineHeight: 20 },
  card: {
    flexDirection: "row",
    gap: 12,
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
  cardTitle: { fontWeight: "800", fontSize: 15, marginBottom: 4 },
  cardDetail: { fontSize: 13, lineHeight: 18, marginBottom: 4 },
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
  callButtonText: { fontWeight: "800", fontSize: 15 },
});
