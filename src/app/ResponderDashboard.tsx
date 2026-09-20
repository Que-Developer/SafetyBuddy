import { AppHeader } from "@/components/AppHeader";
import { ThemeToggleCard } from "@/components/ThemeToggleCard";
import { CARD_SHADOW } from "@/constants/theme";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { useLocale } from "@/i18n/LocaleContext";
import {
  INCIDENT_STATUS_FLOW,
  STATUS_COLORS,
  type IncidentStatus,
  type ResponderIncident,
} from "@/data/mockData";
import {
  listPanicAlerts,
  listSecurityResponders,
  toResponderIncident,
  updatePanicAlertStatus,
  type NotifiedResponder,
} from "@/services/panicAlerts";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type FilterKey = "All" | IncidentStatus;
type ThemeColors = ReturnType<typeof useTheme>["colors"];

// Security / admin home — live panic alerts from students.

function StatCard({
  count,
  label,
  color,
  colors,
}: {
  count: number;
  label: string;
  color: string;
  colors: ThemeColors;
}) {
  return (
    <View style={[styles.statCard, { backgroundColor: colors.card }, CARD_SHADOW]}>
      <View style={[styles.statCircle, { borderColor: color }]} />
      <Text style={[styles.statNumber, { color: colors.text }]}>{count}</Text>
      <Text style={[styles.statLabel, { color: colors.textMuted }]}>{label}</Text>
    </View>
  );
}

function nextStatus(current: IncidentStatus): IncidentStatus {
  // Move New → Acknowledged → Dispatched → Resolved.
  if (current === "Resolved" || current === "False Alarm") return current;
  const idx = INCIDENT_STATUS_FLOW.indexOf(current);
  if (idx < 0 || idx >= 3) return "Resolved";
  return INCIDENT_STATUS_FLOW[idx + 1];
}

