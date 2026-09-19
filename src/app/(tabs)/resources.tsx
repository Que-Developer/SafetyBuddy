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
import { COLORS } from "@/constants/theme";
import { SAFETY_RESOURCES } from "@/data/mockData";

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
  const [openId, setOpenId] = useState<string | null>(SAFETY_RESOURCES[0]?.id);

  const toggle = (id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <SafeAreaView style={styles.safe} edges={["bottom"]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.intro}>
          Calm guidance for emergencies, walking, residences, and supporting
          friends. Tell us what kind of help you need — there is no wrong question.
        </Text>

        {SAFETY_RESOURCES.map((r) => {
          const open = openId === r.id;
          const icon = RESOURCE_ICONS[r.id] ?? "leaf";
          return (
            <TouchableOpacity
              key={r.id}
              style={styles.card}
              onPress={() => toggle(r.id)}
              activeOpacity={0.9}
            >
              <View style={styles.cardHeader}>
                <View style={styles.iconWrap}>
                  <Ionicons name={icon} size={20} color={GREEN} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.title}>{r.title}</Text>
                  <Text style={styles.summary}>{r.summary}</Text>
                </View>
                <Ionicons
                  name={open ? "chevron-up" : "chevron-down"}
                  size={18}
                  color={GREEN}
                />
              </View>
              {open && <Text style={styles.body}>{r.body}</Text>}
            </TouchableOpacity>
          );
        })}
        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  scroll: { padding: 18 },
  intro: {
    color: COLORS.textMuted,
    fontSize: 14,
    lineHeight: 21,
    marginBottom: 16,
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.tileBorder,
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
  title: { color: COLORS.text, fontWeight: "800", fontSize: 15, marginBottom: 4 },
  summary: { color: COLORS.textMuted, fontSize: 12, lineHeight: 17 },
  body: {
    marginTop: 12,
    marginLeft: 52,
    color: COLORS.text,
    opacity: 0.9,
    fontSize: 14,
    lineHeight: 21,
  },
});
