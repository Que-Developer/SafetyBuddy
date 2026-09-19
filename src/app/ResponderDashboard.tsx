import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { GlassPanel } from "@/components/GlassPanel";
import { OpsReportsMap } from "@/components/OpsReportsMap";
import { SafetyBuddyLogo } from "@/components/SafetyBuddyLogo";
import { ThemeToggleButton } from "@/components/ThemeToggleButton";
import { toast } from "@/components/toast";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { buildOpsMapMarkers } from "@/lib/opsMapMarkers";
import {
  INCIDENT_STATUS_FLOW,
  STATUS_COLORS,
  createSupportReferral,
  fetchCampusZones,
  fetchEmergencyAlerts,
  fetchIncidentReports,
  fetchResponders,
  fetchSupportServices,
  fetchWalkSessions,
  updateEmergencyAlert,
  type CampusZone,
  type IncidentReportRow,
  type IncidentStatus,
  type Responder,
  type ResponderIncident,
  type SupportService,
  type WalkSession,
} from "@/services/campusApi";

type FilterKey = "All" | IncidentStatus;

function nextStatus(current: IncidentStatus): IncidentStatus {
  if (
    current === "Resolved" ||
    current === "False Alarm" ||
    current === "Cancelled"
  ) {
    return current;
  }
  const idx = INCIDENT_STATUS_FLOW.indexOf(current);
  if (idx < 0 || idx >= 3) return "Resolved";
  return INCIDENT_STATUS_FLOW[idx + 1];
}

