import { CARD_SHADOW } from "@/constants/theme";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { useLocale } from "@/i18n/LocaleContext";
import { isSecurityRole } from "@/services/database";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Keyboard,
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
import Svg, { Ellipse, Path } from "react-native-svg";

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get("window");
const HERO_H_FULL = Math.round(SCREEN_H * 0.44);
const HERO_H_COMPACT = Math.round(SCREEN_H * 0.22);
const WAVE_H = Math.round(SCREEN_W * 0.48);

const WAVE_PATH =
  "M0,48 C55,55 90,98 145,102 C195,105 225,70 265,48 C310,24 350,16 400,20 L400,120 L0,120 Z";

function TopoPattern({ stroke, height }: { stroke: string; height: number }) {
  return (
    <Svg
      width={SCREEN_W}
      height={height}
      style={StyleSheet.absoluteFill}
      pointerEvents="none"
    >
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <Ellipse
          key={`l-${i}`}
          cx={SCREEN_W * 0.18}
          cy={height * 0.15}
          rx={SCREEN_W * (0.28 + i * 0.12)}
          ry={height * (0.22 + i * 0.1)}
          stroke={stroke}
          strokeWidth={1.4}
          fill="none"
          opacity={0.08 + i * 0.025}
        />
      ))}
      {[0, 1, 2, 3].map((i) => (
        <Ellipse
          key={`r-${i}`}
          cx={SCREEN_W * 0.82}
          cy={height * 0.28}
          rx={SCREEN_W * (0.22 + i * 0.1)}
          ry={height * (0.18 + i * 0.08)}
          stroke={stroke}
          strokeWidth={1.2}
          fill="none"
          opacity={0.07 + i * 0.02}
        />
      ))}
    </Svg>
  );
}

function LoginWave({ fill }: { fill: string }) {
  return (
    <View style={styles.waveWrap} pointerEvents="none">
      <Svg
        width={SCREEN_W}
        height={WAVE_H}
        viewBox="0 0 400 120"
        preserveAspectRatio="none"
      >
        <Path d={WAVE_PATH} fill={fill} />
      </Svg>
    </View>
  );
}

