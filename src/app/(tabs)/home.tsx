import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { router } from "expo-router"

// ---- Design tokens -------------------------------------------------
const COLORS = {
  bg: "#FFD24C",
  text: "#0A0A3D",
  textMuted: "#5A5A7A",
  card: "#FFE27A",
  cardAlt: "#FFE27A",
  danger: "#E63946",
  dangerDark: "#C1121F",
  white: "#FFFFFF",
  black: "#000000",
  link: "#0A7A6B",
  shadow: "#000",
};

// ---- Small reusable pieces ----------------------------------------
type TileProps = {
  emoji: string;
  title: string;
  subtitle: string;
  onPress?: () => void;
};

function Tile({ emoji, title, subtitle, onPress }: TileProps) {
  return (
    <TouchableOpacity style={styles.tile} onPress={onPress} activeOpacity={0.85}>
      <Text style={styles.tileEmoji}>{emoji}</Text>
      <Text style={styles.tileTitle}>{title}</Text>
      <Text style={styles.tileSubtitle}>{subtitle}</Text>
    </TouchableOpacity>
  );
}

type AlertProps = {
  time: string;
  title: string;
  body: string;
};

function AlertCard({ time, title, body }: AlertProps) {
  return (
    <View style={styles.alertCard}>
      <View style={styles.alertHeader}>
        <View style={styles.alertDot} />
        <Text style={styles.alertTime}>{time}</Text>
      </View>
      <Text style={styles.alertTitle}>{title}</Text>
      <Text style={styles.alertBody}>{body}</Text>
    </View>
  );
}

// ---- Screen --------------------------------------------------------
export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.safe}>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Text style={styles.brand}>SafetyBuddy</Text>
        <Text style={styles.greeting}>Hi, Amahle</Text>
        <Text style={styles.subGreeting}>
          You're safe on campus. Here's what's happening around you.
        </Text>

        {/* Emergency SOS */}
        <TouchableOpacity style={styles.sosCard} activeOpacity={0.9} onPress={() => router.push("/(tabs)/panic")}>
          <View style={styles.sosIconWrap}>
            <Text style={styles.sosIcon}>🔔</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.sosLabel}>Emergency</Text>
            <Text style={styles.sosTitle}>Hold For SOS</Text>
            <Text style={styles.sosSub}>
              Alert sent to trusted & security contacts
            </Text>
          </View>
          <Text style={styles.sosArrow}>→</Text>
        </TouchableOpacity>

        {/* 2x2 Tiles */}
        <View style={styles.grid}>
          <Tile emoji="🚶" title="Safe Walk" subtitle="Best route" />
          <Tile emoji="👥" title="Walk with me" subtitle="Trusted Contact" onPress={() => router.push("/(tabs)/map")}/>
          <Tile emoji="📄" title="Report" subtitle="Anonymous OK" />
          <Tile emoji="📞" title="Contacts" subtitle="Anonymous OK" />
        </View>

        {/* Campus alerts header */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Campus alerts</Text>
          <TouchableOpacity>
            <Text style={styles.seeAll}>See All</Text>
          </TouchableOpacity>
        </View>

        {/* Alerts */}
        <AlertCard
          time="20 min ago"
          title="Construction near the Main Gate"
          body="Pedestrian access on the east side until Friday. Allow extra time."
        />
        <AlertCard
          time="1 hour ago"
          title="Pathway closed behind Science Building"
          body="Grounds maintenance in progress. Use the Auditorium route instead."
        />

        {/* Not feeling okay card */}
        <TouchableOpacity style={styles.wellnessCard} activeOpacity={0.9}>
          <Text style={styles.wellnessIcon}>💚</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.wellnessTitle}>Not feeling okay?</Text>
            <Text style={styles.wellnessSub}>
              Counselling, peer support & wellness tools
            </Text>
          </View>
          <Text style={styles.sosArrow}>→</Text>
        </TouchableOpacity>

        <View style={{ height: 100 }} />
      </ScrollView>

    </SafeAreaView>
  );
}

