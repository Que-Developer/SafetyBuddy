import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
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
import { useLocale } from "@/i18n/LocaleContext";
import {
  CAMPUS_CENTER,
  CAMPUS_DESTINATIONS,
  MAP_WALK_CONTACTS,
  type MapLayerKey,
} from "@/data/mapData";
import { loadTrustedContacts } from "@/services/contacts";

// Map tab — Walk With Me: pick a destination and a trusted contact.

type LatLng = { lat: number; lng: number };

type WalkContact = {
  id: string;
  name: string;
  phone: string;
  online: boolean;
  battery: number;
  initial: string;
  color: string;
};

type PendingDestination = {
  name: string;
  lat: number;
  lng: number;
};

function haversineMeters(a: LatLng, b: LatLng) {
  // Rough walking distance between two GPS points.
  const R = 6371e3;
  const φ1 = (a.lat * Math.PI) / 180;
  const φ2 = (b.lat * Math.PI) / 180;
  const Δφ = ((b.lat - a.lat) * Math.PI) / 180;
  const Δλ = ((b.lng - a.lng) * Math.PI) / 180;
  const x =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
}

function walkingEtaMinutes(meters: number) {
  // ~5 km/h walking pace.
  const walkingSpeed = 1.4; // m/s
  return Math.max(1, Math.round(meters / walkingSpeed / 60));
}

function formatDistance(meters: number) {
  if (meters < 1000) return `${Math.round(meters)} m`;
  return `${(meters / 1000).toFixed(1)} km`;
}

