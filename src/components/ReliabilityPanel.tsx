import { CARD_SHADOW } from "@/constants/theme";
import { useTheme } from "@/context/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

export type ReliabilityItem = {
  key: string;
  title: string;
  body: string;
  icon: keyof typeof Ionicons.glyphMap;
};

type Props = {
  items: ReliabilityItem[];
  title?: string;
};

/** Compact reliability checklist for emergency-critical screens. */
export function ReliabilityPanel({ items, title = "Reliability" }: Props) {
  const { colors } = useTheme();

  return (
    <View style={[styles.wrap, { backgroundColor: colors.card }, CARD_SHADOW]}>
      <View style={styles.head}>
        <Ionicons name="shield-checkmark" size={18} color={colors.navy} />
        <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
      </View>
      {items.map((item) => (
        <View key={item.key} style={styles.row}>
          <View style={[styles.icon, { backgroundColor: colors.input }]}>
            <Ionicons name={item.icon} size={16} color={colors.navy} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.itemTitle, { color: colors.text }]}>
              {item.title}
            </Text>
            <Text style={[styles.itemBody, { color: colors.textMuted }]}>
              {item.body}
            </Text>
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { borderRadius: 14, padding: 14, marginBottom: 14 },
  head: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
  },
  title: { fontWeight: "900", fontSize: 14 },
  row: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 10,
  },
  icon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  itemTitle: { fontWeight: "800", fontSize: 13 },
  itemBody: { fontSize: 12, lineHeight: 17, marginTop: 2 },
});
