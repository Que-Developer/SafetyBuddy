import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { router } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Dimensions,
  PanResponder,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { CampusMap, type MapEvent } from "@/components/CampusMap";
import { CARD_SHADOW, COLORS } from "@/constants/theme";
import {
  CAMPUS_DESTINATIONS,
  MAP_LAYERS,
  MAP_WALK_CONTACTS,
  type MapLayerKey,
} from "@/data/mapData";
import { loadTrustedContacts } from "@/services/contacts";
import { WALK_WITH_ME_USE_CASE } from "@/data/walkWithMeUseCase";

type LatLng = { lat: number; lng: number };
type SheetTab = "people" | "walk" | "places" | "layers";

const ETA_OPTIONS = [5, 10, 15, 20];
const ACCENT = COLORS.navy;
const SCREEN_H = Dimensions.get("window").height;
const SHEET_MIN = 120;
const SHEET_MAX = Math.round(SCREEN_H * 0.52);
const SHEET_COLLAPSED = 150;

const PLACE_HINTS = [
  "Near Library",
  "Student Centre",
  "North Residence",
  "Main Gate",
  "Science Building",
];

export default function MapScreen() {
  const [mode, setMode] = useState<"2d" | "3d">("2d");
  const [base, setBase] = useState<"street" | "satellite">("street");
  const [query, setQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [activeLayers, setActiveLayers] = useState<MapLayerKey[]>([
    "danger",
    "security",
    "emergency",
    "firstAid",
    "safeZone",
  ]);
  const [sheetTab, setSheetTab] = useState<SheetTab>("people");
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
  const [checkedIn, setCheckedIn] = useState(false);
  const [sheetHeight, setSheetHeight] = useState(SHEET_MAX);
  const sheetHeightRef = useRef(SHEET_MAX);
  const dragStart = useRef(SHEET_MAX);
  const didCenterGps = useRef(false);
  const arrivedRef = useRef(false);

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dy) > 6,
      onPanResponderGrant: () => {
        dragStart.current = sheetHeightRef.current;
      },
      onPanResponderMove: (_, g) => {
        const next = Math.max(
          SHEET_MIN,
          Math.min(SHEET_MAX, dragStart.current - g.dy)
        );
        sheetHeightRef.current = next;
        setSheetHeight(next);
      },
      onPanResponderRelease: (_, g) => {
        const mid = (SHEET_MIN + SHEET_MAX) / 2;
        const projected = sheetHeightRef.current - g.vy * 40;
        const snap =
          projected < mid || g.vy > 0.8
            ? SHEET_COLLAPSED
            : SHEET_MAX;
        sheetHeightRef.current = snap;
        setSheetHeight(snap);
      },
    })
  ).current;

  useEffect(() => {
    if (!followLive) return;
    const t = setTimeout(() => setFollowLive(false), 900);
    return () => clearTimeout(t);
  }, [followLive]);

  // ETA countdown — if time runs out without "I arrived safely", alert contacts
  useEffect(() => {
    if (!walkActive || secondsLeft <= 0) return;
    const t = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [walkActive, secondsLeft]);

  useEffect(() => {
    if (!walkActive || secondsLeft !== 0 || arrivedRef.current) return;
    const contact = contacts.find((c) => c.id === contactId)?.name ?? "trusted contacts";
    setWalkActive(false);
    setSimulating(false);
    setStatus(`ETA missed — ${contact} alerted that you may be in danger`);
    Alert.alert(
      "Trusted contacts alerted",
      `You did not confirm arrival within the estimated time. ${contact} and campus security have been informed that you may be in danger.`,
      [{ text: "OK" }]
    );
  }, [walkActive, secondsLeft, contacts, contactId]);

  useEffect(() => {
    loadTrustedContacts().then((list) => {
      if (!list.length) return;
      setContacts(
        list.slice(0, 5).map((c, i) => ({
          id: c.id,
          name: c.name,
          phone: c.phone,
          online: i !== 2,
          battery: [86, 42, 12, 70, 55][i] ?? 60,
          initial: c.name.slice(0, 1).toUpperCase(),
          color: ["#F5C842", "#3B82F6", "#22C55E", "#A855F7", "#F97316"][i],
        }))
      );
    });
  }, []);

  useEffect(() => {
    let sub: Location.LocationSubscription | null = null;
    let cancelled = false;
    (async () => {
      try {
        const { status: perm } = await Location.requestForegroundPermissionsAsync();
        if (perm !== "granted") {
          if (!cancelled) setGpsStatus("off");
          return;
        }
        const current = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });
        if (cancelled) return;
        const point = {
          lat: current.coords.latitude,
          lng: current.coords.longitude,
        };
        setGpsStatus("on");
        if (!simulating) {
          setLive(point);
          if (!didCenterGps.current) {
            didCenterGps.current = true;
            setFollowLive(true);
          }
        }
        sub = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.High,
            distanceInterval: 5,
            timeInterval: 2500,
          },
          (pos) => {
            if (simulating) return;
            setLive({
              lat: pos.coords.latitude,
              lng: pos.coords.longitude,
            });
            setGpsStatus("on");
          }
        );
      } catch {
        if (!cancelled) setGpsStatus("off");
      }
    })();
    return () => {
      cancelled = true;
      sub?.remove();
    };
  }, [simulating]);

  const filteredDestinations = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return CAMPUS_DESTINATIONS;
    return CAMPUS_DESTINATIONS.filter((d) =>
      d.name.toLowerCase().includes(q)
    );
  }, [query]);

  const selectedContact = contacts.find((c) => c.id === contactId);

  const onMapEvent = useCallback(
    (event: MapEvent) => {
      if (event.type === "mapClick") {
        const point = { lat: event.lat, lng: event.lng };
        if (pickMode === "start" || (!start && pickMode === "end" && !end)) {
          if (pickMode === "start" || !start) {
            setStart(point);
            setStartLabel(`Start · ${point.lat.toFixed(4)}, ${point.lng.toFixed(4)}`);
            setPickMode("end");
            setSheetTab("walk");
            setStatus("Now tap your destination");
            return;
          }
        }
        if (pickMode === "end" || (start && pickMode !== "start")) {
          setEnd(point);
          setEndLabel(`Going to · ${point.lat.toFixed(4)}, ${point.lng.toFixed(4)}`);
          setPickMode(null);
          setSheetTab("walk");
          setStatus("Set arrival time, then start Walk With Me");
        }
      }
      if (event.type === "simProgress") {
        setLive({ lat: event.lat, lng: event.lng });
        setProgress(event.progress);
      }
      if (event.type === "simDone") {
        setSimulating(false);
        setProgress(1);
        if (walkActive) {
          setStatus("Route finished — tap I arrived safely before the timer ends");
        } else {
          setStatus("You arrived safely");
        }
      }
      if (event.type === "markerClick") {
        setStatus(event.name);
      }
    },
    [pickMode, start, end, walkActive]
  );

  const useMyLocationAsStart = () => {
    if (!live) {
      setStatus("Waiting for GPS…");
      return;
    }
    setStart(live);
    setStartLabel("Start · My live location");
    setPickMode("end");
    setFollowLive(true);
    setSheetTab("walk");
    setStatus("Start set — tap destination on the map");
  };

  const chooseDestination = (name: string, lat: number, lng: number) => {
    setQuery(name);
    setShowSearch(false);
    setEnd({ lat, lng });
    setEndLabel(`Going to · ${name}`);
    setPickMode(start ? null : "start");
    setSheetTab("walk");
  };

  const beginWalkMonitoring = (label: string, etaMinutes = eta) => {
    arrivedRef.current = false;
    setWalkActive(true);
    setSimulating(true);
    setProgress(0);
    setSecondsLeft(etaMinutes * 60);
    setStatus(label);
  };

  const startWalk = () => {
    if (!start || !end) {
      setSheetTab("walk");
      setPickMode(start ? "end" : "start");
      setStatus("Select start and destination first");
      return;
    }
    beginWalkMonitoring(
      `Walking with ${selectedContact?.name ?? "contact"} · ETA ${eta} min · confirm when you arrive`,
      eta
    );
  };

  const markArrivedSafely = () => {
    arrivedRef.current = true;
    setWalkActive(false);
    setSimulating(false);
    setSecondsLeft(0);
    setProgress(1);
    const contact = selectedContact?.name ?? "trusted contacts";
    setStatus(`Arrived safely — ${contact} notified`);
    Alert.alert(
      "You arrived safely",
      `${contact} have been told you reached your destination.`
    );
  };

  const cancelWalk = () => {
    arrivedRef.current = true;
    setWalkActive(false);
    setSimulating(false);
    setSecondsLeft(0);
    setStatus("Walk cancelled");
  };

  /** Library → North Residence preset walk */
  const runPresetWalk = () => {
    const uc = WALK_WITH_ME_USE_CASE;
    setSheetTab("walk");
    setStart({ lat: uc.start.lat, lng: uc.start.lng });
    setEnd({ lat: uc.end.lat, lng: uc.end.lng });
    setStartLabel(`Start · ${uc.start.name}`);
    setEndLabel(`Going to · ${uc.end.name}`);
    setContactId(uc.contactId);
    setEta(uc.etaMinutes);
    setPickMode(null);
    beginWalkMonitoring(
      `${uc.start.name} → ${uc.end.name} with ${uc.contactName} · ETA ${uc.etaMinutes} min`,
      uc.etaMinutes
    );
  };

  const toggleLayer = (key: MapLayerKey) => {
    setActiveLayers((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const formatCountdown = (total: number) => {
    const m = Math.floor(total / 60);
    const s = total % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

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

      <SafeAreaView style={styles.overlay} edges={["top"]} pointerEvents="box-none">
        <View style={styles.topRow} pointerEvents="box-none">
          <TouchableOpacity
            style={styles.roundBtn}
            onPress={() => router.push("/(tabs)/profile")}
          >
            <Ionicons name="settings-outline" size={20} color={ACCENT} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.groupPill}
            onPress={() => setSheetTab("people")}
          >
            <Text style={styles.groupPillText}>Trusted circle</Text>
            <Ionicons name="chevron-down" size={16} color={ACCENT} />
          </TouchableOpacity>

          <View style={styles.topRightStack}>
            <TouchableOpacity
              style={styles.roundBtn}
              onPress={() => router.push("/alerts")}
            >
              <Ionicons name="mail-outline" size={18} color={ACCENT} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.roundBtn}
              onPress={() => setShowSearch((v) => !v)}
            >
              <Ionicons name="search" size={18} color={ACCENT} />
            </TouchableOpacity>
          </View>
        </View>

        {showSearch && (
          <View style={styles.searchCard}>
            <TextInput
              style={styles.searchInput}
              placeholder="Where to?"
              placeholderTextColor="#8A8A9A"
              value={query}
              onChangeText={setQuery}
              autoFocus
            />
            {filteredDestinations.map((d) => (
              <TouchableOpacity
                key={d.id}
                style={styles.searchItem}
                onPress={() => chooseDestination(d.name, d.lat, d.lng)}
              >
                <Text style={styles.searchTitle}>{d.name}</Text>
                <Text style={styles.searchSub}>{d.description}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <View style={styles.sideStack} pointerEvents="box-none">
          <TouchableOpacity
            style={styles.roundBtn}
            onPress={() => {
              setSheetTab("people");
              setStatus("Add someone from your trusted contacts");
            }}
          >
            <Ionicons name="add" size={22} color={ACCENT} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.roundBtn}
            onPress={() => {
              if (live) {
                setFollowLive(true);
                setLive({ ...live });
              }
            }}
          >
            <Ionicons name="locate" size={20} color={ACCENT} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.roundBtn}
            onPress={() => {
              if (mode === "3d") {
                setMode("2d");
                setBase((b) => (b === "street" ? "satellite" : "street"));
              } else if (base === "street") {
                setBase("satellite");
              } else {
                setMode("3d");
              }
            }}
          >
            <Ionicons name="layers-outline" size={20} color={ACCENT} />
          </TouchableOpacity>
        </View>

        <View style={styles.actionRow} pointerEvents="box-none">
          <TouchableOpacity
            style={styles.actionPill}
            onPress={() => {
              setCheckedIn(true);
              setStatus(
                gpsStatus === "on"
                  ? "Checked in · live location shared"
                  : "Checked in · waiting for GPS"
              );
            }}
          >
            <View style={styles.actionIcon}>
              <Ionicons name="checkmark" size={16} color={COLORS.white} />
            </View>
            <Text style={styles.actionText}>
              {checkedIn ? "Checked in" : "Check in"}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionPill}
            onPress={() => router.push("/(tabs)/panic")}
          >
            <View style={[styles.actionIcon, { backgroundColor: COLORS.danger }]}>
              <Ionicons name="radio-button-on" size={14} color={COLORS.white} />
            </View>
            <Text style={styles.actionText}>Set Up SOS</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      <View style={[styles.sheet, { height: sheetHeight, backgroundColor: COLORS.bg }]}>
        <View {...panResponder.panHandlers} style={styles.sheetDragZone}>
          <View style={styles.handle} />
          <View style={styles.sheetTitleRow}>
            <Text style={styles.sheetTitle}>Trusted circle</Text>
            <TouchableOpacity
              onPress={() =>
                setSheetHeight((h) => {
                  const next = h > SHEET_COLLAPSED + 40 ? SHEET_COLLAPSED : SHEET_MAX;
                  sheetHeightRef.current = next;
                  return next;
                })
              }
              hitSlop={12}
            >
              <Ionicons
                name={sheetHeight > SHEET_COLLAPSED + 40 ? "chevron-down" : "chevron-up"}
                size={22}
                color={ACCENT}
              />
            </TouchableOpacity>
          </View>
        </View>

        {sheetHeight > SHEET_COLLAPSED + 20 && (
          <>
        <View style={styles.segRow}>
          {(
            [
              ["people", "people"],
              ["walk", "walk"],
              ["places", "business"],
              ["layers", "layers"],
            ] as const
          ).map(([key, icon]) => {
            const on = sheetTab === key;
            return (
              <TouchableOpacity
                key={key}
                style={[styles.segBtn, on && styles.segBtnOn]}
                onPress={() => setSheetTab(key)}
              >
                <Ionicons
                  name={icon}
                  size={20}
                  color={on ? COLORS.white : COLORS.text}
                />
              </TouchableOpacity>
            );
          })}
        </View>

        <ScrollView
          style={styles.sheetScroll}
          contentContainerStyle={{ paddingBottom: 24 }}
          showsVerticalScrollIndicator={false}
        >
          {sheetTab === "people" && (
            <View style={styles.listCard}>
              {contacts.map((c, i) => {
                const selected = contactId === c.id;
                return (
                  <TouchableOpacity
                    key={c.id}
                    style={[styles.personRow, selected && styles.personRowOn]}
                    onPress={() => {
                      setContactId(c.id);
                      setStatus(`Watching ${c.name}`);
                    }}
                  >
                    <View>
                      <View style={[styles.avatar, { backgroundColor: c.color }]}>
                        <Text style={styles.avatarText}>{c.initial}</Text>
                      </View>
                      <View style={styles.battPill}>
                        <Ionicons
                          name="battery-half"
                          size={10}
                          color={c.battery < 20 ? "#DC2626" : "#16A34A"}
                        />
                        <Text style={styles.battText}>{c.battery}%</Text>
                      </View>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.personName}>{c.name}</Text>
                      {c.online ? (
                        <>
                          <Text style={styles.personPlace}>
                            {PLACE_HINTS[i % PLACE_HINTS.length]}
                          </Text>
                          <Text style={styles.personSince}>
                            Since {16 + (i % 4)}:{30 + i * 3} today
                          </Text>
                        </>
                      ) : (
                        <Text style={styles.personOffline}>
                          No network or phone off
                        </Text>
                      )}
                    </View>
                    {!c.online && (
                      <Ionicons name="ban" size={22} color="#DC2626" />
                    )}
                  </TouchableOpacity>
                );
              })}
              <TouchableOpacity
                style={styles.addPerson}
                onPress={() => router.push("/(tabs)/profile")}
              >
                <Text style={styles.addPersonText}>Add a person</Text>
              </TouchableOpacity>
            </View>
          )}

          {sheetTab === "walk" && (
            <View style={styles.listCard}>
              <Text style={styles.hint}>{status}</Text>
              <TouchableOpacity
                style={[styles.pointCard, pickMode === "start" && styles.pointOn]}
                onPress={() => setPickMode("start")}
              >
                <Ionicons name="locate" size={18} color={ACCENT} />
                <Text style={styles.pointText}>{startLabel}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.myLoc} onPress={useMyLocationAsStart}>
                <Ionicons name="navigate-circle" size={18} color={ACCENT} />
                <Text style={styles.myLocText}>Use my live location as start</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.pointCard, pickMode === "end" && styles.pointOn]}
                onPress={() => setPickMode("end")}
              >
                <Ionicons name="flag" size={18} color={ACCENT} />
                <Text style={styles.pointText}>{endLabel}</Text>
              </TouchableOpacity>
              <Text style={styles.label}>Estimated arrival</Text>
              <View style={styles.etaRow}>
                {ETA_OPTIONS.map((m) => (
                  <TouchableOpacity
                    key={m}
                    style={[styles.etaChip, eta === m && styles.etaOn]}
                    onPress={() => setEta(m)}
                  >
                    <Text style={[styles.etaText, eta === m && styles.etaTextOn]}>
                      {m} min
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              {walkActive && (
                <>
                  <View style={styles.progressWrap}>
                    <View
                      style={[styles.progressFill, { width: `${progress * 100}%` }]}
                    />
                  </View>
                  <Text style={styles.countdown}>
                    Time left to arrive: {formatCountdown(secondsLeft)}
                  </Text>
                </>
              )}
              {walkActive ? (
                <>
                  <TouchableOpacity
                    style={styles.arrivedBtn}
                    onPress={markArrivedSafely}
                  >
                    <Text style={styles.arrivedBtnText}>I arrived safely</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.demoBtn} onPress={cancelWalk}>
                    <Text style={styles.demoBtnText}>Cancel walk</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <TouchableOpacity style={styles.primaryBtn} onPress={startWalk}>
                    <Text style={styles.primaryText}>Start Walk With Me</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.demoBtn} onPress={runPresetWalk}>
                    <Text style={styles.demoBtnText}>
                      Run walk (Library → North Res)
                    </Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          )}

          {sheetTab === "places" && (
            <View style={styles.listCard}>
              {CAMPUS_DESTINATIONS.map((d) => (
                <TouchableOpacity
                  key={d.id}
                  style={styles.personRow}
                  onPress={() => chooseDestination(d.name, d.lat, d.lng)}
                >
                  <View style={[styles.avatar, { backgroundColor: COLORS.bg }]}>
                    <Ionicons name="location" size={20} color={ACCENT} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.personName}>{d.name}</Text>
                    <Text style={styles.personPlace}>{d.description}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {sheetTab === "layers" && (
            <View style={styles.listCard}>
              <Text style={styles.hint}>
                Map: {mode === "3d" ? "3D" : base === "satellite" ? "Satellite" : "Street"}
              </Text>
              <View style={styles.chips}>
                {MAP_LAYERS.map((layer) => {
                  const on = activeLayers.includes(layer.key);
                  return (
                    <TouchableOpacity
                      key={layer.key}
                      style={[styles.chip, on && styles.chipOn]}
                      onPress={() => toggleLayer(layer.key)}
                    >
                      <View
                        style={[styles.chipDot, { backgroundColor: layer.color }]}
                      />
                      <Text style={styles.chipText}>{layer.label}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          )}
        </ScrollView>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bg },
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
    backgroundColor: COLORS.white,
    alignItems: "center",
    justifyContent: "center",
    ...CARD_SHADOW,
  },
  groupPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: COLORS.white,
    borderRadius: 999,
    paddingHorizontal: 18,
    paddingVertical: 12,
    ...CARD_SHADOW,
  },
  groupPillText: { color: ACCENT, fontWeight: "800", fontSize: 15 },
  searchCard: {
    marginHorizontal: 14,
    marginTop: 10,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    overflow: "hidden",
    ...CARD_SHADOW,
  },
  searchInput: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: COLORS.text,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#E5E7EB",
  },
  searchItem: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#F1F1F1",
  },
  searchTitle: { fontWeight: "800", color: COLORS.text },
  searchSub: { color: COLORS.textMuted, fontSize: 12, marginTop: 2 },
  sideStack: {
    position: "absolute",
    right: 14,
    bottom: 70,
    gap: 10,
  },
  actionRow: {
    position: "absolute",
    left: 14,
    right: 70,
    bottom: 16,
    flexDirection: "row",
    gap: 10,
  },
  actionPill: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: COLORS.white,
    borderRadius: 999,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1.5,
    borderColor: ACCENT,
    ...CARD_SHADOW,
  },
  actionIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: ACCENT,
    alignItems: "center",
    justifyContent: "center",
  },
  actionText: { color: ACCENT, fontWeight: "800", fontSize: 13 },
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
  sheetDragZone: {
    paddingTop: 4,
    paddingBottom: 8,
  },
  handle: {
    alignSelf: "center",
    width: 42,
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(0,43,91,0.25)",
    marginBottom: 8,
  },
  sheetTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  sheetTitle: {
    color: COLORS.text,
    fontWeight: "900",
    fontSize: 26,
  },
  segRow: { flexDirection: "row", gap: 10, marginBottom: 14 },
  segBtn: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    backgroundColor: COLORS.white,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E8E8EE",
    ...CARD_SHADOW,
  },
  segBtnOn: {
    backgroundColor: "#1F1F2E",
    borderColor: "#1F1F2E",
  },
  sheetScroll: { flex: 1 },
  listCard: {
    backgroundColor: "#F7F7F9",
    borderRadius: 22,
    padding: 12,
  },
  personRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#E5E7EB",
  },
  personRowOn: {
    backgroundColor: "rgba(0,43,91,0.06)",
    borderRadius: 14,
    paddingHorizontal: 8,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { color: COLORS.navy, fontWeight: "900", fontSize: 18 },
  battPill: {
    position: "absolute",
    bottom: -4,
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    backgroundColor: COLORS.white,
    borderRadius: 999,
    paddingHorizontal: 5,
    paddingVertical: 2,
    ...CARD_SHADOW,
  },
  battText: { fontSize: 9, fontWeight: "800", color: COLORS.text },
  personName: { color: COLORS.text, fontWeight: "800", fontSize: 16 },
  personPlace: { color: COLORS.textMuted, fontSize: 13, marginTop: 2 },
  personSince: { color: "#9CA3AF", fontSize: 12, marginTop: 2 },
  personOffline: { color: "#DC2626", fontWeight: "700", fontSize: 13, marginTop: 2 },
  addPerson: {
    marginTop: 12,
    backgroundColor: "#E8E8EE",
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
  },
  addPersonText: { color: COLORS.text, fontWeight: "800", fontSize: 15 },
  hint: { color: COLORS.textMuted, fontSize: 13, marginBottom: 10, lineHeight: 18 },
  pointCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: "transparent",
  },
  pointOn: { borderColor: ACCENT },
  pointText: { flex: 1, color: COLORS.text, fontWeight: "700", fontSize: 13 },
  myLoc: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
  },
  myLocText: { color: ACCENT, fontWeight: "800", fontSize: 12 },
  label: { color: ACCENT, fontWeight: "800", fontSize: 12, marginBottom: 8 },
  etaRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 12 },
  etaChip: {
    backgroundColor: COLORS.white,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  etaOn: { backgroundColor: ACCENT },
  etaText: { color: ACCENT, fontWeight: "800", fontSize: 12 },
  etaTextOn: { color: COLORS.white },
  progressWrap: {
    height: 8,
    borderRadius: 4,
    backgroundColor: "#E5E7EB",
    overflow: "hidden",
    marginBottom: 12,
  },
  progressFill: { height: "100%", backgroundColor: "#2563EB" },
  countdown: {
    color: COLORS.navy,
    fontWeight: "800",
    fontSize: 14,
    textAlign: "center",
    marginBottom: 12,
  },
  primaryBtn: {
    backgroundColor: ACCENT,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
  },
  primaryText: { color: COLORS.white, fontWeight: "900", fontSize: 15 },
  arrivedBtn: {
    backgroundColor: "#16A34A",
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
  },
  arrivedBtnText: { color: COLORS.white, fontWeight: "900", fontSize: 15 },
  demoBtn: {
    marginTop: 10,
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: "center",
    backgroundColor: COLORS.white,
    borderWidth: 1.5,
    borderColor: ACCENT,
  },
  demoBtnText: { color: ACCENT, fontWeight: "800", fontSize: 13 },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: COLORS.white,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  chipOn: { borderWidth: 2, borderColor: ACCENT },
  chipDot: { width: 12, height: 12, borderRadius: 6 },
  chipText: { color: COLORS.text, fontWeight: "700", fontSize: 12 },
});
