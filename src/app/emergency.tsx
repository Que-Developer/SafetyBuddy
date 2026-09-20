import { useTheme } from "@/context/ThemeContext";
import { EMERGENCY_CONTACTS, SUPPORT_SERVICES } from "@/data/mockData";
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

function dial(number: string) {
  Linking.openURL(`tel:${number.replace(/\s/g, "")}`);
}

export default function EmergencyScreen() {
  const { colors } = useTheme();
  const { t } = useLocale();

  return (
    <SafeAreaView
      style={[styles.safe, { backgroundColor: colors.bg }]}
      edges={["bottom"]}
    >
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={[styles.intro, { color: colors.textMuted }]}>
          {t("emergencyIntro")}
        </Text>

        {EMERGENCY_CONTACTS.map((c) => (
          <TouchableOpacity
            key={c.id}
            style={[styles.card, { backgroundColor: colors.card }]}
            onPress={() => dial(c.number)}
          >
            <View style={[styles.icon, { backgroundColor: colors.navy }]}>
              <Ionicons name="call" size={20} color={colors.bg} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.title, { color: colors.text }]}>
                {c.label}
              </Text>
              <Text style={[styles.number, { color: colors.textMuted }]}>
                {c.number}
              </Text>
            </View>
            <Text style={[styles.tap, { color: colors.navy }]}>
              {t("tapToCall")}
            </Text>
          </TouchableOpacity>
        ))}

        <Text style={[styles.section, { color: colors.text }]}>
          {t("moreSupport")}
        </Text>
        {SUPPORT_SERVICES.map((s) => (
          <View
            key={s.id}
            style={[styles.supportCard, { backgroundColor: colors.cardAlt }]}
          >
            <Text style={[styles.title, { color: colors.text }]}>{s.title}</Text>
            <Text style={[styles.detail, { color: colors.textMuted }]}>
              {s.detail}
            </Text>
            <Text style={[styles.action, { color: colors.navy }]}>
              {s.action}
            </Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { padding: 18, paddingBottom: 40 },
  intro: { fontSize: 14, lineHeight: 21, marginBottom: 16 },
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
  },
  icon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  title: { fontWeight: "800", fontSize: 15 },
  number: { marginTop: 2, fontSize: 13 },
  tap: { fontWeight: "800", fontSize: 10, letterSpacing: 0.6 },
  section: {
    fontWeight: "800",
    fontSize: 16,
    marginTop: 12,
    marginBottom: 10,
  },
  supportCard: { borderRadius: 14, padding: 14, marginBottom: 10 },
  detail: { fontSize: 13, lineHeight: 18, marginTop: 4 },
  action: { fontWeight: "700", fontSize: 12, marginTop: 6 },
});