// ---- Tab bar pieces ------------------------------------------------
function TabItem({
  emoji,
  label,
  active,
}: {
  emoji: string;
  label: string;
  active?: boolean;
}) {
  return (
    <TouchableOpacity style={styles.tabItem}>
      <Text style={[styles.tabEmoji, active && { opacity: 1 }]}>{emoji}</Text>
      <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}


// ---- Styles --------------------------------------------------------
const CARD_SHADOW = {
  shadowColor: COLORS.shadow,
  shadowOffset: { width: 0, height: 6 },
  shadowOpacity: 0.15,
  shadowRadius: 10,
  elevation: 4,
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  statusBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 6,
    paddingBottom: 4,
  },
  statusTime: { color: COLORS.black, fontWeight: "700", fontSize: 14 },
  statusIcons: { color: COLORS.black, fontSize: 12 },

  scroll: { paddingHorizontal: 18, paddingTop: 8, paddingBottom: 24 },

  brand: {
    color: COLORS.text,
    fontWeight: "700",
    fontSize: 16,
    marginBottom: 12,
  },
  greeting: {
    color: COLORS.text,
    fontWeight: "800",
    fontSize: 26,
    marginBottom: 4,
  },
  subGreeting: {
    color: COLORS.text,
    opacity: 0.65,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 18,
  },

  // SOS card
  sosCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.danger,
    borderRadius: 18,
    padding: 14,
    marginBottom: 18,
    borderWidth: 2,
    borderColor: COLORS.dangerDark,
    ...CARD_SHADOW,
  },
  sosIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.white,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  sosIcon: { fontSize: 28 },
  sosLabel: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: "700",
    opacity: 0.95,
    marginBottom: 2,
  },
  sosTitle: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: "900",
    marginBottom: 2,
  },
  sosSub: { color: COLORS.white, fontSize: 12, opacity: 0.9 },
  sosArrow: {
    color: COLORS.white,
    fontSize: 20,
    marginLeft: 6,
    fontWeight: "700",
  },

  // Grid
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  tile: {
    width: "48%",
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    ...CARD_SHADOW,
  },
  tileEmoji: { fontSize: 22, marginBottom: 10 },
  tileTitle: {
    color: COLORS.text,
    fontWeight: "800",
    fontSize: 15,
    marginBottom: 2,
  },
  tileSubtitle: { color: COLORS.text, opacity: 0.6, fontSize: 12 },

  // Section header
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: { color: COLORS.text, fontWeight: "800", fontSize: 20 },
  seeAll: {
    color: COLORS.link,
    fontWeight: "700",
    fontSize: 14,
    textDecorationLine: "underline",
  },

  // Alert cards
  alertCard: {
    backgroundColor: COLORS.cardAlt,
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    ...CARD_SHADOW,
  },
  alertHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  alertDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: COLORS.danger,
    marginRight: 6,
    backgroundColor: "transparent",
  },
  alertTime: { color: COLORS.text, opacity: 0.7, fontSize: 12 },
  alertTitle: {
    color: COLORS.text,
    fontWeight: "800",
    fontSize: 15,
    marginBottom: 4,
  },
  alertBody: {
    color: COLORS.text,
    opacity: 0.7,
    fontSize: 13,
    lineHeight: 18,
  },

  // Wellness card
  wellnessCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 14,
    marginTop: 4,
    ...CARD_SHADOW,
  },
  wellnessIcon: { fontSize: 24, marginRight: 10 },
  wellnessTitle: {
    color: COLORS.text,
    fontWeight: "800",
    fontSize: 15,
    marginBottom: 2,
  },
  wellnessSub: { color: COLORS.text, opacity: 0.65, fontSize: 12 },

  // Bottom tabs
  tabBar: {
    position: "absolute",
    left: 12,
    right: 12,
    bottom: 12,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: "#F3D98A",
    borderRadius: 22,
    paddingVertical: 8,
    paddingHorizontal: 6,
    ...CARD_SHADOW,
  },
  tabItem: { alignItems: "center", flex: 1 },
  tabEmoji: { fontSize: 20, opacity: 0.55, marginBottom: 2 },
  tabLabel: { color: COLORS.text, opacity: 0.55, fontSize: 11 },
  tabLabelActive: { opacity: 1, fontWeight: "800" },

  sosTab: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: COLORS.danger,
    alignItems: "center",
    justifyContent: "center",
    marginTop: -22,
    borderWidth: 3,
    borderColor: COLORS.bg,
    ...CARD_SHADOW,
  },
  sosTabIcon: { fontSize: 24 },
});