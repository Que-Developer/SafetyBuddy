import { CARD_SHADOW } from "@/constants/theme";
import { ThemeToggleCard } from "@/components/ThemeToggleCard";
import { useTheme } from "@/context/ThemeContext";
import { useLocale } from "@/i18n/LocaleContext";
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
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
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

type SectionKey =
  | "contacts"
  | "alerts"
  | "zones"
  | "resources"
  | "responders"
  | "users"
  | "categories";

type ThemeColors = ReturnType<typeof useTheme>["colors"];

export default function AdminScreen() {
  const { colors } = useTheme();
  const { t } = useLocale();
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
    <SafeAreaView
      style={[styles.safe, { backgroundColor: colors.bg }]}
      edges={[]}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={[styles.greeting, { color: colors.text }]}>
          Content Manager
        </Text>
        <Text style={[styles.subGreeting, { color: colors.textMuted }]}>
          Manage contacts, alerts, zones, and responder accounts.
        </Text>

        <Text
          style={{
            color: colors.navy,
            fontWeight: "800",
            fontSize: 12,
            letterSpacing: 0.8,
            marginBottom: 10,
          }}
        >
          {t("appearance").toUpperCase()}
        </Text>
        <ThemeToggleCard />

        <TouchableOpacity
          style={[styles.heatCard, { backgroundColor: colors.card }, CARD_SHADOW]}
          onPress={() => router.push("/heatmap")}
          accessibilityRole="button"
          accessibilityLabel={t("heatmap")}
        >
          <View style={[styles.heatIcon, { backgroundColor: colors.navy }]}>
            <Ionicons name="flame" size={22} color={colors.bg} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.heatTitle, { color: colors.text }]}>
              {t("heatmap")}
            </Text>
            <Text style={[styles.heatSub, { color: colors.textMuted }]}>
              Open the campus map with concern density for planning.
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.navy} />
        </TouchableOpacity>

        <SectionHeader
          title="Emergency Contact Numbers"
          open={openSection === "contacts"}
          onPress={() => toggleSection("contacts")}
          colors={colors}
        />
        {openSection === "contacts" && (
          <View style={styles.sectionBody}>
            {contacts.map((c) => (
              <ContactRow key={c.id} contact={c} colors={colors} />
            ))}
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.input,
                  color: colors.text,
                  borderColor: colors.tileBorder,
                },
              ]}
              placeholder="Contact label (sample)"
              placeholderTextColor={colors.textDim}
              value={newContactLabel}
              onChangeText={setNewContactLabel}
            />
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.input,
                  color: colors.text,
                  borderColor: colors.tileBorder,
                },
              ]}
              placeholder="Phone number (sample)"
              placeholderTextColor={colors.textDim}
              keyboardType="phone-pad"
              value={newContactNumber}
              onChangeText={setNewContactNumber}
            />
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: colors.navy }]}
              onPress={addContact}
            >
              <Text style={[styles.actionBtnText, { color: colors.bg }]}>
                Add / Edit Contact
              </Text>
            </TouchableOpacity>
          </View>
        )}

        <SectionHeader
          title="Issue Safety Alerts"
          open={openSection === "alerts"}
          onPress={() => toggleSection("alerts")}
          colors={colors}
        />
        {openSection === "alerts" && (
          <View style={styles.sectionBody}>
            {issuedAlerts.slice(0, 3).map((a) => (
              <View
                key={a.id}
                style={[styles.listCard, { backgroundColor: colors.card }, CARD_SHADOW]}
              >
                <Text style={[styles.listTitle, { color: colors.text }]}>
                  {a.title}
                </Text>
                <Text style={[styles.listMeta, { color: colors.textMuted }]}>
                  {a.alertLevel} · {a.affectedArea}
                </Text>
              </View>
            ))}
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.input,
                  color: colors.text,
                  borderColor: colors.tileBorder,
                },
              ]}
              placeholder="New alert title (sample)"
              placeholderTextColor={colors.textDim}
              value={newAlertTitle}
              onChangeText={setNewAlertTitle}
            />
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: colors.navy }]}
              onPress={issueAlert}
            >
              <Text style={[styles.actionBtnText, { color: colors.bg }]}>
                Broadcast Sample Alert
              </Text>
            </TouchableOpacity>
          </View>
        )}

        <SectionHeader
          title="Campus Zones"
          open={openSection === "zones"}
          onPress={() => toggleSection("zones")}
          colors={colors}
        />
        {openSection === "zones" && (
          <View style={styles.sectionBody}>
            {zones.map((z: CampusZone) => (
              <View
                key={z.id}
                style={[styles.listCard, { backgroundColor: colors.card }, CARD_SHADOW]}
              >
                <Text style={[styles.listTitle, { color: colors.text }]}>
                  {z.name}
                </Text>
                <Text style={[styles.listMeta, { color: colors.textMuted }]}>
                  {z.description}
                </Text>
                <Text style={[styles.listId, { color: colors.textDim }]}>
                  Risk: {z.riskStatus} · Help: {z.nearestHelpPoint} ·{" "}
                  {z.mapReference}
                </Text>
              </View>
            ))}
          </View>
        )}

        <SectionHeader
          title="Safety Resources / Guidance"
          open={openSection === "resources"}
          onPress={() => toggleSection("resources")}
          colors={colors}
        />
        {openSection === "resources" && (
          <View style={styles.sectionBody}>
            {resources.map((r: SafetyResource) => (
              <View
                key={r.id}
                style={[styles.listCard, { backgroundColor: colors.card }, CARD_SHADOW]}
              >
                <Text style={[styles.listTitle, { color: colors.text }]}>
                  {r.title}
                </Text>
                <Text style={[styles.listMeta, { color: colors.textMuted }]}>
                  {r.summary}
                </Text>
              </View>
            ))}
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: colors.navy }]}
              onPress={() =>
                Alert.alert(
                  "Upload (concept)",
                  "File upload is a UI placeholder in this prototype."
                )
              }
            >
              <Text style={[styles.actionBtnText, { color: colors.bg }]}>
                Upload Resource (UI only)
              </Text>
            </TouchableOpacity>
          </View>
        )}

        <SectionHeader
          title="Manage Responder Accounts"
          open={openSection === "responders"}
          onPress={() => toggleSection("responders")}
          colors={colors}
        />
        {openSection === "responders" && (
          <View style={styles.sectionBody}>
            {RESPONDERS.map((r) => (
              <View
                key={r.id}
                style={[styles.listCard, { backgroundColor: colors.card }, CARD_SHADOW]}
              >
                <Text style={[styles.listTitle, { color: colors.text }]}>
                  {r.name}
                </Text>
                <Text style={[styles.listMeta, { color: colors.textMuted }]}>
                  {r.role} · {r.availability} · {r.contact}
                </Text>
                <Text style={[styles.listId, { color: colors.textDim }]}>
                  Responder ID: {r.id}
                </Text>
              </View>
            ))}
          </View>
        )}

        <SectionHeader
          title="User accounts (SQL Server)"
          open={openSection === "users"}
          onPress={() => toggleSection("users")}
          colors={colors}
        />
        {openSection === "users" && (
          <View style={styles.sectionBody}>
            {users.map((u) => (
              <View
                key={u.id}
                style={[styles.listCard, { backgroundColor: colors.card }, CARD_SHADOW]}
              >
                <Text style={[styles.listTitle, { color: colors.text }]}>
                  {u.fullName}
                </Text>
                <Text style={[styles.listMeta, { color: colors.textMuted }]}>
                  {u.email} · {u.role}
                </Text>
                <Text style={[styles.listId, { color: colors.textDim }]}>
                  User ID: {u.id}
                </Text>
              </View>
            ))}
          </View>
        )}

        <SectionHeader
          title="Incident Categories"
          open={openSection === "categories"}
          onPress={() => toggleSection("categories")}
          colors={colors}
        />
        {openSection === "categories" && (
          <View style={styles.sectionBody}>
            {categories.map((c: IncidentCategory) => (
              <View
                key={c.id}
                style={[
                  styles.categoryRow,
                  { backgroundColor: colors.card },
                  CARD_SHADOW,
                ]}
              >
                <Text style={[styles.listTitle, { color: colors.text }]}>
                  {c.name}
                </Text>
                <Switch
                  value={c.active}
                  onValueChange={() => toggleCategory(c.id)}
                  trackColor={{ false: colors.textDim, true: colors.navy }}
                  thumbColor={colors.white}
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
  colors,
}: {
  title: string;
  open: boolean;
  onPress: () => void;
  colors: ThemeColors;
}) {
  return (
    <TouchableOpacity
      style={[styles.sectionHeader, { backgroundColor: colors.card }, CARD_SHADOW]}
      onPress={onPress}
    >
      <Text style={[styles.sectionTitle, { color: colors.text }]}>{title}</Text>
      <Ionicons
        name={open ? "chevron-up" : "chevron-down"}
        size={18}
        color={colors.navy}
      />
    </TouchableOpacity>
  );
}

function ContactRow({
  contact,
  colors,
}: {
  contact: EmergencyContact;
  colors: ThemeColors;
}) {
  return (
    <View style={[styles.listCard, { backgroundColor: colors.card }, CARD_SHADOW]}>
      <Text style={[styles.listTitle, { color: colors.text }]}>
        {contact.label}
      </Text>
      <Text style={[styles.listMeta, { color: colors.textMuted }]}>
        {contact.number}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { padding: 18, paddingTop: 8 },
  greeting: { fontSize: 24, fontWeight: "800" },
  subGreeting: { fontSize: 14, marginTop: 4, marginBottom: 14 },
  heatCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
  },
  heatIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  heatTitle: { fontWeight: "900", fontSize: 16 },
  heatSub: { fontSize: 12, marginTop: 2, lineHeight: 17 },
  sectionHeader: {
    borderRadius: 12,
    padding: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  sectionTitle: {
    fontWeight: "800",
    fontSize: 15,
    flex: 1,
    paddingRight: 8,
  },
  sectionBody: { marginBottom: 14 },
  listCard: {
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  listTitle: { fontWeight: "800", fontSize: 14 },
  listMeta: {
    fontSize: 12,
    marginTop: 4,
    lineHeight: 17,
  },
  listId: {
    fontSize: 11,
    marginTop: 4,
  },
  input: {
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
  },
  actionBtn: {
    borderRadius: 12,
    padding: 14,
    alignItems: "center",
    marginBottom: 4,
  },
  actionBtnText: { fontWeight: "800", fontSize: 14 },
  categoryRow: {
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
});
