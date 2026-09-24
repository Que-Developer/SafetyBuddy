import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { useLocale } from "@/i18n/LocaleContext";
import { isSecurityRole } from "@/services/database";
import { Redirect, useSegments } from "expo-router";
import { ActivityIndicator, View } from "react-native";

// Screens anyone can open without logging in.
const PUBLIC = new Set(["index", "splash", "login", "theme-select"]);

// Sends people to the right home based on role (student vs security).
export function AuthGate({ children }: { children: React.ReactNode }) {
  const { ready, user, isAdmin } = useAuth();
  const { colors, ready: themeReady } = useTheme();
  const { ready: localeReady } = useLocale();
  const segments = useSegments();
  const root = String(segments[0] ?? "splash");

  // Wait for auth, theme, and language to load so we don't flash the wrong screen.
  if (!ready || !themeReady || !localeReady) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: colors.bg,
        }}
      >
        <ActivityIndicator color={colors.navy} size="large" />
      </View>
    );
  }

  const onPublic = PUBLIC.has(root);

  // Not logged in and trying a private screen → send them to login.
  if (!user && !onPublic) {
    return <Redirect href="/login" />;
  }

  // Already logged in — skip splash / login and go to their home.
  if (
    user &&
    (root === "login" ||
      root === "splash" ||
      root === "index" ||
      root === "theme-select")
  ) {
    if (isSecurityRole(user.role)) {
      return <Redirect href="/ResponderDashboard" />;
    }
    return <Redirect href="/(tabs)/home" />;
  }

  if (user) {
    const security = isSecurityRole(user.role);

    // Students can't open security/admin screens.
    if (!security && (root === "ResponderDashboard" || root === "admin")) {
      return <Redirect href="/(tabs)/home" />;
    }

    // Security staff stay on the responder dashboard, not student tabs.
    if (security && root === "(tabs)") {
      return <Redirect href="/ResponderDashboard" />;
    }

    // Only admins get the admin manager.
    if (root === "admin" && !isAdmin) {
      return <Redirect href="/ResponderDashboard" />;
    }
  }

  return <>{children}</>;
}
