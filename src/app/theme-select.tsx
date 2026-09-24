import { useTheme } from "@/context/ThemeContext";
import { useLocale } from "@/i18n/LocaleContext";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ThemeSelectScreen() {
  const router = useRouter();
  const { setTheme } = useTheme();
  const { t } = useLocale();
  const [selectedTheme, setSelectedTheme] = useState<"yellow" | "dark">(
    "yellow"
  );

  const handleContinue = () => {
    setTheme(selectedTheme);
    router.replace("/login");
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <View style={styles.header}>
        <View style={styles.iconCircle}>
          <Ionicons name="color-palette-outline" size={24} color="#FFD24C" />
        </View>
        <View>
          <Text style={styles.headerTitle}>{t("themeSelectHeader")}</Text>
          <Text style={styles.headerSubtitle}>{t("themePersonalization")}</Text>
        </View>
      </View>

      <View style={styles.titleSection}>
        <Text style={styles.title}>{t("themeSelectBetween")}</Text>
        <Text style={styles.subtitle}>{t("themeSelectSubtitle")}</Text>
      </View>

      <TouchableOpacity
        style={[
          styles.card,
          styles.yellowCard,
          selectedTheme === "yellow" && styles.selectedCardBorder,
        ]}
        onPress={() => setSelectedTheme("yellow")}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityState={{ selected: selectedTheme === "yellow" }}
        accessibilityLabel={t("lightThemeA11y")}
      >
        <View style={styles.cardHeader}>
          <Ionicons name="sunny-outline" size={22} color="#000458" />
          <Text style={styles.yellowCardTitle}>{t("themeYellowTitle")}</Text>
          {selectedTheme === "yellow" && (
            <View style={styles.checkBadge}>
              <Ionicons name="checkmark" size={14} color="#FFF" />
            </View>
          )}
        </View>
        <Text style={styles.yellowCardText}>{t("themeYellowBody")}</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.card,
          styles.darkCard,
          selectedTheme === "dark" && styles.selectedCardBorder,
        ]}
        onPress={() => setSelectedTheme("dark")}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityState={{ selected: selectedTheme === "dark" }}
        accessibilityLabel={t("darkTheme")}
      >
        <View style={styles.cardHeader}>
          <Ionicons name="moon-outline" size={22} color="#FFF" />
          <Text style={styles.darkCardTitle}>{t("themeDarkTitle")}</Text>
          {selectedTheme === "dark" && (
            <View style={styles.checkBadge}>
              <Ionicons name="checkmark" size={14} color="#FFF" />
            </View>
          )}
        </View>
        <Text style={styles.darkCardText}>{t("themeDarkBody")}</Text>
      </TouchableOpacity>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.continueBtn} onPress={handleContinue}>
          <Text style={styles.continueBtnText}>{t("continue")}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFD24C", paddingHorizontal: 20 },
  header: { flexDirection: "row", alignItems: "center", marginTop: 12, gap: 12 },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#000458",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#000458",
    letterSpacing: 1,
  },
  headerSubtitle: { fontSize: 16, fontWeight: "600", color: "#000458" },
  titleSection: { marginTop: 28, marginBottom: 18 },
  title: { fontSize: 26, fontWeight: "bold", color: "#000458", marginBottom: 10 },
  subtitle: { fontSize: 14, color: "#000458", opacity: 0.8, lineHeight: 20 },
  card: { borderRadius: 16, padding: 18, marginBottom: 14 },
  yellowCard: { backgroundColor: "#fce07a" },
  yellowCardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000458",
    marginLeft: 10,
    flex: 1,
  },
  yellowCardText: {
    fontSize: 14,
    color: "#000458",
    opacity: 0.8,
    marginTop: 12,
    lineHeight: 20,
  },
  darkCard: { backgroundColor: "#1a2332" },
  darkCardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFF",
    marginLeft: 10,
    flex: 1,
  },
  darkCardText: {
    fontSize: 14,
    color: "#FFF",
    opacity: 0.7,
    marginTop: 12,
    lineHeight: 20,
  },
  cardHeader: { flexDirection: "row", alignItems: "center" },
  selectedCardBorder: { borderWidth: 3, borderColor: "#4ade80" },
  checkBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#4ade80",
    alignItems: "center",
    justifyContent: "center",
  },
  footer: { marginTop: "auto", paddingBottom: 24 },
  continueBtn: {
    backgroundColor: "#000458",
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
  },
  continueBtnText: { color: "#FFF", fontSize: 18, fontWeight: "800" },
});
