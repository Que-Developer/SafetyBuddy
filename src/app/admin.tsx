import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { CARD_SHADOW, COLORS } from "@/constants/theme";
import {
  createHelpContact,
  createSafetyAlert,
  fetchCampusZones,
  fetchHelpContacts,
  fetchReportCategories,
  fetchResponders,
  fetchSafetyAlerts,
  fetchSafetyResources,
  setReportCategoryActive,
  type CampusZone,
  type HelpContact,
  type ReportCategory,
  type Responder,
  type SafetyAlert,
  type SafetyResource,
} from "@/services/campusApi";
import { listUsers, type AppUser } from "@/services/database";

type SectionKey =
  | "contacts"
  | "alerts"
  | "zones"
  | "resources"
  | "responders"
  | "users"
  | "categories";

export default function AdminScreen() {
  const [contacts, setContacts] = useState<HelpContact[]>([]);
  const [zones, setZones] = useState<CampusZone[]>([]);
  const [resources, setResources] = useState<SafetyResource[]>([]);
  const [responders, setResponders] = useState<Responder[]>([]);
  const [categories, setCategories] = useState<ReportCategory[]>([]);
  const [users, setUsers] = useState<AppUser[]>([]);
  const [issuedAlerts, setIssuedAlerts] = useState<SafetyAlert[]>([]);
  const [newContactLabel, setNewContactLabel] = useState("");
  const [newContactNumber, setNewContactNumber] = useState("");
  const [newAlertTitle, setNewAlertTitle] = useState("");
  const [openSection, setOpenSection] = useState<SectionKey>("contacts");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    Promise.all([
      fetchHelpContacts(),
      fetchSafetyAlerts(),
      fetchCampusZones(),
      fetchSafetyResources(),
      fetchResponders(),
      fetchReportCategories(),
      listUsers().catch(() => [] as AppUser[]),
    ])
      .then(([c, alerts, z, res, resp, cats, u]) => {
        setContacts(c);
        setIssuedAlerts(alerts);
        setZones(z);
        setResources(res);
        setResponders(resp);
        setCategories(cats);
        setUsers(u);
      })
      .catch((e) =>
        setError(e instanceof Error ? e.message : "Failed to load admin data")
      )
      .finally(() => setLoading(false));
  }, []);

  const toggleSection = (key: SectionKey) => {
    setOpenSection((prev) => (prev === key ? prev : key));
  };

  const addContact = async () => {
    if (!newContactLabel.trim() || !newContactNumber.trim()) {
      Alert.alert("Missing fields", "Enter a label and number.");
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
    } catch (e) {
      Alert.alert(
        "Could not add contact",
        e instanceof Error ? e.message : "Please try again."
      );
    } finally {
      setBusy(false);
    }
  };

  const issueAlert = async () => {
    if (!newAlertTitle.trim()) {
      Alert.alert("Missing title", "Enter an alert title.");
      return;
    }
    setBusy(true);
    try {
      const alert = await createSafetyAlert({
        title: newAlertTitle.trim(),
        message: "Admin-issued campus safety alert.",
        affectedArea: "Campus-wide",
        recommendedAction: "Follow campus guidance and stay aware.",
        alertLevel: "Information",
      });
      setIssuedAlerts((prev) => [alert, ...prev]);
      setNewAlertTitle("");
      Alert.alert("Alert issued", "Safety alert published to students.");
    } catch (e) {
      Alert.alert(
        "Could not issue alert",
        e instanceof Error ? e.message : "Please try again."
      );
    } finally {
      setBusy(false);
    }
  };

  const toggleCategory = async (id: string, active: boolean) => {
    setBusy(true);
    try {
      const next = await setReportCategoryActive(id, !active);
      setCategories(next);
    } catch (e) {
      Alert.alert(
        "Update failed",
        e instanceof Error ? e.message : "Could not update category."
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={["bottom"]}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.banner}>
          <Ionicons name="construct-outline" size={20} color={COLORS.navy} />
          <Text style={styles.bannerText}>
            Admin Content Manager (FR11) — manage emergency contacts, alerts,
            zones, resources, responders, and report categories from the campus
            database.
          </Text>
        </View>

        {loading ? (
          <ActivityIndicator color={COLORS.navy} style={{ marginBottom: 16 }} />
        ) : null}
        {error ? (
          <Text style={{ color: COLORS.textMuted, marginBottom: 12 }}>{error}</Text>
        ) : null}

        <SectionHeader
          title="Emergency Contact Numbers"
          open={openSection === "contacts"}
          onPress={() => toggleSection("contacts")}
        />
        {openSection === "contacts" && (
          <View style={styles.sectionBody}>
            {contacts.length === 0 && !loading ? (
              <Text style={styles.emptyText}>No help contacts yet.</Text>
            ) : null}
            {contacts.map((c) => (
              <ContactRow key={c.id} contact={c} />
            ))}
            <TextInput
              style={styles.input}
              placeholder="Contact label"
              placeholderTextColor="#888"
              value={newContactLabel}
              onChangeText={setNewContactLabel}
            />
            <TextInput
              style={styles.input}
              placeholder="Phone number"
              placeholderTextColor="#888"
              keyboardType="phone-pad"
              value={newContactNumber}
              onChangeText={setNewContactNumber}
            />
            <TouchableOpacity
              style={[styles.actionBtn, { opacity: busy ? 0.7 : 1 }]}
              onPress={addContact}
              disabled={busy}
            >
              <Text style={styles.actionBtnText}>Add Contact</Text>
            </TouchableOpacity>
          </View>
        )}

        <SectionHeader
          title="Issue Safety Alerts"
          open={openSection === "alerts"}
          onPress={() => toggleSection("alerts")}
        />
        {openSection === "alerts" && (
          <View style={styles.sectionBody}>
            {issuedAlerts.length === 0 && !loading ? (
              <Text style={styles.emptyText}>No safety alerts yet.</Text>
            ) : null}
            {issuedAlerts.slice(0, 3).map((a) => (
              <View key={a.id} style={styles.listCard}>
                <Text style={styles.listTitle}>{a.title}</Text>
                <Text style={styles.listMeta}>
                  {a.alertLevel} · {a.affectedArea}
                </Text>
              </View>
            ))}
            <TextInput
              style={styles.input}
              placeholder="New alert title"
              placeholderTextColor="#888"
              value={newAlertTitle}
              onChangeText={setNewAlertTitle}
            />
            <TouchableOpacity
              style={[styles.actionBtn, { opacity: busy ? 0.7 : 1 }]}
              onPress={issueAlert}
              disabled={busy}
            >
              <Text style={styles.actionBtnText}>Broadcast Alert</Text>
            </TouchableOpacity>
          </View>
        )}

        <SectionHeader
          title="Campus Zones"
          open={openSection === "zones"}
          onPress={() => toggleSection("zones")}
        />
        {openSection === "zones" && (
          <View style={styles.sectionBody}>
            {zones.length === 0 && !loading ? (
              <Text style={styles.emptyText}>No campus zones.</Text>
            ) : null}
            {zones.map((z) => (
              <View key={z.id} style={styles.listCard}>
                <Text style={styles.listTitle}>{z.name}</Text>
                <Text style={styles.listMeta}>{z.description}</Text>
                <Text style={styles.listId}>
                  Risk: {z.riskStatus} · Help: {z.nearestHelpPoint} · {z.mapReference}
                </Text>
              </View>
            ))}
          </View>
        )}

        <SectionHeader
          title="Safety Resources / Guidance"
          open={openSection === "resources"}
          onPress={() => toggleSection("resources")}
        />
        {openSection === "resources" && (
          <View style={styles.sectionBody}>
            {resources.length === 0 && !loading ? (
              <Text style={styles.emptyText}>No safety resources.</Text>
            ) : null}
            {resources.map((r) => (
              <View key={r.id} style={styles.listCard}>
                <Text style={styles.listTitle}>{r.title}</Text>
                <Text style={styles.listMeta}>{r.summary}</Text>
              </View>
            ))}
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() =>
                Alert.alert(
                  "Upload (concept)",
                  "File upload is a UI placeholder in this prototype."
                )
              }
            >
              <Text style={styles.actionBtnText}>Upload Resource (UI only)</Text>
            </TouchableOpacity>
          </View>
        )}

        <SectionHeader
          title="Manage Responder Accounts"
          open={openSection === "responders"}
          onPress={() => toggleSection("responders")}
        />
        {openSection === "responders" && (
          <View style={styles.sectionBody}>
            {responders.length === 0 && !loading ? (
              <Text style={styles.emptyText}>No responders listed.</Text>
            ) : null}
            {responders.map((r) => (
              <View key={r.id} style={styles.listCard}>
                <Text style={styles.listTitle}>{r.name}</Text>
                <Text style={styles.listMeta}>
                  {r.role} · {r.availability} · {r.contact}
                </Text>
                <Text style={styles.listId}>Responder ID: {r.id}</Text>
              </View>
            ))}
          </View>
        )}

        <SectionHeader
          title="User accounts (SQL Server)"
          open={openSection === "users"}
          onPress={() => toggleSection("users")}
        />
        {openSection === "users" && (
          <View style={styles.sectionBody}>
            {users.length === 0 && !loading ? (
              <Text style={styles.emptyText}>No users found.</Text>
            ) : null}
            {users.map((u) => (
              <View key={u.id} style={styles.listCard}>
                <Text style={styles.listTitle}>{u.fullName}</Text>
                <Text style={styles.listMeta}>
                  {u.email} · {u.role}
                </Text>
                <Text style={styles.listId}>User ID: {u.id}</Text>
              </View>
            ))}
          </View>
        )}

        <SectionHeader
          title="Incident Categories"
          open={openSection === "categories"}
          onPress={() => toggleSection("categories")}
        />
        {openSection === "categories" && (
          <View style={styles.sectionBody}>
            {categories.length === 0 && !loading ? (
              <Text style={styles.emptyText}>No report categories.</Text>
            ) : null}
            {categories.map((c) => (
              <View key={c.id} style={styles.categoryRow}>
                <Text style={styles.listTitle}>{c.name}</Text>
                <Switch
                  value={c.active}
                  onValueChange={() => toggleCategory(c.id, c.active)}
                  disabled={busy}
                  trackColor={{ false: "#767577", true: COLORS.navy }}
                  thumbColor={COLORS.white}
                />
              </View>
            ))}
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function SectionHeader({
  title,
  open,
  onPress,
}: {
  title: string;
  open: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity style={styles.sectionHeader} onPress={onPress}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Ionicons
        name={open ? "chevron-up" : "chevron-down"}
        size={18}
        color={COLORS.navy}
      />
    </TouchableOpacity>
  );
}

function ContactRow({ contact }: { contact: HelpContact }) {
  return (
    <View style={styles.listCard}>
      <Text style={styles.listTitle}>{contact.label}</Text>
      <Text style={styles.listMeta}>{contact.number}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  scroll: { padding: 18 },
  banner: {
    flexDirection: "row",
    gap: 10,
    backgroundColor: COLORS.card,
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
    ...CARD_SHADOW,
  },
  bannerText: {
    flex: 1,
    color: COLORS.text,
    fontSize: 13,
    lineHeight: 19,
    opacity: 0.85,
  },
  emptyText: {
    color: COLORS.textMuted,
    fontSize: 13,
    marginBottom: 8,
  },
  sectionHeader: {
    backgroundColor: COLORS.cardAlt,
    borderRadius: 12,
    padding: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
    ...CARD_SHADOW,
  },
  sectionTitle: {
    color: COLORS.text,
    fontWeight: "800",
    fontSize: 15,
    flex: 1,
    paddingRight: 8,
  },
  sectionBody: {
    marginBottom: 14,
  },
  listCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  listTitle: { color: COLORS.text, fontWeight: "800", fontSize: 14 },
  listMeta: {
    color: COLORS.text,
    opacity: 0.7,
    fontSize: 12,
    marginTop: 4,
    lineHeight: 17,
  },
  listId: {
    color: COLORS.textMuted,
    fontSize: 11,
    marginTop: 4,
  },
  input: {
    backgroundColor: COLORS.white,
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
    color: COLORS.text,
  },
  actionBtn: {
    backgroundColor: COLORS.navy,
    borderRadius: 12,
    padding: 14,
    alignItems: "center",
    marginBottom: 4,
  },
  actionBtnText: { color: COLORS.white, fontWeight: "800", fontSize: 14 },
  categoryRow: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
});
