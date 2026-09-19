import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Linking,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { GritHelpButton } from "@/components/GritHelpButton";
import { useTheme } from "@/context/ThemeContext";
import {
  createEmergencyAlert,
  fetchHelpContacts,
  type HelpContact,
} from "@/services/campusApi";
import { loadTrustedContacts, type TrustedContact } from "@/services/contacts";
import { getSharedLocation, type SharedLocation } from "@/services/location";

const FALLBACK_SECURITY: HelpContact = {
  id: "fallback",
  label: "Campus Security",
  number: "+27 41 504 2000",
};

function dialNumber(number: string) {
  const digits = number.replace(/\s/g, "");
  return Linking.openURL(`tel:${digits}`);
}

/**
 * Panic tab: one press on HELP creates an emergency alert and dials campus security.
 */
export default function PanicScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const [phase, setPhase] = useState<"idle" | "calling">("idle");
  const [location, setLocation] = useState<SharedLocation | null>(null);
  const [contacts, setContacts] = useState<TrustedContact[]>([]);
  const [security, setSecurity] = useState<HelpContact | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getSharedLocation().then(setLocation);
    loadTrustedContacts().then(setContacts);
    fetchHelpContacts()
      .then((list) => {
        const campus =
          list.find((c) => c.label === "Campus Security") ?? list[0] ?? null;
        setSecurity(campus);
      })
      .catch((e) =>
        setError(e instanceof Error ? e.message : "Failed to load security number")
      )
      .finally(() => setLoading(false));
  }, []);

  const securityContact = security ?? FALLBACK_SECURITY;

  const callSecurity = async () => {
    setPhase("calling");
    try {
      await createEmergencyAlert({
        alertType: "Panic",
        locationLabel: location?.label,
      });
    } catch {
      /* still dial even if alert creation fails */
    }
    try {
      await dialNumber(securityContact.number);
    } catch {
      /* dialer unavailable (e.g. web) — stay on calling screen */
    }
  };

  const cancel = () => {
    setPhase("idle");
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
          Press once to call campus security immediately. Your phone dialer will
          open with {securityContact.number}.
        </Text>
        {loading ? (
          <ActivityIndicator color={colors.navy} style={{ marginTop: 16 }} />
        ) : null}
        {error ? (
          <Text style={{ color: colors.textMuted, marginTop: 8 }}>{error}</Text>
        ) : null}
        <View style={styles.center}>
          <GritHelpButton onActivated={callSecurity} />
          <Text style={[styles.holdHint, { color: colors.textMuted }]}>
            Tap once · calls {securityContact.label}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.safe, { backgroundColor: colors.bg }]}
      edges={["top", "bottom"]}
    >
      <Text style={[styles.title, { color: colors.text }]}>Calling security</Text>
      <Text style={[styles.sub, { color: colors.textMuted }]}>
        Your device should be dialing campus security now. Stay on the line if
        you can.
      </Text>

      <View style={[styles.card, { backgroundColor: colors.card }]}>
        <View style={styles.redCircle}>
          <Ionicons name="call" size={36} color="#FFF" />
        </View>
        <Text style={[styles.alertType, { color: colors.navy }]}>
          CAMPUS SECURITY
        </Text>
        <Text style={[styles.number, { color: colors.text }]}>
          {securityContact.number}
        </Text>
        <Text style={[styles.loc, { color: colors.textMuted }]}>
          Location: {location?.label ?? "Capturing…"}
        </Text>
      </View>

      <TouchableOpacity
        style={[styles.redialBtn, { backgroundColor: colors.accent }]}
        onPress={callSecurity}
      >
        <Ionicons name="call" size={18} color={colors.bg} />
        <Text style={[styles.redialText, { color: colors.bg }]}>
          Call again
        </Text>
      </TouchableOpacity>

      <View style={{ flex: 1, marginTop: 12 }}>
        {contacts.slice(0, 3).map((c) => (
          <View
            key={c.id}
            style={[styles.contactRow, { backgroundColor: colors.card }]}
          >
            <Text style={[styles.contactName, { color: colors.text }]}>
              {c.name}
            </Text>
            <Text style={[styles.contactSub, { color: colors.textMuted }]}>
              Trusted · {c.preferredAlertMethod}
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
  alertType: { fontWeight: "800", letterSpacing: 1, fontSize: 13 },
  number: { fontSize: 28, fontWeight: "900", marginVertical: 8 },
  loc: { fontSize: 13, marginTop: 4 },
  redialBtn: {
    marginTop: 14,
    borderRadius: 14,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  redialText: { fontWeight: "800", fontSize: 15 },
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
