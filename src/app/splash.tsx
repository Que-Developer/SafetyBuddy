import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { isSecurityRole } from "@/services/database";
import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Animated, Image, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const logo = require("../../assets/visily-image-4.png");

export default function SplashScreen() {
  const { ready, user } = useAuth();
  const { ready: themeReady, hasChosen, colors } = useTheme();
  const progress = useRef(new Animated.Value(0)).current;
  const [done, setDone] = useState(false);

  useEffect(() => {
    Animated.timing(progress, {
      toValue: 1,
      duration: 3000,
      useNativeDriver: false,
    }).start(() => setDone(true));
  }, [progress]);

  useEffect(() => {
    if (!ready || !themeReady || !done) return;
    if (user) {
      if (isSecurityRole(user.role)) {
        router.replace("/ResponderDashboard");
      } else {
        router.replace("/(tabs)/home");
      }
      return;
    }
    if (!hasChosen) {
      router.replace("/theme-select");
    } else {
      router.replace("/login");
    }
  }, [ready, themeReady, done, user, hasChosen]);

  const width = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ["8%", "100%"],
  });

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]}>
      <View style={styles.center}>
       <Image 
          source={logo} 
          style={styles.logo} 
          resizeMode="contain" 
        />
      </View>

      <View style={styles.footer}>
        <Text style={[styles.tagline, { color: colors.text }]}>
          SafeStep Protecting Your Academic Journey
        </Text>
        <View style={[styles.track, { borderColor: colors.navy, backgroundColor: colors.navy }]}>
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
    width: 280,   // Adjust this to make the logo bigger or smaller
    height: 280,  // Keep height and width the same to keep it square
  },
});
