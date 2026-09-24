import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { useLocale } from "@/i18n/LocaleContext";
import { isSecurityRole } from "@/services/database";
import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Animated, Image, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const logo = require("../../assets/visily-image-4.png");

// First screen on launch — short wait, then send people where they belong.
export default function SplashScreen() {
  const { ready, user } = useAuth();
  const { ready: themeReady, hasChosen, colors } = useTheme();
  const { ready: localeReady, t } = useLocale();
  const progress = useRef(new Animated.Value(0)).current;
  const [done, setDone] = useState(false);

  useEffect(() => {
    // Fill the loading bar over ~3 seconds.
    Animated.timing(progress, {
      toValue: 1,
      duration: 3000,
      useNativeDriver: false,
    }).start(() => setDone(true));
  }, [progress]);

  useEffect(() => {
    // Don't navigate until auth, theme, language, and the bar are ready.
    if (!ready || !themeReady || !localeReady || !done) return;
    if (user) {
      // Already logged in — security goes to the dashboard, students to home.
      if (isSecurityRole(user.role)) {
        router.replace("/ResponderDashboard");
      } else {
        router.replace("/(tabs)/home");
      }
      return;
    }
    // New visitors pick a theme first; everyone else goes to login.
    if (!hasChosen) {
      router.replace("/theme-select");
    } else {
      router.replace("/login");
    }
  }, [ready, themeReady, localeReady, done, user, hasChosen]);

  // Stretch the white bar from a thin start to full width.
  const width = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ["8%", "100%"],
  });

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]}>
      <View style={styles.center}>
        <Image source={logo} style={styles.logo} resizeMode="contain" />
      </View>

      <View style={styles.footer}>
        <Text style={[styles.tagline, { color: colors.text }]}>
          {t("appName")} — {t("splashTagline")}
        </Text>
        <View
          style={[
            styles.track,
            { borderColor: colors.navy, backgroundColor: colors.navy },
          ]}
        >
          <Animated.View
            style={[styles.fill, { width, backgroundColor: colors.white }]}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    paddingHorizontal: 28,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  footer: {
    paddingBottom: 48,
    alignItems: "center",
  },
  tagline: {
    fontSize: 13,
    fontStyle: "italic",
    marginBottom: 14,
    textAlign: "center",
  },
  track: {
    width: "100%",
    height: 10,
    borderRadius: 6,
    borderWidth: 2,
    overflow: "hidden",
  },
  fill: {
    height: "100%",
  },
  logo: {
    width: 280,
    height: 280,
  },
});