function formatCountdown(total: number) {
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function fill(template: string, vars: Record<string, string | number>) {
  // Swap {placeholders} in translated strings.
  return Object.entries(vars).reduce(
    (s, [k, v]) => s.split(`{${k}}`).join(String(v)),
    template
  );
}

export default function MapScreen() {
  const { colors } = useTheme();
  const { t } = useLocale();
  const ACCENT = colors.accent;
  const [mode, setMode] = useState<"2d" | "3d">("2d");
  const [base, setBase] = useState<"street" | "satellite">("street");
  const [query, setQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [showContactPicker, setShowContactPicker] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pendingDestination, setPendingDestination] =
    useState<PendingDestination | null>(null);
  const [pendingContact, setPendingContact] = useState<WalkContact | null>(null);

  const [activeLayers] = useState<MapLayerKey[]>([
    "danger",
    "security",
    "emergency",
    "firstAid",
    "safeZone",
  ]);
  const pickMode = null as "start" | "end" | null;
  const [start, setStart] = useState<LatLng | null>(null);
  const [end, setEnd] = useState<LatLng | null>(null);
  const [endLabel, setEndLabel] = useState(() => t("tapMapForDestination"));
  const [destName, setDestName] = useState("");
  const [eta, setEta] = useState(10);
  const [distanceMeters, setDistanceMeters] = useState(0);
  const [contactId, setContactId] = useState(MAP_WALK_CONTACTS[0]?.id);
  const [contacts, setContacts] = useState<WalkContact[]>(MAP_WALK_CONTACTS);
  const [simulating, setSimulating] = useState(false);
  const [walkActive, setWalkActive] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [progress, setProgress] = useState(0);
  const [live, setLive] = useState<LatLng | null>(null);
  const [gpsStatus, setGpsStatus] = useState<"pending" | "on" | "off" | "campus">(
    "pending"
  );
  const [followLive, setFollowLive] = useState(false);
  const [status, setStatus] = useState(() => t("findingLiveLocation"));
  const didCenterGps = useRef(false);
  const arrivedRef = useRef(false);
  const simulatingRef = useRef(false);

  useEffect(() => {
    simulatingRef.current = simulating;
  }, [simulating]);

  useEffect(() => {
    if (!followLive) return;
    const timer = setTimeout(() => setFollowLive(false), 900);
    return () => clearTimeout(timer);
  }, [followLive]);

  useEffect(() => {
    // Count down every second while a walk is active.
    if (!walkActive || secondsLeft <= 0) return;
    const timer = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [walkActive, secondsLeft]);

  useEffect(() => {
    // Timer ran out and they never tapped "arrived" — alert the trusted contact.
    if (!walkActive || secondsLeft !== 0 || arrivedRef.current) return;
    const contact = contacts.find((c) => c.id === contactId)?.name ?? t("trustedContactsFallback");
    setWalkActive(false);
    setSimulating(false);
    setStatus(fill(t("etaMissedAlertBody"), { contact }));
    Alert.alert(
      t("trustedContactsAlerted"),
      fill(t("etaMissedAlertBody"), { contact }),
      [{ text: t("ok") }]
    );
  }, [walkActive, secondsLeft, contacts, contactId, t]);

  useEffect(() => {
    // Prefill the contact picker from saved trusted contacts.
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
      setContactId((prev) => prev || list[0].id);
    });
  }, []);

  useEffect(() => {
    // Track the student's live GPS (or fall back to campus center).
    let sub: Location.LocationSubscription | null = null;
    let cancelled = false;

    const applyPoint = (point: LatLng, source: "on" | "campus") => {
      if (cancelled || simulatingRef.current) return;
      setLive(point);
      setGpsStatus(source);
      if (!didCenterGps.current) {
        didCenterGps.current = true;
        setFollowLive(true);
      }
      setStatus(
        source === "on" ? t("liveGpsWalkHint") : t("campusGpsWalkHint")
      );
    };

    (async () => {
      try {
        const { status: perm } = await Location.requestForegroundPermissionsAsync();
        if (perm !== "granted") {
          if (!cancelled) {
            applyPoint(CAMPUS_CENTER, "campus");
            setGpsStatus("off");
          }
          return;
        }

        const current = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });
        if (cancelled) return;
        applyPoint(
          { lat: current.coords.latitude, lng: current.coords.longitude },
          "on"
        );

        sub = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.High,
            distanceInterval: 5,
            timeInterval: 2500,
          },
          (pos) => {
            applyPoint(
              { lat: pos.coords.latitude, lng: pos.coords.longitude },
              "on"
            );
          }
        );
      } catch {
        if (!cancelled) {
          applyPoint(CAMPUS_CENTER, "campus");
        }
      }
    })();

    return () => {
      cancelled = true;
      sub?.remove();
    };
  }, [t]);

  const filteredDestinations = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return CAMPUS_DESTINATIONS;
    return CAMPUS_DESTINATIONS.filter((d) =>
      d.name.toLowerCase().includes(q)
    );
  }, [query]);

  const selectedContact = contacts.find((c) => c.id === contactId);

  const routePreview = useMemo(() => {
    if (!pendingDestination || !live) return null;
    const meters = haversineMeters(live, {
      lat: pendingDestination.lat,
      lng: pendingDestination.lng,
    });
    return {
      meters,
      distanceLabel: formatDistance(meters),
      etaMinutes: walkingEtaMinutes(meters),
    };
  }, [pendingDestination, live]);

  const onMapEvent = useCallback(
    (event: MapEvent) => {
      if (event.type === "mapClick") {
        if (walkActive) return;
        setStatus(
          gpsStatus === "on"
            ? t("liveGpsWalkHint")
            : gpsStatus === "campus"
              ? t("campusGpsWalkHint")
              : t("findingLiveLocation")
        );
      }
      if (event.type === "simProgress") {
        setLive({ lat: event.lat, lng: event.lng });
        setProgress(event.progress);
      }
      if (event.type === "simDone") {
        setSimulating(false);
        setProgress(1);
        if (walkActive) {
          setStatus(t("routeFinishedHint"));
        } else {
          setStatus(t("youArrivedSafely"));
        }
      }
      if (event.type === "markerClick") {
        setStatus(event.name);
      }
    },
    [walkActive, gpsStatus, t]
  );

  const chooseDestination = (name: string, lat: number, lng: number) => {
    if (!live) {
      Alert.alert(t("locationNeeded"), t("locationNeededBody"));
      return;
    }
    setQuery(name);
    setShowSearch(false);
    setPendingDestination({ name, lat, lng });
    setPendingContact(null);
    setShowContactPicker(true);
  };

  const selectContact = (contact: WalkContact) => {
    setPendingContact(contact);
    setContactId(contact.id);
    setShowContactPicker(false);
    setShowConfirm(true);
  };

  const startWalkWithMe = () => {
    // Starts the walk: route, ETA countdown, and share with the chosen contact.
    if (!pendingDestination || !live || !pendingContact) {
      Alert.alert(t("locationError"), t("locationErrorBody"));
      return;
    }

    const startPoint = live;
    const endPoint = {
      lat: pendingDestination.lat,
      lng: pendingDestination.lng,
    };
    const meters = haversineMeters(startPoint, endPoint);
    const etaMinutes = walkingEtaMinutes(meters);

    setStart(startPoint);
    setEnd(endPoint);
    setEndLabel(fill(t("goingToLabel"), { place: pendingDestination.name }));
    setDestName(pendingDestination.name);
    setContactId(pendingContact.id);
    setDistanceMeters(meters);
    setEta(etaMinutes);

    arrivedRef.current = false;
    setWalkActive(true);
    setSimulating(true);
    setProgress(0);
    setSecondsLeft(etaMinutes * 60);
    setStatus(
      fill(t("walkingWithStatus"), {
        name: pendingContact.name,
        distance: formatDistance(meters),
        eta: etaMinutes,
      })
    );
    setShowConfirm(false);
    setPendingDestination(null);
    setPendingContact(null);
    setFollowLive(false);
  };

  const markArrivedSafely = () => {
    // Student made it — stop the timer and tell their contact.
    arrivedRef.current = true;
    setWalkActive(false);
    setSimulating(false);
    setSecondsLeft(0);
    setProgress(1);
    const contact = selectedContact?.name ?? t("trustedContactsFallback");
    setStatus(fill(t("arrivedSafelyStatus"), { contact }));
    Alert.alert(
      t("youArrivedSafely"),
      fill(t("arrivedNotifiedBody"), { contact })
    );
  };

  const cancelWalk = () => {
    // Bail out of the walk without alerting anyone about ETA.
    arrivedRef.current = true;
    setWalkActive(false);
    setSimulating(false);
    setSecondsLeft(0);
    setStart(null);
    setEnd(null);
    setProgress(0);
    setStatus(t("walkCancelled"));
  };

  const gpsLabel =
    gpsStatus === "on"
      ? t("liveGps")
      : gpsStatus === "campus"
        ? t("campusPin")
        : gpsStatus === "off"
          ? t("gpsOff")
          : t("locating");

  return (
    <View style={[styles.root, { backgroundColor: colors.bgDeep }]}>
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
          youLabel={t("youMarker")}
          onEvent={onMapEvent}
        />
      </View>

      <SafeAreaView style={styles.overlay} edges={[]} pointerEvents="box-none">
        <View style={styles.topRow} pointerEvents="box-none">
          <View
            style={[
              styles.gpsChip,
              {
                backgroundColor: colors.card,
                borderColor:
                  gpsStatus === "on"
                    ? "#22C55E"
                    : gpsStatus === "campus"
                      ? ACCENT
                      : colors.textDim,
              },
            ]}
          >
            <View
              style={[
                styles.gpsDot,
                {
                  backgroundColor:
                    gpsStatus === "on"
                      ? "#22C55E"
                      : gpsStatus === "campus"
                        ? ACCENT
                        : colors.textDim,
                },
              ]}
            />
            <Text style={[styles.gpsChipText, { color: colors.text }]}>
              {gpsLabel}
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.roundBtn, { backgroundColor: colors.card }]}
            onPress={() => {
              if (walkActive) {
                Alert.alert(t("walkInProgress"), t("walkInProgressBody"));
                return;
              }
              setShowSearch(true);
            }}
          >
            <Ionicons name="search" size={18} color={ACCENT} />
          </TouchableOpacity>
        </View>

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

      {!walkActive && (
        <SafeAreaView style={styles.hintBar} edges={[]} pointerEvents="none">
          <View style={[styles.hintCard, { backgroundColor: colors.card }]}>
            <Text style={[styles.hintText, { color: colors.text }]} numberOfLines={2}>
              {status}
            </Text>
          </View>
        </SafeAreaView>
      )}

      {walkActive && (
        <SafeAreaView style={styles.walkPanelWrap} edges={[]}>
          <View style={[styles.walkPanel, { backgroundColor: colors.card }]}>
            <View style={styles.walkHeader}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.walkTitle, { color: colors.text }]}>
                  {t("walkWithMe")} · {selectedContact?.name ?? "buddy"}
                </Text>
                <Text style={[styles.walkSub, { color: colors.textMuted }]}>
                  {destName || endLabel} · {formatDistance(distanceMeters)}
                </Text>
              </View>
              <View
                style={[
                  styles.etaBadge,
                  { backgroundColor: colors.navy },
                ]}
              >
                <Text style={[styles.etaBadgeLabel, { color: colors.bg }]}>
                  {t("eta")}
                </Text>
                <Text style={[styles.etaBadgeValue, { color: colors.bg }]}>
                  {formatCountdown(secondsLeft)}
                </Text>
              </View>
            </View>

            <View style={[styles.progressTrack, { backgroundColor: colors.input }]}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${Math.round(progress * 100)}%`,
                    backgroundColor: colors.navy,
                  },
                ]}
              />
            </View>
            <Text style={[styles.progressLabel, { color: colors.textMuted }]}>
              {fill(t("walkProgressLabel"), {
                pct: Math.round(progress * 100),
                eta,
              })}
            </Text>

            <View style={styles.walkActions}>
              <TouchableOpacity
                style={[styles.cancelBtn, { borderColor: colors.navy }]}
                onPress={cancelWalk}
              >
                <Text style={[styles.cancelBtnText, { color: colors.text }]}>{t("cancel")}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.arriveBtn, { backgroundColor: colors.navy }]}
                onPress={markArrivedSafely}
              >
                <Ionicons name="checkmark-circle" size={18} color={colors.bg} />
                <Text style={[styles.arriveBtnText, { color: colors.bg }]}>
                  {t("iArrivedSafely")}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      )}

      {/* Search destinations */}
      <Modal
        visible={showSearch}
        transparent
        animationType="slide"
        onRequestClose={() => setShowSearch(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>{t("whereTo")}</Text>
              <TouchableOpacity onPress={() => setShowSearch(false)}>
                <Ionicons name="close-circle" size={28} color={colors.textMuted} />
              </TouchableOpacity>
            </View>
            <TextInput
              style={[
                styles.modalSearchInput,
                { color: colors.text, borderBottomColor: colors.navy },
              ]}
              placeholder={t("searchDestinations")}
              placeholderTextColor={colors.textDim}
              value={query}
              onChangeText={setQuery}
              autoFocus
            />
            <ScrollView style={styles.modalScroll}>
              {filteredDestinations.map((d) => {
                const meters = live
                  ? haversineMeters(live, { lat: d.lat, lng: d.lng })
                  : null;
                return (
                  <TouchableOpacity
                    key={d.id}
                    style={[styles.modalItem, { borderBottomColor: colors.navy }]}
                    onPress={() => chooseDestination(d.name, d.lat, d.lng)}
                  >
                    <Ionicons
                      name="location-outline"
                      size={20}
                      color={ACCENT}
                      style={{ marginRight: 12 }}
                    />
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.modalItemTitle, { color: colors.text }]}>
                        {d.name}
                      </Text>
                      <Text style={[styles.modalItemSub, { color: colors.textMuted }]}>
                        {d.description}
                      </Text>
                    </View>
                    {meters != null && (
                      <View style={styles.destMeta}>
                        <Text style={[styles.destMetaDist, { color: colors.text }]}>
                          {formatDistance(meters)}
                        </Text>
                        <Text style={[styles.destMetaEta, { color: colors.textMuted }]}>
                          ~{walkingEtaMinutes(meters)} min
                        </Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Trusted contact picker */}
      <Modal
        visible={showContactPicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowContactPicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>{t("walkWithEllipsis")}</Text>
              <TouchableOpacity onPress={() => setShowContactPicker(false)}>
                <Ionicons name="close-circle" size={28} color={colors.textMuted} />
              </TouchableOpacity>
            </View>
            <Text style={[styles.modalSubtitle, { color: colors.textMuted }]}>
              {fill(t("chooseTrustedContact"), {
                place: pendingDestination?.name ?? t("yourDestination"),
              })}
            </Text>
            <ScrollView style={styles.modalScroll}>
              {contacts.map((c) => (
                <TouchableOpacity
                  key={c.id}
                  style={[styles.contactItem, { borderBottomColor: colors.navy }]}
                  onPress={() => selectContact(c)}
                >
                  <View style={[styles.contactAvatar, { backgroundColor: c.color }]}>
                    <Text style={[styles.contactInitial, { color: colors.white }]}>
                      {c.initial}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.contactName, { color: colors.text }]}>{c.name}</Text>
                    <Text style={[styles.contactPhone, { color: colors.textMuted }]}>
                      {c.phone}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={colors.textDim} />
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Confirm distance + ETA */}
      <Modal
        visible={showConfirm}
        transparent
        animationType="slide"
        onRequestClose={() => setShowConfirm(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.confirmCard, { backgroundColor: colors.card }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>{t("startWalkConfirm")}</Text>
            <Text style={[styles.modalSubtitle, { color: colors.textMuted, paddingHorizontal: 0 }]}>
              {fill(t("startWalkShareBody"), {
                name: pendingContact?.name ?? t("trustedContactsFallback"),
              })}
            </Text>

            <View style={[styles.confirmRow, { backgroundColor: colors.input }]}>
              <Ionicons name="navigate" size={18} color={ACCENT} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.confirmLabel, { color: colors.textMuted }]}>{t("from")}</Text>
                <Text style={[styles.confirmValue, { color: colors.text }]}>
                  {t("myLiveLocation")}
                </Text>
              </View>
            </View>
            <View style={[styles.confirmRow, { backgroundColor: colors.input }]}>
              <Ionicons name="flag" size={18} color="#EF4444" />
              <View style={{ flex: 1 }}>
                <Text style={[styles.confirmLabel, { color: colors.textMuted }]}>{t("to")}</Text>
                <Text style={[styles.confirmValue, { color: colors.text }]}>
                  {pendingDestination?.name}
                </Text>
              </View>
            </View>
            <View style={styles.confirmStats}>
              <View style={[styles.statBox, { backgroundColor: colors.input }]}>
                <Text style={[styles.statValue, { color: colors.text }]}>
                  {routePreview?.distanceLabel ?? "—"}
                </Text>
                <Text style={[styles.statLabel, { color: colors.textMuted }]}>{t("distance")}</Text>
              </View>
              <View style={[styles.statBox, { backgroundColor: colors.input }]}>
                <Text style={[styles.statValue, { color: colors.text }]}>
                  {routePreview ? `~${routePreview.etaMinutes} min` : "—"}
                </Text>
                <Text style={[styles.statLabel, { color: colors.textMuted }]}>{t("walkingEta")}</Text>
              </View>
            </View>

            <View style={styles.confirmActions}>
              <TouchableOpacity
                style={[styles.cancelBtn, { borderColor: colors.navy, flex: 1 }]}
                onPress={() => {
                  setShowConfirm(false);
                  setShowContactPicker(true);
                }}
              >
                <Text style={[styles.cancelBtnText, { color: colors.text }]}>{t("back")}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.arriveBtn, { backgroundColor: colors.navy, flex: 1.4 }]}
                onPress={startWalkWithMe}
              >
                <Ionicons name="walk" size={18} color={colors.bg} />
                <Text style={[styles.arriveBtnText, { color: colors.bg }]}>
                  {t("startWalk")}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  mapFull: { ...StyleSheet.absoluteFill },
  overlay: {
    ...StyleSheet.absoluteFill,
    bottom: undefined,
    height: "58%",
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingTop: 4,
  },
  gpsChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    ...CARD_SHADOW,
  },
  gpsDot: { width: 8, height: 8, borderRadius: 4 },
  gpsChipText: { fontSize: 13, fontWeight: "700" },
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
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    ...CARD_SHADOW,
  },
  sideStack: {
    position: "absolute",
    right: 14,
    bottom: 0,
    paddingBottom: 16,
    gap: 10,
    justifyContent: "flex-end",
  },
  hintBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 14,
    paddingBottom: 10,
  },
  hintCard: {
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    ...CARD_SHADOW,
  },
  hintText: { fontSize: 13, fontWeight: "600" },
  walkPanelWrap: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 12,
    paddingBottom: 8,
  },
  walkPanel: {
    borderRadius: 20,
    padding: 16,
    ...CARD_SHADOW,
  },
  walkHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  walkTitle: { fontSize: 17, fontWeight: "800" },
  walkSub: { fontSize: 13, marginTop: 2 },
  etaBadge: {
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignItems: "center",
  },
  etaBadgeLabel: { fontSize: 10, fontWeight: "700" },
  etaBadgeValue: { fontSize: 18, fontWeight: "900" },
  progressTrack: {
    height: 8,
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: { height: "100%", borderRadius: 4 },
  progressLabel: { fontSize: 12, marginTop: 8, marginBottom: 14 },
  walkActions: { flexDirection: "row", gap: 10 },
  cancelBtn: {
    borderWidth: 1.5,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelBtnText: { fontSize: 14, fontWeight: "700" },
  arriveBtn: {
    flex: 1,
    flexDirection: "row",
    gap: 8,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  arriveBtnText: { fontSize: 14, fontWeight: "800" },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "80%",
    paddingBottom: 24,
  },
  confirmCard: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 28,
    gap: 10,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 20,
    paddingBottom: 10,
  },
  modalTitle: { fontSize: 22, fontWeight: "900" },
  modalSubtitle: {
    fontSize: 14,
    paddingHorizontal: 20,
    marginBottom: 15,
    lineHeight: 20,
  },
  modalSearchInput: {
    marginHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    fontSize: 16,
    marginBottom: 10,
  },
  modalScroll: { paddingHorizontal: 20 },
  modalItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  modalItemTitle: { fontSize: 16, fontWeight: "700" },
  modalItemSub: { fontSize: 13, marginTop: 2 },
  destMeta: { alignItems: "flex-end", marginLeft: 8 },
  destMetaDist: { fontSize: 14, fontWeight: "800" },
  destMetaEta: { fontSize: 12, marginTop: 2 },
  contactItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  contactAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 15,
  },
  contactInitial: { fontSize: 20, fontWeight: "900" },
  contactName: { fontSize: 16, fontWeight: "700" },
  contactPhone: { fontSize: 13, marginTop: 2 },
  confirmRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: 14,
    padding: 14,
  },
  confirmLabel: { fontSize: 11, fontWeight: "600", textTransform: "uppercase" },
  confirmValue: { fontSize: 15, fontWeight: "700", marginTop: 2 },
  confirmStats: { flexDirection: "row", gap: 10, marginTop: 4 },
  statBox: {
    flex: 1,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
  },
  statValue: { fontSize: 20, fontWeight: "900" },
  statLabel: { fontSize: 12, marginTop: 4, fontWeight: "600" },
  confirmActions: { flexDirection: "row", gap: 10, marginTop: 12 },
});
