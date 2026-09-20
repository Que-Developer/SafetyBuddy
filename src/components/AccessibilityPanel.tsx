import { CARD_SHADOW } from "@/constants/theme";
import { useA11y } from "@/hooks/useA11y";
import { useTheme } from "@/context/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

export type A11yItem = {
  key: string;
  title: string;
  body: string;
  icon: keyof typeof Ionicons.glyphMap;
};

type Props = {
  items: A11yItem[];
  title?: string;
};

/** Checklist explaining how the app supports accessibility. */
export function AccessibilityPanel({
  items,
  title = "Accessibility",
}: Props) {
  const { colors } = useTheme();
  const a11y = useA11y();

  return (
    <View
      style={[styles.wrap, { backgroundColor: colors.card }, CARD_SHADOW]}
      accessibilityRole="summary"
      accessibilityLabel={title}
    >
      <View style={styles.head}>
        <Ionicons
          name="accessibility"
          size={a11y.icon}
          color={colors.navy}
          accessibilityElementsHidden
        />
        <Text
          style={[
            styles.title,
            {
              color: a11y.text,
              fontSize: 15 * a11y.scale,
              fontWeight: a11y.fontWeight,
            },
          ]}
        >
          {title}
        </Text>
      </View>
      {items.map((item) => (
        <View key={item.key} style={styles.row} accessible>
          <View style={[styles.icon, { backgroundColor: colors.input }]}>
            <Ionicons name={item.icon} size={18} color={colors.navy} />
          </View>
          <View style={{ flex: 1 }}>
            <Text
              style={[
                styles.itemTitle,
                {
                  color: a11y.text,
                  fontSize: 14 * a11y.scale,
                  fontWeight: a11y.fontWeight,
                },
              ]}
            >
              {item.title}
            </Text>
            <Text
              style={[
                styles.itemBody,
                {
                  color: a11y.muted,
                  fontSize: 12 * a11y.scale,
                  lineHeight: 17 * a11y.scale,
                },
              ]}
            >
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
  title: {},
  row: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 10,
  },
  icon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  itemTitle: {},
  itemBody: {},
});
