import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
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
  CAMPUS_ZONES,
  EMERGENCY_CONTACTS,
  INCIDENT_CATEGORIES,
  RESPONDERS,
  SAFETY_ALERTS,
  SAFETY_RESOURCES,
  type CampusZone,
  type EmergencyContact,
  type IncidentCategory,
  type SafetyResource,
} from "@/data/mockData";
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
  const [contacts, setContacts] = useState(EMERGENCY_CONTACTS);
  const [zones] = useState(CAMPUS_ZONES);
  const [resources] = useState(SAFETY_RESOURCES);
  const [categories, setCategories] = useState(INCIDENT_CATEGORIES);
  const [users, setUsers] = useState<AppUser[]>([]);
  const [newContactLabel, setNewContactLabel] = useState("");
  const [newContactNumber, setNewContactNumber] = useState("");
  const [newAlertTitle, setNewAlertTitle] = useState("");
  const [issuedAlerts, setIssuedAlerts] = useState(SAFETY_ALERTS);
  const [openSection, setOpenSection] = useState<SectionKey>("contacts");

  useEffect(() => {
    listUsers().then(setUsers).catch(() => setUsers([]));
  }, []);

  const toggleSection = (key: SectionKey) => {
    setOpenSection((prev) => (prev === key ? prev : key));
  };

  const addContact = () => {
    if (!newContactLabel.trim() || !newContactNumber.trim()) {
      Alert.alert("Missing fields", "Enter a label and number (sample only).");
      return;
    }
    const contact: EmergencyContact = {
      id: `EC-${Date.now()}`,
      label: newContactLabel.trim(),
      number: newContactNumber.trim(),
    };
    setContacts((prev) => [...prev, contact]);
    setNewContactLabel("");
    setNewContactNumber("");
  };

  const issueAlert = () => {
    if (!newAlertTitle.trim()) {
      Alert.alert("Missing title", "Enter an alert title (sample only).");
      return;
    }
    setIssuedAlerts((prev) => [
      {
        id: `ALT-${Date.now()}`,
        title: newAlertTitle.trim(),
        message: "Admin-issued sample alert for demo purposes.",
        affectedArea: "Campus-wide",
        dateTime: new Date().toISOString().slice(0, 16).replace("T", " "),
        recommendedAction: "Follow campus guidance and stay aware.",
        alertLevel: "Information",
      },
      ...prev,
    ]);
    setNewAlertTitle("");
    Alert.alert("Alert issued", "Simulated safety alert published to students.");
  };

  const toggleCategory = (id: string) => {
    setCategories((prev) =>
      prev.map((c) => (c.id === id ? { ...c, active: !c.active } : c))
    );
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
            Admin Content Manager (FR11) — mock interface with dummy data for
            emergency contacts, alerts, zones, resources, responders, and
            categories.
          </Text>
        </View>

        <SectionHeader
          title="Emergency Contact Numbers"
          open={openSection === "contacts"}
          onPress={() => toggleSection("contacts")}
        />
        {openSection === "contacts" && (
          <View style={styles.sectionBody}>
            {contacts.map((c) => (
              <ContactRow key={c.id} contact={c} />
            ))}
            <TextInput
              style={styles.input}
              placeholder="Contact label (sample)"
              placeholderTextColor="#888"
              value={newContactLabel}
              onChangeText={setNewContactLabel}
            />
            <TextInput
              style={styles.input}
              placeholder="Phone number (sample)"
              placeholderTextColor="#888"
              keyboardType="phone-pad"
              value={newContactNumber}
              onChangeText={setNewContactNumber}
            />
            <TouchableOpacity style={styles.actionBtn} onPress={addContact}>
              <Text style={styles.actionBtnText}>Add / Edit Contact</Text>
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
              placeholder="New alert title (sample)"
              placeholderTextColor="#888"
              value={newAlertTitle}
              onChangeText={setNewAlertTitle}
            />
            <TouchableOpacity style={styles.actionBtn} onPress={issueAlert}>
              <Text style={styles.actionBtnText}>Broadcast Sample Alert</Text>
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
            {zones.map((z: CampusZone) => (
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
            {resources.map((r: SafetyResource) => (
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
            {RESPONDERS.map((r) => (
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
            {categories.map((c: IncidentCategory) => (
              <View key={c.id} style={styles.categoryRow}>
                <Text style={styles.listTitle}>{c.name}</Text>
                <Switch
                  value={c.active}
                  onValueChange={() => toggleCategory(c.id)}
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

function ContactRow({ contact }: { contact: EmergencyContact }) {
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
