import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { GritHelpButton } from "@/components/GritHelpButton";
import { useTheme } from "@/context/ThemeContext";
import { loadTrustedContacts, type TrustedContact } from "@/services/contacts";
import { getSharedLocation, type SharedLocation } from "@/services/location";

/**
 * Panic tab stays IDLE until the student deliberately activates HELP.
 * This prevents accidental “calling security” when merely opening the tab.
 */
export default function PanicScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const [phase, setPhase] = useState<"idle" | "counting" | "sent">("idle");
  const [countdown, setCountdown] = useState(5);
  const [location, setLocation] = useState<SharedLocation | null>(null);
  const [contacts, setContacts] = useState<TrustedContact[]>([]);

  useEffect(() => {
    getSharedLocation().then(setLocation);
    loadTrustedContacts().then(setContacts);
  }, []);

  useEffect(() => {
    if (phase !== "counting") return;
    if (countdown <= 0) {
      setPhase("sent");
      return;
    }
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [phase, countdown]);

  useEffect(() => {
    if (phase !== "sent") return;
    const t = setTimeout(() => router.replace("/panicCountdownAlert"), 3500);
    return () => clearTimeout(t);
  }, [phase, router]);

  const startAlert = () => {
    setCountdown(5);
    setPhase("counting");
  };

  const cancel = () => {
    setPhase("idle");
    setCountdown(5);
    router.replace("/AlertCanceled");
  };

  if (phase === "idle") {
    return (
      <SafeAreaView
        style={[styles.safe, { backgroundColor: colors.bg }]}
        edges={["top", "bottom"]}
      >
        <Text style={[styles.title, { color: colors.text }]}>Panic alert</Text>
        <Text style={[styles.sub, { color: colors.textMuted }]}>
          Hold the button for 3 seconds only if you need help. Nothing is sent
          until you finish holding.
        </Text>
        <View style={styles.center}>
          <GritHelpButton onActivated={startAlert} />
          <Text style={[styles.holdHint, { color: colors.textMuted }]}>
            Hold for 3 seconds · release to cancel
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (phase === "counting") {
    return (
      <SafeAreaView
        style={[styles.safe, { backgroundColor: colors.bg }]}
        edges={["top", "bottom"]}
      >
        <Text style={[styles.title, { color: colors.text }]}>
          Sending help request
        </Text>
        <Text style={[styles.sub, { color: colors.textMuted }]}>
          Emergency alert will be sent in {countdown} seconds. Tap cancel if
          this was accidental.
        </Text>

        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <View style={styles.redCircle}>
            <Ionicons name="alert" size={36} color="#FFF" />
          </View>
          <Text style={[styles.alertType, { color: colors.navy }]}>
            HELP REQUEST
          </Text>
          <Text style={[styles.countdown, { color: colors.navy }]}>
            {countdown}
          </Text>
          <Text style={[styles.loc, { color: colors.textMuted }]}>
            Location: {location?.label ?? "Capturing…"}
          </Text>
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

  return (
    <SafeAreaView
      style={[styles.safe, { backgroundColor: colors.bg }]}
      edges={["top", "bottom"]}
    >
      <Text style={[styles.title, { color: colors.text }]}>Help is on the way</Text>
      <View style={[styles.card, { backgroundColor: colors.card }]}>
        <View style={styles.greenCircle}>
          <Ionicons name="checkmark" size={36} color="#fff" />
        </View>
        <Text style={[styles.sentTitle, { color: colors.text }]}>
          Help request sent
        </Text>
        <Text style={[styles.sub, { color: colors.textMuted }]}>
          Campus security and your trusted contacts were notified with your
          location. No phone call was placed automatically.
        </Text>
      </View>

      <View style={{ flex: 1, marginTop: 12 }}>
        <View style={[styles.contactRow, { backgroundColor: colors.card }]}>
          <Text style={[styles.contactName, { color: colors.text }]}>
            Campus Security
          </Text>
          <Text style={[styles.contactSub, { color: colors.textMuted }]}>
            Alert notified — not auto-dialed
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
  holdHint: { marginTop: 12, fontSize: 12 },
  card: {
    borderRadius: 20,
    padding: 28,
    alignItems: "center",
    marginTop: 20,
  },
  redCircle: {
    backgroundColor: "#E63946",
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
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
  alertType: { fontWeight: "800", letterSpacing: 1, fontSize: 13 },
  countdown: { fontSize: 80, fontWeight: "900", marginVertical: 6 },
  loc: { fontSize: 13, marginTop: 4 },
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
