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
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import {
  loadTrustedContacts,
  saveTrustedContacts,
  type TrustedContact,
} from "@/services/contacts";

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const { colors } = useTheme();
  const [shareLocation, setShareLocation] = useState(true);
  const [anonReport, setAnonReport] = useState(true);
  const [campusAlerts, setCampusAlerts] = useState(true);
  const [walkWithMe, setWalkWithMe] = useState(true);
  const [contacts, setContacts] = useState<TrustedContact[]>([]);
  const [newName, setNewName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newRelationship, setNewRelationship] = useState("");
  const [newEmail, setNewEmail] = useState("");

  useEffect(() => {
    loadTrustedContacts().then(setContacts);
  }, []);

  const persist = async (next: TrustedContact[]) => {
    setContacts(next);
    await saveTrustedContacts(next);
  };

  const handleAddContact = () => {
    if (!newName.trim() || !newPhone.trim()) {
      Alert.alert(
        "Missing info",
        "Please enter at least a name and phone number."
      );
      return;
    }
    const contact: TrustedContact = {
      id: Date.now().toString(),
      name: newName.trim(),
      phone: newPhone.trim(),
      relationship: newRelationship.trim() || "Trusted",
      email: newEmail.trim() || "demo@example.com",
      preferredAlertMethod: "SMS",
    };
    persist([...contacts, contact]);
    setNewName("");
    setNewPhone("");
    setNewRelationship("");
    setNewEmail("");
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.bg }]}
      edges={["bottom"]}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            Trusted contacts & privacy
          </Text>
          <Text style={[styles.headerSubtitle, { color: colors.textMuted }]}>
            {user?.fullName} · {user?.email}
          </Text>
        </View>

        <Text style={[styles.sectionTitle, { color: colors.navy }]}>
          TRUSTED CONTACTS
        </Text>
        {contacts.map((contact) => (
          <View
            key={contact.id}
            style={[styles.contactCard, { backgroundColor: colors.card }]}
          >
            <View style={{ flex: 1 }}>
              <Text style={[styles.contactName, { color: colors.text }]}>
                {contact.name}
              </Text>
              <Text style={[styles.contactPhone, { color: colors.textMuted }]}>
                {contact.phone}
              </Text>
              <Text style={[styles.contactMeta, { color: colors.textDim }]}>
                {contact.relationship} · Alert via {contact.preferredAlertMethod}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() =>
                persist(contacts.filter((c) => c.id !== contact.id))
              }
            >
              <Ionicons name="trash-outline" size={22} color={colors.navy} />
            </TouchableOpacity>
          </View>
        ))}

        <View style={styles.addContactForm}>
          <TextInput
            style={[
              styles.input,
              { backgroundColor: colors.input, color: colors.text },
            ]}
            placeholder="Name"
            placeholderTextColor={colors.textDim}
            value={newName}
            onChangeText={setNewName}
          />
          <TextInput
            style={[
              styles.input,
              { backgroundColor: colors.input, color: colors.text },
            ]}
            placeholder="Phone"
            placeholderTextColor={colors.textDim}
            keyboardType="phone-pad"
            value={newPhone}
            onChangeText={setNewPhone}
          />
          <TextInput
            style={[
              styles.input,
              { backgroundColor: colors.input, color: colors.text },
            ]}
            placeholder="Email"
            placeholderTextColor={colors.textDim}
            keyboardType="email-address"
            value={newEmail}
            onChangeText={setNewEmail}
          />
          <TextInput
            style={[
              styles.input,
              { backgroundColor: colors.input, color: colors.text },
            ]}
            placeholder="Relationship"
            placeholderTextColor={colors.textDim}
            value={newRelationship}
            onChangeText={setNewRelationship}
          />
          <TouchableOpacity
            style={[styles.addButton, { backgroundColor: colors.navy }]}
            onPress={handleAddContact}
          >
            <Ionicons name="person-add-outline" size={20} color={colors.bg} />
            <Text style={[styles.addButtonText, { color: colors.bg }]}>
              Add trusted contact
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={[styles.sectionTitle, { color: colors.navy }]}>
          PRIVACY & PERMISSIONS
        </Text>
        {(
          [
            [
              "Share my location during Help / Walk With Me",
              "Used only while an alert or journey is active",
              shareLocation,
              setShareLocation,
            ],
            [
              "Anonymous report by default",
              "Your name won't be attached to reports",
              anonReport,
              setAnonReport,
            ],
            [
              "Campus safety alerts",
              "Notifications about incidents & closures",
              campusAlerts,
              setCampusAlerts,
            ],
            [
              "Enable Walk With Me",
              "Trusted contacts receive journey updates",
              walkWithMe,
              setWalkWithMe,
            ],
          ] as const
        ).map(([title, subtitle, value, onChange]) => (
          <View
            key={title}
            style={[styles.toggleCard, { backgroundColor: colors.card }]}
          >
            <View style={styles.toggleTextContainer}>
              <Text style={[styles.toggleTitle, { color: colors.text }]}>
                {title}
              </Text>
              <Text style={[styles.toggleSubtitle, { color: colors.textMuted }]}>
                {subtitle}
              </Text>
            </View>
            <Switch
              value={value}
              onValueChange={onChange}
              trackColor={{ false: "#ccc", true: colors.navy }}
              thumbColor={colors.white}
            />
          </View>
        ))}

        <TouchableOpacity
          style={[styles.linkCard, { backgroundColor: colors.cardAlt }]}
          onPress={() => router.push("/privacy")}
        >
          <Text style={[styles.linkText, { color: colors.text }]}>
            Open full privacy notice
          </Text>
          <Ionicons name="chevron-forward" size={18} color={colors.navy} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.logoutBtn, { backgroundColor: colors.navy }]}
          onPress={async () => {
            await logout();
            router.replace("/login");
          }}
        >
          <Text style={[styles.logoutText, { color: colors.bg }]}>Log out</Text>
        </TouchableOpacity>

        <Text style={[styles.footerNote, { color: colors.textMuted }]}>
          Your account is stored in Microsoft SQL Server (SafetyBuddy database).
        </Text>
        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 40 },
  header: { marginBottom: 20 },
  headerTitle: { fontSize: 24, fontWeight: "bold" },
  headerSubtitle: { fontSize: 14, marginTop: 4 },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 10,
    letterSpacing: 0.8,
  },
  contactCard: {
    padding: 15,
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  contactName: { fontSize: 16, fontWeight: "700" },
  contactPhone: { fontSize: 13, marginTop: 2 },
  contactMeta: { fontSize: 12, marginTop: 2 },
  addContactForm: { marginBottom: 24 },
  input: {
    borderRadius: 10,
    padding: 14,
    marginBottom: 8,
  },
  addButton: {
    borderRadius: 10,
    padding: 14,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  addButtonText: { fontWeight: "bold" },
  toggleCard: {
    padding: 14,
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  toggleTextContainer: { flex: 1, paddingRight: 10 },
  toggleTitle: { fontSize: 14, fontWeight: "bold" },
  toggleSubtitle: { fontSize: 12, marginTop: 2 },
  linkCard: {
    padding: 14,
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
    marginTop: 4,
  },
  linkText: { fontWeight: "700", fontSize: 14 },
  logoutBtn: {
    marginTop: 12,
    borderRadius: 12,
    padding: 14,
    alignItems: "center",
  },
  logoutText: { fontWeight: "800" },
  footerNote: {
    fontSize: 12,
    marginTop: 16,
    lineHeight: 18,
  },
});
