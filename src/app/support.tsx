import { useTheme } from "@/context/ThemeContext";
import { SUPPORT_SERVICES } from "@/data/mockData";
<<<<<<< HEAD
import { Ionicons } from "@expo/vector-icons";
import { Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const GREEN = "#16A34A";
=======
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
>>>>>>> a8cc0c78713501ce131694d807d00c10f2d05e35

const SERVICE_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  "SUP-1": "chatbubbles",
  "SUP-2": "people-circle",
  "SUP-3": "medkit",
  "SUP-4": "call",
};

export default function SupportScreen() {
  const { colors } = useTheme();
<<<<<<< HEAD
=======
  const { t } = useLocale();
>>>>>>> a8cc0c78713501ce131694d807d00c10f2d05e35

  return (
    <SafeAreaView
      style={[styles.safe, { backgroundColor: colors.bg }]}
      edges={["bottom"]}
    >
<<<<<<< HEAD
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={[styles.hero, { backgroundColor: colors.card }]}>
          <Text style={[styles.heroTitle, { color: colors.text }]}>You are not alone</Text>
          <Text style={[styles.heroBody, { color: colors.textMuted }]}>
            After an incident — or anytime you need help — campus and mental
            health support is available. Reach out when you are ready.
=======
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
>>>>>>> a8cc0c78713501ce131694d807d00c10f2d05e35
          </Text>
        </View>

        {SUPPORT_SERVICES.map((service) => {
          const icon = SERVICE_ICONS[service.id] ?? "heart";
          return (
            <View
              key={service.id}
<<<<<<< HEAD
              style={[styles.card, { backgroundColor: colors.cardAlt }]}
            >
              <View style={styles.iconWrap}>
                <Ionicons name={icon} size={22} color={GREEN} />
=======
              style={[styles.card, { backgroundColor: colors.card }]}
            >
              <View
                style={[styles.iconWrap, { backgroundColor: colors.tile }]}
              >
                <Ionicons name={icon} size={22} color={colors.success} />
>>>>>>> a8cc0c78713501ce131694d807d00c10f2d05e35
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.cardTitle, { color: colors.text }]}>
                  {service.title}
                </Text>
                <Text style={[styles.cardDetail, { color: colors.textMuted }]}>
                  {service.detail}
                </Text>
<<<<<<< HEAD
                <Text style={styles.cardAction}>{service.action}</Text>
=======
                <Text style={[styles.cardAction, { color: colors.navy }]}>
                  {service.action}
                </Text>
>>>>>>> a8cc0c78713501ce131694d807d00c10f2d05e35
              </View>
            </View>
          );
        })}

        <TouchableOpacity
          style={[styles.callButton, { backgroundColor: colors.navy }]}
          onPress={() => Linking.openURL("tel:0800567567")}
        >
<<<<<<< HEAD
          <Ionicons name="call" size={20} color={colors.white} />
          <Text style={[styles.callButtonText, { color: colors.white }]}>
            Call crisis support
=======
          <Ionicons name="call" size={20} color={colors.bg} />
          <Text style={[styles.callButtonText, { color: colors.bg }]}>
            {t("callCrisisSupport")}
>>>>>>> a8cc0c78713501ce131694d807d00c10f2d05e35
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { padding: 18, paddingBottom: 40 },
<<<<<<< HEAD
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
=======
  hero: { borderRadius: 16, padding: 16, marginBottom: 14 },
  heroTitle: { fontWeight: "900", fontSize: 22, marginBottom: 8 },
  heroBody: { fontSize: 14, lineHeight: 20 },
  card: {
>>>>>>> a8cc0c78713501ce131694d807d00c10f2d05e35
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
<<<<<<< HEAD
  cardAction: { color: GREEN, fontWeight: "700", fontSize: 13 },
=======
  cardAction: { fontWeight: "700", fontSize: 12 },
>>>>>>> a8cc0c78713501ce131694d807d00c10f2d05e35
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
