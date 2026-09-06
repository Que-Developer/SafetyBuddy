import { Tabs } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";

export default function TabsLayout() {
  return (
  <Tabs 
    screenOptions={{
        tabBarActiveTintColor: "#ffd33d",
        headerStyle: {
            backgroundColor: "#25292e"
        },
        headerShadowVisible: false,
        headerTintColor: "#fff",
        tabBarStyle: { 
            backgroundColor: "#25292e"
        },
    }}>
    <Tabs.Screen name="home" options={{ title: "Home", tabBarIcon: ({ color, focused }) => (<Ionicons name={focused ? 'home-sharp' : 'home-outline'} color={color} size={24} />), }}/>
    <Tabs.Screen name="map" options={{ title: "Map", tabBarIcon: ({focused, color}) => (<Ionicons name={focused ? "information-circle" : "information-circle-outline"} color={color} size={24} />), }}/>
    <Tabs.Screen name="panic" options={{ title: "Panic-Button", tabBarIcon: ({ color, focused }) => (<Ionicons name={focused ? 'home-sharp' : 'home-outline'} color={color} size={24} />), }}/>
    <Tabs.Screen name="report" options={{ title: "Report", tabBarIcon: ({focused, color}) => (<Ionicons name={focused ? "information-circle" : "information-circle-outline"} color={color} size={24} />), }}/>
    <Tabs.Screen name="profile" options={{ title: "Profile", tabBarIcon: ({ color, focused }) => (<Ionicons name={focused ? 'home-sharp' : 'home-outline'} color={color} size={24} />), }}/>
    <Tabs.Screen name="+not-found" options={{ headerShown: false }} />
  </Tabs>
  );
}