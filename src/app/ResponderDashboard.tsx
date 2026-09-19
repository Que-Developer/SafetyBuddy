import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useMemo, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "@/context/AuthContext";
import { COLORS } from "@/constants/theme";
import {
  INCIDENT_STATUS_FLOW,
  RESPONDER_INCIDENTS,
  RESPONDERS,
  STATUS_COLORS,
  type IncidentStatus,
  type ResponderIncident,
} from "@/data/mockData";

type FilterKey = "All" | IncidentStatus;

function StatCard({
  count,
  label,
  color,
}: {
  count: number;
  label: string;
  color: string;
}) {
  return (
    <View style={styles.statCard}>
      <View style={[styles.statCircle, { borderColor: color }]} />
      <Text style={styles.statNumber}>{count}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function nextStatus(current: IncidentStatus): IncidentStatus {
  if (current === "Resolved" || current === "False Alarm") return current;
  const idx = INCIDENT_STATUS_FLOW.indexOf(current);
  if (idx < 0 || idx >= 3) return "Resolved";
  return INCIDENT_STATUS_FLOW[idx + 1];
}

function AlertCard({
  alert,
  onAdvance,
  onFalseAlarm,
}: {
  alert: ResponderIncident;
  onAdvance: () => void;
  onFalseAlarm: () => void;
}) {
  const canAdvance =
    alert.status !== "Resolved" && alert.status !== "False Alarm";

  return (
    <View style={styles.alertCard}>
      <View style={styles.alertHeader}>
        <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
          <Text style={styles.alertTitle}>{alert.alertType}</Text>
          <View
            style={[
              styles.tag,
              { backgroundColor: STATUS_COLORS[alert.status] },
            ]}
          >
            <Text style={styles.tagText}>{alert.status.toUpperCase()}</Text>
          </View>
        </View>
        <Text style={styles.timeText}>{alert.timeTriggered}</Text>
      </View>

      <Text style={styles.studentName}>{alert.studentName}</Text>
      <Text style={styles.incidentId}>Incident {alert.id}</Text>
      <View style={styles.divider} />

      <View style={styles.detailRow}>
        <Ionicons name="location-outline" size={16} color={COLORS.responderMuted} />
        <Text style={styles.detailText}>{alert.location}</Text>
      </View>
      <View style={styles.detailRow}>
        <Ionicons name="time-outline" size={16} color={COLORS.responderMuted} />
        <Text style={styles.detailText}>Triggered {alert.timeTriggered}</Text>
      </View>
      <View style={styles.detailRow}>
        <Ionicons name="person-outline" size={16} color={COLORS.responderMuted} />
        <Text style={styles.detailText}>{alert.assignedResponder}</Text>
      </View>

      <View style={styles.notesBox}>
        <Text style={styles.notesText}>{alert.notes}</Text>
      </View>

      {canAdvance && (
        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.advanceBtn} onPress={onAdvance}>
            <Text style={styles.advanceBtnText}>
              → {nextStatus(alert.status)}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.falseBtn} onPress={onFalseAlarm}>
            <Text style={styles.falseBtnText}>False Alarm</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

export default function ResponderDashboard() {
  const { user, logout, isAdmin } = useAuth();
  const [incidents, setIncidents] = useState(RESPONDER_INCIDENTS);
  const [filter, setFilter] = useState<FilterKey>("All");

  const stats = useMemo(() => {
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

  const advance = (id: string) => {
    setIncidents((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const status = nextStatus(item.status);
        const assignedResponder =
          status === "Responder Dispatched" &&
          item.assignedResponder === "Unassigned"
            ? user?.fullName ?? "Officer on duty"
            : item.assignedResponder;
        return { ...item, status, assignedResponder };
      })
    );
  };

  const markFalse = (id: string) => {
    setIncidents((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, status: "False Alarm" as const } : item
      )
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Responder dashboard</Text>
          <Text style={styles.headerSubtitle}>
            Active emergency alerts · {user?.fullName ?? "Responder"} ·{" "}
            {user?.role === "security_admin" ? "Admin" : "Staff"}
          </Text>
        </View>
        {isAdmin && (
          <TouchableOpacity
            style={styles.adminBtn}
            onPress={() => router.push("/admin")}
          >
            <Text style={styles.adminBtnText}>Admin</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={styles.backButton}
          onPress={async () => {
            await logout();
            router.replace("/login");
          }}
        >
          <Ionicons name="log-out-outline" size={22} color="#FFF" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.statsRow}>
          <StatCard count={stats.active} label="Active" color="#ff3b3b" />
          <StatCard count={stats.resolved} label="Resolved" color="#4ade80" />
          <StatCard
            count={stats.falseAlarm}
            label="False alarm"
            color="#8a9bb3"
          />
        </View>

        <Text style={styles.sectionLabel}>ACTIVE ALERTS</Text>
        <Text style={styles.workflowText}>
          Status flow: New → Acknowledged → Responder Dispatched → Resolved (or
          False Alarm). Each card shows student/anonymous ID, type, location,
          time, status, assigned responder, and notes.
        </Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterScroll}
          contentContainerStyle={{ paddingRight: 20 }}
        >
          {filters.map((key) => {
            const active = filter === key;
            return (
              <TouchableOpacity
                key={key}
                style={[styles.filterTab, active && styles.filterTabActive]}
                onPress={() => setFilter(key)}
              >
                <Text
                  style={active ? styles.filterTextActive : styles.filterText}
                >
                  {key}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {filtered.map((alert) => (
          <AlertCard
            key={alert.id}
            alert={alert}
            onAdvance={() => advance(alert.id)}
            onFalseAlarm={() => markFalse(alert.id)}
          />
        ))}

        <Text style={styles.sectionLabel}>RESPONDERS ON DUTY</Text>
        {RESPONDERS.map((r) => (
          <View key={r.id} style={styles.responderCard}>
            <View style={{ flex: 1 }}>
              <Text style={styles.responderName}>{r.name}</Text>
              <Text style={styles.responderMeta}>
                {r.role} · {r.contact}
              </Text>
              <Text style={styles.responderId}>ID: {r.id}</Text>
            </View>
            <View
              style={[
                styles.availBadge,
                {
                  backgroundColor:
                    r.availability === "Available" || r.availability === "On Call"
                      ? "#22C55E"
                      : "#8A9BB3",
                },
              ]}
            >
              <Text style={styles.availText}>{r.availability}</Text>
            </View>
          </View>
        ))}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.responderBg,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    paddingTop: 10,
  },
  backButton: {
    backgroundColor: COLORS.responderCard,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
  adminBtn: {
    backgroundColor: "#FFD24C",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  adminBtnText: {
    color: COLORS.navy,
    fontWeight: "800",
    fontSize: 12,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#FFF",
  },
  headerSubtitle: {
    fontSize: 13,
    color: COLORS.responderMuted,
    marginTop: 2,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  statCard: {
    backgroundColor: COLORS.responderCard,
    flex: 1,
    marginHorizontal: 5,
    padding: 15,
    borderRadius: 15,
    alignItems: "center",
  },
  statCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 3,
    marginBottom: 10,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFF",
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.responderMuted,
    marginTop: 5,
  },
  sectionLabel: {
    color: COLORS.responderMuted,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.8,
    paddingHorizontal: 20,
    marginBottom: 8,
    marginTop: 4,
  },
  workflowText: {
    color: "#FFF",
    fontSize: 12,
    paddingHorizontal: 20,
    marginBottom: 14,
    opacity: 0.85,
  },
  filterScroll: {
    paddingLeft: 20,
    marginBottom: 20,
    maxHeight: 44,
  },
  filterTab: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.responderCard,
    marginRight: 10,
  },
  filterTabActive: {
    backgroundColor: "#facc15",
  },
  filterText: {
    color: COLORS.responderMuted,
    fontSize: 13,
  },
  filterTextActive: {
    color: COLORS.responderBg,
    fontWeight: "bold",
    fontSize: 13,
  },
  alertCard: {
    backgroundColor: COLORS.responderCard,
    marginHorizontal: 20,
    marginBottom: 15,
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
    fontWeight: "bold",
    color: "#FFF",
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
    fontWeight: "bold",
  },
  timeText: {
    fontSize: 12,
    color: COLORS.responderMuted,
  },
  studentName: {
    fontSize: 14,
    color: COLORS.responderMuted,
    marginBottom: 2,
  },
  incidentId: {
    fontSize: 11,
    color: COLORS.responderMuted,
    marginBottom: 10,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.responderBg,
    marginBottom: 15,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  detailText: {
    color: "#FFF",
    fontSize: 14,
    marginLeft: 10,
    flex: 1,
  },
  notesBox: {
    backgroundColor: COLORS.responderBg,
    padding: 12,
    borderRadius: 10,
    marginTop: 10,
  },
  notesText: {
    color: COLORS.responderMuted,
    fontSize: 13,
    lineHeight: 18,
  },
  actionRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 12,
  },
  advanceBtn: {
    flex: 1,
    backgroundColor: "#facc15",
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: "center",
  },
  advanceBtnText: {
    color: COLORS.responderBg,
    fontWeight: "800",
    fontSize: 12,
  },
  falseBtn: {
    backgroundColor: "#3b4a63",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    alignItems: "center",
  },
  falseBtnText: {
    color: "#FFF",
    fontWeight: "700",
    fontSize: 12,
  },
  responderCard: {
    backgroundColor: COLORS.responderCard,
    marginHorizontal: 20,
    marginBottom: 10,
    borderRadius: 12,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
  },
  responderName: { color: "#FFF", fontWeight: "800", fontSize: 15 },
  responderMeta: {
    color: COLORS.responderMuted,
    fontSize: 12,
    marginTop: 2,
  },
  responderId: {
    color: COLORS.responderMuted,
    fontSize: 11,
    marginTop: 2,
  },
  availBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  availText: { color: "#FFF", fontSize: 11, fontWeight: "800" },
});
