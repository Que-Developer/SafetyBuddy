import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
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
import { useTheme } from "@/context/ThemeContext";
import {
  fetchSafetyResources,
  type SafetyResource,
} from "@/services/campusApi";

const GREEN = "#16A34A";

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
  const [resources, setResources] = useState<SafetyResource[]>([]);
  const [openId, setOpenId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSafetyResources()
      .then((list) => {
        setResources(list);
        setOpenId(list[0]?.id ?? null);
      })
      .catch((e) =>
        setError(e instanceof Error ? e.message : "Failed to load resources")
      )
      .finally(() => setLoading(false));
  }, []);

  const toggle = (id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <SafeAreaView
      style={[styles.safe, { backgroundColor: colors.bg }]}
      edges={["bottom"]}
    >
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={[styles.intro, { color: colors.textMuted }]}>
          Calm guidance for emergencies, walking, residences, and supporting
          friends. Tell us what kind of help you need — there is no wrong question.
        </Text>

        {loading ? (
          <ActivityIndicator color={colors.navy} style={{ marginTop: 12 }} />
        ) : null}
        {error ? (
          <Text style={{ color: colors.textMuted, marginBottom: 12 }}>{error}</Text>
        ) : null}
        {!loading && !error && resources.length === 0 ? (
          <Text style={{ color: colors.textMuted, marginBottom: 12 }}>
            No safety resources available.
          </Text>
        ) : null}

        {resources.map((r) => {
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
                <View style={styles.iconWrap}>
                  <Ionicons name={icon} size={20} color={GREEN} />
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
                  color={GREEN}
                />
              </View>
              {open && (
                <Text style={[styles.body, { color: colors.text }]}>{r.body}</Text>
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
  intro: {
    fontSize: 14,
    lineHeight: 21,
    marginBottom: 16,
  },
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
    backgroundColor: "rgba(22,163,74,0.12)",
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
