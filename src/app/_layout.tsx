import { AuthGate } from "@/components/AuthGate";
import { HeaderMenuButton } from "@/components/AppHeader";
import { AuthProvider } from "@/context/AuthContext";
import { SafetyModesProvider } from "@/context/SafetyModesContext";
import { ThemeProvider, useTheme } from "@/context/ThemeContext";
import { LocaleProvider, useLocale } from "@/i18n/LocaleContext";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { LogBox, View } from "react-native";

LogBox.ignoreAllLogs(true);

function RootStack() {
  const { colors, selectedTheme } = useTheme();
  const { t, isRtl } = useLocale();
  const headerOpts = {
    headerStyle: { backgroundColor: colors.bg },
    headerTintColor: colors.navy,
    headerTitleStyle: { fontWeight: "800" as const },
    animation: "slide_from_bottom" as const,
    headerRight: () => <HeaderMenuButton tipKey="tipGeneric" />,
  };

  return (
    <View style={{ flex: 1, direction: isRtl ? "rtl" : "ltr" }}>
      <StatusBar style={selectedTheme === "dark" ? "light" : "dark"} />
      <AuthGate>
        <Stack>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="splash" options={{ headerShown: false }} />
          <Stack.Screen name="theme-select" options={{ headerShown: false }} />
          <Stack.Screen name="login" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen
            name="alerts"
            options={{
              title: t("safetyAlertsTitle"),
              presentation: "modal",
              ...headerOpts,
            }}
          />
          <Stack.Screen
            name="support"
            options={{ title: t("supportServicesTitle"), ...headerOpts }}
          />
          <Stack.Screen
            name="emergency"
            options={{ title: t("callForHelp"), ...headerOpts }}
          />
          <Stack.Screen
            name="walk-with-me"
            options={{ title: t("walkWithMe"), ...headerOpts }}
          />
          <Stack.Screen
            name="privacy"
            options={{ title: t("privacyNoticeTitle"), ...headerOpts }}
          />
          <Stack.Screen name="role-select" options={{ title: t("demoRole"), ...headerOpts }} />
          <Stack.Screen
            name="report-success"
            options={{ headerShown: false, presentation: "modal" }}
          />
          <Stack.Screen name="ResponderDashboard" options={{ headerShown: false }} />
          <Stack.Screen name="admin" options={{ title: t("adminManager"), ...headerOpts }} />
          <Stack.Screen name="panicCountdownAlert" options={{ headerShown: false }} />
          <Stack.Screen name="AlertCanceled" options={{ headerShown: false }} />
          <Stack.Screen name="qr-scan" options={{ title: t("qrScan"), ...headerOpts }} />
          <Stack.Screen name="chatbot" options={{ title: t("chatbot"), ...headerOpts }} />
          <Stack.Screen
            name="offline-emergency"
            options={{ title: t("offlineEmergency"), ...headerOpts }}
          />
          <Stack.Screen name="safe-routes" options={{ title: t("safeRoutes"), ...headerOpts }} />
          <Stack.Screen name="heatmap" options={{ title: t("heatmap"), ...headerOpts }} />
          <Stack.Screen name="wearable-panic" options={{ title: t("wearable"), ...headerOpts }} />
          <Stack.Screen
            name="security-integration"
            options={{ title: t("securityLink"), ...headerOpts }}
          />
          <Stack.Screen
            name="safety-settings"
            options={{ title: t("settings"), ...headerOpts }}
          />
          <Stack.Screen name="+not-found" options={{ headerShown: false }} />
        </Stack>
      </AuthGate>
    </View>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <LocaleProvider>
        <SafetyModesProvider>
          <AuthProvider>
            <RootStack />
          </AuthProvider>
        </SafetyModesProvider>
      </LocaleProvider>
    </ThemeProvider>
  );
}
