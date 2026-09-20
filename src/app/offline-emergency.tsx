import { AccessibilityPanel } from "@/components/AccessibilityPanel";
import { ReliabilityPanel } from "@/components/ReliabilityPanel";
import { OFFLINE_EMERGENCY } from "@/data/featureData";
import { useTheme } from "@/context/ThemeContext";
import { useA11y } from "@/hooks/useA11y";
import { useLocale } from "@/i18n/LocaleContext";
import { Ionicons } from "@expo/vector-icons";
import { useMemo } from "react";
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

export default function OfflineEmergencyScreen() {
  const { colors } = useTheme();
  const { t } = useLocale();
  const a11y = useA11y();
  const calls = OFFLINE_EMERGENCY.filter((i) => i.category === "Call now");
  const steps = OFFLINE_EMERGENCY.filter((i) => i.category === "Steps");

  const reliabilityItems = useMemo(
    () => [
      {
        key: "data",
        title: t("reliabilityNoDataTitle"),
        body: t("reliabilityNoDataBody"),
        icon: "cloud-offline-outline" as const,
      },
      {
        key: "location",
        title: t("reliabilityNoLocationTitle"),
        body: t("reliabilityNoLocationBody"),
        icon: "locate-outline" as const,
      },
      {
        key: "alert",
        title: t("reliabilityAlertFailTitle"),
        body: t("reliabilityAlertFailBody"),
        icon: "warning-outline" as const,
      },
      {
        key: "battery",
        title: t("reliabilityBatteryTitle"),
        body: t("reliabilityBatteryBody"),
        icon: "battery-half-outline" as const,
      },
      {
        key: "accidental",
        title: t("reliabilityAccidentalTitle"),
        body: t("reliabilityAccidentalBody"),
        icon: "hand-left-outline" as const,
      },
    ],
    [t]
  );

  const a11yItems = useMemo(
    () => [
      {
        key: "text",
        title: t("a11yLargeTextTitle"),
        body: t("a11yLargeTextBody"),
        icon: "text-outline" as const,
      },
      {
        key: "emergency",
        title: t("a11yEmergencyTitle"),
        body: t("a11yEmergencyBody"),
        icon: "warning-outline" as const,
      },
      {
        key: "disability",
        title: t("a11yDisabilityTitle"),
        body: t("a11yDisabilityBody"),
        icon: "heart-outline" as const,
      },
    ],
    [t]
  );

  return (
    <SafeAreaView
      style={[styles.safe, { backgroundColor: colors.bg }]}
      edges={["bottom"]}
    >
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={[styles.badge, { backgroundColor: colors.card }]}>
          <Ionicons name="cloud-offline" size={a11y.icon} color={colors.navy} />
          <Text
            style={[
              styles.badgeText,
              { color: a11y.text, fontSize: a11y.caption },
            ]}
          >
            {t("offlineReady")} {t("offlineEmergencyNote")}
          </Text>
        </View>

        <ReliabilityPanel title={t("reliabilityTitle")} items={reliabilityItems} />
        <AccessibilityPanel title={t("a11yPrinciplesTitle")} items={a11yItems} />

        <Text
          style={[
            styles.section,
            { color: colors.navy, fontSize: 12 * a11y.scale },
          ]}
          accessibilityRole="header"
        >
          {t("callNow")}
        </Text>
        {calls.map((c) => (
          <TouchableOpacity
            key={c.id}
            style={[
              styles.card,
              { backgroundColor: colors.card, minHeight: a11y.hit + 16 },
            ]}
            onPress={() => c.phone && dial(c.phone)}
            accessibilityRole="button"
            accessibilityLabel={`Call ${c.title}`}
            accessibilityHint={c.phone ? `Dials ${c.phone}` : undefined}
          >
            <View style={[styles.icon, { backgroundColor: colors.navy }]}>
              <Ionicons name="call" size={a11y.icon - 4} color={colors.bg} />
            </View>
            <View style={{ flex: 1 }}>
              <Text
                style={[
                  styles.title,
                  {
                    color: a11y.text,
                    fontSize: a11y.body,
                    fontWeight: a11y.fontWeight,
                  },
                ]}
              >
                {c.title}
              </Text>
              <Text
                style={[
                  styles.body,
                  {
                    color: a11y.muted,
                    fontSize: a11y.caption,
                    lineHeight: a11y.caption * 1.4,
                  },
                ]}
              >
                {c.body}
              </Text>
              {c.phone ? (
                <Text
                  style={[
                    styles.phone,
                    { color: colors.navy, fontSize: a11y.caption },
                  ]}
                >
                  {c.phone}
                </Text>
              ) : null}
            </View>
          </TouchableOpacity>
        ))}

        <Text
          style={[
            styles.section,
            { color: colors.navy, fontSize: 12 * a11y.scale },
          ]}
          accessibilityRole="header"
        >
          {t("stepsTab")}
        </Text>
        {steps.map((s) => (
          <View
            key={s.id}
            style={[styles.card, { backgroundColor: colors.card }]}
            accessible
            accessibilityRole="text"
            accessibilityLabel={`${s.title}. ${s.body}`}
          >
            <View style={{ flex: 1 }}>
              <Text
                style={[
                  styles.title,
                  {
                    color: a11y.text,
                    fontSize: a11y.body,
                    fontWeight: a11y.fontWeight,
                  },
                ]}
              >
                {s.title}
              </Text>
              <Text
                style={[
                  styles.body,
                  {
                    color: a11y.muted,
                    fontSize: a11y.caption,
                    lineHeight: a11y.caption * 1.4,
                  },
                ]}
              >
                {s.body}
              </Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { padding: 18, paddingBottom: 40 },
  badge: {
    flexDirection: "row",
    gap: 10,
    padding: 12,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 16,
  },
  badgeText: { flex: 1, fontWeight: "700" },
  section: {
    fontWeight: "800",
    letterSpacing: 0.8,
    marginBottom: 8,
    marginTop: 4,
  },
  card: {
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    flexDirection: "row",
    gap: 12,
  },
  icon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {},
  body: { marginTop: 4 },
  phone: { fontWeight: "800", marginTop: 6 },
});
