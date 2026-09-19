import { GritHelpButton } from "@/components/GritHelpButton";
import { useTheme } from "@/context/ThemeContext";
import { loadTrustedContacts, type TrustedContact } from "@/services/contacts";
import { getSharedLocation, type SharedLocation } from "@/services/location";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

/**
 * Panic tab:
 *  - Shows the Grit button which auto-counts down 5  1
 *  - Immediately redirects to Calling Security when done
 *  - Cancel button aborts the countdown
 */
export default function PanicScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const [, setLocation] = useState<SharedLocation | null>(null);
  const [, setContacts] = useState<TrustedContact[]>([]);

  // Pre-load context data (kept for parity with the rest of the app)
  useEffect(() => {
    getSharedLocation().then(setLocation);
    loadTrustedContacts().then(setContacts);
  }, []);

  // Fired when the Grit button finishes its countdown
  const startAlert = () => {
    // No intermediate screen — go straight to Calling Security
    router.replace("/panicCountdownAlert");
  };

  const cancel = () => {
    router.replace("/AlertCanceled");
  };

  return (
    <SafeAreaView
      style={[styles.safe, { backgroundColor: colors.bg }]}
      edges={["top", "bottom"]}
    >
      <Text style={[styles.title, { color: colors.text }]}>
        Sending emergency alert
      </Text>
      <Text style={[styles.sub, { color: colors.textMuted }]}>
        The alert will be sent automatically in a few seconds. Tap cancel
        below if this was a mistake.
      </Text>

      <View style={styles.center}>
        <GritHelpButton onActivated={startAlert} />
      </View>

      <TouchableOpacity
        style={[styles.cancelBtn, { backgroundColor: colors.navy }]}
        onPress={cancel}
      >
        <Text style={[styles.cancelText, { color: colors.bg }]}>
          I'm safe — cancel alert
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, padding: 20 },
  title: { fontSize: 24, fontWeight: "900" },
  sub: { fontSize: 14, lineHeight: 20, marginTop: 8 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  cancelBtn: {
    marginTop: "auto",
    marginBottom: 24,
    borderRadius: 28,
    padding: 18,
    alignItems: "center",
  },
  cancelText: { fontWeight: "800", fontSize: 15 },
});