import { GritHelpButton } from "@/components/GritHelpButton";
import { useSafetyModes } from "@/context/SafetyModesContext";
import { useTheme } from "@/context/ThemeContext";
import { useA11y } from "@/hooks/useA11y";
import { useLocale } from "@/i18n/LocaleContext";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Panic tab — countdown, then jump to the calling / send-alert screen.
export default function PanicScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { t } = useLocale();
  const a11y = useA11y();
  const { silentPanicMode, batteryLow, effectiveLowData } = useSafetyModes();
  // Remount the button after cancel so the countdown starts fresh.
  const [buttonKey, setButtonKey] = useState(0);

  const startAlert = useCallback(() => {
    // Countdown done — open the screen that actually sends the SOS.
    router.replace("/panicCountdownAlert");
  }, [router]);

  const cancel = useCallback(() => {
    // Accidental tap — bump the key and show the canceled screen.
    setButtonKey((k) => k + 1);
    router.replace("/AlertCanceled");
  }, [router]);


  return (
    <SafeAreaView
      style={[styles.safe, { backgroundColor: colors.bg }]}
      edges={["bottom"]}
      accessibilityLabel={t("panicTitle")}
    >
      <Text
        style={[
          styles.title,
          {
            color: a11y.text,
            fontSize: a11y.title,
            fontWeight: a11y.fontWeight,
          },
        ]}
        accessibilityRole="header"
      >
        {t("sendingHelp")}
      </Text>
      <Text
        style={[
          styles.sub,
          { color: a11y.muted, fontSize: a11y.body, lineHeight: a11y.body * 1.4 },
        ]}
      >
        {t("cancelIfAccidental")}
      </Text>
      {/* Quiet mode shortens the countdown so help goes out faster. */}
      {silentPanicMode && (
        <Text
          style={[
            styles.silentBadge,
            { color: colors.navy, fontSize: a11y.caption },
          ]}
        >
          {t("silentModeActive")}
        </Text>
      )}
      {/* Battery / low-data cues so the student knows the phone is struggling. */}
      {batteryLow && (
        <View
          style={[styles.cue, { backgroundColor: colors.card, minHeight: a11y.hit }]}
          accessibilityRole="text"
          accessibilityLabel={t("batteryLow")}
        >
          <Ionicons name="battery-half" size={a11y.icon} color={colors.caution} />
          <Text
            style={{
              color: a11y.text,
              flex: 1,
              fontWeight: a11y.fontWeight,
              fontSize: a11y.caption,
            }}
          >
            {t("batteryLow")}
          </Text>
        </View>
      )}
      {effectiveLowData && (
        <View
          style={[styles.cue, { backgroundColor: colors.card, minHeight: a11y.hit }]}
          accessibilityRole="text"
          accessibilityLabel={t("queuedOfflineAlert")}
        >
          <Ionicons
            name="cloud-offline-outline"
            size={a11y.icon}
            color={colors.navy}
          />
          <Text
            style={{
              color: a11y.text,
              flex: 1,
              fontWeight: a11y.fontWeight,
              fontSize: a11y.caption,
            }}
          >
            {t("queuedOfflineAlert")}
          </Text>
        </View>
      )}

      <View style={styles.center}>
        <GritHelpButton
          key={buttonKey}
          onActivated={startAlert}
          onCancelled={cancel}
          silent={silentPanicMode || a11y.reduceMotion}
        />
      </View>

      <TouchableOpacity
        style={[styles.offlineLink, { minHeight: a11y.hit }]}
        onPress={() => router.push("/offline-emergency")}
        accessibilityRole="link"
        accessibilityLabel={t("offlineEmergency")}
      >
        <Text
          style={{
            color: a11y.muted,
            fontWeight: a11y.fontWeight,
            fontSize: a11y.caption,
          }}
        >
          {t("offlineEmergency")}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.cancelBtn,
          { backgroundColor: colors.navy, minHeight: a11y.hit + 8 },
        ]}
        onPress={cancel}
        accessibilityRole="button"
        accessibilityLabel={t("imSafe")}
        accessibilityHint={t("cancelIfAccidental")}
      >
        <Text
          style={[
            styles.cancelText,
            { color: colors.bg, fontSize: 16 * a11y.scale },
          ]}
        >
          {t("imSafe")}
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, padding: 20 },
  title: {},
  sub: { marginTop: 8 },
  silentBadge: { fontWeight: "800", marginTop: 10 },
  cue: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 10,
    borderRadius: 12,
    padding: 10,
  },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  offlineLink: { alignItems: "center", justifyContent: "center", marginBottom: 12 },
  cancelBtn: {
    marginTop: "auto",
    marginBottom: 24,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelText: { fontWeight: "900" },
});
