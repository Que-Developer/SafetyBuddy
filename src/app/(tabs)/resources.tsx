import { useTheme } from "@/context/ThemeContext";
import { useLocale } from "@/i18n/LocaleContext";
import { SAFETY_RESOURCES } from "@/data/mockData";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  LayoutAnimation,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  UIManager,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const RESOURCE_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  "RES-1": "alert-circle",
  "RES-2": "shield-checkmark",
  "RES-3": "walk",
  "RES-4": "bus",
  "RES-5": "home",
  "RES-6": "people",
  "RES-7": "heart",
};

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function ResourcesScreen() {
  const { colors } = useTheme();
  const { t } = useLocale();
  const [openId, setOpenId] = useState<string | null>(SAFETY_RESOURCES[0]?.id);

  const toggle = (id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <SafeAreaView
      style={[styles.safe, { backgroundColor: colors.bg }]}
      edges={["bottom"]}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.intro, { color: colors.textMuted }]}>
          {t("resourcesIntro")}
        </Text>

        {SAFETY_RESOURCES.map((r) => {
          const open = openId === r.id;
          const icon = RESOURCE_ICONS[r.id] ?? "leaf";
          return (
            <TouchableOpacity
              key={r.id}
              style={[
                styles.card,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.tileBorder,
                },
              ]}
              onPress={() => toggle(r.id)}
              activeOpacity={0.9}
            >
              <View style={styles.cardHeader}>
                <View
                  style={[
                    styles.iconWrap,
                    { backgroundColor: colors.success + "22" },
                  ]}
                >
                  <Ionicons name={icon} size={20} color={colors.success} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.title, { color: colors.text }]}>
                    {r.title}
                  </Text>
                  <Text style={[styles.summary, { color: colors.textMuted }]}>
                    {r.summary}
                  </Text>
                </View>
                <Ionicons
                  name={open ? "chevron-up" : "chevron-down"}
                  size={18}
                  color={colors.success}
                />
              </View>
              {open && (
                <Text style={[styles.body, { color: colors.text }]}>
                  {r.body}
                </Text>
              )}
            </TouchableOpacity>
          );
        })}
        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { padding: 18 },
  intro: { fontSize: 14, lineHeight: 21, marginBottom: 16 },
  card: {
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
  },
  cardHeader: { flexDirection: "row", gap: 12, alignItems: "flex-start" },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  title: { fontWeight: "800", fontSize: 15, marginBottom: 4 },
  summary: { fontSize: 12, lineHeight: 17 },
  body: {
    marginTop: 12,
    marginLeft: 52,
    opacity: 0.9,
    fontSize: 14,
    lineHeight: 21,
  },
});
