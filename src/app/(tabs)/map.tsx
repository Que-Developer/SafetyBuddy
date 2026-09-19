import { CampusMap, type MapEvent } from "@/components/CampusMap";
import { CARD_SHADOW } from "@/constants/theme";
import { useTheme } from "@/context/ThemeContext";
import {
  MAP_WALK_CONTACTS,
  type MapLayerKey
} from "@/data/mapData";
import { useRef, useState } from "react";
import {
  Dimensions,
  PanResponder,
  StyleSheet,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type LatLng = { lat: number; lng: number };
type SheetTab = "walk" | "places" | "layers";

const ETA_OPTIONS = [5, 10, 15, 20];
const SCREEN_H = Dimensions.get("window").height;
const SHEET_MIN = 120;
const SHEET_MAX = Math.round(SCREEN_H * 0.52);
const SHEET_COLLAPSED = 150;

export default function MapScreen() {
  const { colors } = useTheme();
  const ACCENT = colors.accent;

  // ... (all your existing state and logic stays the same) ...
  // I'm only including the updated JSX return below — copy over just the <View> & styles.

  const [mode, setMode] = useState<"2d" | "3d">("2d");
  const [base, setBase] = useState<"street" | "satellite">("street");
  const [query, setQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [activeLayers, setActiveLayers] = useState<MapLayerKey[]>([
    "danger", "security", "emergency", "firstAid", "safeZone",
  ]);
  const [sheetTab, setSheetTab] = useState<SheetTab>("walk");
  const [pickMode, setPickMode] = useState<"start" | "end" | null>(null);
  const [start, setStart] = useState<LatLng | null>(null);
  const [end, setEnd] = useState<LatLng | null>(null);
  const [startLabel, setStartLabel] = useState("Tap map for start");
  const [endLabel, setEndLabel] = useState("Tap map for destination");
  const [eta, setEta] = useState(10);
  const [contactId, setContactId] = useState(MAP_WALK_CONTACTS[0]?.id);
  const [contacts, setContacts] = useState(MAP_WALK_CONTACTS);
  const [simulating, setSimulating] = useState(false);
  const [walkActive, setWalkActive] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [progress, setProgress] = useState(0);
  const [live, setLive] = useState<LatLng | null>(null);
  const [gpsStatus, setGpsStatus] = useState<"pending" | "on" | "off">("pending");
  const [followLive, setFollowLive] = useState(false);
  const [status, setStatus] = useState("Sharing live campus location");
  const [sheetHeight, setSheetHeight] = useState(SHEET_MAX);
  const sheetHeightRef = useRef(SHEET_MAX);
  const dragStart = useRef(SHEET_MAX);
  const didCenterGps = useRef(false);
  const arrivedRef = useRef(false);

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dy) > 6,
      onPanResponderGrant: () => { dragStart.current = sheetHeightRef.current; },
      onPanResponderMove: (_, g) => {
        const next = Math.max(SHEET_MIN, Math.min(SHEET_MAX, dragStart.current - g.dy));
        sheetHeightRef.current = next;
        setSheetHeight(next);
      },
      onPanResponderRelease: (_, g) => {
        const mid = (SHEET_MIN + SHEET_MAX) / 2;
        const projected = sheetHeightRef.current - g.vy * 40;
        const snap = projected < mid || g.vy > 0.8 ? SHEET_COLLAPSED : SHEET_MAX;
        sheetHeightRef.current = snap;
        setSheetHeight(snap);
      },
    })
  ).current;

  function onMapEvent(event: MapEvent): void {
    throw new Error("Function not implemented.");
  }

  // ... (all useEffect + callbacks stay the same) ...

  // This return is the ONLY part I fully rewrote below (colors only).
  // Everything else stays the same. Copy this over your current return:

  return (
    <View style={styles.root}>
      <View style={styles.mapFull}>
        <CampusMap
          mode={mode}
          base={base}
          activeLayers={activeLayers}
          pickMode={pickMode}
          start={start}
          end={end}
          simulating={simulating}
          liveLocation={live}
          followLive={followLive && !simulating}
          onEvent={onMapEvent}
        />
      </View>

      {/* The rest of the JSX is IDENTICAL to what you have now.
          Just make sure your StyleSheet matches the one below. */}

      <SafeAreaView style={styles.overlay} edges={["top"]} pointerEvents="box-none">
        {/* ... your existing overlay content ... */}
      </SafeAreaView>

      <View style={[styles.sheet, { height: sheetHeight, backgroundColor: colors.bg }]}>
        {/* ... your existing sheet content ... */}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#1a2332" }, // <-- CHANGED: from '#002B5B' to a neutral navy
  mapFull: { ...StyleSheet.absoluteFill },
  overlay: {
    ...StyleSheet.absoluteFill,
    bottom: undefined,
    height: "58%",
  },
  topRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingTop: 4,
  },
  topRightStack: { gap: 10 },
  roundBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    ...CARD_SHADOW,
  },
  searchCard: {
    marginHorizontal: 14,
    marginTop: 10,
    borderRadius: 16,
    overflow: "hidden",
    ...CARD_SHADOW,
  },
  searchInput: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  searchItem: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  searchTitle: { fontWeight: "800" },
  searchSub: { fontSize: 12, marginTop: 2 },
  sideStack: {
    position: "absolute",
    right: 14,
    bottom: 16,
    gap: 10,
  },
  sheet: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 72,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 4,
    paddingHorizontal: 16,
    ...CARD_SHADOW,
  },
  sheetDragZone: { paddingTop: 4, paddingBottom: 8 },
  handle: {
    alignSelf: "center",
    width: 42,
    height: 4,
    borderRadius: 2,
    marginBottom: 8,
  },
  sheetTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  sheetTitle: { fontWeight: "900", fontSize: 26 },
  segRow: { flexDirection: "row", gap: 10, marginBottom: 14 },
  segBtn: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    ...CARD_SHADOW,
  },
  sheetScroll: { flex: 1 },
  listCard: { borderRadius: 22, padding: 12 },
  personRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
  },
  personName: { fontWeight: "800", fontSize: 16 },
  personPlace: { fontSize: 13, marginTop: 2 },
  hint: { fontSize: 13, marginBottom: 10, lineHeight: 18 },
  pointCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: "transparent",
  },
  pointOn: { borderColor: "#000458" }, // <-- CHANGED: still navy in yellow theme. (See note below)
  pointText: { flex: 1, fontWeight: "700", fontSize: 13 },
  myLoc: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 10 },
  myLocText: { fontWeight: "800", fontSize: 12 },
  label: { fontWeight: "800", fontSize: 12, marginBottom: 8 },
  etaRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 12 },
  etaChip: { borderRadius: 999, paddingHorizontal: 14, paddingVertical: 8 },
  etaText: { fontWeight: "800", fontSize: 12 },
  progressWrap: { height: 8, borderRadius: 4, overflow: "hidden", marginBottom: 12 },
  progressFill: { height: "100%" },
  countdown: {
    fontWeight: "800",
    fontSize: 14,
    textAlign: "center",
    marginBottom: 12,
  },
  primaryBtn: { borderRadius: 14, paddingVertical: 14, alignItems: "center" },
  primaryText: { fontWeight: "900", fontSize: 15 },
  arrivedBtn: { borderRadius: 14, paddingVertical: 14, alignItems: "center" },
  arrivedBtnText: { fontWeight: "900", fontSize: 15 },
  demoBtn: { marginTop: 10, borderRadius: 14, paddingVertical: 12, alignItems: "center" },
  demoBtnText: { fontWeight: "800", fontSize: 13 },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  chipDot: { width: 12, height: 12, borderRadius: 6 },
  chipText: { fontWeight: "700", fontSize: 12 },
});