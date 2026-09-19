import { CARD_SHADOW } from "@/constants/theme";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { SAFETY_ALERTS } from "@/data/mockData";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useRef } from "react";
import {
  Animated,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const ACTIONS = [
  {
    key: "walk-with-me",
    title: "Walk with me",
    sub: "Trusted contact",
    icon: "people" as const,
    href: "/(tabs)/map",
  },
  {
    key: "contacts",
    title: "Contacts",
    sub: "Manage contacts",
    icon: "call" as const,
    href: "/(tabs)/profile",
  },
  {
    key: "alerts",
    title: "Campus alerts",
    sub: "Stay informed",
    icon: "notifications" as const,
    href: "/alerts",
  },
  {
    key: "support",
    title: "Support",
    sub: "Counseling & help",
    icon: "heart" as const,
    href: "/support",
  },
];

function timeAgo(dateTime: string) {
  const then = new Date(dateTime.replace(" ", "T")).getTime();
  const mins = Math.max(1, Math.round((Date.now() - then) / 60000));
  if (mins < 60) return `${mins} min ago`;
  return `${Math.round(mins / 60)} hr ago`;
}

export default function HomeScreen() {
  const { user } = useAuth();
  const { colors } = useTheme();
  const firstName = user?.fullName?.split(" ")[0] ?? "there";
  const slide = useRef(new Animated.Value(40)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(slide, { toValue: 0, useNativeDriver: true, friction: 8 }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 260,
        useNativeDriver: true,
      }),
    ]).start();
  }, [slide, opacity]);

  return (
    <SafeAreaView
      style={[styles.safe, { backgroundColor: colors.bg }]}
      edges={["top"]}
    >
      <Animated.View
        style={{ flex: 1, opacity, transform: [{ translateY: slide }] }}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          <Text style={[styles.brand, { color: colors.navy }]}>SafetyBuddy</Text>
          <Text style={[styles.greeting, { color: colors.text }]}>
            Hi, {firstName}
          </Text>
          <Text style={[styles.subGreeting, { color: colors.textMuted }]}>
            You're safe on campus. Here's what's happening around you.
          </Text>

          <TouchableOpacity
            style={[styles.sosCard, { backgroundColor: colors.danger }]}
            activeOpacity={0.9}
            onPress={() => router.push("/(tabs)/panic")}
          >
            <View
              style={[styles.sosIconWrap, { backgroundColor: colors.white }]}
            >
              <Ionicons name="warning" size={22} color={colors.danger} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.sosTitle, { color: colors.white }]}>
                Emergency Hold For SOS
              </Text>
              <Text style={[styles.sosSub, { color: colors.white }]}>
                Alert sent to trusted & security contacts
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.white} />
          </TouchableOpacity>

          <View style={styles.grid}>
            {ACTIONS.map((a) => (
              <TouchableOpacity
                key={a.key}
                style={[styles.actionCard, { backgroundColor: colors.card }]}
                onPress={() => router.push(a.href as never)}
              >
                <Ionicons name={a.icon} size={28} color={colors.navy} />
                <Text style={[styles.actionTitle, { color: colors.text }]}>
                  {a.title}
                </Text>
                <Text style={[styles.actionSub, { color: colors.textMuted }]}>
                  {a.sub}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.alertsHeader}>
            <Text style={[styles.alertsTitle, { color: colors.text }]}>
              Campus alerts
            </Text>
            <TouchableOpacity onPress={() => router.push("/alerts")}>
              <Text style={[styles.seeAll, { color: colors.link }]}>
                See All
              </Text>
            </TouchableOpacity>
          </View>

          {SAFETY_ALERTS.slice(0, 2).map((alert) => (
            <TouchableOpacity
              key={alert.id}
              style={[styles.alertCard, { backgroundColor: colors.card }]}
              onPress={() => router.push("/alerts")}
            >
              <Text style={[styles.alertTime, { color: colors.danger }]}>
                {timeAgo(alert.dateTime)}
              </Text>
              <Text style={[styles.alertTitle, { color: colors.text }]}>
                {alert.title}
              </Text>
            </TouchableOpacity>
          ))}

          <TouchableOpacity
            style={[styles.wellness, { backgroundColor: colors.card }]}
            onPress={() => router.push("/(tabs)/resources")}
          >
            <Ionicons name="heart" size={22} color="#16A34A" />
            <View style={{ flex: 1 }}>
              <Text style={[styles.wellnessTitle, { color: colors.text }]}>
                Not feeling okay?
              </Text>
              <Text style={[styles.wellnessSub, { color: colors.textMuted }]}>
                Counseling & wellness tools are here for you
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.navy} />
          </TouchableOpacity>
        </ScrollView>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { paddingHorizontal: 18, paddingBottom: 110, paddingTop: 8 },
  brand: {
    fontSize: 34,
    fontWeight: "900",
    marginBottom: 10,
  },
  greeting: {
    fontSize: 24,
    fontWeight: "900",
  },
  subGreeting: {
    fontSize: 14,
    lineHeight: 20,
    marginTop: 4,
    marginBottom: 16,
  },
  sosCard: {
    borderRadius: 16,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 14,
    ...CARD_SHADOW,
  },
  sosIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  sosTitle: { fontWeight: "900", fontSize: 15 },
  sosSub: { fontSize: 12, marginTop: 2, opacity: 0.9 },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 18,
  },
  actionCard: {
    width: "47%",
    flexGrow: 1,
    borderRadius: 16,
    padding: 16,
    minHeight: 110,
    ...CARD_SHADOW,
  },
  actionTitle: { fontWeight: "900", fontSize: 16, marginTop: 10 },
  actionSub: { fontSize: 12, marginTop: 2 },
  alertsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  alertsTitle: { fontWeight: "900", fontSize: 18 },
  seeAll: { fontWeight: "800", fontSize: 13 },
  alertCard: {
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    ...CARD_SHADOW,
  },
  alertTime: { fontWeight: "700", fontSize: 12, marginBottom: 4 },
  alertTitle: { fontWeight: "800", fontSize: 15 },
  wellness: {
    marginTop: 6,
    borderRadius: 14,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    ...CARD_SHADOW,
  },
  wellnessTitle: { fontWeight: "800", fontSize: 15 },
  wellnessSub: { fontSize: 12, marginTop: 2 },
});