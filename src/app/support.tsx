import { useTheme } from "@/context/ThemeContext";
import { SUPPORT_SERVICES } from "@/data/mockData";
import { useLocale } from "@/i18n/LocaleContext";
import { Ionicons } from "@expo/vector-icons";
import {
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const SERVICE_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  "SUP-1": "chatbubbles",
  "SUP-2": "people-circle",
  "SUP-3": "medkit",
  "SUP-4": "call",
};

export default function SupportScreen() {
  const { colors } = useTheme();
  const { t } = useLocale();

  return (
    <SafeAreaView
      style={[styles.safe, { backgroundColor: colors.bg }]}
      edges={["bottom"]}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.hero, { backgroundColor: colors.card }]}>
          <Text style={[styles.heroTitle, { color: colors.text }]}>
            {t("youAreNotAlone")}
          </Text>
          <Text style={[styles.heroBody, { color: colors.textMuted }]}>
            {t("supportHeroBody")}
          </Text>
        </View>

        {SUPPORT_SERVICES.map((service) => {
          const icon = SERVICE_ICONS[service.id] ?? "heart";
          return (
            <View
              key={service.id}
              style={[styles.card, { backgroundColor: colors.card }]}
            >
              <View
                style={[styles.iconWrap, { backgroundColor: colors.tile }]}
              >
                <Ionicons name={icon} size={22} color={colors.success} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.cardTitle, { color: colors.text }]}>
                  {service.title}
                </Text>
                <Text style={[styles.cardDetail, { color: colors.textMuted }]}>
                  {service.detail}
                </Text>
                <Text style={[styles.cardAction, { color: colors.navy }]}>
                  {service.action}
                </Text>
              </View>
            </View>
          );
        })}

        <TouchableOpacity
          style={[styles.callButton, { backgroundColor: colors.navy }]}
          onPress={() => Linking.openURL("tel:0800567567")}
        >
          <Ionicons name="call" size={20} color={colors.bg} />
          <Text style={[styles.callButtonText, { color: colors.bg }]}>
            {t("callCrisisSupport")}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { padding: 18, paddingBottom: 40 },
  hero: { borderRadius: 16, padding: 16, marginBottom: 14 },
  heroTitle: { fontWeight: "900", fontSize: 22, marginBottom: 8 },
  heroBody: { fontSize: 14, lineHeight: 20 },
  card: {
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    flexDirection: "row",
    gap: 12,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  cardTitle: { fontWeight: "800", fontSize: 15, marginBottom: 4 },
  cardDetail: { fontSize: 13, lineHeight: 18, marginBottom: 4 },
  cardAction: { fontWeight: "700", fontSize: 12 },
  callButton: {
    marginTop: 8,
    borderRadius: 14,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  callButtonText: { fontWeight: "800", fontSize: 15 },
});