function AlertCard({
  alert,
  colors,
  onAdvance,
  onFalseAlarm,
}: {
  alert: ResponderIncident;
  colors: ThemeColors;
  onAdvance: () => void;
  onFalseAlarm: () => void;
}) {
  // Hide action buttons once the alert is closed out.
  const canAdvance =
    alert.status !== "Resolved" && alert.status !== "False Alarm";

  return (
    <View style={[styles.alertCard, { backgroundColor: colors.card }, CARD_SHADOW]}>
      <View style={styles.alertHeader}>
        <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
          <Text style={[styles.alertTitle, { color: colors.text }]}>
            {alert.alertType}
          </Text>
          <View
            style={[
              styles.tag,
              { backgroundColor: STATUS_COLORS[alert.status] },
            ]}
          >
            <Text style={[styles.tagText, { color: colors.white }]}>
              {alert.status.toUpperCase()}
            </Text>
          </View>
        </View>
        <Text style={[styles.timeText, { color: colors.textMuted }]}>
          {alert.timeTriggered}
        </Text>
      </View>

      <Text style={[styles.studentName, { color: colors.textMuted }]}>
        {alert.studentName}
      </Text>
      <Text style={[styles.incidentId, { color: colors.textDim }]}>
        Incident {alert.id}
      </Text>
      <View style={[styles.divider, { backgroundColor: colors.tileBorder }]} />

      <View style={styles.detailRow}>
        <Ionicons name="location-outline" size={16} color={colors.navy} />
        <Text style={[styles.detailText, { color: colors.text }]}>
          {alert.location}
        </Text>
      </View>
      <View style={styles.detailRow}>
        <Ionicons name="time-outline" size={16} color={colors.navy} />
        <Text style={[styles.detailText, { color: colors.text }]}>
          Triggered {alert.timeTriggered}
        </Text>
      </View>
      <View style={styles.detailRow}>
        <Ionicons name="person-outline" size={16} color={colors.navy} />
        <Text style={[styles.detailText, { color: colors.text }]}>
          {alert.assignedResponder}
        </Text>
      </View>

      <View style={[styles.notesBox, { backgroundColor: colors.input }]}>
        <Text style={[styles.notesText, { color: colors.textMuted }]}>
          {alert.notes}
        </Text>
      </View>

      {canAdvance && (
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={[styles.advanceBtn, { backgroundColor: colors.navy }]}
            onPress={onAdvance}
          >
            <Text style={[styles.advanceBtnText, { color: colors.bg }]}>
              {nextStatus(alert.status)}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.falseBtn, { backgroundColor: colors.cardAlt, borderColor: colors.tileBorder }]}
            onPress={onFalseAlarm}
          >
            <Text style={[styles.falseBtnText, { color: colors.text }]}>
              False Alarm
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

export default function ResponderDashboard() {
  const { user, isAdmin } = useAuth();
  const { colors } = useTheme();
  const { t } = useLocale();
  const [incidents, setIncidents] = useState<ResponderIncident[]>([]);
  const [responders, setResponders] = useState<NotifiedResponder[]>([]);
  const [filter, setFilter] = useState<FilterKey>("All");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadError, setLoadError] = useState("");

  const loadAlerts = useCallback(async (opts?: { soft?: boolean }) => {
    if (!opts?.soft) setLoading(true);
    // Pull alerts and the list of registered security users.
    const [alertsResult, respondersResult] = await Promise.all([
      listPanicAlerts(false),
      listSecurityResponders(),
    ]);

    if (alertsResult.ok) {
      setIncidents(alertsResult.alerts.map(toResponderIncident));
      setLoadError("");
    } else {
      setLoadError(alertsResult.error);
    }

    if (respondersResult.ok) {
      setResponders(respondersResult.responders);
    }

    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => {
    loadAlerts();
    // Refresh every 5 seconds so new student panics show up quickly.
    const timer = setInterval(() => loadAlerts({ soft: true }), 5000);
    return () => clearInterval(timer);
  }, [loadAlerts]);

  const stats = useMemo(() => {
    // Top summary cards: open vs closed alerts.
    const active = incidents.filter(
      (i) => i.status !== "Resolved" && i.status !== "False Alarm"
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

  const filters: FilterKey[] = [
    "All",
    "New",
    "Acknowledged",
    "Responder Dispatched",
    "Resolved",
    "False Alarm",
  ];

  const advance = async (id: string) => {
    // Claim the alert and bump it to the next status step.
    const current = incidents.find((i) => i.id === id);
    if (!current) return;
    const status = nextStatus(current.status);
    const result = await updatePanicAlertStatus(id, {
      status,
      assignToSelf: true,
    });
    if (result.ok) {
      setIncidents((prev) =>
        prev.map((item) =>
          item.id === id ? toResponderIncident(result.alert) : item
        )
      );
    }
  };

  const markFalse = async (id: string) => {
    // Accidental panic — close it out as a false alarm.
    const result = await updatePanicAlertStatus(id, {
      status: "False Alarm",
      assignToSelf: true,
    });
    if (result.ok) {
      setIncidents((prev) =>
        prev.map((item) =>
          item.id === id ? toResponderIncident(result.alert) : item
        )
      );
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <AppHeader title={t("responderDashboard")} tipKey="tipGeneric" />

      <SafeAreaView style={{ flex: 1 }} edges={[]}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                loadAlerts({ soft: true });
              }}
              tintColor={colors.navy}
            />
          }
        >
          <Text style={[styles.greeting, { color: colors.text }]}>
            {user?.fullName ?? "Responder"}
          </Text>
          <Text style={[styles.subGreeting, { color: colors.textMuted }]}>
            Active emergency alerts ·{" "}
            {user?.role === "security_admin" ? "Admin" : "Staff"}
          </Text>

          <Text style={[styles.sectionLabel, { color: colors.navy }]}>
            {t("appearance").toUpperCase()}
          </Text>
          <ThemeToggleCard />

          {isAdmin && (
            <TouchableOpacity
              style={[styles.adminBanner, { backgroundColor: colors.card }, CARD_SHADOW]}
              onPress={() => router.push("/admin")}
            >
              <Ionicons name="construct-outline" size={18} color={colors.navy} />
              <Text style={[styles.adminBannerText, { color: colors.text }]}>
                Open Admin Manager
              </Text>
              <Ionicons name="chevron-forward" size={18} color={colors.navy} />
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[styles.adminBanner, { backgroundColor: colors.card }, CARD_SHADOW]}
            onPress={() => router.push("/heatmap")}
          >
            <Ionicons name="flame-outline" size={18} color={colors.navy} />
            <Text style={[styles.adminBannerText, { color: colors.text }]}>
              Concern heatmap — campus map
            </Text>
            <Ionicons name="chevron-forward" size={18} color={colors.navy} />
          </TouchableOpacity>

          <View style={styles.statsRow}>
            <StatCard
              count={stats.active}
              label="Active"
              color={colors.danger}
              colors={colors}
            />
            <StatCard
              count={stats.resolved}
              label="Resolved"
              color={colors.success}
              colors={colors}
            />
            <StatCard
              count={stats.falseAlarm}
              label="False alarm"
              color={colors.textDim}
              colors={colors}
            />
          </View>

          <Text style={[styles.sectionLabel, { color: colors.navy }]}>
            ACTIVE ALERTS
          </Text>
          <Text style={[styles.workflowText, { color: colors.textMuted }]}>
            Status: New · Acknowledged · Dispatched · Resolved
          </Text>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.filterScroll}
            contentContainerStyle={{ paddingRight: 8 }}
          >
            {filters.map((key) => {
              const active = filter === key;
              return (
                <TouchableOpacity
                  key={key}
                  style={[
                    styles.filterTab,
                    {
                      backgroundColor: active ? colors.navy : colors.card,
                      borderColor: colors.tileBorder,
                    },
                  ]}
                  onPress={() => setFilter(key)}
                >
                  <Text
                    style={{
                      color: active ? colors.bg : colors.textMuted,
                      fontWeight: active ? "800" : "600",
                      fontSize: 13,
                    }}
                  >
                    {key}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {loading && incidents.length === 0 ? (
            <ActivityIndicator color={colors.navy} style={{ marginVertical: 20 }} />
          ) : null}

          {loadError ? (
            <Text style={[styles.workflowText, { color: colors.danger }]}>
              {loadError}
            </Text>
          ) : null}

          {!loading && filtered.length === 0 ? (
            <Text style={[styles.workflowText, { color: colors.textMuted }]}>
              No panic alerts yet. When a student triggers Panic, it appears here.
            </Text>
          ) : null}

          {filtered.map((alert) => (
            <AlertCard
              key={alert.id}
              alert={alert}
              colors={colors}
              onAdvance={() => advance(alert.id)}
              onFalseAlarm={() => markFalse(alert.id)}
            />
          ))}

          <Text style={[styles.sectionLabel, { color: colors.navy, marginTop: 8 }]}>
            RESPONDERS ON DUTY
          </Text>
          {responders.length === 0 ? (
            <Text style={[styles.workflowText, { color: colors.textMuted }]}>
              No registered security or admin accounts found.
            </Text>
          ) : (
            responders.map((r) => (
              <View
                key={r.id}
                style={[styles.responderCard, { backgroundColor: colors.card }, CARD_SHADOW]}
              >
                <View style={{ flex: 1 }}>
                  <Text style={[styles.responderName, { color: colors.text }]}>
                    {r.fullName}
                  </Text>
                  <Text style={[styles.responderMeta, { color: colors.textMuted }]}>
                    {r.role === "security_admin" ? "Admin" : "Campus Security"}
                  </Text>
                  <Text style={[styles.responderId, { color: colors.textDim }]}>
                    ID: {r.id}
                  </Text>
                </View>
                <View
                  style={[
                    styles.availBadge,
                    { backgroundColor: colors.success },
                  ]}
                >
                  <Text style={[styles.availText, { color: colors.white }]}>
                    Available
                  </Text>
                </View>
              </View>
            ))
          )}

          <View style={{ height: 28 }} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingHorizontal: 18, paddingTop: 8, paddingBottom: 24 },
  greeting: { fontSize: 24, fontWeight: "800" },
  subGreeting: { fontSize: 14, marginTop: 4, marginBottom: 14 },
  adminBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
  },
  adminBannerText: { flex: 1, fontWeight: "700", fontSize: 14 },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 18,
    gap: 8,
  },
  statCard: {
    flex: 1,
    padding: 14,
    borderRadius: 15,
    alignItems: "center",
  },
  statCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 3,
    marginBottom: 8,
  },
  statNumber: { fontSize: 22, fontWeight: "800" },
  statLabel: { fontSize: 11, marginTop: 4, fontWeight: "600" },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  workflowText: {
    fontSize: 12,
    marginBottom: 14,
    lineHeight: 18,
  },
  filterScroll: {
    marginBottom: 16,
    maxHeight: 44,
  },
  filterTab: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
  },
  alertCard: {
    marginBottom: 12,
    borderRadius: 15,
    padding: 15,
  },
  alertHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 5,
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: "800",
    marginRight: 10,
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  tagText: {
    color: "#FFF",
    fontSize: 9,
    fontWeight: "800",
  },
  timeText: { fontSize: 12 },
  studentName: { fontSize: 14, marginBottom: 2 },
  incidentId: { fontSize: 11, marginBottom: 10 },
  divider: { height: 1, marginBottom: 12 },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  detailText: { fontSize: 14, marginLeft: 10, flex: 1 },
  notesBox: {
    padding: 12,
    borderRadius: 10,
    marginTop: 8,
  },
  notesText: { fontSize: 13, lineHeight: 18 },
  actionRow: { flexDirection: "row", gap: 8, marginTop: 12 },
  advanceBtn: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 11,
    alignItems: "center",
  },
  advanceBtnText: { fontWeight: "800", fontSize: 12 },
  falseBtn: {
    borderRadius: 12,
    paddingVertical: 11,
    paddingHorizontal: 12,
    alignItems: "center",
    borderWidth: 1,
  },
  falseBtnText: { fontWeight: "700", fontSize: 12 },
  responderCard: {
    marginBottom: 10,
    borderRadius: 12,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
  },
  responderName: { fontWeight: "800", fontSize: 15 },
  responderMeta: { fontSize: 12, marginTop: 2 },
  responderId: { fontSize: 11, marginTop: 2 },
  availBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  availText: { color: "#FFF", fontSize: 11, fontWeight: "800" },
});
