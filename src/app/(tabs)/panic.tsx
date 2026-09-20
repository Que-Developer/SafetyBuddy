import { GritHelpButton } from "@/components/GritHelpButton";
import { useTheme } from "@/context/ThemeContext";
import { loadTrustedContacts, type TrustedContact } from "@/services/contacts";
import { getSharedLocation, type SharedLocation } from "@/services/location";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

/**
 * Panic tab:
 *  - Phase 1 (idle): Grit button auto-counts down 5 → 1
 *  - Phase 2 (sent): 2-second confirmation → auto-redirects to Calling Security
 */
export default function PanicScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const [phase, setPhase] = useState<"idle" | "sent">("idle");
  const [location, setLocation] = useState<SharedLocation | null>(null);
  const [contacts, setContacts] = useState<TrustedContact[]>([]);

  useEffect(() => {
    getSharedLocation().then(setLocation);
    loadTrustedContacts().then(setContacts);
  }, []);

  // When phase becomes "sent", wait 2 seconds then redirect to Calling Security
  useEffect(() => {
    if (phase !== "sent") return;
    const t = setTimeout(() => {
      router.replace("/panicCountdownAlert");
    }, 2000);
    return () => clearTimeout(t);
  }, [phase, router]);

  const startAlert = () => {
    setPhase("sent");
  };

  const cancel = () => {
    setPhase("idle");
    router.replace("/AlertCanceled");
  };

  // ==========================================
  // PHASE 1: IDLE — Grit button auto-countdown
  // ==========================================
  if (phase === "idle") {
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

  // ==========================================
  // PHASE 2: SENT — 2-second confirmation card
  // ==========================================
  return (
    <SafeAreaView
      style={[styles.safe, { backgroundColor: colors.bg }]}
      edges={["top", "bottom"]}
    >
      <Text style={[styles.title, { color: colors.text }]}>
        Sending emergency alert
      </Text>
      <Text style={[styles.sub, { color: colors.textMuted }]}>
        The alert will be sent automatically in a few seconds. You can also
        start this by shaking your phone from any tab. Tap cancel below if
        this was a mistake.
      </Text>

      <View style={[styles.card, { backgroundColor: colors.card }]}>
        <View style={styles.greenCircle}>
          <Ionicons name="checkmark" size={36} color="#fff" />
        </View>
        <Text style={[styles.sentTitle, { color: colors.text }]}>
          Help request sent
        </Text>
        <Text style={[styles.sub, { color: colors.textMuted }]}>
          Campus security and your trusted contacts were notified with your
          location. Connecting you now…
        </Text>
      </View>

      <View style={{ flex: 1, marginTop: 12 }}>
        <View style={[styles.contactRow, { backgroundColor: colors.card }]}>
          <Text style={[styles.contactName, { color: colors.text }]}>
            Campus Security
          </Text>
          <Text style={[styles.contactSub, { color: colors.textMuted }]}>
            Alert notified — dispatching
          </Text>
        </View>
        {contacts.slice(0, 3).map((c) => (
          <View
            key={c.id}
            style={[styles.contactRow, { backgroundColor: colors.card }]}
          >
            <Text style={[styles.contactName, { color: colors.text }]}>
              {c.name}
            </Text>
            <Text style={[styles.contactSub, { color: colors.textMuted }]}>
              via {c.preferredAlertMethod}
            </Text>
          </View>
        ))}
      </View>

      <TouchableOpacity
        style={[styles.cancelBtn, { backgroundColor: colors.navy }]}
        onPress={cancel}
      >
        <Text style={[styles.cancelText, { color: colors.white }]}>
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
  card: {
    borderRadius: 20,
    padding: 28,
    alignItems: "center",
    marginTop: 20,
  },
  greenCircle: {
    backgroundColor: "#22C55E",
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  sentTitle: { fontSize: 20, fontWeight: "900", marginBottom: 8 },
  cancelBtn: {
    marginTop: "auto",
    marginBottom: 24,
    borderRadius: 28,
    padding: 18,
    alignItems: "center",
  },
  cancelText: { fontWeight: "800", fontSize: 15 },
  contactRow: {
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
  },
  contactName: { fontWeight: "800", fontSize: 15 },
  contactSub: { fontSize: 12, marginTop: 2 },
});