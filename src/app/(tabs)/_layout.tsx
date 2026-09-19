import { ShakeToPanicListener } from "@/components/ShakeToPanicListener";
import { useTheme } from "@/context/ThemeContext";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Tabs } from "expo-router";
import { StyleSheet, View } from "react-native";

export default function TabsLayout() {
  const { colors } = useTheme();

  return (
    <>
    <ShakeToPanicListener />
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: colors.bg },
        headerShadowVisible: false,
        headerTintColor: colors.navy,
        headerTitleStyle: { fontWeight: "800" },
        tabBarActiveTintColor: colors.navy,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor: colors.bg,
          borderTopWidth: StyleSheet.hairlineWidth,
          borderTopColor: colors.cardAlt,
          height: 72,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "700",
          marginTop: 2,
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          headerShown: false,
          tabBarIcon: ({ focused, color }) => (
            <Ionicons
              name={focused ? "home" : "home-outline"}
              color={color}
              size={24}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="map"
        options={{
          title: "Map",
          headerShown: false,
          tabBarIcon: ({ focused, color }) => (
            <Ionicons
              name={focused ? "map" : "map-outline"}
              color={color}
              size={24}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="panic"
        options={{
          title: "Panic",
          headerShown: false,
          tabBarLabel: "Panic",
          tabBarIcon: () => (
            <View style={styles.panicBtn}>
              <Ionicons name="warning" color="#FFFFFF" size={28} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="report"
        options={{
          title: "Reports",
          headerShown: false,
          tabBarIcon: ({ focused, color }) => (
            <Ionicons
              name={focused ? "document-text" : "document-text-outline"}
              color={color}
              size={24}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ focused, color }) => (
            <Ionicons
              name={focused ? "person" : "person-outline"}
              color={color}
              size={24}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="resources"
        options={{ href: null, title: "Resources" }}
      />
    </Tabs>
    </>
  );
}

const styles = StyleSheet.create({
  panicBtn: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: "#E63946",
    alignItems: "center",
    justifyContent: "center",
    marginTop: -22,
    borderWidth: 4,
    borderColor: "#FFFFFF",
    shadowColor: "#E63946",
    shadowOpacity: 0.45,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 10,
  },
});
