import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  Linking,
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
import { useSafetyModes } from "@/context/SafetyModesContext";
import { useTheme } from "@/context/ThemeContext";
import { useLocale } from "@/i18n/LocaleContext";
import { ThemeToggleCard } from "@/components/ThemeToggleCard";
import {
  loadTrustedContacts,
  saveTrustedContacts,
  type TrustedContact,
} from "@/services/contacts";
import {
  phonesMatch,
  pickContactFromPhone,
  toTrustedContact,
} from "@/services/phoneContacts";

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const { colors } = useTheme();
  const { t, locale, setLocale, locales } = useLocale();
  const modes = useSafetyModes();
  const scale = modes.scale;
  const [shareLocation, setShareLocation] = useState(true);
  const [campusAlerts, setCampusAlerts] = useState(true);
  const [walkWithMe, setWalkWithMe] = useState(true);
  const [contacts, setContacts] = useState<TrustedContact[]>([]);
  const [newName, setNewName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newRelationship, setNewRelationship] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [pickingContact, setPickingContact] = useState(false);

  useEffect(() => {
    loadTrustedContacts().then(setContacts);
  }, []);

  const persist = async (next: TrustedContact[]) => {
    setContacts(next);
    await saveTrustedContacts(next);
  };

  const handleAddContact = () => {
    if (!newName.trim() || !newPhone.trim()) {
      Alert.alert(t("missingInfo"), t("missingInfoBody"));
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

  const handlePickFromPhone = async () => {
    if (pickingContact) return;
    setPickingContact(true);
    try {
      const result = await pickContactFromPhone();
      if (!result.ok) {
        if (result.reason === "cancelled") return;
        if (result.reason === "permission") {
          Alert.alert(t("contactsPermissionTitle"), t("contactsPermissionBody"), [
            { text: t("cancel"), style: "cancel" },
            {
              text: t("openSettings"),
              onPress: () => Linking.openSettings().catch(() => undefined),
            },
          ]);
          return;
        }
        if (result.reason === "no_phone") {
          Alert.alert(t("contactNoPhoneTitle"), t("contactNoPhoneBody"));
          return;
        }
        Alert.alert(t("contactsUnsupportedTitle"), t("contactsUnsupportedBody"));
        return;
      }

      if (contacts.some((c) => phonesMatch(c.phone, result.contact.phone))) {
        Alert.alert(t("contactAlreadyAddedTitle"), t("contactAlreadyAddedBody"));
        setNewName(result.contact.name);
        setNewPhone(result.contact.phone);
        setNewEmail(result.contact.email);
        setNewRelationship(result.contact.relationship);
        return;
      }

      const trusted = toTrustedContact(result.contact);
      await persist([...contacts, trusted]);
      setNewName("");
      setNewPhone("");
      setNewRelationship("");
      setNewEmail("");
      Alert.alert(t("trustedContacts"), t("contactAddedFromPhone"));
    } finally {
      setPickingContact(false);
    }
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
            {t("trustedContactsPrivacy")}
          </Text>
          <Text style={[styles.headerSubtitle, { color: colors.textMuted }]}>
            {user?.fullName} · {user?.email}
          </Text>
        </View>

        <Text style={[styles.sectionTitle, { color: colors.navy }]}>
          {t("trustedContacts").toUpperCase()}
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
          <TouchableOpacity
            style={[
              styles.pickButton,
              {
                backgroundColor: colors.card,
                borderColor: colors.navy,
                opacity: pickingContact ? 0.7 : 1,
              },
            ]}
            onPress={handlePickFromPhone}
            disabled={pickingContact}
            accessibilityRole="button"
            accessibilityLabel={t("pickFromPhone")}
            accessibilityHint={t("pickFromPhoneSub")}
          >
            <Ionicons name="people-outline" size={20} color={colors.navy} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.pickButtonTitle, { color: colors.text }]}>
                {t("pickFromPhone")}
              </Text>
              <Text style={[styles.pickButtonSub, { color: colors.textMuted }]}>
                {t("pickFromPhoneSub")}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.navy} />
          </TouchableOpacity>

          <Text
            style={[
              styles.orDivider,
              { color: colors.textDim },
            ]}
          >
            — {t("orEnterManually")} —
          </Text>

          <TextInput
            style={[
              styles.input,
              { backgroundColor: colors.input, color: colors.text },
            ]}
            placeholder={t("namePlaceholder")}
            placeholderTextColor={colors.textDim}
            value={newName}
            onChangeText={setNewName}
          />
          <TextInput
            style={[
              styles.input,
              { backgroundColor: colors.input, color: colors.text },
            ]}
            placeholder={t("phonePlaceholder")}
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
            placeholder={t("emailPlaceholder")}
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
            placeholder={t("relationshipPlaceholder")}
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
              {t("addTrustedContact")}
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={[styles.sectionTitle, { color: colors.navy }]}>
          {t("appearance").toUpperCase()}
        </Text>
        <ThemeToggleCard />

        <Text style={[styles.sectionTitle, { color: colors.navy }]}>
          {t("safetyFeatures").toUpperCase()}
        </Text>
        {(
          [
            [t("qrScan"), t("qrScanSub"), "qr-code-outline", "/qr-scan"],
            [t("safeRoutes"), t("safeRoutesSub"), "map-outline", "/safe-routes"],
            [
              t("offlineEmergency"),
              t("offlineEmergencySub"),
              "cloud-offline-outline",
              "/offline-emergency",
            ],
            [t("chatbot"), t("chatbotSub"), "chatbubbles-outline", "/chatbot"],
            [t("heatmap"), t("heatmapSub"), "flame-outline", "/heatmap"],
            [t("wearable"), t("wearableSub"), "watch-outline", "/wearable-panic"],
            [
              t("securityLink"),
              t("securityLinkSub"),
              "shield-checkmark-outline",
              "/security-integration",
            ],
            [t("walkWithMe"), t("walkWithMeSub"), "walk-outline", "/(tabs)/map"],
          ] as const
        ).map(([title, sub, icon, href]) => (
          <TouchableOpacity
            key={href}
            style={[styles.linkCard, { backgroundColor: colors.card }]}
            onPress={() => router.push(href as never)}
            accessibilityRole="button"
            accessibilityLabel={title}
          >
            <View style={styles.featureRow}>
              <Ionicons name={icon} size={22} color={colors.navy} />
              <View style={{ flex: 1 }}>
                <Text
                  style={[
                    styles.linkText,
                    { color: colors.text, fontSize: 14 * scale },
                  ]}
                >
                  {title}
                </Text>
                <Text
                  style={[
                    styles.toggleSubtitle,
                    { color: colors.textMuted, fontSize: 12 * scale },
                  ]}
                >
                  {sub}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.navy} />
            </View>
          </TouchableOpacity>
        ))}

        <Text style={[styles.sectionTitle, { color: colors.navy, marginTop: 12 }]}>
          {t("language").toUpperCase()}
        </Text>
        <View style={styles.langGrid}>
          {locales.map((l) => {
            const active = locale === l.code;
            return (
              <TouchableOpacity
                key={l.code}
                style={[
                  styles.langChip,
                  {
                    backgroundColor: active ? colors.navy : colors.card,
                    borderColor: colors.navy,
                  },
                ]}
                onPress={() => setLocale(l.code)}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
              >
                <Text
                  style={{
                    color: active ? colors.bg : colors.text,
                    fontWeight: "800",
                    fontSize: 12 * scale,
                  }}
                >
                  {l.nativeLabel}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={[styles.sectionTitle, { color: colors.navy }]}>
          {t("safetyModes").toUpperCase()}
        </Text>
        {modes.batteryLow && (
          <View style={[styles.modeBanner, { backgroundColor: colors.card }]}>
            <Ionicons name="battery-half" size={18} color={colors.caution} />
            <Text style={{ color: colors.text, flex: 1, fontWeight: "700", fontSize: 12 * scale }}>
              {t("batteryLow")}
              {modes.batteryLevel != null
                ? ` (${Math.round(modes.batteryLevel * 100)}%)`
                : ""}
            </Text>
          </View>
        )}
        {(
          [
            ["accessibilityMode", t("accessibility"), t("accessibilitySub")],
            ["lowDataMode", t("lowData"), t("lowDataSub")],
            ["batteryAwareMode", t("batteryMode"), t("batteryModeSub")],
            ["silentPanicMode", t("silentPanic"), t("silentPanicSub")],
            ["anonymousDefault", t("anonymousReport"), t("anonymousReportSub")],
          ] as const
        ).map(([key, title, subtitle]) => (
          <View
            key={key}
            style={[styles.toggleCard, { backgroundColor: colors.card }]}
          >
            <View style={styles.toggleTextContainer}>
              <Text
                style={[
                  styles.toggleTitle,
                  { color: colors.text, fontSize: 14 * scale },
                ]}
              >
                {title}
              </Text>
              <Text
                style={[
                  styles.toggleSubtitle,
                  { color: colors.textMuted, fontSize: 12 * scale },
                ]}
              >
                {subtitle}
              </Text>
            </View>
            <Switch
              value={modes[key]}
              onValueChange={(v) => modes.setMode(key, v)}
              trackColor={{ false: colors.textDim, true: colors.navy }}
              thumbColor={colors.white}
              accessibilityLabel={title}
            />
          </View>
        ))}

        <Text style={[styles.sectionTitle, { color: colors.navy, marginTop: 8 }]}>
          {t("privacyPermissions").toUpperCase()}
        </Text>
        {(
          [
            [
              t("shareLocationTitle"),
              t("shareLocationSub"),
              shareLocation,
              setShareLocation,
            ],
            [
              t("campusAlertsPermTitle"),
              t("campusAlertsPermSub"),
              campusAlerts,
              setCampusAlerts,
            ],
            [
              t("enableWalkTitle"),
              t("enableWalkSub"),
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
              trackColor={{ false: colors.textDim, true: colors.navy }}
              thumbColor={colors.white}
            />
          </View>
        ))}

        <TouchableOpacity
          style={[styles.linkCard, { backgroundColor: colors.cardAlt }]}
          onPress={() => router.push("/privacy")}
        >
          <View style={styles.featureRow}>
            <Text style={[styles.linkText, { color: colors.text, flex: 1 }]}>
              {t("openPrivacyNotice")}
            </Text>
            <Ionicons name="chevron-forward" size={18} color={colors.navy} />
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.logoutBtn, { backgroundColor: colors.navy }]}
          onPress={async () => {
            await logout();
            router.replace("/login");
          }}
        >
          <Text style={[styles.logoutText, { color: colors.bg }]}>
            {t("logOut")}
          </Text>
        </TouchableOpacity>

        <Text style={[styles.footerNote, { color: colors.textMuted }]}>
          {t("accountStoredNote")}
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
  pickButton: {
    borderRadius: 12,
    borderWidth: 1.5,
    paddingVertical: 14,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  pickButtonTitle: { fontSize: 15, fontWeight: "800" },
  pickButtonSub: { fontSize: 12, marginTop: 2 },
  orDivider: {
    textAlign: "center",
    fontSize: 12,
    fontWeight: "700",
    marginBottom: 12,
    letterSpacing: 0.4,
  },
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
  themeCard: {
    padding: 14,
    borderRadius: 12,
    marginBottom: 16,
  },
  toggleTextContainer: { flex: 1, paddingRight: 10 },
  themeToggleTrack: {
    flexDirection: "row",
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 4,
    gap: 4,
  },
  themeToggleOption: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    borderRadius: 10,
    paddingVertical: 12,
  },
  themeToggleLabel: {
    fontSize: 14,
    fontWeight: "800",
  },
  toggleTitle: { fontSize: 14, fontWeight: "bold" },
  toggleSubtitle: { fontSize: 12, marginTop: 2 },
  linkCard: {
    padding: 14,
    borderRadius: 12,
    marginBottom: 8,
    marginTop: 4,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  langGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 16,
  },
  langChip: {
    borderWidth: 1.5,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  modeBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
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
