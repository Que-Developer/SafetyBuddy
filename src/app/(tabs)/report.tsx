import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Image,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS } from "@/constants/theme";
import {
  CAMPUS_LOCATIONS,
  REPORT_TYPES,
  type ReportType,
} from "@/data/mockData";

const TOGGLE_OFF = "#C4C4C4";
const TOGGLE_ON = COLORS.navy;

export default function ReportScreen() {
  const [reportType, setReportType] = useState<ReportType>(REPORT_TYPES[0]);
  const [location, setLocation] = useState(CAMPUS_LOCATIONS[0]);
  const [description, setDescription] = useState("");
  const [followUp, setFollowUp] = useState(true);
  const [anonymous, setAnonymous] = useState(true);
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [showTypes, setShowTypes] = useState(false);
  const [showLocations, setShowLocations] = useState(false);
  const slide = useRef(new Animated.Value(48)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(slide, { toValue: 0, useNativeDriver: true, friction: 8 }),
      Animated.timing(opacity, { toValue: 1, duration: 260, useNativeDriver: true }),
    ]).start();
  }, [slide, opacity]);

  const reportId = useMemo(() => `RPT-${Date.now().toString().slice(-6)}`, []);
  const dateTime = useMemo(
    () => new Date().toISOString().slice(0, 16).replace("T", " "),
    []
  );

  const pickPhoto = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.8,
      allowsEditing: true,
    });
    if (!result.canceled && result.assets[0]?.uri) {
      setPhotoUri(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      quality: 0.8,
      allowsEditing: true,
    });
    if (!result.canceled && result.assets[0]?.uri) {
      setPhotoUri(result.assets[0].uri);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <Animated.View
        style={{ flex: 1, opacity, transform: [{ translateY: slide }] }}
      >
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.heading}>Share a safety concern</Text>
        <Text style={styles.subheading}>
          Your report can help improve campus safety. Tell us what kind of help
          you need — you can stay anonymous.
        </Text>

        <View style={styles.metaCard}>
          <Text style={styles.metaLabel}>Report ID</Text>
          <Text style={styles.metaValue}>{reportId}</Text>
          <Text style={styles.metaLabel}>Date & Time</Text>
          <Text style={styles.metaValue}>{dateTime}</Text>
          <Text style={styles.metaLabel}>Status</Text>
          <Text style={[styles.metaValue, { color: COLORS.accent }]}>
            Draft → Submitted on send
          </Text>
        </View>

        <Text style={styles.label}>Type of concern</Text>
        <TouchableOpacity
          style={styles.select}
          onPress={() => {
            setShowTypes((v) => !v);
            setShowLocations(false);
          }}
        >
          <Text style={styles.selectText}>{reportType}</Text>
          <Ionicons name="chevron-down" size={18} color={COLORS.accent} />
        </TouchableOpacity>
        {showTypes && (
          <View style={styles.dropdown}>
            {REPORT_TYPES.map((type) => (
              <TouchableOpacity
                key={type}
                style={styles.dropdownItem}
                onPress={() => {
                  setReportType(type);
                  setShowTypes(false);
                }}
              >
                <Text style={styles.dropdownText}>{type}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <Text style={styles.label}>Location</Text>
        <TouchableOpacity
          style={styles.select}
          onPress={() => {
            setShowLocations((v) => !v);
            setShowTypes(false);
          }}
        >
          <Text style={styles.selectText}>{location}</Text>
          <Ionicons name="location-outline" size={18} color={COLORS.accent} />
        </TouchableOpacity>
        {showLocations && (
          <View style={styles.dropdown}>
            {CAMPUS_LOCATIONS.map((loc) => (
              <TouchableOpacity
                key={loc}
                style={styles.dropdownItem}
                onPress={() => {
                  setLocation(loc);
                  setShowLocations(false);
                }}
              >
                <Text style={styles.dropdownText}>{loc}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <Text style={styles.label}>Description</Text>
        <TextInput
          style={styles.textArea}
          multiline
          numberOfLines={5}
          placeholder="Share what happened, in your own words…"
          placeholderTextColor={COLORS.textDim}
          value={description}
          onChangeText={setDescription}
        />

        <Text style={styles.label}>Optional photo</Text>
        {photoUri ? (
          <View style={styles.photoPreviewWrap}>
            <Image source={{ uri: photoUri }} style={styles.photoPreview} />
            <View style={styles.photoActions}>
              <TouchableOpacity style={styles.photoActionBtn} onPress={pickPhoto}>
                <Text style={styles.photoActionText}>Change</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.photoActionBtn}
                onPress={() => setPhotoUri(null)}
              >
                <Text style={styles.photoActionText}>Remove</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.photoBox}>
            <Ionicons name="camera-outline" size={28} color={COLORS.accent} />
            <Text style={styles.photoText}>Add a photo of the area or concern</Text>
            <View style={styles.photoActions}>
              <TouchableOpacity style={styles.photoActionBtn} onPress={takePhoto}>
                <Ionicons name="camera" size={16} color={COLORS.navy} />
                <Text style={styles.photoActionText}>Camera</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.photoActionBtn} onPress={pickPhoto}>
                <Ionicons name="images-outline" size={16} color={COLORS.navy} />
                <Text style={styles.photoActionText}>Gallery</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <View style={styles.toggleCard}>
          <View style={{ flex: 1 }}>
            <Text style={styles.toggleTitle}>Request follow-up</Text>
            <Text style={styles.toggleSub}>
              Ask security to contact you about this report
            </Text>
          </View>
          <Switch
            value={followUp}
            onValueChange={setFollowUp}
            trackColor={{ false: TOGGLE_OFF, true: TOGGLE_ON }}
            thumbColor={COLORS.white}
            ios_backgroundColor={TOGGLE_OFF}
          />
        </View>

        <View style={styles.toggleCard}>
          <View style={{ flex: 1 }}>
            <Text style={styles.toggleTitle}>Submit anonymously</Text>
            <Text style={styles.toggleSub}>
              Your identity stays hidden from the report record
            </Text>
          </View>
          <Switch
            value={anonymous}
            onValueChange={setAnonymous}
            trackColor={{ false: TOGGLE_OFF, true: TOGGLE_ON }}
            thumbColor={COLORS.white}
            ios_backgroundColor={TOGGLE_OFF}
          />
        </View>

        <TouchableOpacity
          style={styles.submitBtn}
          onPress={() => router.push("/report-success")}
        >
          <Text style={styles.submitText}>Submit safety concern</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push("/support")}>
          <Text style={styles.supportLinkText}>
            Need support now? Open Support Services →
          </Text>
        </TouchableOpacity>

        <View style={{ height: 110 }} />
      </ScrollView>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  scroll: { padding: 18 },
  heading: {
    color: COLORS.text,
    fontSize: 24,
    fontWeight: "800",
    marginBottom: 6,
  },
  subheading: {
    color: COLORS.textMuted,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  metaCard: {
    backgroundColor: COLORS.card,
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
  },
  metaLabel: {
    color: COLORS.textDim,
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    marginTop: 6,
  },
  metaValue: { color: COLORS.text, fontSize: 15, fontWeight: "700" },
  label: {
    color: COLORS.accent,
    fontWeight: "800",
    fontSize: 12,
    marginBottom: 8,
    marginTop: 4,
    letterSpacing: 0.5,
  },
  select: {
    backgroundColor: COLORS.tile,
    borderRadius: 12,
    padding: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  selectText: { color: COLORS.text, fontSize: 15, fontWeight: "600" },
  dropdown: {
    backgroundColor: COLORS.cardAlt,
    borderRadius: 12,
    marginBottom: 12,
    overflow: "hidden",
  },
  dropdownItem: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(0,43,91,0.08)",
  },
  dropdownText: { color: COLORS.text, fontSize: 14 },
  textArea: {
    backgroundColor: COLORS.tile,
    borderRadius: 12,
    padding: 14,
    minHeight: 120,
    textAlignVertical: "top",
    color: COLORS.text,
    fontSize: 15,
    marginBottom: 12,
  },
  photoBox: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderColor: COLORS.accent,
    padding: 20,
    alignItems: "center",
    marginBottom: 14,
    gap: 8,
  },
  photoPreviewWrap: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 14,
  },
  photoPreview: { width: "100%", height: 180 },
  photoText: {
    color: COLORS.textMuted,
    fontSize: 13,
    textAlign: "center",
  },
  photoActions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 6,
    padding: 10,
    justifyContent: "center",
  },
  photoActionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: COLORS.tile,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
  },
  photoActionText: { color: COLORS.navy, fontWeight: "800", fontSize: 13 },
  toggleCard: {
    backgroundColor: COLORS.cardAlt,
    borderRadius: 12,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 10,
  },
  toggleTitle: {
    color: COLORS.text,
    fontWeight: "800",
    fontSize: 14,
    marginBottom: 2,
  },
  toggleSub: { color: COLORS.textMuted, fontSize: 12 },
  submitBtn: {
    backgroundColor: COLORS.accent,
    borderRadius: 14,
    padding: 16,
    alignItems: "center",
    marginTop: 10,
  },
  submitText: { color: COLORS.white, fontWeight: "900", fontSize: 16 },
  supportLinkText: {
    marginTop: 16,
    textAlign: "center",
    color: COLORS.accent,
    fontWeight: "700",
    fontSize: 14,
    textDecorationLine: "underline",
  },
});
