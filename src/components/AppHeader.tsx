import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { useA11y } from "@/hooks/useA11y";
import { useLocale } from "@/i18n/LocaleContext";
import type { TranslationKey } from "@/i18n/types";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useMemo, useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export type HeaderTipKey =
  | "tipHome"
  | "tipMap"
  | "tipPanic"
  | "tipReports"
  | "tipProfile"
  | "tipGeneric";

type NavItem = {
  key: string;
  labelKey: TranslationKey;
  icon: keyof typeof Ionicons.glyphMap;
  href: string;
};

const STUDENT_NAV: NavItem[] = [
  { key: "home", labelKey: "tabHome", icon: "home-outline", href: "/(tabs)/home" },
  { key: "map", labelKey: "tabMap", icon: "map-outline", href: "/(tabs)/map" },
  { key: "panic", labelKey: "tabPanic", icon: "warning-outline", href: "/(tabs)/panic" },
  { key: "reports", labelKey: "tabReports", icon: "document-text-outline", href: "/(tabs)/report" },
  { key: "profile", labelKey: "tabProfile", icon: "person-outline", href: "/(tabs)/profile" },
  { key: "alerts", labelKey: "campusAlerts", icon: "notifications-outline", href: "/alerts" },
  { key: "support", labelKey: "support", icon: "heart-outline", href: "/support" },
  { key: "emergency", labelKey: "callForHelp", icon: "call-outline", href: "/emergency" },
  { key: "offline", labelKey: "offlineEmergency", icon: "cloud-offline-outline", href: "/offline-emergency" },
  { key: "qr", labelKey: "qrScan", icon: "qr-code-outline", href: "/qr-scan" },
  { key: "routes", labelKey: "safeRoutes", icon: "navigate-outline", href: "/safe-routes" },
  { key: "heatmap", labelKey: "heatmap", icon: "flame-outline", href: "/heatmap" },
  { key: "settings", labelKey: "settings", icon: "options-outline", href: "/safety-settings" },
];

const SECURITY_NAV: NavItem[] = [
  {
    key: "responder",
    labelKey: "campusAlerts",
    icon: "shield-checkmark-outline",
    href: "/ResponderDashboard",
  },
  {
    key: "heatmap",
    labelKey: "heatmap",
    icon: "flame-outline",
    href: "/heatmap",
  },
  {
    key: "settings",
    labelKey: "settings",
    icon: "options-outline",
    href: "/safety-settings",
  },
];

const ADMIN_NAV_EXTRA: NavItem = {
  key: "admin",
  labelKey: "settings",
  icon: "construct-outline",
  href: "/admin",
};

type Props = {
  title?: string;
  tipKey?: HeaderTipKey;
  showBack?: boolean;
  onBack?: () => void;
};

