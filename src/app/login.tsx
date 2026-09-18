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
import { useAuth } from "@/context/AuthContext";
import { CARD_SHADOW, COLORS } from "@/constants/theme";
import { isSecurityRole } from "@/services/database";

export default function LoginScreen() {
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
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.brand}>Safety Buddy</Text>
          <Text style={styles.heading}>Login</Text>

          <View style={styles.card}>
            <Text style={styles.label}>Email Address</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g JohnDoe@anonymous.com"
              placeholderTextColor="#8A8A9A"
              autoCapitalize="none"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
            />

            <Text style={styles.label}>Password</Text>
            <View style={styles.passwordRow}>
              <TextInput
                style={styles.passwordInput}
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
                  color={COLORS.navy}
                />
              </TouchableOpacity>
            </View>

            {error ? <Text style={styles.error}>{error}</Text> : null}

            <TouchableOpacity
              style={styles.primaryBtn}
              onPress={onLogin}
              disabled={loading}
              accessibilityRole="button"
              accessibilityLabel="Login"
            >
              {loading ? (
                <ActivityIndicator color={COLORS.white} />
              ) : (
                <Text style={styles.primaryBtnText}>Login</Text>
              )}
            </TouchableOpacity>
          </View>

          <Text style={styles.orText}>Or sign in using</Text>
          <TouchableOpacity
            style={styles.msBtn}
            onPress={() =>
              setError(
                "Microsoft SSO is a production concept. Use email login with a campus account."
              )
            }
          >
            <View style={styles.msLogo}>
              <View style={[styles.msSquare, { backgroundColor: "#F25022" }]} />
              <View style={[styles.msSquare, { backgroundColor: "#7FBA00" }]} />
              <View style={[styles.msSquare, { backgroundColor: "#00A4EF" }]} />
              <View style={[styles.msSquare, { backgroundColor: "#FFB900" }]} />
            </View>
            <Text style={styles.msText}>Microsoft</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  scroll: { padding: 22, paddingBottom: 40 },
  brand: {
    fontFamily: Platform.select({ ios: "Georgia", android: "serif", default: "serif" }),
    fontSize: 28,
    color: COLORS.text,
    fontWeight: "700",
    marginTop: 8,
  },
  heading: {
    fontFamily: Platform.select({ ios: "Georgia", android: "serif", default: "serif" }),
    fontSize: 40,
    color: COLORS.text,
    fontWeight: "700",
    marginTop: 18,
    marginBottom: 18,
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 18,
    padding: 18,
    ...CARD_SHADOW,
  },
  label: {
    color: COLORS.text,
    fontWeight: "700",
    fontSize: 13,
    marginBottom: 6,
    marginTop: 8,
  },
  input: {
    backgroundColor: COLORS.input,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: COLORS.text,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "rgba(0,43,91,0.08)",
  },
  passwordRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.input,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(0,43,91,0.08)",
    marginBottom: 8,
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: COLORS.text,
  },
  eyeBtn: {
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  error: {
    color: COLORS.danger,
    fontSize: 13,
    marginTop: 4,
    marginBottom: 4,
  },
  primaryBtn: {
    marginTop: 12,
    backgroundColor: COLORS.navy,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  primaryBtnText: {
    color: COLORS.white,
    fontWeight: "800",
    fontSize: 16,
  },
  orText: {
    marginTop: 22,
    marginBottom: 12,
    textAlign: "center",
    color: COLORS.text,
    fontWeight: "600",
  },
  msBtn: {
    backgroundColor: COLORS.navy,
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
  msText: { color: COLORS.white, fontWeight: "800", fontSize: 16 },
});
