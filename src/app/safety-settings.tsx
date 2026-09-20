import { AccessibilityPanel } from "@/components/AccessibilityPanel";
import { useSafetyModes } from "@/context/SafetyModesContext";
import { useTheme } from "@/context/ThemeContext";
import { useA11y } from "@/hooks/useA11y";
import { useLocale } from "@/i18n/LocaleContext";
import type { LocaleCode } from "@/i18n/types";
import { Ionicons } from "@expo/vector-icons";
import { useMemo } from "react";
import {
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SafetySettingsScreen() {
  const { colors } = useTheme();
  const { t, locale, setLocale, locales } = useLocale();
  const modes = useSafetyModes();
  const a11y = useA11y();

  const toggles: {
    key:
      | "accessibilityMode"
      | "lowDataMode"
      | "batteryAwareMode"
      | "silentPanicMode"
      | "anonymousDefault";
    title: string;
    sub: string;
  }[] = [
    {
      key: "accessibilityMode",
      title: t("accessibility"),
      sub: t("accessibilitySub"),
    },
    {
      key: "lowDataMode",
      title: t("lowData"),
      sub: t("lowDataSub"),
    },
    {
      key: "batteryAwareMode",
      title: t("batteryMode"),
      sub: t("batteryModeSub"),
    },
    {
      key: "silentPanicMode",
      title: t("silentPanic"),
      sub: t("silentPanicSub"),
    },
    {
      key: "anonymousDefault",
      title: t("anonymousReport"),
      sub: t("anonymousReportSub"),
    },
  ];

  const a11yItems = useMemo(
    () => [
      {
        key: "text",
        title: t("a11yLargeTextTitle"),
        body: t("a11yLargeTextBody"),
        icon: "text-outline" as const,
      },
      {
        key: "icons",
        title: t("a11yIconsTitle"),
        body: t("a11yIconsBody"),
        icon: "apps-outline" as const,
      },
      {
        key: "contrast",
        title: t("a11yContrastTitle"),
        body: t("a11yContrastBody"),
        icon: "contrast-outline" as const,
      },
      {
        key: "nav",
        title: t("a11yNavTitle"),
        body: t("a11yNavBody"),
        icon: "navigate-outline" as const,
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
        {modes.batteryLow && (
          <View style={[styles.warn, { backgroundColor: colors.card }]}>
            <Ionicons name="battery-half" size={a11y.icon} color={colors.caution} />
            <Text
              style={[
                styles.warnText,
                { color: a11y.text, fontSize: a11y.caption },
              ]}
            >
              {t("batteryLow")}
              {modes.batteryLevel != null
                ? ` (${Math.round(modes.batteryLevel * 100)}%)`
                : ""}
            </Text>
          </View>
        )}

        <AccessibilityPanel
          title={t("a11yPrinciplesTitle")}
          items={a11yItems}
        />

        <Text
          style={[
            styles.section,
            { color: colors.navy, fontSize: 12 * a11y.scale },
          ]}
          accessibilityRole="header"
        >
          {t("language").toUpperCase()}
        </Text>
        <View style={styles.langGrid}>
          {locales.map((l) => {
            const active = locale === l.code;
            return (
              <TouchableOpacity
                key={l.code}
                style={[
                  styles.langChip,
                  {
                    backgroundColor: active ? colors.navy : colors.card,
                    borderColor: colors.navy,
                    minHeight: a11y.hit - 8,
                    justifyContent: "center",
                  },
                ]}
                onPress={() => setLocale(l.code as LocaleCode)}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                accessibilityLabel={l.nativeLabel}
              >
                <Text
                  style={{
                    color: active ? colors.bg : a11y.text,
                    fontWeight: a11y.fontWeight,
                    fontSize: a11y.caption,
                  }}
                >
                  {l.nativeLabel}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text
          style={[
            styles.section,
            { color: colors.navy, fontSize: 12 * a11y.scale },
          ]}
          accessibilityRole="header"
        >
          MODES
        </Text>
        {toggles.map((item) => (
          <View
            key={item.key}
            style={[
              styles.toggleCard,
              { backgroundColor: colors.card, minHeight: a11y.hit + 12 },
            ]}
          >
            <View style={{ flex: 1, paddingRight: 10 }}>
              <Text
                style={[
                  styles.toggleTitle,
                  {
                    color: a11y.text,
                    fontSize: a11y.body,
                    fontWeight: a11y.fontWeight,
                  },
                ]}
              >
                {item.title}
              </Text>
              <Text
                style={[
                  styles.toggleSub,
                  {
                    color: a11y.muted,
                    fontSize: a11y.caption,
                    lineHeight: a11y.caption * 1.35,
                  },
                ]}
              >
                {item.sub}
              </Text>
            </View>
            <Switch
              value={modes[item.key]}
              onValueChange={(v) => modes.setMode(item.key, v)}
              trackColor={{ false: colors.textDim, true: colors.navy }}
              thumbColor={colors.white}
              accessibilityLabel={item.title}
              accessibilityHint={item.sub}
            />
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { padding: 18, paddingBottom: 40 },
  warn: {
    flexDirection: "row",
    gap: 10,
    padding: 12,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 14,
  },
  warnText: { flex: 1, fontWeight: "700" },
  section: {
    fontWeight: "800",
    letterSpacing: 0.8,
    marginBottom: 10,
    marginTop: 4,
  },
  langGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 18 },
  langChip: {
    borderWidth: 1.5,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  toggleCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
  },
  toggleTitle: {},
  toggleSub: { marginTop: 2 },
});
