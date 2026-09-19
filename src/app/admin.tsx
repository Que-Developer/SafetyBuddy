import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { GlassPanel } from "@/components/GlassPanel";
import { OpsReportsMap } from "@/components/OpsReportsMap";
import { SafetyBuddyLogo } from "@/components/SafetyBuddyLogo";
import { ThemeToggleButton } from "@/components/ThemeToggleButton";
import { toast } from "@/components/toast";
import { useTheme } from "@/context/ThemeContext";
import { buildOpsMapMarkers } from "@/lib/opsMapMarkers";
import {
  createHelpContact,
  createSafetyAlert,
  createSafetyResource,
  createSupportService,
  fetchCampusZones,
  fetchEmergencyAlerts,
  fetchHelpContacts,
  fetchIncidentReports,
  fetchReportCategories,
  fetchResponders,
  fetchRolePrivileges,
  fetchSafetyAlerts,
  fetchSafetyResources,
  fetchSupportServices,
  setReportCategoryActive,
  type CampusZone,
  type HelpContact,
  type IncidentReportRow,
  type ReportCategory,
  type Responder,
  type ResponderIncident,
  type RolePrivilege,
  type SafetyAlert,
  type SafetyResource,
  type SupportService,
} from "@/services/campusApi";
import { listUsers, type AppUser } from "@/services/database";

type SectionKey =
  | "map"
  | "contacts"
  | "alerts"
  | "zones"
  | "resources"
  | "services"
  | "responders"
  | "users"
  | "categories"
  | "privileges";

const SECTIONS: { key: SectionKey; label: string }[] = [
  { key: "map", label: "Map" },
  { key: "contacts", label: "Contacts" },
  { key: "alerts", label: "Alerts" },
  { key: "zones", label: "Zones" },
  { key: "resources", label: "Resources" },
  { key: "services", label: "Support" },
  { key: "responders", label: "Responders" },
  { key: "users", label: "Users" },
  { key: "categories", label: "Categories" },
  { key: "privileges", label: "Roles" },
];

