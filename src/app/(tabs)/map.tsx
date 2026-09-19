import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { router } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Dimensions,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { CampusMap, type MapEvent } from "@/components/CampusMap";
import { CARD_SHADOW } from "@/constants/theme";
import { useTheme } from "@/context/ThemeContext";
import {
  CAMPUS_DESTINATIONS,
  MAP_LAYERS,
  MAP_WALK_CONTACTS,
  type MapLayerKey,
} from "@/data/mapData";
import { loadTrustedContacts } from "@/services/contacts";
import { WALK_WITH_ME_USE_CASE } from "@/data/walkWithMeUseCase";

type LatLng = { lat: number; lng: number };

export default function MapScreen() {
  const { colors } = useTheme();
  const ACCENT = colors.accent;
  const [mode, setMode] = useState<"2d" | "3d">("2d");
  const [base, setBase] = useState<"street" | "satellite">("street");
  const [query, setQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [showContactPicker, setShowContactPicker] = useState(false);
  const [pendingDestination, setPendingDestination] = useState<{name: string, lat: number, lng: number} | null>(null);
  
  const [activeLayers, setActiveLayers] = useState<MapLayerKey[]>([
    "danger", "security", "emergency", "firstAid", "safeZone",
  ]);
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
  const didCenterGps = useRef(false);
  const arrivedRef = useRef(false);

  useEffect(() => {
    if (!followLive) return;
    const t = setTimeout(() => setFollowLive(false), 900);
    return () => clearTimeout(t);
  }, [followLive]);

  // ETA countdown
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

  const calculateETA = (startPoint: LatLng, endPoint: LatLng) => {
    const R = 6371e3;
    const φ1 = (startPoint.lat * Math.PI) / 180;
    const φ2 = (endPoint.lat * Math.PI) / 180;
    const Δφ = ((endPoint.lat - startPoint.lat) * Math.PI) / 180;
    const Δλ = ((endPoint.lng - startPoint.lng) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    const distance = R * c;
    const walkingSpeed = 1.4;
    const timeSeconds = distance / walkingSpeed;
    const timeMinutes = Math.max(1, Math.round(timeSeconds / 60));
    return timeMinutes;
  };

  const onMapEvent = useCallback(
    (event: MapEvent) => {
      if (event.type === "mapClick") {
        const point = { lat: event.lat, lng: event.lng };
        if (pickMode === "start" || (!start && !end && pickMode !== "end")) {
          setStart(point);
          setStartLabel(`Start · ${point.lat.toFixed(4)}, ${point.lng.toFixed(4)}`);
          setPickMode("end");
          setStatus("Now tap your destination");
        } else if (pickMode === "end" || (start && !end)) {
          setEnd(point);
          setEndLabel(`Going to · ${point.lat.toFixed(4)}, ${point.lng.toFixed(4)}`);
          setPickMode(null);
          setStatus("Set arrival time, then start Walk With Me");
          
          if (start) {
            const calculatedEta = calculateETA(start, point);
            setEta(calculatedEta);
          }
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
    setStatus("Start set — tap destination on the map");
  };

  const chooseDestination = (name: string, lat: number, lng: number) => {
    setQuery(name);
    setShowSearch(false);
    setPendingDestination({ name, lat, lng });
    setShowContactPicker(true);
  };

  const confirmWalkWithContact = (contact: any) => {
    if (!pendingDestination || !live) {
      Alert.alert("Location Error", "Waiting for your live location. Please try again.");
      return;
    }

    const startPoint = live;
    const endPoint = { lat: pendingDestination.lat, lng: pendingDestination.lng };
    
    setStart(startPoint);
    setEnd(endPoint);
    setStartLabel("Start · My live location");
    setEndLabel(`Going to · ${pendingDestination.name}`);
    setContactId(contact.id);
    
    const calculatedEta = calculateETA(startPoint, endPoint);
    setEta(calculatedEta);
    
    arrivedRef.current = false;
    setWalkActive(true);
    setSimulating(true);
    setProgress(0);
    setSecondsLeft(calculatedEta * 60);
    setStatus(`Walking with ${contact.name} · ETA ${calculatedEta} min · confirm when you arrive`);
    setShowContactPicker(false);
    setPendingDestination(null);
  };

  const beginWalkMonitoring = (label: string, etaMinutes = eta) => {
    arrivedRef.current = false;
    setWalkActive(true);
    setSimulating(true);
    setProgress(0);
    setSecondsLeft(etaMinutes * 60);
    setStatus(label);
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
          <View style={styles.topRightStack}>
            <TouchableOpacity
              style={[styles.roundBtn, { backgroundColor: colors.card }]}
              onPress={() => setShowSearch(true)}
            >
              <Ionicons name="search" size={18} color={ACCENT} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Side stack - Lowered to the bottom right corner */}
        <View style={styles.sideStack} pointerEvents="box-none">
          <TouchableOpacity
            style={[styles.roundBtn2, { backgroundColor: colors.card }]}
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
            style={[styles.roundBtn2, { backgroundColor: colors.card }]}
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
      </SafeAreaView>

      {/* --- SEARCH MODAL --- */}
      <Modal
        visible={showSearch}
        transparent
        animationType="slide"
        onRequestClose={() => setShowSearch(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.bg }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Where to?</Text>
              <TouchableOpacity onPress={() => setShowSearch(false)}>
                <Ionicons name="close-circle" size={28} color={colors.textMuted} />
              </TouchableOpacity>
            </View>
            <TextInput
              style={[styles.modalSearchInput, { color: colors.text, borderBottomColor: colors.navy }]}
              placeholder="Search destinations..."
              placeholderTextColor={colors.textDim}
              value={query}
              onChangeText={setQuery}
              autoFocus
            />
            <ScrollView style={styles.modalScroll}>
              {filteredDestinations.map((d) => (
                <TouchableOpacity
                  key={d.id}
                  style={[styles.modalItem, { borderBottomColor: colors.navy }]}
                  onPress={() => chooseDestination(d.name, d.lat, d.lng)}
                >
                  <Ionicons name="location-outline" size={20} color={ACCENT} style={{ marginRight: 12 }} />
                  <View>
                    <Text style={[styles.modalItemTitle, { color: colors.text }]}>{d.name}</Text>
                    <Text style={[styles.modalItemSub, { color: colors.textMuted }]}>{d.description}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* --- CONTACT PICKER MODAL --- */}
      <Modal
        visible={showContactPicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowContactPicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.bg }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Walk with...</Text>
              <TouchableOpacity onPress={() => setShowContactPicker(false)}>
                <Ionicons name="close-circle" size={28} color={colors.textMuted} />
              </TouchableOpacity>
            </View>
            <Text style={[styles.modalSubtitle, { color: colors.textMuted }]}>
              Choose a trusted contact to share your live location with.
            </Text>
            <ScrollView style={styles.modalScroll}>
              {contacts.map((c) => (
                <TouchableOpacity
                  key={c.id}
                  style={[styles.contactItem, { borderBottomColor: colors.navy }]}
                  onPress={() => confirmWalkWithContact(c)}
                >
                  <View style={[styles.contactAvatar, { backgroundColor: c.color }]}>
                    <Text style={[styles.contactInitial, { color: colors.bg }]}>{c.initial}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.contactName, { color: colors.text }]}>{c.name}</Text>
                    <Text style={[styles.contactPhone, { color: colors.textMuted }]}>{c.phone}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={colors.textDim} />
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#1a2332" },
  mapFull: { ...StyleSheet.absoluteFill },
  overlay: {
    ...StyleSheet.absoluteFill,
    bottom: undefined,
    height: "58%",
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'flex-end',
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
  roundBtn2: {
    width: 44,
    height: 44,
    top: 300,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    ...CARD_SHADOW,
  },
  // Lowered to the bottom right corner
  sideStack: {
    position: "absolute",
    right: 14,
    bottom: 0,
    paddingBottom: 16,
    gap: 10,
    justifyContent: 'flex-end',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
    paddingBottom: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    paddingBottom: 10,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '900',
  },
  modalSubtitle: {
    fontSize: 14,
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  modalSearchInput: {
    marginHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    fontSize: 16,
    marginBottom: 10,
  },
  modalScroll: {
    paddingHorizontal: 20,
  },
  modalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  modalItemTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  modalItemSub: {
    fontSize: 13,
    marginTop: 2,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  contactAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  contactInitial: {
    fontSize: 20,
    fontWeight: '900',
  },
  contactName: {
    fontSize: 16,
    fontWeight: '700',
  },
  contactPhone: {
    fontSize: 13,
    marginTop: 2,
  },
});