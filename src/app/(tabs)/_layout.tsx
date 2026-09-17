import { Tabs } from "expo-router";
import { StyleSheet } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";

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

const CARD_SHADOW = {
  shadowColor: COLORS.shadow,
  shadowOffset: { width: 0, height: 6 },
  shadowOpacity: 0.15,
  shadowRadius: 10,
  elevation: 4,
};

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        // Header
        headerStyle: { backgroundColor: COLORS.bg },
        headerShadowVisible: false,
        headerTintColor: COLORS.text,
        headerTitleStyle: { fontWeight: "800" },

        // Tab bar colors
        tabBarActiveTintColor: COLORS.text,
        tabBarInactiveTintColor: COLORS.textMuted,

        // Tab bar container (your styles.tabBar)
        tabBarStyle: styles.tabBar,

        // Each tab item (your styles.tabItem)
        tabBarItemStyle: styles.tabItem,

        // Label (your styles.tabLabel)
        tabBarLabelStyle: styles.tabLabel,
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "home-sharp" : "home-outline"}
              color={color}
              size={22}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="map"
        options={{
          title: "Map",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "map-sharp" : "map-outline"}
              color={color}
              size={22}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="panic"
        options={{
          title: "Panic",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "alert-circle" : "alert-circle-outline"}
              color={color}
              size={22}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="report"
        options={{
          title: "Report",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "information-circle" : "information-circle-outline"}
              color={color}
              size={22}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "person-sharp" : "person-outline"}
              color={color}
              size={22}
            />
          ),
        }}
      />
      <Tabs.Screen name="+not-found" options={{ headerShown: false }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: "absolute",
    left: 12,
    right: 12,
    bottom: 12,
    backgroundColor: "#F3D98A",
    borderRadius: 22,
    paddingTop: 8,
    paddingBottom: 8,
    height: 68,
    borderTopWidth: 0,
    ...CARD_SHADOW,
  },
  tabItem: {
    alignItems: "center",
    justifyContent: "center",
  },
  tabLabel: {
    color: COLORS.text,
    fontSize: 11,
    fontWeight: "600",
  },
});