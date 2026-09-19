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
import { COLORS } from "@/constants/theme";
import {
  loadTrustedContacts,
  saveTrustedContacts,
  type TrustedContact,
} from "@/services/contacts";

export default function ProfileScreen() {
  const { user, logout } = useAuth();
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
      Alert.alert("Missing info", "Please enter at least a name and phone number.");
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
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Trusted contacts & privacy</Text>
          <Text style={styles.headerSubtitle}>
            {user?.fullName} · {user?.email}
          </Text>
        </View>

        <Text style={styles.sectionTitle}>TRUSTED CONTACTS</Text>
        {contacts.map((contact) => (
          <View key={contact.id} style={styles.contactCard}>
            <View style={{ flex: 1 }}>
              <Text style={styles.contactName}>{contact.name}</Text>
              <Text style={styles.contactPhone}>{contact.phone}</Text>
              <Text style={styles.contactMeta}>
                {contact.relationship} · Alert via {contact.preferredAlertMethod}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() =>
                persist(contacts.filter((c) => c.id !== contact.id))
              }
            >
              <Ionicons name="trash-outline" size={22} color={COLORS.navy} />
            </TouchableOpacity>
          </View>
        ))}

        <View style={styles.addContactForm}>
          <TextInput
            style={styles.input}
            placeholder="Name"
            placeholderTextColor={COLORS.textDim}
            value={newName}
            onChangeText={setNewName}
          />
          <TextInput
            style={styles.input}
            placeholder="Phone"
            placeholderTextColor={COLORS.textDim}
            keyboardType="phone-pad"
            value={newPhone}
            onChangeText={setNewPhone}
          />
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor={COLORS.textDim}
            keyboardType="email-address"
            value={newEmail}
            onChangeText={setNewEmail}
          />
          <TextInput
            style={styles.input}
            placeholder="Relationship"
            placeholderTextColor={COLORS.textDim}
            value={newRelationship}
            onChangeText={setNewRelationship}
          />
          <TouchableOpacity style={styles.addButton} onPress={handleAddContact}>
            <Ionicons name="person-add-outline" size={20} color={COLORS.white} />
            <Text style={styles.addButtonText}>Add trusted contact</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>PRIVACY & PERMISSIONS</Text>
        {(
          [
            ["Share my location during Help / Walk With Me", "Used only while an alert or journey is active", shareLocation, setShareLocation],
            ["Anonymous report by default", "Your name won't be attached to reports", anonReport, setAnonReport],
            ["Campus safety alerts", "Notifications about incidents & closures", campusAlerts, setCampusAlerts],
            ["Enable Walk With Me", "Trusted contacts receive journey updates", walkWithMe, setWalkWithMe],
          ] as const
        ).map(([title, subtitle, value, onChange]) => (
          <View key={title} style={styles.toggleCard}>
            <View style={styles.toggleTextContainer}>
              <Text style={styles.toggleTitle}>{title}</Text>
              <Text style={styles.toggleSubtitle}>{subtitle}</Text>
            </View>
            <Switch
              value={value}
              onValueChange={onChange}
              trackColor={{ false: "#ccc", true: COLORS.navy }}
              thumbColor={COLORS.white}
            />
          </View>
        ))}

        <TouchableOpacity style={styles.linkCard} onPress={() => router.push("/privacy")}>
          <Text style={styles.linkText}>Open full privacy notice</Text>
          <Ionicons name="chevron-forward" size={18} color={COLORS.navy} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={async () => {
            await logout();
            router.replace("/login");
          }}
        >
          <Text style={styles.logoutText}>Log out</Text>
        </TouchableOpacity>

        <Text style={styles.footerNote}>
          Your account is stored in Microsoft SQL Server (SafetyBuddy database).
        </Text>
        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  scrollContent: { padding: 20, paddingBottom: 40 },
  header: { marginBottom: 20 },
  headerTitle: { fontSize: 24, fontWeight: "bold", color: COLORS.text },
  headerSubtitle: { fontSize: 14, color: COLORS.textMuted, marginTop: 4 },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "bold",
    color: COLORS.navy,
    marginBottom: 10,
    letterSpacing: 0.8,
  },
  contactCard: {
    backgroundColor: COLORS.card,
    padding: 15,
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  contactName: { fontSize: 16, fontWeight: "700", color: COLORS.text },
  contactPhone: { fontSize: 13, color: COLORS.textMuted, marginTop: 2 },
  contactMeta: { fontSize: 12, color: COLORS.textDim, marginTop: 2 },
  addContactForm: { marginBottom: 24 },
  input: {
    backgroundColor: COLORS.white,
    borderRadius: 10,
    padding: 14,
    marginBottom: 8,
    color: COLORS.text,
  },
  addButton: {
    backgroundColor: COLORS.navy,
    borderRadius: 10,
    padding: 14,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  addButtonText: { color: COLORS.white, fontWeight: "bold" },
  toggleCard: {
    backgroundColor: COLORS.card,
    padding: 14,
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  toggleTextContainer: { flex: 1, paddingRight: 10 },
  toggleTitle: { fontSize: 14, fontWeight: "bold", color: COLORS.text },
  toggleSubtitle: { fontSize: 12, color: COLORS.textMuted, marginTop: 2 },
  linkCard: {
    backgroundColor: COLORS.cardAlt,
    padding: 14,
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
    marginTop: 4,
  },
  linkText: { color: COLORS.text, fontWeight: "700", fontSize: 14 },
  logoutBtn: {
    marginTop: 12,
    backgroundColor: COLORS.navy,
    borderRadius: 12,
    padding: 14,
    alignItems: "center",
  },
  logoutText: { color: COLORS.white, fontWeight: "800" },
  footerNote: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 16,
    lineHeight: 18,
  },
});
