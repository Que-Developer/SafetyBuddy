import { CARD_SHADOW } from "@/constants/theme";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { isSecurityRole } from "@/services/database";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function LoginScreen() {
  const { colors } = useTheme();
  const { login, apiOnline } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const onLogin = async () => {
    setError("");
    if (!email.trim() || !password) {
      setError("Email and password are required.");
      return;
    }
    if (!apiOnline) {
      setError("Unable to sign in right now. Please try again shortly.");
      return;
    }

    setLoading(true);
    const result = await login(email, password);
    setLoading(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    if (isSecurityRole(result.user.role)) {
      router.replace("/ResponderDashboard");
    } else {
      router.replace("/(tabs)/home");
    }
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={[styles.heading, { color: colors.text }]}>Login</Text>

          <View style={[styles.card, { backgroundColor: colors.card }]}>
            <Text style={[styles.label, { color: colors.text }]}>Email Address</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.white, color: colors.text }]}
              placeholder="e.g JohnDoe@anonymous.com"
              placeholderTextColor="#8A8A9A"
              autoCapitalize="none"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
            />

            <Text style={[styles.label, { color: colors.text }]}>Password</Text>
            <View style={[styles.passwordRow, { backgroundColor: colors.white }]}>
              <TextInput
                style={[styles.passwordInput, { color: colors.text }]}
                placeholder="e.g Abcd12345!"
                placeholderTextColor="#8A8A9A"
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
                onSubmitEditing={onLogin}
                returnKeyType="go"
              />
              <TouchableOpacity
                style={styles.eyeBtn}
                onPress={() => setShowPassword((v) => !v)}
                accessibilityLabel={showPassword ? "Hide password" : "Show password"}
              >
                <Ionicons
                  name={showPassword ? "eye-off-outline" : "eye-outline"}
                  size={22}
                  color={colors.text}
                />
              </TouchableOpacity>
            </View>

            {error ? (
              <Text style={[styles.error, { color: colors.danger }]}>{error}</Text>
            ) : null}

            <TouchableOpacity
              style={[styles.primaryBtn, { backgroundColor: colors.navy }]}
              onPress={onLogin}
              disabled={loading}
              accessibilityRole="button"
              accessibilityLabel="Login"
            >
              {loading ? (
                <ActivityIndicator color={colors.white} />
              ) : (
                <Text style={[styles.primaryBtnText, { color: colors.white }]}>Login</Text>
              )}
            </TouchableOpacity>
          </View>

          <Text style={[styles.orText, { color: colors.text }]}>Or sign in using</Text>
          <TouchableOpacity
            style={[styles.msBtn, { backgroundColor: colors.navy }]}
            onPress={() => setError("Please use email login with a campus account.")}
          >
            <View style={styles.msLogo}>
              <View style={[styles.msSquare, { backgroundColor: "#F25022" }]} />
              <View style={[styles.msSquare, { backgroundColor: "#7FBA00" }]} />
              <View style={[styles.msSquare, { backgroundColor: "#00A4EF" }]} />
              <View style={[styles.msSquare, { backgroundColor: "#FFB900" }]} />
            </View>
            <Text style={[styles.msText, { color: colors.white }]}>Microsoft</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    // backgroundColor is applied inline from theme
  },
  scroll: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 22,
    paddingBottom: 40,
  },
  heading: {
    fontFamily: Platform.select({ ios: "Georgia", android: "serif", default: "serif" }),
    fontSize: 40,
    fontWeight: "700",
    marginTop: 18,
    marginBottom: 18,
  },
  card: {
    borderRadius: 18,
    padding: 18,
    ...CARD_SHADOW,
  },
  label: {
    fontWeight: "700",
    fontSize: 13,
    marginBottom: 6,
    marginTop: 8,
  },
  input: {
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "rgba(0,4,88,0.08)",
  },
  passwordRow: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(0,4,88,0.08)",
    marginBottom: 8,
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  eyeBtn: {
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  error: {
    fontSize: 13,
    marginTop: 4,
    marginBottom: 4,
  },
  primaryBtn: {
    marginTop: 12,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  primaryBtnText: {
    fontWeight: "800",
    fontSize: 16,
  },
  orText: {
    marginTop: 22,
    marginBottom: 12,
    textAlign: "center",
    fontWeight: "600",
  },
  msBtn: {
    borderRadius: 12,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    ...CARD_SHADOW,
  },
  msLogo: {
    width: 18,
    height: 18,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 2,
  },
  msSquare: { width: 8, height: 8 },
  msText: {
    fontWeight: "800",
    fontSize: 16,
  },
});