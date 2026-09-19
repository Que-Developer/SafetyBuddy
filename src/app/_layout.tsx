import { Stack } from "expo-router";
import * as SystemUI from "expo-system-ui";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { LogBox, Platform, StatusBar as RNStatusBar } from "react-native";
import { AuthGate } from "@/components/AuthGate";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider, useTheme } from "@/context/ThemeContext";

LogBox.ignoreAllLogs(true);

function RootStack() {
  const { colors, mode } = useTheme();
  const headerOpts = {
    headerStyle: { backgroundColor: colors.bg },
    headerTintColor: colors.navy,
    headerTitleStyle: { fontWeight: "800" as const },
    animation: "slide_from_bottom" as const,
  };

  useEffect(() => {
    SystemUI.setBackgroundColorAsync(colors.bg).catch(() => {});
    if (Platform.OS === "android") {
      RNStatusBar.setBackgroundColor(colors.bg);
      RNStatusBar.setBarStyle(
        mode === "navy" ? "light-content" : "dark-content"
      );
      RNStatusBar.setTranslucent(false);
    }
  }, [colors.bg, mode]);

  return (
    <>
      <StatusBar style={mode === "navy" ? "light" : "dark"} hidden={false} />
      <AuthGate>
        <Stack
          screenOptions={{
            contentStyle: { backgroundColor: colors.bg },
          }}
        >
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="splash" options={{ headerShown: false }} />
          <Stack.Screen name="theme-select" options={{ headerShown: false }} />
          <Stack.Screen name="login" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen
            name="alerts"
            options={{
              title: "Safety Alerts",
              presentation: "modal",
              ...headerOpts,
            }}
          />
          <Stack.Screen name="support" options={{ title: "Support Services", ...headerOpts }} />
          <Stack.Screen name="emergency" options={{ title: "Call for Help", ...headerOpts }} />
          <Stack.Screen name="walk-with-me" options={{ title: "Walk With Me", ...headerOpts }} />
          <Stack.Screen name="privacy" options={{ title: "Privacy Notice", ...headerOpts }} />
          <Stack.Screen name="role-select" options={{ title: "Demo Role", ...headerOpts }} />
          <Stack.Screen
            name="report-success"
            options={{ headerShown: false, presentation: "modal" }}
          />
          <Stack.Screen name="ResponderDashboard" options={{ headerShown: false }} />
          <Stack.Screen name="admin" options={{ title: "Admin Manager", ...headerOpts }} />
          <Stack.Screen name="panicCountdownAlert" options={{ headerShown: false }} />
          <Stack.Screen name="AlertCanceled" options={{ headerShown: false }} />
          <Stack.Screen name="+not-found" options={{ headerShown: false }} />
        </Stack>
      </AuthGate>
    </>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <RootStack />
      </AuthProvider>
    </ThemeProvider>
  );
}

