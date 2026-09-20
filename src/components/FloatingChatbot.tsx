import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { useLocale } from "@/i18n/LocaleContext";
import { Ionicons } from "@expo/vector-icons";
import { usePathname } from "expo-router";
import { useState } from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ChatbotPanel } from "./ChatbotPanel";

// Don't show the floating bubble on splash / login / panic call screens.
const HIDDEN_PATHS = new Set([
  "/",
  "/index",
  "/splash",
  "/login",
  "/theme-select",
  "/panicCountdownAlert",
]);

// Floating chat button for logged-in users on most screens.
export function FloatingChatbot() {
  const { user } = useAuth();
  const { colors } = useTheme();
  const { t } = useLocale();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const [open, setOpen] = useState(false);

  // Guests and hidden routes get no FAB.
  if (!user) return null;
  if (HIDDEN_PATHS.has(pathname)) return null;

  return (
    <>
      <TouchableOpacity
        style={[
          styles.fab,
          {
            backgroundColor: colors.navy,
            // Sit above the tab bar so it stays tappable.
            bottom: Math.max(88, insets.bottom + 72),
            right: 16,
          },
        ]}
        onPress={() => setOpen(true)}
        accessibilityRole="button"
        accessibilityLabel={t("openChat")}
        activeOpacity={0.9}
      >
        <Ionicons name="chatbubbles" size={26} color={colors.bg} />
      </TouchableOpacity>

      <Modal
        visible={open}
        animationType="slide"
        transparent
        onRequestClose={() => setOpen(false)}
      >
        <View style={styles.modalRoot}>
          {/* Tap outside to close. */}
          <Pressable style={styles.scrim} onPress={() => setOpen(false)} />
          <View
            style={[
              styles.sheet,
              {
                backgroundColor: colors.bg,
                paddingBottom: insets.bottom + 8,
              },
            ]}
          >
            <View style={styles.sheetHeader}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.sheetTitle, { color: colors.text }]}>
                  {t("chatbot")}
                </Text>
                <Text style={[styles.sheetSub, { color: colors.textMuted }]}>
                  {t("chatFollowsAppLanguage")}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setOpen(false)}
                accessibilityLabel={t("closeChat")}
                style={styles.closeBtn}
              >
                <Ionicons name="close" size={24} color={colors.navy} />
              </TouchableOpacity>
            </View>
            <View style={{ flex: 1 }}>
              {/* Compact layout fits the bottom sheet height. */}
              <ChatbotPanel compact />
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: "absolute",
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 50,
    elevation: 12,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  modalRoot: { flex: 1, justifyContent: "flex-end" },
  scrim: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  sheet: {
    height: "78%",
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    overflow: "hidden",
  },
  sheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 8,
  },
  sheetTitle: { fontSize: 18, fontWeight: "900" },
  sheetSub: { fontSize: 12, marginTop: 2 },
  closeBtn: { padding: 8 },
});
