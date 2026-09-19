import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { toast } from "@/components/toast";
import { useTheme } from "@/context/ThemeContext";

type Props = {
  size?: "sm" | "md";
  showLabel?: boolean;
};

export function ThemeToggleButton({ size = "md", showLabel = false }: Props) {
  const { selectedTheme, colors, setTheme } = useTheme();
  const next = selectedTheme === "yellow" ? "dark" : "yellow";
  const dim = size === "sm" ? 36 : 44;
  const icon = size === "sm" ? 16 : 20;

  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityLabel={`Switch to ${next} theme`}
      activeOpacity={0.85}
      onPress={() => {
        setTheme(next);
        toast.info(next === "dark" ? "Dark theme" : "Yellow theme");
      }}
      style={[
        styles.btn,
        {
          width: showLabel ? undefined : dim,
          height: dim,
          backgroundColor: colors.card,
          borderColor: colors.tileBorder,
          paddingHorizontal: showLabel ? 12 : 0,
        },
      ]}
    >
      <Ionicons
        name={selectedTheme === "yellow" ? "moon-outline" : "sunny-outline"}
        size={icon}
        color={colors.navy}
      />
      {showLabel ? (
        <View style={styles.labelWrap}>
          <Text style={[styles.label, { color: colors.text }]}>
            {selectedTheme === "yellow" ? "Dark" : "Yellow"}
          </Text>
        </View>
      ) : null}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  labelWrap: { justifyContent: "center" },
  label: { fontWeight: "800", fontSize: 13 },
});
