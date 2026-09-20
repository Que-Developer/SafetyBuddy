import { Redirect, useSegments } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { isSecurityRole } from "@/services/database";

const PUBLIC = new Set(["index", "splash", "login", "theme-select"]);

export function AuthGate({ children }: { children: React.ReactNode }) {
  const { ready, user, isAdmin } = useAuth();
  const { colors, ready: themeReady } = useTheme();
  const segments = useSegments();
  const root = String(segments[0] ?? "splash");

  if (!ready || !themeReady) {
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

  // Must be logged in for protected screens
  if (!user && !onPublic) {
    return <Redirect href="/login" />;
  }

  // Already logged in — leave auth screens
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

    // Students cannot open security / admin areas
    if (!security && (root === "ResponderDashboard" || root === "admin")) {
      return <Redirect href="/(tabs)/home" />;
    }

    // Security staff/admin stay out of the student tab shell
    if (security && root === "(tabs)") {
      return <Redirect href="/ResponderDashboard" />;
    }

    // Only security_admin can open admin manager
    if (root === "admin" && !isAdmin) {
      return <Redirect href="/ResponderDashboard" />;
    }
  }

  return <>{children}</>;
}