export default function LoginScreen() {
  const { colors, selectedTheme } = useTheme();
  const { t } = useLocale();
  const { login, apiOnline } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [keyboardOpen, setKeyboardOpen] = useState(false);

  const headerBg = selectedTheme === "dark" ? colors.bgDeep : colors.bg;
  const formBg = colors.white;
  const accent = selectedTheme === "dark" ? colors.accent : colors.navy;
  const formText = "#000458";
  const formMuted = "#5A5A7A";
  const formDim = "#8A8A9A";
  const lineIdle = "rgba(0,4,88,0.16)";
  const topoStroke = selectedTheme === "dark" ? "#FFD24C" : "#000458";
  const heroH = keyboardOpen ? HERO_H_COMPACT : HERO_H_FULL;

  const brandColor = useMemo(
    () => (selectedTheme === "dark" ? colors.accent : colors.navy),
    [selectedTheme, colors]
  );

  useEffect(() => {
    const showEvt =
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvt =
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";
    const showSub = Keyboard.addListener(showEvt, () => setKeyboardOpen(true));
    const hideSub = Keyboard.addListener(hideEvt, () => setKeyboardOpen(false));
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const onLogin = async () => {
    setError("");
    if (!email.trim() || !password) {
      setError(t("emailPasswordRequired"));
      return;
    }
    if (!apiOnline) {
      setError(t("unableToSignIn"));
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
    <View style={[styles.root, { backgroundColor: formBg }]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 8 : 0}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          showsVerticalScrollIndicator={false}
          automaticallyAdjustKeyboardInsets
        >
          <View
            style={[styles.hero, { height: heroH, backgroundColor: headerBg }]}
          >
            <TopoPattern stroke={topoStroke} height={heroH} />
            <SafeAreaView edges={["top"]} style={styles.heroSafe}>
              <Text style={[styles.brand, { color: brandColor }]}>
                {t("appName")}
              </Text>
            </SafeAreaView>
            <LoginWave fill={formBg} />
          </View>

          <View style={styles.formPad}>
            <View style={styles.titleBlock}>
              <Text style={[styles.heading, { color: formText }]}>
                {t("login")}
              </Text>
              <View
                style={[styles.titleUnderline, { backgroundColor: accent }]}
              />
            </View>

            <Text style={[styles.label, { color: formText }]}>
              {t("emailAddress")}
            </Text>
            <View style={[styles.fieldRow, { borderBottomColor: accent }]}>
              <Ionicons name="mail-outline" size={20} color={formDim} />
              <View
                style={[styles.fieldDivider, { backgroundColor: lineIdle }]}
              />
              <TextInput
                style={[styles.underlineInput, { color: formText }]}
                placeholder="john.doe@email.com"
                placeholderTextColor={formDim}
                autoCapitalize="none"
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail}
                returnKeyType="next"
              />
            </View>

            <Text style={[styles.label, { color: formText, marginTop: 22 }]}>
              {t("password")}
            </Text>
            <View style={[styles.fieldRow, { borderBottomColor: lineIdle }]}>
              <Ionicons name="lock-closed-outline" size={20} color={formDim} />
              <View
                style={[styles.fieldDivider, { backgroundColor: lineIdle }]}
              />
              <TextInput
                style={[styles.underlineInput, { color: formText }]}
                placeholder="••••••••••"
                placeholderTextColor={formDim}
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
                onSubmitEditing={onLogin}
                returnKeyType="go"
              />
              <TouchableOpacity
                onPress={() => setShowPassword((v) => !v)}
                accessibilityLabel={
                  showPassword ? t("hidePassword") : t("showPassword")
                }
                hitSlop={8}
              >
                <Ionicons
                  name={showPassword ? "eye-off-outline" : "eye-outline"}
                  size={20}
                  color={formDim}
                />
              </TouchableOpacity>
            </View>

            <View style={styles.rowBetween}>
              <TouchableOpacity
                style={styles.rememberRow}
                onPress={() => setRememberMe((v) => !v)}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: rememberMe }}
              >
                <View
                  style={[
                    styles.checkbox,
                    {
                      backgroundColor: rememberMe ? accent : "transparent",
                      borderColor: accent,
                    },
                  ]}
                >
                  {rememberMe ? (
                    <Ionicons name="checkmark" size={14} color={formBg} />
                  ) : null}
                </View>
                <Text style={[styles.rememberText, { color: formText }]}>
                  {t("rememberMe")}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() =>
                  setError("Password reset is not available in this demo.")
                }
              >
                <Text style={[styles.forgot, { color: accent }]}>
                  {t("forgotPassword")}
                </Text>
              </TouchableOpacity>
            </View>

            {error ? (
              <Text style={[styles.error, { color: colors.danger }]}>
                {error}
              </Text>
            ) : null}

            <TouchableOpacity
              style={[
                styles.primaryBtn,
                { backgroundColor: accent },
                CARD_SHADOW,
              ]}
              onPress={onLogin}
              disabled={loading}
              accessibilityRole="button"
              accessibilityLabel={t("login")}
            >
              {loading ? (
                <ActivityIndicator color={formBg} />
              ) : (
                <Text style={[styles.primaryBtnText, { color: formBg }]}>
                  {t("login")}
                </Text>
              )}
            </TouchableOpacity>

            <Text style={[styles.orText, { color: formMuted }]}>
              {t("orSignInUsing")}
            </Text>

            <TouchableOpacity
              style={[
                styles.msBtn,
                { backgroundColor: formBg, borderColor: lineIdle },
                CARD_SHADOW,
              ]}
              onPress={() => setError(t("unableToSignIn"))}
            >
              <View style={styles.msLogo}>
                <View style={[styles.msSquare, { backgroundColor: "#F25022" }]} />
                <View style={[styles.msSquare, { backgroundColor: "#7FBA00" }]} />
                <View style={[styles.msSquare, { backgroundColor: "#00A4EF" }]} />
                <View style={[styles.msSquare, { backgroundColor: "#FFB900" }]} />
              </View>
              <Text style={[styles.msText, { color: formText }]}>Microsoft</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.footer}
              onPress={() => router.push("/role-select")}
            >
              <Text style={[styles.footerMuted, { color: formMuted }]}>
                Don't have an Account?{" "}
              </Text>
              <Text style={[styles.footerLink, { color: accent }]}>Sign up</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  hero: {
    width: "100%",
    overflow: "hidden",
    justifyContent: "flex-start",
  },
  heroSafe: {
    paddingHorizontal: 24,
    paddingTop: 8,
    zIndex: 2,
  },
  brand: {
    fontSize: 18,
    fontWeight: "900",
    letterSpacing: 0.3,
  },
  waveWrap: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: WAVE_H,
  },
  scroll: {
    flexGrow: 1,
    paddingBottom: 48,
  },
  formPad: {
    paddingHorizontal: 28,
    paddingTop: 4,
  },
  titleBlock: {
    marginBottom: 28,
    alignSelf: "flex-start",
  },
  heading: {
    fontSize: 34,
    fontWeight: "800",
  },
  titleUnderline: {
    marginTop: 6,
    height: 3,
    width: 72,
    borderRadius: 2,
  },
  label: {
    fontWeight: "700",
    fontSize: 13,
    marginBottom: 8,
  },
  fieldRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderBottomWidth: 1.5,
    paddingBottom: 10,
  },
  fieldDivider: {
    width: StyleSheet.hairlineWidth,
    height: 18,
  },
  underlineInput: {
    flex: 1,
    fontSize: 15,
    paddingVertical: 4,
  },
  rowBetween: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 18,
    marginBottom: 8,
  },
  rememberRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 5,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  rememberText: {
    fontSize: 13,
    fontWeight: "600",
  },
  forgot: {
    fontSize: 13,
    fontWeight: "700",
  },
  error: {
    fontSize: 13,
    marginTop: 10,
    marginBottom: 4,
  },
  primaryBtn: {
    marginTop: 22,
    borderRadius: 28,
    paddingVertical: 16,
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
    fontSize: 13,
  },
  msBtn: {
    borderRadius: 28,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    borderWidth: 1,
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
  footer: {
    marginTop: 28,
    flexDirection: "row",
    justifyContent: "center",
    flexWrap: "wrap",
  },
  footerMuted: { fontSize: 13, fontWeight: "600" },
  footerLink: { fontSize: 13, fontWeight: "800" },
});
