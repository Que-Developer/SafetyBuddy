import { useSafetyModes } from "@/context/SafetyModesContext";
import { useTheme } from "@/context/ThemeContext";
import { useLocale } from "@/i18n/LocaleContext";
import {
  createPanicAlertRequest,
  updatePanicAlertStatus,
  type NotifiedResponder,
} from "@/services/panicAlerts";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type SendState = "sending" | "sent" | "queued" | "failed";

// Shown after panic countdown — grabs GPS and posts the alert to security.
export default function PanicCountdownAlert() {
  const router = useRouter();
  const { colors } = useTheme();
  const { t } = useLocale();
  const { batteryLow, effectiveLowData } = useSafetyModes();
  const [locationOk, setLocationOk] = useState<boolean | null>(null);
  const [sendState, setSendState] = useState<SendState>("sending");
  const [alertId, setAlertId] = useState<string | null>(null);
  const [responders, setResponders] = useState<NotifiedResponder[]>([]);
  const [errorText, setErrorText] = useState("");
  // Stop React Strict Mode from sending the same alert twice.
  const sentRef = useRef(false);

  useEffect(() => {
    if (sentRef.current) return;
    sentRef.current = true;

    let cancelled = false;

    (async () => {
      // Fall back to a campus label if GPS is off or denied.
      let locationLabel = "Campus location (GPS unavailable)";
      let lat: number | null = null;
      let lng: number | null = null;

      try {
        // Ask for GPS so security can see where the student is.
        const { status } = await Location.getForegroundPermissionsAsync();
        if (status === "granted") {
          const pos = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          });
          lat = pos.coords.latitude;
          lng = pos.coords.longitude;
          locationLabel = `Live GPS ${lat.toFixed(5)}, ${lng.toFixed(5)}`;
          if (!cancelled) setLocationOk(true);
        } else if (!cancelled) {
          setLocationOk(false);
        }
      } catch {
        if (!cancelled) setLocationOk(false);
      }

      // This is the actual SOS post to campus security.
      const result = await createPanicAlertRequest({
        locationLabel,
        lat,
        lng,
        notes:
          "Student triggered Panic / SOS from SafetyBuddy. Responders should contact the student and update alert status.",
      });

      if (cancelled) return;

      if (result.ok) {
        setAlertId(result.alert.id);
        setResponders(result.notifiedResponders);
        setSendState("sent");
        return;
      }

      // API was unreachable — we still queued it on the phone.
      if (result.queued) {
        setSendState("queued");
        setErrorText(result.error);
        return;
      }

      setSendState("failed");
      setErrorText(result.error);
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleEndCall = () => {
    // Fake phone-call UI — ending it closes the alert for responders.
    Alert.alert(t("endCall") + "?", t("endCallConfirm"), [
      { text: t("stayOnCall"), style: "cancel" },
      {
        text: t("endCall"),
        style: "destructive",
        onPress: async () => {
          // Student ends the "call" — mark the alert resolved on the server.
          if (alertId) {
            await updatePanicAlertStatus(alertId, { status: "Resolved" });
          }
          router.replace("/(tabs)/home");
        },
      },
    ]);
  };

  // Names of security staff the server says it notified.
  const responderNames =
    responders.length > 0
      ? responders.map((r) => r.fullName).join(", ")
      : null;

  const statusLine =
    sendState === "sending"
      ? t("sendingHelp")
      : sendState === "sent"
        ? t("helpSent")
        : sendState === "queued"
          ? t("queuedOfflineAlert")
          : t("alertFailFallback");

  // Decorative call controls — look like a phone UI, not wired up yet.
  const actions = [
    { icon: "pause" as const, label: t("hold") },
    { icon: "volume-high" as const, label: t("speaker") },
    { icon: "keypad" as const, label: t("keypad") },
    { icon: "videocam" as const, label: t("video") },
    { icon: "bluetooth" as const, label: t("bluetooth") },
  ];

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.bg }]}
      edges={["top", "bottom"]}
    >
      <View style={styles.header}>
        <Text style={[styles.appName, { color: colors.navy }]}>
          {t("appName")}
        </Text>
        <Text style={[styles.sosLabel, { color: colors.danger }]}>SOS</Text>
        <Text style={[styles.callingText, { color: colors.text }]}>
          {t("callingSecurity")}
        </Text>
        <Text style={[styles.statusLine, { color: colors.textMuted }]}>
          {statusLine}
        </Text>
        {sendState === "sent" && responderNames ? (
          <Text style={[styles.notified, { color: colors.navy }]}>
            Notified: {responderNames}
          </Text>
        ) : null}
        {sendState === "sending" ? (
          <ActivityIndicator
            color={colors.navy}
            style={{ marginTop: 10 }}
          />
        ) : null}
        {errorText && sendState !== "sent" ? (
          <Text style={[styles.error, { color: colors.danger }]}>
            {errorText}
          </Text>
        ) : null}
      </View>

      {locationOk === false && (
        <View style={[styles.banner, { backgroundColor: colors.card }]}>
          <Ionicons name="locate-outline" size={16} color={colors.caution} />
          <Text style={[styles.bannerText, { color: colors.text }]}>
            {t("locationUnavailable")}
          </Text>
        </View>
      )}
      {batteryLow && (
        <View style={[styles.banner, { backgroundColor: colors.card }]}>
          <Ionicons name="battery-half" size={16} color={colors.caution} />
          <Text style={[styles.bannerText, { color: colors.text }]}>
            {t("batteryLow")}
          </Text>
        </View>
      )}
      {effectiveLowData && (
        <View style={[styles.banner, { backgroundColor: colors.card }]}>
          <Ionicons name="cloud-offline-outline" size={16} color={colors.navy} />
          <Text style={[styles.bannerText, { color: colors.text }]}>
            {t("queuedOfflineAlert")}
          </Text>
        </View>
      )}

      <View
        style={[
          styles.imageContainer,
          { backgroundColor: colors.card, borderColor: colors.tileBorder },
        ]}
      >
        <Ionicons name="person" size={160} color={colors.navy} />
      </View>

      <View style={styles.buttonGrid}>
        <View style={styles.row}>
          {actions.slice(0, 3).map((a) => (
            <View key={a.label} style={styles.buttonWrapper}>
              <TouchableOpacity
                style={[styles.iconButton, { backgroundColor: colors.card }]}
              >
                <Ionicons name={a.icon} size={28} color={colors.text} />
              </TouchableOpacity>
              <Text style={[styles.buttonLabel, { color: colors.text }]}>
                {a.label}
              </Text>
            </View>
          ))}
        </View>
        <View style={styles.row}>
          {actions.slice(3).map((a) => (
            <View key={a.label} style={styles.buttonWrapper}>
              <TouchableOpacity
                style={[styles.iconButton, { backgroundColor: colors.card }]}
              >
                <Ionicons name={a.icon} size={28} color={colors.text} />
              </TouchableOpacity>
              <Text style={[styles.buttonLabel, { color: colors.text }]}>
                {a.label}
              </Text>
            </View>
          ))}
          <View style={styles.buttonWrapper}>
            <View style={{ width: 64, height: 64 }} />
          </View>
        </View>
      </View>

      <TouchableOpacity
        onPress={() => router.push("../offline-emergency")}
        style={styles.retryHint}
      >
        <Text style={{ color: colors.navy, fontSize: 13, fontWeight: "800" }}>
          {t("offlineEmergency")}
        </Text>
      </TouchableOpacity>

      <View style={styles.endCallContainer}>
        <TouchableOpacity
          onPress={handleEndCall}
          style={[styles.endCallBtn, { backgroundColor: colors.danger }]}
          accessibilityRole="button"
          accessibilityLabel={t("endCall")}
        >
          <MaterialIcons name="call-end" size={36} color={colors.white} />
          <Text style={[styles.endCallText, { color: colors.white }]}>
            {t("endCall")}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20 },
  header: { marginTop: 10, marginBottom: 12 },
  appName: { fontSize: 16, fontWeight: "700" },
  sosLabel: { fontSize: 14, fontWeight: "800", marginTop: 4 },
  callingText: { fontSize: 28, fontWeight: "700", marginTop: 6 },
  statusLine: { fontSize: 14, fontWeight: "600", marginTop: 8 },
  notified: { fontSize: 13, fontWeight: "700", marginTop: 6, lineHeight: 18 },
  error: { fontSize: 12, marginTop: 8, lineHeight: 16 },
  banner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: 12,
    padding: 10,
    marginBottom: 8,
  },
  bannerText: { flex: 1, fontSize: 12, fontWeight: "700", lineHeight: 16 },
  imageContainer: {
    alignSelf: "center",
    width: 180,
    height: 180,
    borderRadius: 90,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    marginVertical: 12,
  },
  buttonGrid: { marginTop: 8 },
  row: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 16,
  },
  buttonWrapper: { alignItems: "center", width: 80 },
  iconButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonLabel: { marginTop: 6, fontSize: 12, fontWeight: "600" },
  retryHint: { alignItems: "center", marginTop: 10 },
  endCallContainer: { marginTop: "auto", marginBottom: 20, alignItems: "center" },
  endCallBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderRadius: 28,
    paddingHorizontal: 28,
    paddingVertical: 14,
  },
  endCallText: { fontWeight: "800", fontSize: 16 },
});
