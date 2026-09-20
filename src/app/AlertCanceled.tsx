import { useTheme } from "@/context/ThemeContext";
import { useLocale } from "@/i18n/LocaleContext";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function AlertCanceledScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { t } = useLocale();

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.bg }]}
      edges={["top", "bottom"]}
    >
      <View style={styles.content}>
        <View style={[styles.greenCircle, { backgroundColor: colors.success }]}>
          <Ionicons name="checkmark" size={50} color={colors.white} />
        </View>

        <Text style={[styles.title, { color: colors.text }]}>
          {t("alertCancelled")}
        </Text>
        <Text style={[styles.subtitle, { color: colors.textMuted }]}>
          {t("alertCancelledSub")}
        </Text>

        <TouchableOpacity
          style={[styles.homeButton, { backgroundColor: colors.navy }]}
          onPress={() => router.replace("/(tabs)/home")}
        >
          <Text style={[styles.homeButtonText, { color: colors.bg }]}>
            {t("returnHome")}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondary}
          onPress={() => router.replace("/support")}
        >
          <Text style={[styles.secondaryText, { color: colors.navy }]}>
            {t("talkToSupport")}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 30,
  },
  greenCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 22,
  },
  title: { fontSize: 26, fontWeight: "900", textAlign: "center" },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: "center",
    marginTop: 10,
    marginBottom: 28,
  },
  homeButton: {
    borderRadius: 28,
    paddingVertical: 16,
    paddingHorizontal: 28,
    width: "100%",
    alignItems: "center",
  },
  homeButtonText: { fontWeight: "800", fontSize: 16 },
  secondary: { marginTop: 16, padding: 8 },
  secondaryText: { fontWeight: "700", fontSize: 14 },
});