export default function ResponderDashboard() {
  const { user, logout, isAdmin } = useAuth();
  const { colors } = useTheme();
  const [incidents, setIncidents] = useState<ResponderIncident[]>([]);
  const [reports, setReports] = useState<IncidentReportRow[]>([]);
  const [zones, setZones] = useState<CampusZone[]>([]);
  const [responders, setResponders] = useState<Responder[]>([]);
  const [walks, setWalks] = useState<WalkSession[]>([]);
  const [services, setServices] = useState<SupportService[]>([]);
  const [filter, setFilter] = useState<FilterKey>("All");
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const [alerts, duty, sessions, svc, reps, z] = await Promise.all([
      fetchEmergencyAlerts(),
      fetchResponders(),
      fetchWalkSessions().catch(() => [] as WalkSession[]),
      fetchSupportServices().catch(() => [] as SupportService[]),
      fetchIncidentReports().catch(() => [] as IncidentReportRow[]),
      fetchCampusZones().catch(() => [] as CampusZone[]),
    ]);
    setIncidents(alerts);
    setResponders(duty);
    setWalks(
      sessions.filter((s) => s.status === "Active" || s.status === "Distress")
    );
    setServices(svc);
    setReports(reps);
    setZones(z);
  }, []);

  useEffect(() => {
    refresh()
      .catch(() => toast.error("Could not load"))
      .finally(() => setLoading(false));
  }, [refresh]);

  const stats = useMemo(() => {
    const active = incidents.filter(
      (i) =>
        i.status !== "Resolved" &&
        i.status !== "False Alarm" &&
        i.status !== "Cancelled"
    ).length;
    const resolved = incidents.filter((i) => i.status === "Resolved").length;
    const falseAlarm = incidents.filter(
      (i) => i.status === "False Alarm"
    ).length;
    return { active, resolved, falseAlarm };
  }, [incidents]);

  const filtered = useMemo(() => {
    if (filter === "All") return incidents;
    return incidents.filter((i) => i.status === filter);
  }, [incidents, filter]);

  const mapMarkers = useMemo(
    () =>
      buildOpsMapMarkers({
        alerts: incidents,
        reports,
        walks,
        zones,
      }),
    [incidents, reports, walks, zones]
  );

  const filters: FilterKey[] = [
    "All",
    "New",
    "Acknowledged",
    "Responder Dispatched",
    "Resolved",
    "False Alarm",
  ];

  const advance = async (alert: ResponderIncident) => {
    const status = nextStatus(alert.status);
    const assignedResponder =
      status === "Responder Dispatched" &&
      alert.assignedResponder === "Unassigned"
        ? (user?.fullName ?? "Officer on duty")
        : undefined;
    try {
      await updateEmergencyAlert(alert.emergencyAlertId, {
        status,
        assignedResponder,
      });
      await refresh();
      toast.success(status);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Update failed");
    }
  };

  const markFalse = async (alert: ResponderIncident) => {
    try {
      await updateEmergencyAlert(alert.emergencyAlertId, {
        status: "False Alarm",
      });
      await refresh();
      toast.info("False alarm");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Update failed");
    }
  };

  const referSupport = async (alert: ResponderIncident) => {
    if (!alert.studentId) {
      toast.warning("No student id on alert");
      return;
    }
    try {
      const counselling =
        services.find((s) => /counselling/i.test(s.title)) ?? services[0];
      await createSupportReferral({
        studentId: alert.studentId,
        emergencyAlertId: alert.emergencyAlertId,
        serviceId: counselling ? Number(counselling.id) : undefined,
        reason: "Security referral after incident",
      });
      toast.success("Support referral sent");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Referral failed");
    }
  };

  const openMap = (alert: ResponderIncident) => {
    if (alert.latitude == null || alert.longitude == null) {
      toast.info("No GPS yet", alert.location);
      return;
    }
    const url = `https://www.google.com/maps?q=${alert.latitude},${alert.longitude}`;
    Linking.openURL(url).catch(() => toast.warning("Could not open maps"));
  };

  return (
    <SafeAreaView
      style={[styles.root, { backgroundColor: colors.bg }]}
      edges={["top", "bottom"]}
    >
      <View style={styles.topBar}>
        <View style={{ flex: 1 }}>
          <SafetyBuddyLogo size="xs" style={styles.logo} />
          <Text style={[styles.title, { color: colors.text }]}>
            {user?.fullName ?? "Security"}
          </Text>
          <Text style={[styles.sub, { color: colors.textMuted }]}>
            Incident queue
          </Text>
        </View>
        <ThemeToggleButton size="sm" />
        {isAdmin ? (
          <TouchableOpacity
            onPress={() => router.push("/admin")}
            hitSlop={8}
            style={[styles.linkPill, { backgroundColor: colors.card }]}
          >
            <Text style={[styles.link, { color: colors.navy }]}>Admin</Text>
          </TouchableOpacity>
        ) : null}
        <TouchableOpacity
          onPress={async () => {
            await logout();
            router.replace("/login");
          }}
          hitSlop={8}
          style={[styles.iconBtn, { backgroundColor: colors.card }]}
        >
          <Ionicons name="log-out-outline" size={18} color={colors.navy} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.listPad}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.section, { color: colors.navy }]}>
          REPORTS MAP
        </Text>
        <Text style={[styles.mapHint, { color: colors.textMuted }]}>
          ! panic · R report · W active walk
        </Text>
        <GlassPanel radius={16} style={styles.mapCard}>
          <OpsReportsMap markers={mapMarkers} height={210} />
        </GlassPanel>

        <GlassPanel radius={14} style={styles.summaryCard}>
          <View style={styles.summaryInner}>
            <Text style={[styles.summaryText, { color: colors.textMuted }]}>
              <Text style={[styles.summaryStrong, { color: colors.text }]}>
                {stats.active}
              </Text>{" "}
              active ·{" "}
              <Text style={[styles.summaryStrong, { color: colors.text }]}>
                {stats.resolved}
              </Text>{" "}
              resolved ·{" "}
              <Text style={[styles.summaryStrong, { color: colors.text }]}>
                {stats.falseAlarm}
              </Text>{" "}
              false ·{" "}
              <Text style={[styles.summaryStrong, { color: colors.text }]}>
                {mapMarkers.length}
              </Text>{" "}
              on map
            </Text>
          </View>
        </GlassPanel>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
        >
          {filters.map((key) => {
            const on = filter === key;
            return (
              <TouchableOpacity
                key={key}
                onPress={() => setFilter(key)}
                style={[
                  styles.filterItem,
                  {
                    backgroundColor: on ? colors.navy : colors.card,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.filterLabel,
                    { color: on ? colors.bg : colors.text },
                  ]}
                >
                  {key === "Responder Dispatched" ? "Dispatched" : key}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {loading ? (
          <ActivityIndicator color={colors.navy} style={{ marginTop: 24 }} />
        ) : null}

        {!loading && filtered.length === 0 ? (
          <Text style={[styles.empty, { color: colors.textMuted }]}>
            No alerts
          </Text>
        ) : null}

        <Text style={[styles.section, { color: colors.navy }]}>ALERTS</Text>
        {filtered.map((alert) => {
          const canAdvance =
            alert.status !== "Resolved" &&
            alert.status !== "False Alarm" &&
            alert.status !== "Cancelled";
          const statusColor = STATUS_COLORS[alert.status] ?? colors.textDim;

          return (
            <GlassPanel key={alert.id} radius={14} style={styles.rowCard}>
              <View style={styles.rowInner}>
                <View
                  style={[styles.statusDot, { backgroundColor: statusColor }]}
                />
                <View style={{ flex: 1 }}>
                  <View style={styles.rowTop}>
                    <Text style={[styles.rowTitle, { color: colors.text }]}>
                      {alert.alertType}
                    </Text>
                    <Text
                      style={[styles.rowTime, { color: colors.textMuted }]}
                    >
                      {alert.timeTriggered}
                    </Text>
                  </View>
                  <Text style={[styles.rowMeta, { color: colors.textMuted }]}>
                    {alert.studentName} · {alert.status}
                  </Text>
                  <Text style={[styles.rowMeta, { color: colors.textMuted }]}>
                    {alert.location}
                  </Text>
                  {alert.latitude != null && alert.longitude != null ? (
                    <TouchableOpacity onPress={() => openMap(alert)}>
                      <Text style={[styles.gpsLink, { color: colors.navy }]}>
                        GPS {alert.latitude.toFixed(5)},{" "}
                        {alert.longitude.toFixed(5)} · Open map
                      </Text>
                    </TouchableOpacity>
                  ) : (
                    <Text style={[styles.rowMeta, { color: colors.textDim }]}>
                      GPS pending — zone pin on map if matched
                    </Text>
                  )}
                  <Text style={[styles.rowMeta, { color: colors.textMuted }]}>
                    {alert.assignedResponder}
                  </Text>
                  {alert.notes ? (
                    <Text style={[styles.notes, { color: colors.textDim }]}>
                      {alert.notes}
                    </Text>
                  ) : null}

                  {canAdvance ? (
                    <View style={styles.actions}>
                      <TouchableOpacity
                        style={[
                          styles.primaryAction,
                          { backgroundColor: colors.navy },
                        ]}
                        onPress={() => advance(alert)}
                      >
                        <Text
                          style={[
                            styles.primaryActionText,
                            { color: colors.bg },
                          ]}
                        >
                          {nextStatus(alert.status)}
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[
                          styles.ghostAction,
                          { borderColor: colors.tileBorder },
                        ]}
                        onPress={() => markFalse(alert)}
                      >
                        <Text
                          style={[
                            styles.ghostActionText,
                            { color: colors.text },
                          ]}
                        >
                          False alarm
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[
                          styles.ghostAction,
                          { borderColor: colors.tileBorder },
                        ]}
                        onPress={() => referSupport(alert)}
                      >
                        <Text
                          style={[
                            styles.ghostActionText,
                            { color: colors.text },
                          ]}
                        >
                          Refer
                        </Text>
                      </TouchableOpacity>
                    </View>
                  ) : null}
                </View>
              </View>
            </GlassPanel>
          );
        })}

        <Text style={[styles.section, { color: colors.navy }]}>
          SAFETY REPORTS
        </Text>
        {reports.length === 0 ? (
          <Text style={[styles.empty, { color: colors.textMuted }]}>
            No incident reports
          </Text>
        ) : null}
        {reports.slice(0, 8).map((r) => (
          <GlassPanel key={r.id} radius={14} style={styles.rowCard}>
            <View style={styles.rowInner}>
              <View
                style={[styles.statusDot, { backgroundColor: colors.caution }]}
              />
              <View style={{ flex: 1 }}>
                <Text style={[styles.rowTitle, { color: colors.text }]}>
                  {r.reportType}
                </Text>
                <Text style={[styles.rowMeta, { color: colors.textMuted }]}>
                  {r.location} · {r.status}
                </Text>
                <Text
                  style={[styles.notes, { color: colors.textDim }]}
                  numberOfLines={2}
                >
                  {r.description}
                </Text>
              </View>
            </View>
          </GlassPanel>
        ))}

        <Text style={[styles.section, { color: colors.navy }]}>
          ACTIVE WALKS
        </Text>
        {walks.length === 0 ? (
          <Text style={[styles.empty, { color: colors.textMuted }]}>
            No shared walks
          </Text>
        ) : null}
        {walks.map((w) => (
          <GlassPanel key={w.sessionId} radius={14} style={styles.rowCard}>
            <View style={styles.dutyInner}>
              <Text style={[styles.dutyName, { color: colors.text }]}>
                {w.studentName}
              </Text>
              <Text style={[styles.dutyMeta, { color: colors.textMuted }]}>
                {(w.startLabel || "?") + " → " + (w.endLabel || "?")} ·{" "}
                {w.status}
              </Text>
              {w.lastLat != null && w.lastLng != null ? (
                <Text style={[styles.dutyMeta, { color: colors.textDim }]}>
                  Last GPS {w.lastLat.toFixed(5)}, {w.lastLng.toFixed(5)}
                </Text>
              ) : null}
            </View>
          </GlassPanel>
        ))}

        <Text style={[styles.section, { color: colors.navy }]}>ON DUTY</Text>
        {responders.map((r) => (
          <GlassPanel key={r.id} radius={14} style={styles.rowCard}>
            <View style={styles.dutyRow}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.dutyName, { color: colors.text }]}>
                  {r.name}
                </Text>
                <Text style={[styles.dutyMeta, { color: colors.textMuted }]}>
                  {r.role}
                  {r.contact ? ` · ${r.contact}` : ""}
                </Text>
              </View>
              <Text
                style={[
                  styles.dutyStatus,
                  {
                    color:
                      r.availability === "Available" ||
                      r.availability === "On Call"
                        ? colors.success
                        : colors.textDim,
                  },
                ]}
              >
                {r.availability}
              </Text>
            </View>
          </GlassPanel>
        ))}
        <View style={{ height: 28 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 18,
    paddingTop: 8,
    paddingBottom: 12,
    gap: 10,
  },
  logo: { alignSelf: "flex-start", marginBottom: 6 },
  title: { fontSize: 20, fontWeight: "800" },
  sub: { fontSize: 13, marginTop: 2 },
  linkPill: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  link: { fontWeight: "800", fontSize: 13 },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  listPad: { paddingHorizontal: 16, paddingBottom: 28 },
  section: {
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.7,
    marginTop: 16,
    marginBottom: 8,
  },
  mapHint: { fontSize: 12, marginBottom: 8 },
  mapCard: { marginBottom: 10, overflow: "hidden" },
  summaryCard: { marginBottom: 12 },
  summaryInner: { padding: 14 },
  summaryText: { fontSize: 13 },
  summaryStrong: { fontWeight: "800" },
  filterRow: { gap: 8, paddingBottom: 8 },
  filterItem: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
  },
  filterLabel: { fontSize: 13, fontWeight: "700" },
  empty: { paddingVertical: 10, fontSize: 14 },
  rowCard: { marginBottom: 10 },
  rowInner: {
    flexDirection: "row",
    gap: 10,
    padding: 14,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 6,
  },
  rowTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 4,
  },
  rowTitle: { fontSize: 15, fontWeight: "800", flex: 1 },
  rowTime: { fontSize: 12 },
  rowMeta: { fontSize: 13, marginTop: 2 },
  gpsLink: { fontSize: 12, fontWeight: "700", marginTop: 4 },
  notes: { fontSize: 13, marginTop: 8, lineHeight: 18 },
  actions: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 12 },
  primaryAction: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 12,
  },
  primaryActionText: { fontWeight: "800", fontSize: 13 },
  ghostAction: {
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
  },
  ghostActionText: { fontWeight: "700", fontSize: 13 },
  dutyInner: { padding: 14 },
  dutyRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
  },
  dutyName: { fontWeight: "800", fontSize: 14 },
  dutyMeta: { fontSize: 12, marginTop: 2 },
  dutyStatus: { fontSize: 12, fontWeight: "700" },
});