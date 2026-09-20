import { Ionicons } from "@expo/vector-icons";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useState } from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "@/context/ThemeContext";
import { useLocale } from "@/i18n/LocaleContext";
import {
  findCheckpointByCode,
  QR_CHECKPOINTS,
  type QrCheckpoint,
} from "@/data/featureData";

export default function QrScanScreen() {
  const { colors } = useTheme();
  const { t } = useLocale();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [found, setFound] = useState<QrCheckpoint | null>(null);
  const [manual, setManual] = useState("");
  const [error, setError] = useState("");

  const applyCode = (data: string) => {
    const hit = findCheckpointByCode(data);
    if (hit) {
      setFound(hit);
      setError("");
      setScanned(true);
    } else {
      setFound(null);
      setError("Unknown QR. Try a campus SafetyBuddy code like SB-QR-LIBRARY.");
    }
  };

  const cameraSupported = Platform.OS !== "web";

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]} edges={["bottom"]}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={[styles.intro, { color: colors.textMuted }]}>
          {t("qrIntro")}
        </Text>

        {cameraSupported && permission?.granted ? (
          <View style={styles.cameraWrap}>
            <CameraView
              style={StyleSheet.absoluteFill}
              barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
              onBarcodeScanned={
                scanned
                  ? undefined
                  : (result: { data: string }) => {
                      setScanned(true);
                      applyCode(result.data);
                    }
              }
            />
            <View style={styles.frame} />
          </View>
        ) : cameraSupported ? (
          <TouchableOpacity
            style={[styles.permBtn, { backgroundColor: colors.navy }]}
            onPress={requestPermission}
          >
            <Text style={[styles.permText, { color: colors.bg }]}>
              {t("allowCameraQr")}
            </Text>
          </TouchableOpacity>
        ) : (
          <View style={[styles.webNote, { backgroundColor: colors.card }]}>
            <Ionicons name="desktop-outline" size={22} color={colors.navy} />
            <Text style={[styles.webNoteText, { color: colors.textMuted }]}>
              Camera QR scan works on a phone build. On web, enter a checkpoint
              code below or tap a sample.
            </Text>
          </View>
        )}

        {found && (
          <View style={[styles.result, { backgroundColor: colors.card }]}>
            <Text style={[styles.resultLabel, { color: colors.success }]}>
              {t("checkpointFound")}
            </Text>
            <Text style={[styles.resultTitle, { color: colors.text }]}>
              {found.name}
            </Text>
            <Text style={[styles.meta, { color: colors.textMuted }]}>
              {found.zone} · {found.code}
            </Text>
            <Text style={[styles.body, { color: colors.text }]}>{found.tip}</Text>
            <Text style={[styles.help, { color: colors.navy }]}>
              Nearest help: {found.nearestHelp}
            </Text>
            <TouchableOpacity
              style={[styles.again, { backgroundColor: colors.navy }]}
              onPress={() => {
                setScanned(false);
                setFound(null);
              }}
            >
              <Text style={[styles.againText, { color: colors.bg }]}>
                {t("scanAgain")}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {!!error && (
          <Text style={[styles.error, { color: colors.danger }]}>{error}</Text>
        )}

        <Text style={[styles.section, { color: colors.navy }]}>Enter code</Text>
        <View style={styles.row}>
          <TextInput
            style={[
              styles.input,
              { backgroundColor: colors.input, color: colors.text },
            ]}
            placeholder="SB-QR-LIBRARY"
            placeholderTextColor={colors.textDim}
            autoCapitalize="characters"
            value={manual}
            onChangeText={setManual}
          />
          <TouchableOpacity
            style={[styles.go, { backgroundColor: colors.navy }]}
            onPress={() => applyCode(manual)}
          >
            <Ionicons name="checkmark" size={22} color={colors.bg} />
          </TouchableOpacity>
        </View>

        <Text style={[styles.section, { color: colors.navy }]}>
          Sample checkpoints
        </Text>
        {QR_CHECKPOINTS.map((c) => (
          <TouchableOpacity
            key={c.id}
            style={[styles.sample, { backgroundColor: colors.card }]}
            onPress={() => applyCode(c.code)}
          >
            <Ionicons name="qr-code-outline" size={20} color={colors.navy} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.sampleTitle, { color: colors.text }]}>
                {c.name}
              </Text>
              <Text style={[styles.meta, { color: colors.textMuted }]}>
                {c.code}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { padding: 18, paddingBottom: 40 },
  intro: { fontSize: 14, lineHeight: 20, marginBottom: 14 },
  cameraWrap: {
    height: 260,
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 14,
  },
  frame: {
    ...StyleSheet.absoluteFill,
    borderWidth: 2,
    borderColor: "rgba(255,210,76,0.7)",
    margin: 36,
    borderRadius: 12,
  },
  permBtn: {
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginBottom: 14,
  },
  permText: { fontWeight: "800" },
  webNote: {
    flexDirection: "row",
    gap: 10,
    padding: 14,
    borderRadius: 14,
    marginBottom: 14,
    alignItems: "center",
  },
  webNoteText: { flex: 1, fontSize: 13, lineHeight: 18 },
  result: { borderRadius: 14, padding: 16, marginBottom: 12 },
  resultLabel: { fontWeight: "800", fontSize: 12, marginBottom: 4 },
  resultTitle: { fontWeight: "900", fontSize: 18 },
  meta: { fontSize: 12, marginTop: 2 },
  body: { fontSize: 14, lineHeight: 20, marginTop: 10 },
  help: { fontWeight: "700", marginTop: 10, fontSize: 13 },
  again: {
    marginTop: 14,
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
  },
  againText: { fontWeight: "800" },
  error: { marginBottom: 10, fontSize: 13 },
  section: {
    fontWeight: "800",
    fontSize: 12,
    letterSpacing: 0.6,
    marginTop: 8,
    marginBottom: 8,
  },
  row: { flexDirection: "row", gap: 8, marginBottom: 12 },
  input: { flex: 1, borderRadius: 12, padding: 14 },
  go: {
    width: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  sample: {
    flexDirection: "row",
    gap: 12,
    padding: 14,
    borderRadius: 12,
    marginBottom: 8,
    alignItems: "center",
  },
  sampleTitle: { fontWeight: "800", fontSize: 14 },
});