export default function AdminScreen() {
  const { colors } = useTheme();
  const [contacts, setContacts] = useState<HelpContact[]>([]);
  const [zones, setZones] = useState<CampusZone[]>([]);
  const [resources, setResources] = useState<SafetyResource[]>([]);
  const [services, setServices] = useState<SupportService[]>([]);
  const [privileges, setPrivileges] = useState<RolePrivilege[]>([]);
  const [responders, setResponders] = useState<Responder[]>([]);
  const [categories, setCategories] = useState<ReportCategory[]>([]);
  const [users, setUsers] = useState<AppUser[]>([]);
  const [issuedAlerts, setIssuedAlerts] = useState<SafetyAlert[]>([]);
  const [emergencyAlerts, setEmergencyAlerts] = useState<ResponderIncident[]>(
    []
  );
  const [reports, setReports] = useState<IncidentReportRow[]>([]);
  const [newContactLabel, setNewContactLabel] = useState("");
  const [newContactNumber, setNewContactNumber] = useState("");
  const [newAlertTitle, setNewAlertTitle] = useState("");
  const [newResourceTitle, setNewResourceTitle] = useState("");
  const [newResourceSummary, setNewResourceSummary] = useState("");
  const [newServiceTitle, setNewServiceTitle] = useState("");
  const [newServiceDetail, setNewServiceDetail] = useState("");
  const [newServiceAction, setNewServiceAction] = useState("");
  const [openSection, setOpenSection] = useState<SectionKey>("map");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    Promise.all([
      fetchHelpContacts(),
      fetchSafetyAlerts(),
      fetchCampusZones(),
      fetchSafetyResources(),
      fetchSupportServices(),
      fetchResponders(),
      fetchReportCategories(),
      fetchRolePrivileges().catch(() => [] as RolePrivilege[]),
      listUsers().catch(() => [] as AppUser[]),
      fetchEmergencyAlerts().catch(() => [] as ResponderIncident[]),
      fetchIncidentReports().catch(() => [] as IncidentReportRow[]),
    ])
      .then(
        ([c, alerts, z, res, svc, resp, cats, priv, u, emergencies, reps]) => {
          setContacts(c);
          setIssuedAlerts(alerts);
          setZones(z);
          setResources(res);
          setServices(svc);
          setResponders(resp);
          setCategories(cats);
          setPrivileges(priv);
          setUsers(u);
          setEmergencyAlerts(emergencies);
          setReports(reps);
        }
      )
      .catch(() => toast.error("Could not load"))
      .finally(() => setLoading(false));
  }, []);

  const mapMarkers = useMemo(
    () =>
      buildOpsMapMarkers({
        alerts: emergencyAlerts,
        reports,
        zones,
      }),
    [emergencyAlerts, reports, zones]
  );

  const addContact = async () => {
    if (!newContactLabel.trim() || !newContactNumber.trim()) {
      toast.warning("Missing fields");
      return;
    }
    setBusy(true);
    try {
      const contact = await createHelpContact({
        label: newContactLabel.trim(),
        number: newContactNumber.trim(),
      });
      setContacts((prev) => [...prev, contact]);
      setNewContactLabel("");
      setNewContactNumber("");
      toast.success("Saved");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally {
      setBusy(false);
    }
  };

  const issueAlert = async () => {
    if (!newAlertTitle.trim()) {
      toast.warning("Enter a title");
      return;
    }
    setBusy(true);
    try {
      const alert = await createSafetyAlert({
        title: newAlertTitle.trim(),
        message: "Campus safety alert.",
        affectedArea: "Campus-wide",
        recommendedAction: "Follow campus guidance.",
        alertLevel: "Information",
      });
      setIssuedAlerts((prev) => [alert, ...prev]);
      setNewAlertTitle("");
      toast.success("Issued");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally {
      setBusy(false);
    }
  };

  const toggleCategory = async (id: string, active: boolean) => {
    setBusy(true);
    try {
      setCategories(await setReportCategoryActive(id, !active));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally {
      setBusy(false);
    }
  };

  const addResource = async () => {
    if (!newResourceTitle.trim() || !newResourceSummary.trim()) {
      toast.warning("Title and summary required");
      return;
    }
    setBusy(true);
    try {
      const resource = await createSafetyResource({
        title: newResourceTitle.trim(),
        summary: newResourceSummary.trim(),
        body: newResourceSummary.trim(),
      });
      setResources((prev) => [...prev, resource]);
      setNewResourceTitle("");
      setNewResourceSummary("");
      toast.success("Resource saved");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally {
      setBusy(false);
    }
  };

  const addService = async () => {
    if (
      !newServiceTitle.trim() ||
      !newServiceDetail.trim() ||
      !newServiceAction.trim()
    ) {
      toast.warning("All service fields required");
      return;
    }
    setBusy(true);
    try {
      const service = await createSupportService({
        title: newServiceTitle.trim(),
        detail: newServiceDetail.trim(),
        actionText: newServiceAction.trim(),
      });
      setServices((prev) => [...prev, service]);
      setNewServiceTitle("");
      setNewServiceDetail("");
      setNewServiceAction("");
      toast.success("Service saved");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally {
      setBusy(false);
    }
  };

  const inputStyle = [
    styles.input,
    {
      backgroundColor: colors.input,
      color: colors.text,
      borderColor: colors.tileBorder,
    },
  ];

  return (
    <SafeAreaView
      style={[styles.safe, { backgroundColor: colors.bg }]}
      edges={["top", "bottom"]}
    >
      <View style={styles.top}>
        <View style={styles.topRow}>
          <View style={{ flex: 1 }}>
            <SafetyBuddyLogo size="xs" style={styles.logo} />
            <Text style={[styles.heading, { color: colors.text }]}>Admin</Text>
            <Text style={[styles.sub, { color: colors.textMuted }]}>
              Campus data · reports map · roles
            </Text>
          </View>
          <ThemeToggleButton size="sm" />
          <TouchableOpacity
            onPress={() => router.back()}
            style={[styles.backBtn, { backgroundColor: colors.card }]}
          >
            <Ionicons name="arrow-back" size={18} color={colors.navy} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.navRow}
        style={styles.navScroll}
      >
        {SECTIONS.map((s) => {
          const on = openSection === s.key;
          return (
            <TouchableOpacity
              key={s.key}
              onPress={() => setOpenSection(s.key)}
              style={[
                styles.navItem,
                { backgroundColor: on ? colors.navy : colors.card },
              ]}
            >
              <Text
                style={[
                  styles.navLabel,
                  { color: on ? colors.bg : colors.text },
                ]}
              >
                {s.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <ScrollView
        contentContainerStyle={styles.body}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {loading ? (
          <ActivityIndicator color={colors.navy} style={{ marginTop: 24 }} />
        ) : null}

        {openSection === "map" && (
          <View>
            <Text style={[styles.section, { color: colors.navy }]}>
              WHERE REPORTS COME FROM
            </Text>
            <Text style={[styles.mapHint, { color: colors.textMuted }]}>
              ! panic alerts · R student safety reports
            </Text>
            <GlassPanel radius={16} style={styles.mapCard}>
              <OpsReportsMap markers={mapMarkers} height={260} />
            </GlassPanel>
            <GlassPanel radius={14} style={styles.statCard}>
              <Text style={[styles.statText, { color: colors.text }]}>
                {mapMarkers.length} locations on map · {emergencyAlerts.length}{" "}
                panics · {reports.length} reports
              </Text>
            </GlassPanel>
            {reports.slice(0, 6).map((r) => (
              <GlassPanel key={r.id} radius={14} style={styles.itemCard}>
                <Text style={[styles.itemTitle, { color: colors.text }]}>
                  {r.reportType}
                </Text>
                <Text style={[styles.itemMeta, { color: colors.textMuted }]}>
                  {r.location} · {r.status}
                </Text>
              </GlassPanel>
            ))}
          </View>
        )}

        {openSection === "contacts" && (
          <View>
            {contacts.map((c) => (
              <GlassPanel key={c.id} radius={14} style={styles.itemCard}>
                <Text style={[styles.itemTitle, { color: colors.text }]}>
                  {c.label}
                </Text>
                <Text style={[styles.itemMeta, { color: colors.textMuted }]}>
                  {c.number}
                </Text>
              </GlassPanel>
            ))}
            <View style={styles.form}>
              <TextInput
                style={inputStyle}
                placeholder="Label"
                placeholderTextColor={colors.textDim}
                value={newContactLabel}
                onChangeText={setNewContactLabel}
              />
              <TextInput
                style={inputStyle}
                placeholder="Phone"
                placeholderTextColor={colors.textDim}
                keyboardType="phone-pad"
                value={newContactNumber}
                onChangeText={setNewContactNumber}
              />
              <TouchableOpacity
                style={[styles.btn, { backgroundColor: colors.navy }]}
                onPress={addContact}
                disabled={busy}
              >
                <Text style={[styles.btnText, { color: colors.bg }]}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {openSection === "alerts" && (
          <View>
            {issuedAlerts.slice(0, 8).map((a) => (
              <GlassPanel key={a.id} radius={14} style={styles.itemCard}>
                <Text style={[styles.itemTitle, { color: colors.text }]}>
                  {a.title}
                </Text>
                <Text style={[styles.itemMeta, { color: colors.textMuted }]}>
                  {a.alertLevel} · {a.affectedArea}
                </Text>
              </GlassPanel>
            ))}
            <View style={styles.form}>
              <TextInput
                style={inputStyle}
                placeholder="Title"
                placeholderTextColor={colors.textDim}
                value={newAlertTitle}
                onChangeText={setNewAlertTitle}
              />
              <TouchableOpacity
                style={[styles.btn, { backgroundColor: colors.navy }]}
                onPress={issueAlert}
                disabled={busy}
              >
                <Text style={[styles.btnText, { color: colors.bg }]}>
                  Issue alert
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {openSection === "zones" && (
          <View>
            {zones.map((z) => (
              <GlassPanel key={z.id} radius={14} style={styles.itemCard}>
                <Text style={[styles.itemTitle, { color: colors.text }]}>
                  {z.name}
                </Text>
                <Text style={[styles.itemMeta, { color: colors.textMuted }]}>
                  {z.riskStatus} · {z.nearestHelpPoint}
                </Text>
              </GlassPanel>
            ))}
          </View>
        )}

        {openSection === "resources" && (
          <View>
            {resources.map((r) => (
              <GlassPanel key={r.id} radius={14} style={styles.itemCard}>
                <Text style={[styles.itemTitle, { color: colors.text }]}>
                  {r.title}
                </Text>
                <Text style={[styles.itemMeta, { color: colors.textMuted }]}>
                  {r.summary}
                </Text>
              </GlassPanel>
            ))}
            <View style={styles.form}>
              <TextInput
                style={inputStyle}
                placeholder="Resource title"
                placeholderTextColor={colors.textDim}
                value={newResourceTitle}
                onChangeText={setNewResourceTitle}
              />
              <TextInput
                style={inputStyle}
                placeholder="Summary"
                placeholderTextColor={colors.textDim}
                value={newResourceSummary}
                onChangeText={setNewResourceSummary}
              />
              <TouchableOpacity
                style={[styles.btn, { backgroundColor: colors.navy }]}
                onPress={addResource}
                disabled={busy}
              >
                <Text style={[styles.btnText, { color: colors.bg }]}>
                  Add resource
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {openSection === "services" && (
          <View>
            {services.map((s) => (
              <GlassPanel key={s.id} radius={14} style={styles.itemCard}>
                <Text style={[styles.itemTitle, { color: colors.text }]}>
                  {s.title}
                </Text>
                <Text style={[styles.itemMeta, { color: colors.textMuted }]}>
                  {s.detail} · {s.action}
                </Text>
              </GlassPanel>
            ))}
            <View style={styles.form}>
              <TextInput
                style={inputStyle}
                placeholder="Service title"
                placeholderTextColor={colors.textDim}
                value={newServiceTitle}
                onChangeText={setNewServiceTitle}
              />
              <TextInput
                style={inputStyle}
                placeholder="Detail"
                placeholderTextColor={colors.textDim}
                value={newServiceDetail}
                onChangeText={setNewServiceDetail}
              />
              <TextInput
                style={inputStyle}
                placeholder="Action text"
                placeholderTextColor={colors.textDim}
                value={newServiceAction}
                onChangeText={setNewServiceAction}
              />
              <TouchableOpacity
                style={[styles.btn, { backgroundColor: colors.navy }]}
                onPress={addService}
                disabled={busy}
              >
                <Text style={[styles.btnText, { color: colors.bg }]}>
                  Add service
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {openSection === "responders" && (
          <View>
            {responders.map((r) => (
              <GlassPanel key={r.id} radius={14} style={styles.itemCard}>
                <Text style={[styles.itemTitle, { color: colors.text }]}>
                  {r.name}
                </Text>
                <Text style={[styles.itemMeta, { color: colors.textMuted }]}>
                  {r.role} · {r.availability}
                </Text>
              </GlassPanel>
            ))}
          </View>
        )}

        {openSection === "users" && (
          <View>
            {users.map((u) => (
              <GlassPanel key={u.id} radius={14} style={styles.itemCard}>
                <Text style={[styles.itemTitle, { color: colors.text }]}>
                  {u.fullName}
                </Text>
                <Text style={[styles.itemMeta, { color: colors.textMuted }]}>
                  {u.email} · {u.role}
                </Text>
              </GlassPanel>
            ))}
          </View>
        )}

        {openSection === "categories" && (
          <View>
            {categories.map((c) => (
              <GlassPanel key={c.id} radius={14} style={styles.itemCard}>
                <View style={styles.itemRow}>
                  <Text
                    style={[styles.itemTitle, { color: colors.text, flex: 1 }]}
                  >
                    {c.name}
                  </Text>
                  <Switch
                    value={c.active}
                    onValueChange={() => toggleCategory(c.id, c.active)}
                    disabled={busy}
                    trackColor={{ false: colors.textDim, true: colors.navy }}
                    thumbColor={colors.white}
                  />
                </View>
              </GlassPanel>
            ))}
          </View>
        )}

        {openSection === "privileges" && (
          <View>
            {privileges.map((p, idx) => (
              <GlassPanel
                key={`${p.role}-${p.resource}-${idx}`}
                radius={14}
                style={styles.itemCard}
              >
                <Text style={[styles.itemTitle, { color: colors.text }]}>
                  {p.role} · {p.resource}
                </Text>
                <Text style={[styles.itemMeta, { color: colors.textMuted }]}>
                  {[
                    p.create ? "C" : "-",
                    p.read ? "R" : "-",
                    p.update ? "U" : "-",
                    p.delete ? "D" : "-",
                  ].join(" ")}
                  {p.scope ? ` · ${p.scope}` : ""}
                </Text>
              </GlassPanel>
            ))}
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  top: { paddingHorizontal: 18, paddingTop: 8, paddingBottom: 10 },
  topRow: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  logo: { alignSelf: "flex-start", marginBottom: 6 },
  heading: { fontSize: 22, fontWeight: "800" },
  sub: { fontSize: 13, marginTop: 2 },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  navScroll: { maxHeight: 52 },
  navRow: {
    paddingHorizontal: 14,
    gap: 8,
    alignItems: "center",
    paddingBottom: 8,
  },
  navItem: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 999,
  },
  navLabel: { fontSize: 13, fontWeight: "700" },
  body: { paddingHorizontal: 16, paddingTop: 8 },
  section: {
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.7,
    marginBottom: 8,
  },
  mapHint: { fontSize: 12, marginBottom: 8 },
  mapCard: { marginBottom: 10, overflow: "hidden" },
  statCard: { padding: 14, marginBottom: 12 },
  statText: { fontWeight: "700", fontSize: 13 },
  itemCard: { padding: 14, marginBottom: 10 },
  itemRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  itemTitle: { fontSize: 15, fontWeight: "800" },
  itemMeta: { fontSize: 13, marginTop: 3, lineHeight: 18 },
  form: { paddingTop: 8, gap: 8 },
  input: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
  },
  btn: {
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 4,
  },
  btnText: { fontWeight: "800", fontSize: 14 },
});