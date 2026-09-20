import { AppHeader, type HeaderTipKey } from "@/components/AppHeader";
import { FloatingChatbot } from "@/components/FloatingChatbot";
import { ShakeToPanicListener } from "@/components/ShakeToPanicListener";
import { useSafetyModes } from "@/context/SafetyModesContext";
import { useTheme } from "@/context/ThemeContext";
import { useA11y } from "@/hooks/useA11y";
import { useLocale } from "@/i18n/LocaleContext";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Tabs } from "expo-router";
import { StyleSheet, View } from "react-native";

function tipFor(name: string): HeaderTipKey {
  switch (name) {
    case "home":
      return "tipHome";
    case "map":
      return "tipMap";
    case "panic":
      return "tipPanic";
    case "report":
      return "tipReports";
    case "profile":
      return "tipProfile";
    default:
      return "tipGeneric";
  }
}

export default function TabsLayout() {
  const { colors } = useTheme();
  const { t } = useLocale();
  const a11y = useA11y();
  const { iconSize } = useSafetyModes();

  return (
    <>
      <ShakeToPanicListener />
      <Tabs
        screenOptions={({ route }) => ({
          header: () => (
            <AppHeader
              title={
                route.name === "home"
                  ? t("appName")
                  : route.name === "map"
                    ? t("tabMap")
                    : route.name === "panic"
                      ? t("tabPanic")
                      : route.name === "report"
                        ? t("tabReports")
                        : route.name === "profile"
                          ? t("tabProfile")
                          : t("tabResources")
              }
              tipKey={tipFor(route.name)}
            />
          ),
          headerShown: true,
          headerStyle: { backgroundColor: colors.bg },
          headerShadowVisible: false,
          headerTintColor: colors.navy,
          headerTitleStyle: { fontWeight: "800", fontSize: 17 * a11y.scale },
          tabBarActiveTintColor: colors.navy,
          tabBarInactiveTintColor: a11y.muted,
          tabBarStyle: {
            backgroundColor: colors.bg,
            borderTopWidth: StyleSheet.hairlineWidth,
            borderTopColor: colors.tileBorder,
            height: a11y.tabBarHeight,
            paddingBottom: 8,
            paddingTop: 6,
          },
          tabBarLabelStyle: {
            fontSize: a11y.tabLabel,
            fontWeight: a11y.fontWeight,
            marginTop: 2,
          },
        })}
      >
        <Tabs.Screen
          name="home"
          options={{
            title: t("tabHome"),
            tabBarAccessibilityLabel: t("tabHome"),
            tabBarIcon: ({ focused, color }) => (
              <Ionicons
                name={focused ? "home" : "home-outline"}
                color={color}
                size={iconSize}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="map"
          options={{
            title: t("tabMap"),
            tabBarAccessibilityLabel: t("tabMap"),
            tabBarIcon: ({ focused, color }) => (
              <Ionicons
                name={focused ? "map" : "map-outline"}
                color={color}
                size={iconSize}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="panic"
          options={{
            title: t("tabPanic"),
            tabBarLabel: t("tabPanic"),
            tabBarAccessibilityLabel: t("tabPanic"),
            tabBarIcon: () => (
              <View
                style={[
                  styles.panicBtn,
                  {
                    backgroundColor: colors.danger,
                    borderColor: colors.white,
                    width: a11y.enabled ? 64 : 58,
                    height: a11y.enabled ? 64 : 58,
                    borderRadius: a11y.enabled ? 32 : 29,
                  },
                ]}
                accessibilityElementsHidden
                importantForAccessibility="no-hide-descendants"
              >
                <Ionicons
                  name="warning"
                  color={colors.white}
                  size={a11y.enabled ? 32 : 28}
                />
              </View>
            ),
          }}
        />
        <Tabs.Screen
          name="report"
          options={{
            title: t("tabReports"),
            tabBarAccessibilityLabel: t("tabReports"),
            tabBarIcon: ({ focused, color }) => (
              <Ionicons
                name={focused ? "document-text" : "document-text-outline"}
                color={color}
                size={iconSize}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: t("tabProfile"),
            tabBarAccessibilityLabel: t("tabProfile"),
            tabBarIcon: ({ focused, color }) => (
              <Ionicons
                name={focused ? "person" : "person-outline"}
                color={color}
                size={iconSize}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="resources"
          options={{ href: null, title: t("tabResources") }}
        />
      </Tabs>
      <FloatingChatbot />
    </>
  );
}

const styles = StyleSheet.create({
  panicBtn: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: -22,
    borderWidth: 4,
    shadowColor: "#E63946",
    shadowOpacity: 0.45,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 10,
  },
});
