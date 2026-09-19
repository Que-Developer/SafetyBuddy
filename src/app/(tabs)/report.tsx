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
import { useTheme } from "@/context/ThemeContext";
import {
  CAMPUS_LOCATIONS,
  REPORT_TYPES,
  type ReportType,
} from "@/data/mockData";

const TOGGLE_OFF = "#C4C4C4";

export default function ReportScreen() {
  const { colors } = useTheme();
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
      Animated.timing(opacity, {
        toValue: 1,
        duration: 260,
        useNativeDriver: true,
      }),
    ]).start();
  }, [slide, opacity]);

  const reportId = useMemo(() => `RPT-${Date.now().toString().slice(-6)}`, []);
  const dateTime = useMemo(
    () => new Date().toISOString().slice(0, 16).replace("T", " "),
    []
  );

  const pickPhoto = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") return;
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
    if (status !== "granted") return;
    const result = await ImagePicker.launchCameraAsync({
      quality: 0.8,
      allowsEditing: true,
    });
    if (!result.canceled && result.assets[0]?.uri) {
      setPhotoUri(result.assets[0].uri);
    }
  };

  return (
    <SafeAreaView
      style={[styles.safe, { backgroundColor: colors.bg }]}
      edges={["top", "bottom"]}
    >
      <Animated.View
        style={{ flex: 1, opacity, transform: [{ translateY: slide }] }}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={[styles.heading, { color: colors.text }]}>
            Share a safety concern
          </Text>
          <Text style={[styles.subheading, { color: colors.textMuted }]}>
            Your report can help improve campus safety. Tell us what kind of
            help you need — you can stay anonymous.
          </Text>

          <View style={[styles.metaCard, { backgroundColor: colors.card }]}>
            <Text style={[styles.metaLabel, { color: colors.textDim }]}>
              Report ID
            </Text>
            <Text style={[styles.metaValue, { color: colors.text }]}>
              {reportId}
            </Text>
            <Text style={[styles.metaLabel, { color: colors.textDim }]}>
              Date & Time
            </Text>
            <Text style={[styles.metaValue, { color: colors.text }]}>
              {dateTime}
            </Text>
            <Text style={[styles.metaLabel, { color: colors.textDim }]}>
              Status
            </Text>
            <Text style={[styles.metaValue, { color: colors.accent }]}>
              Draft → Submitted on send
            </Text>
          </View>

          <Text style={[styles.label, { color: colors.accent }]}>
            Type of concern
          </Text>
          <TouchableOpacity
            style={[styles.select, { backgroundColor: colors.tile }]}
            onPress={() => {
              setShowTypes((v) => !v);
              setShowLocations(false);
            }}
          >
            <Text style={[styles.selectText, { color: colors.text }]}>
              {reportType}
            </Text>
            <Ionicons name="chevron-down" size={18} color={colors.accent} />
          </TouchableOpacity>
          {showTypes ? (
            <View style={[styles.dropdown, { backgroundColor: colors.cardAlt }]}>
              {REPORT_TYPES.map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.dropdownItem,
                    { borderBottomColor: colors.tileBorder },
                  ]}
                  onPress={() => {
                    setReportType(type);
                    setShowTypes(false);
                  }}
                >
                  <Text style={[styles.dropdownText, { color: colors.text }]}>
                    {type}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          ) : null}

          <Text style={[styles.label, { color: colors.accent }]}>Location</Text>
          <TouchableOpacity
            style={[styles.select, { backgroundColor: colors.tile }]}
            onPress={() => {
              setShowLocations((v) => !v);
              setShowTypes(false);
            }}
          >
            <Text style={[styles.selectText, { color: colors.text }]}>
              {location}
            </Text>
            <Ionicons
              name="location-outline"
              size={18}
              color={colors.accent}
            />
          </TouchableOpacity>
          {showLocations ? (
            <View style={[styles.dropdown, { backgroundColor: colors.cardAlt }]}>
              {CAMPUS_LOCATIONS.map((loc) => (
                <TouchableOpacity
                  key={loc}
                  style={[
                    styles.dropdownItem,
                    { borderBottomColor: colors.tileBorder },
                  ]}
                  onPress={() => {
                    setLocation(loc);
                    setShowLocations(false);
                  }}
                >
                  <Text style={[styles.dropdownText, { color: colors.text }]}>
                    {loc}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          ) : null}

          <Text style={[styles.label, { color: colors.accent }]}>
            Description
          </Text>
          <TextInput
            style={[
              styles.textArea,
              {
                backgroundColor: colors.tile,
                color: colors.text,
              },
            ]}
            multiline
            numberOfLines={5}
            placeholder="Share what happened, in your own words…"
            placeholderTextColor={colors.textDim}
            value={description}
            onChangeText={setDescription}
          />

          <Text style={[styles.label, { color: colors.accent }]}>
            Optional photo
          </Text>
          {photoUri ? (
            <View
              style={[styles.photoPreviewWrap, { backgroundColor: colors.card }]}
            >
              <Image source={{ uri: photoUri }} style={styles.photoPreview} />
              <View style={styles.photoActions}>
                <TouchableOpacity
                  style={[styles.photoActionBtn, { backgroundColor: colors.tile }]}
                  onPress={pickPhoto}
                >
                  <Text style={[styles.photoActionText, { color: colors.navy }]}>
                    Change
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.photoActionBtn, { backgroundColor: colors.tile }]}
                  onPress={() => setPhotoUri(null)}
                >
                  <Text style={[styles.photoActionText, { color: colors.navy }]}>
                    Remove
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View
              style={[
                styles.photoBox,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.accent,
                },
              ]}
            >
              <Ionicons name="camera-outline" size={28} color={colors.accent} />
              <Text style={[styles.photoText, { color: colors.textMuted }]}>
                Add a photo of the area or concern
              </Text>
              <View style={styles.photoActions}>
                <TouchableOpacity
                  style={[styles.photoActionBtn, { backgroundColor: colors.tile }]}
                  onPress={takePhoto}
                >
                  <Ionicons name="camera" size={16} color={colors.navy} />
                  <Text style={[styles.photoActionText, { color: colors.navy }]}>
                    Camera
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.photoActionBtn, { backgroundColor: colors.tile }]}
                  onPress={pickPhoto}
                >
                  <Ionicons name="images-outline" size={16} color={colors.navy} />
                  <Text style={[styles.photoActionText, { color: colors.navy }]}>
                    Gallery
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          <View style={[styles.toggleCard, { backgroundColor: colors.cardAlt }]}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.toggleTitle, { color: colors.text }]}>
                Request follow-up
              </Text>
              <Text style={[styles.toggleSub, { color: colors.textMuted }]}>
                Ask security to contact you about this report
              </Text>
            </View>
            <Switch
              value={followUp}
              onValueChange={setFollowUp}
              trackColor={{ false: TOGGLE_OFF, true: colors.navy }}
              thumbColor={colors.white}
              ios_backgroundColor={TOGGLE_OFF}
            />
          </View>

          <View style={[styles.toggleCard, { backgroundColor: colors.cardAlt }]}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.toggleTitle, { color: colors.text }]}>
                Submit anonymously
              </Text>
              <Text style={[styles.toggleSub, { color: colors.textMuted }]}>
                Your identity stays hidden from the report record
              </Text>
            </View>
            <Switch
              value={anonymous}
              onValueChange={setAnonymous}
              trackColor={{ false: TOGGLE_OFF, true: colors.navy }}
              thumbColor={colors.white}
              ios_backgroundColor={TOGGLE_OFF}
            />
          </View>

          <TouchableOpacity
            style={[styles.submitBtn, { backgroundColor: colors.accent }]}
            onPress={() => router.push("/report-success")}
          >
            <Text style={[styles.submitText, { color: colors.bgDeep }]}>
              Submit safety concern
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push("/support")}>
            <Text style={[styles.supportLinkText, { color: colors.accent }]}>
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
  safe: { flex: 1 },
  scroll: { padding: 18 },
  heading: { fontSize: 24, fontWeight: "800", marginBottom: 6 },
  subheading: { fontSize: 14, lineHeight: 20, marginBottom: 16 },
  metaCard: { borderRadius: 14, padding: 14, marginBottom: 16 },
  metaLabel: {
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    marginTop: 6,
  },
  metaValue: { fontSize: 15, fontWeight: "700" },
  label: {
    fontWeight: "800",
    fontSize: 12,
    marginBottom: 8,
    marginTop: 4,
    letterSpacing: 0.5,
  },
  select: {
    borderRadius: 12,
    padding: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  selectText: { fontSize: 15, fontWeight: "600" },
  dropdown: { borderRadius: 12, marginBottom: 12, overflow: "hidden" },
  dropdownItem: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  dropdownText: { fontSize: 14 },
  textArea: {
    borderRadius: 12,
    padding: 14,
    minHeight: 120,
    textAlignVertical: "top",
    fontSize: 15,
    marginBottom: 12,
  },
  photoBox: {
    borderRadius: 12,
    borderWidth: 1.5,
    borderStyle: "dashed",
    padding: 20,
    alignItems: "center",
    marginBottom: 14,
    gap: 8,
  },
  photoPreviewWrap: {
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 14,
  },
  photoPreview: { width: "100%", height: 180 },
  photoText: { fontSize: 13, textAlign: "center" },
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
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
  },
  photoActionText: { fontWeight: "800", fontSize: 13 },
  toggleCard: {
    borderRadius: 12,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 10,
  },
  toggleTitle: { fontWeight: "800", fontSize: 14, marginBottom: 2 },
  toggleSub: { fontSize: 12 },
  submitBtn: {
    borderRadius: 14,
    padding: 16,
    alignItems: "center",
    marginTop: 10,
  },
  submitText: { fontWeight: "900", fontSize: 16 },
  supportLinkText: {
    marginTop: 16,
    textAlign: "center",
    fontWeight: "700",
    fontSize: 14,
    textDecorationLine: "underline",
  },
});
