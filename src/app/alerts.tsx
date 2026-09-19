import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ALERT_LEVEL_COLORS } from "@/constants/theme";
import { useTheme } from "@/context/ThemeContext";
import {
  fetchSafetyAlerts,
  type SafetyAlert,
} from "@/services/campusApi";

function AlertCard({
  alert,
  colors,
}: {
  alert: SafetyAlert;
  colors: ReturnType<typeof useTheme>["colors"];
}) {
  return (
    <View style={[styles.alertCard, { backgroundColor: colors.card }]}>
      <View style={styles.alertHeader}>
        <View
          style={[
            styles.levelBadge,
            {
              backgroundColor:
                ALERT_LEVEL_COLORS[
                  alert.alertLevel as keyof typeof ALERT_LEVEL_COLORS
                ] || colors.info,
            },
          ]}
        >
          <Text style={styles.levelBadgeText}>{alert.alertLevel}</Text>
        </View>
        <Text style={[styles.alertMeta, { color: colors.textMuted }]}>
          {alert.dateTime}
        </Text>
      </View>
      <Text style={[styles.alertTitle, { color: colors.text }]}>
        {alert.title}
      </Text>
      <Text style={[styles.metaText, { color: colors.textMuted }]} numberOfLines={2}>
        {alert.affectedArea || alert.message}
      </Text>
    </View>
  );
}

export default function AlertsScreen() {
  const { colors } = useTheme();
  const slide = useRef(new Animated.Value(40)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const [alerts, setAlerts] = useState<SafetyAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Animated.parallel([
      Animated.spring(slide, {
        toValue: 0,
        useNativeDriver: true,
        friction: 8,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 280,
        useNativeDriver: true,
      }),
    ]).start();
  }, [slide, opacity]);

  useEffect(() => {
    fetchSafetyAlerts()
      .then(setAlerts)
      .catch((e) =>
        setError(e instanceof Error ? e.message : "Failed to load alerts")
      )
      .finally(() => setLoading(false));
  }, []);

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]} edges={["bottom"]}>
      <Animated.View
        style={{ flex: 1, opacity, transform: [{ translateY: slide }] }}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          {loading ? (
            <ActivityIndicator color={colors.navy} style={{ marginTop: 24 }} />
          ) : null}
          {error ? (
            <Text style={{ color: colors.textMuted, marginBottom: 12 }}>{error}</Text>
          ) : null}
          {!loading && !error && alerts.length === 0 ? (
            <Text style={{ color: colors.textMuted }}>No safety alerts in the database.</Text>
          ) : null}

          {alerts.map((alert) => (
            <AlertCard key={alert.id} alert={alert} colors={colors} />
          ))}

          <TouchableOpacity
            style={styles.supportLink}
            onPress={() => router.push("/support")}
          >
            <Ionicons name="heart" size={20} color="#FFFFFF" />
            <Text style={styles.supportTitle}>Need support right now?</Text>
            <Text style={styles.arrow}>→</Text>
          </TouchableOpacity>
          <View style={{ height: 40 }} />
        </ScrollView>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { padding: 18, paddingBottom: 40 },
  alertCard: {
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
  },
  alertHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  levelBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  levelBadgeText: { color: "#0A0A3D", fontSize: 11, fontWeight: "800" },
  alertMeta: { fontSize: 12 },
  alertTitle: {
    fontWeight: "800",
    fontSize: 16,
    marginBottom: 4,
  },
  metaText: { fontSize: 13 },
  supportLink: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#16A34A",
    borderRadius: 16,
    padding: 16,
    marginTop: 8,
  },
  supportTitle: { flex: 1, color: "#FFFFFF", fontWeight: "800", fontSize: 15 },
  arrow: { color: "#FFFFFF", fontSize: 18, fontWeight: "700" },
});
