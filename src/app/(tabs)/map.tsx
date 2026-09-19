import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { router } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
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
  type MapLayerKey,
  type MapPoint,
} from "@/data/mapData";
import {
  fetchMapDestinations,
  fetchMapMarkers,
} from "@/services/campusApi";

type LatLng = { lat: number; lng: number };

const ACCENT = COLORS.navy;

export default function MapScreen() {
  const [mode, setMode] = useState<"2d" | "3d">("2d");
  const [base, setBase] = useState<"street" | "satellite">("street");
  const [viewRevision, setViewRevision] = useState(0);
  const [query, setQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [destinations, setDestinations] = useState<MapPoint[]>([]);
  const [layerPoints, setLayerPoints] = useState<MapPoint[]>([]);
  const activeLayers: MapLayerKey[] = [
    "danger",
    "security",
    "emergency",
    "firstAid",
    "safeZone",
  ];
  const [pickMode, setPickMode] = useState<"start" | "end" | null>(null);
  const [start, setStart] = useState<LatLng | null>(null);
  const [end, setEnd] = useState<LatLng | null>(null);
  const [simulating, setSimulating] = useState(false);
  const [live, setLive] = useState<LatLng | null>(null);
  const [followLive, setFollowLive] = useState(false);
  const didCenterGps = useRef(false);

  useEffect(() => {
    Promise.all([fetchMapDestinations(), fetchMapMarkers()])
      .then(([dests, markers]) => {
        setDestinations(
          dests.map((d) => ({
            id: d.id,
            name: d.name,
            lat: d.lat,
            lng: d.lng,
            type: "destination" as const,
            description: d.description,
          }))
        );
        setLayerPoints(
          markers.map((m) => ({
            id: m.id,
            name: m.name,
            lat: m.lat,
            lng: m.lng,
            type: m.type as MapPoint["type"],
            description: m.description,
          }))
        );
      })
      .catch(() => {
        setDestinations([]);
        setLayerPoints([]);
      });
  }, []);

  /** Cycle: 2D street → Color satellite → 3D pitched → 2D … */
  const cycleMapView = () => {
    if (mode === "3d") {
      setMode("2d");
      setBase("street");
    } else if (base === "street") {
      setMode("2d");
      setBase("satellite");
    } else {
      setMode("3d");
      setBase("satellite");
    }
    setViewRevision((n) => n + 1);
  };

  const viewLabel =
    mode === "3d" ? "3D" : base === "satellite" ? "Color" : "2D";

  useEffect(() => {
    if (!followLive) return;
    const t = setTimeout(() => setFollowLive(false), 900);
    return () => clearTimeout(t);
  }, [followLive]);

  useEffect(() => {
    let sub: Location.LocationSubscription | null = null;
    let cancelled = false;
    (async () => {
      try {
        const { status: perm } = await Location.requestForegroundPermissionsAsync();
        if (perm !== "granted") return;
        const current = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });
        if (cancelled) return;
        const point = {
          lat: current.coords.latitude,
          lng: current.coords.longitude,
        };
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
          }
        );
      } catch {
        // GPS unavailable — map still works without live position
      }
    })();
    return () => {
      cancelled = true;
      sub?.remove();
    };
  }, [simulating]);

  const filteredDestinations = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return destinations;
    return destinations.filter((d) =>
      d.name.toLowerCase().includes(q)
    );
  }, [query, destinations]);

  const onMapEvent = useCallback(
    (event: MapEvent) => {
      if (event.type === "mapClick") {
        const point = { lat: event.lat, lng: event.lng };
        if (pickMode === "start" || (!start && pickMode === "end" && !end)) {
          if (pickMode === "start" || !start) {
            setStart(point);
            setPickMode("end");
            return;
          }
        }
        if (pickMode === "end" || (start && pickMode !== "start")) {
          setEnd(point);
          setPickMode(null);
        }
      }
      if (event.type === "simProgress") {
        setLive({ lat: event.lat, lng: event.lng });
      }
      if (event.type === "simDone") {
        setSimulating(false);
      }
    },
    [pickMode, start, end]
  );

  const chooseDestination = (name: string, lat: number, lng: number) => {
    setQuery(name);
    setShowSearch(false);
    setEnd({ lat, lng });
    setPickMode(start ? null : "start");
  };

  return (
    <View style={styles.root}>
      <View style={styles.mapFull}>
        <CampusMap
          mode={mode}
          base={base}
          viewRevision={viewRevision}
          layerPoints={layerPoints}
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
            onPress={() => router.push("/(tabs)/profile")}
          >
            <Text style={styles.groupPillText}>Trusted circle</Text>
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
            onPress={() => router.push("/(tabs)/profile")}
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
          <TouchableOpacity style={styles.modeBtn} onPress={cycleMapView}>
            <Ionicons name="layers" size={18} color={ACCENT} />
            <Text style={styles.modeBtnText}>{viewLabel}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bg },
  mapFull: { ...StyleSheet.absoluteFill, backgroundColor: COLORS.bg },
  overlay: {
    ...StyleSheet.absoluteFill,
    bottom: 90,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingTop: 8,
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
    bottom: 24,
    gap: 10,
  },
  modeBtn: {
    width: 44,
    height: 52,
    borderRadius: 22,
    backgroundColor: COLORS.white,
    alignItems: "center",
    justifyContent: "center",
    gap: 1,
    ...CARD_SHADOW,
  },
  modeBtnText: {
    color: ACCENT,
    fontWeight: "900",
    fontSize: 9,
    letterSpacing: 0.3,
  },
});