export function AppHeader({
  title,
  tipKey = "tipGeneric",
  showBack = false,
  onBack,
}: Props) {
  const { colors } = useTheme();
  const { t } = useLocale();
  const a11y = useA11y();
  const { logout, user, isSecurity, isAdmin } = useAuth();
  const [tipOpen, setTipOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const heading = title ?? t("appName");
  const navItems = useMemo(() => {
    if (!isSecurity) return STUDENT_NAV;
    return isAdmin ? [...SECURITY_NAV, ADMIN_NAV_EXTRA] : SECURITY_NAV;
  }, [isSecurity, isAdmin]);

  const go = (href: string) => {
    setMenuOpen(false);
    router.push(href as never);
  };

  const onLogout = async () => {
    setMenuOpen(false);
    await logout();
    router.replace("/login");
  };

  const hitStyle = { width: a11y.hit, height: a11y.hit };

  return (
    <SafeAreaView
      edges={["top"]}
      style={{ backgroundColor: colors.bg }}
    >
    <View style={[styles.wrap, { backgroundColor: colors.bg, borderBottomColor: colors.tileBorder }]}>
      <View style={styles.row}>
        {showBack ? (
          <TouchableOpacity
            onPress={onBack ?? (() => router.back())}
            style={[styles.iconBtn, hitStyle]}
            accessibilityRole="button"
            accessibilityLabel="Back"
          >
            <Ionicons name="chevron-back" size={a11y.icon} color={colors.navy} />
          </TouchableOpacity>
        ) : (
          <View style={[styles.iconBtn, hitStyle]} />
        )}

        <Text
          style={[
            styles.title,
            {
              color: colors.navy,
              fontSize: 17 * a11y.scale,
              fontWeight: a11y.fontWeight,
            },
          ]}
          numberOfLines={1}
          accessibilityRole="header"
        >
          {heading}
        </Text>

        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.iconBtn, hitStyle]}
            onPress={() => setTipOpen((v) => !v)}
            accessibilityRole="button"
            accessibilityLabel={t("tipHelp")}
          >
            <Ionicons
              name={tipOpen ? "help-circle" : "help-circle-outline"}
              size={a11y.icon}
              color={colors.navy}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.iconBtn, hitStyle]}
            onPress={() => setMenuOpen(true)}
            accessibilityRole="button"
            accessibilityLabel={t("openMenu")}
          >
            <Ionicons name="menu" size={a11y.icon + 2} color={colors.navy} />
          </TouchableOpacity>
        </View>
      </View>

      {tipOpen && (
        <View style={[styles.tipBubble, { backgroundColor: colors.card }]}>
          <Ionicons name="information-circle" size={a11y.icon - 6} color={colors.navy} />
          <Text style={[styles.tipText, { color: a11y.text, fontSize: 13 * a11y.scale }]}>
            {t(tipKey)}
          </Text>
          <Pressable onPress={() => setTipOpen(false)} accessibilityLabel={t("closeMenu")}>
            <Ionicons name="close" size={a11y.icon - 6} color={a11y.muted} />
          </Pressable>
        </View>
      )}

      <Modal
        visible={menuOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setMenuOpen(false)}
      >
        <Pressable style={styles.backdrop} onPress={() => setMenuOpen(false)}>
          <Pressable
            style={[styles.menuCard, { backgroundColor: colors.card }]}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.menuHeader}>
              <Text style={[styles.menuTitle, { color: colors.text }]}>
                {t("menuTitle")}
              </Text>
              <TouchableOpacity
                onPress={() => setMenuOpen(false)}
                accessibilityLabel={t("closeMenu")}
              >
                <Ionicons name="close" size={22} color={colors.navy} />
              </TouchableOpacity>
            </View>
            {user ? (
              <Text style={[styles.userLine, { color: colors.textMuted }]}>
                {user.fullName}
              </Text>
            ) : null}
            <Text style={[styles.sectionLabel, { color: colors.navy }]}>
              {t("navQuickLinks").toUpperCase()}
            </Text>
            <ScrollView style={{ maxHeight: 360 }} showsVerticalScrollIndicator={false}>
              {navItems.map((item) => (
                <TouchableOpacity
                  key={item.key}
                  style={styles.menuRow}
                  onPress={() => go(item.href)}
                >
                  <Ionicons name={item.icon} size={20} color={colors.navy} />
                  <Text style={[styles.menuLabel, { color: colors.text }]}>
                    {item.key === "responder"
                      ? t("responderDashboard")
                      : item.key === "admin"
                        ? t("adminManager")
                        : t(item.labelKey)}
                  </Text>
                  <Ionicons name="chevron-forward" size={16} color={colors.textDim} />
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity
              style={[styles.logoutRow, { backgroundColor: colors.navy }]}
              onPress={onLogout}
            >
              <Ionicons name="log-out-outline" size={20} color={colors.bg} />
              <Text style={[styles.logoutText, { color: colors.bg }]}>
                {t("logOut")}
              </Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
    </SafeAreaView>
  );
}

/** Compact header actions for native stack headers (right side). */
export function HeaderMenuButton({ tipKey = "tipGeneric" as HeaderTipKey }) {
  const { colors } = useTheme();
  const { t } = useLocale();
  const tip = useMemo(() => t(tipKey), [t, tipKey]);
  const [open, setOpen] = useState(false);
  const [tipOpen, setTipOpen] = useState(false);
  const { logout, user, isSecurity, isAdmin } = useAuth();
  const navItems = useMemo(() => {
    if (!isSecurity) return STUDENT_NAV;
    return isAdmin ? [...SECURITY_NAV, ADMIN_NAV_EXTRA] : SECURITY_NAV;
  }, [isSecurity, isAdmin]);

  return (
    <View style={{ flexDirection: "row", alignItems: "center", marginRight: 4 }}>
      <TouchableOpacity
        onPress={() => setTipOpen(true)}
        style={{ padding: 8 }}
        accessibilityLabel={t("tipHelp")}
      >
        <Ionicons name="help-circle-outline" size={22} color={colors.navy} />
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => setOpen(true)}
        style={{ padding: 8 }}
        accessibilityLabel={t("openMenu")}
      >
        <Ionicons name="menu" size={24} color={colors.navy} />
      </TouchableOpacity>

      <Modal visible={tipOpen} transparent animationType="fade" onRequestClose={() => setTipOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setTipOpen(false)}>
          <View style={[styles.tipModal, { backgroundColor: colors.card }]}>
            <Text style={{ color: colors.text, lineHeight: 20 }}>{tip}</Text>
          </View>
        </Pressable>
      </Modal>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
          <Pressable
            style={[styles.menuCard, { backgroundColor: colors.card }]}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.menuHeader}>
              <Text style={[styles.menuTitle, { color: colors.text }]}>
                {t("menuTitle")}
              </Text>
              <TouchableOpacity onPress={() => setOpen(false)}>
                <Ionicons name="close" size={22} color={colors.navy} />
              </TouchableOpacity>
            </View>
            {user ? (
              <Text style={[styles.userLine, { color: colors.textMuted }]}>
                {user.fullName}
              </Text>
            ) : null}
            <ScrollView style={{ maxHeight: 360 }}>
              {navItems.map((item) => (
                <TouchableOpacity
                  key={item.key}
                  style={styles.menuRow}
                  onPress={() => {
                    setOpen(false);
                    router.push(item.href as never);
                  }}
                >
                  <Ionicons name={item.icon} size={20} color={colors.navy} />
                  <Text style={[styles.menuLabel, { color: colors.text }]}>
                    {item.key === "responder"
                      ? t("responderDashboard")
                      : item.key === "admin"
                        ? t("adminManager")
                        : t(item.labelKey)}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity
              style={[styles.logoutRow, { backgroundColor: colors.navy }]}
              onPress={async () => {
                setOpen(false);
                await logout();
                router.replace("/login");
              }}
            >
              <Ionicons name="log-out-outline" size={20} color={colors.bg} />
              <Text style={[styles.logoutText, { color: colors.bg }]}>
                {t("logOut")}
              </Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: 12,
    paddingTop: 4,
    paddingBottom: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 44,
  },
  title: {
    flex: 1,
    fontSize: 18,
    fontWeight: "900",
    textAlign: "center",
  },
  actions: { flexDirection: "row", alignItems: "center" },
  iconBtn: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  tipBubble: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
  },
  tipText: { flex: 1, fontSize: 12, lineHeight: 17, fontWeight: "600" },
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "flex-end",
  },
  menuCard: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 18,
    paddingBottom: 28,
    maxHeight: "80%",
  },
  menuHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  menuTitle: { fontSize: 18, fontWeight: "900" },
  userLine: { fontSize: 13, marginBottom: 10 },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.7,
    marginBottom: 6,
  },
  menuRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
  },
  menuLabel: { flex: 1, fontWeight: "700", fontSize: 15 },
  logoutRow: {
    marginTop: 12,
    borderRadius: 14,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  logoutText: { fontWeight: "800", fontSize: 15 },
  tipModal: {
    margin: 24,
    marginTop: 80,
    borderRadius: 14,
    padding: 16,
    alignSelf: "stretch",
  },
});
