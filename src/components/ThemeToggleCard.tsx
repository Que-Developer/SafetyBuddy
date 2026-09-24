import { useTheme } from "@/context/ThemeContext";
import { useLocale } from "@/i18n/LocaleContext";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

/** Light / dark theme switch used on student, security, and admin screens. */
export function ThemeToggleCard() {
  const { colors, selectedTheme, setTheme } = useTheme();
  const { t } = useLocale();

  return (
    <View style={[styles.card, { backgroundColor: colors.card }]}>
      <Text style={[styles.title, { color: colors.text }]}>{t("appearance")}</Text>
      <Text style={[styles.hint, { color: colors.textMuted }]}>{t("themeHint")}</Text>
      <View
        style={[
          styles.track,
          { backgroundColor: colors.input, borderColor: colors.tileBorder },
        ]}
      >
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityState={{ selected: selectedTheme === "yellow" }}
          accessibilityLabel={t("lightThemeA11y")}
          activeOpacity={0.85}
          onPress={() => setTheme("yellow")}
          style={[
            styles.option,
            selectedTheme === "yellow" && { backgroundColor: "#FFD24C" },
          ]}
        >
          <Ionicons
            name="sunny"
            size={16}
            color={selectedTheme === "yellow" ? "#000458" : colors.textMuted}
          />
          <Text
            style={[
              styles.label,
              {
                color:
                  selectedTheme === "yellow" ? "#000458" : colors.textMuted,
              },
            ]}
          >
            {t("lightTheme")}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityState={{ selected: selectedTheme === "dark" }}
          accessibilityLabel={t("darkTheme")}
          activeOpacity={0.85}
          onPress={() => setTheme("dark")}
          style={[
            styles.option,
            selectedTheme === "dark" && { backgroundColor: "#002B5B" },
          ]}
        >
          <Ionicons
            name="moon"
            size={16}
            color={selectedTheme === "dark" ? "#FFD24C" : colors.textMuted}
          />
          <Text
            style={[
              styles.label,
              {
                color:
                  selectedTheme === "dark" ? "#FFD24C" : colors.textMuted,
              },
            ]}
          >
            {t("darkTheme")}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    padding: 14,
    marginBottom: 14,
  },
  title: { fontSize: 15, fontWeight: "800", marginBottom: 4 },
  hint: { fontSize: 12, marginBottom: 12 },
  track: {
    flexDirection: "row",
    borderRadius: 12,
    borderWidth: 1,
    padding: 4,
    gap: 4,
  },
  option: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
  },
  label: { fontSize: 13, fontWeight: "800" },
});
