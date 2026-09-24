import { ConcernHeatMap } from "@/components/ConcernHeatMap";
import { CARD_SHADOW } from "@/constants/theme";
import { useAuth } from "@/context/AuthContext";
import { useSafetyModes } from "@/context/SafetyModesContext";
import { useTheme } from "@/context/ThemeContext";
import { HEATMAP_SPOTS } from "@/data/featureData";
import { useA11y } from "@/hooks/useA11y";
import { useLocale } from "@/i18n/LocaleContext";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const INTENSITY = {
  high: { color: "#EF4444", label: "High" },
  medium: { color: "#F59E0B", label: "Medium" },
  low: { color: "#22C55E", label: "Low" },
} as const;

// Simple offline picture when map tiles can't load (battery / low-data).
function SchematicFallback({
  colors,
}: {
  colors: ReturnType<typeof useTheme>["colors"];
}) {
  const max = Math.max(...HEATMAP_SPOTS.map((s) => s.reportCount));
  return (
    <View style={[styles.schematic, { backgroundColor: colors.card }]}>
      <Text style={[styles.schematicTitle, { color: colors.text }]}>
        Offline campus schematic
      </Text>
      <Text style={[styles.schematicSub, { color: colors.textMuted }]}>
        Live map tiles unavailable — showing saved concern density.
      </Text>
      <View style={[styles.plot, { backgroundColor: "rgba(0,0,0,0.08)" }]}>
        {HEATMAP_SPOTS.map((s) => {
          // Bigger blob = more reports at that spot.
          const size = 28 + (s.reportCount / max) * 42;
          const left = ((s.lng - 25.6135) / 0.0045) * 100;
          const top = ((s.lat + 33.9645) / 0.0055) * 100;
          return (
            <View
              key={s.id}
              style={[
                styles.blob,
                {
                  width: size,
                  height: size,
                  borderRadius: size / 2,
                  backgroundColor: INTENSITY[s.intensity].color + "66",
                  borderColor: INTENSITY[s.intensity].color,
                  left: `${Math.min(90, Math.max(4, left))}%`,
                  top: `${Math.min(85, Math.max(4, top))}%`,
                },
              ]}
            />
          );
        })}
      </View>
    </View>
  );
}

// Campus concern density — anonymous report hotspots for planning.
export default function HeatmapScreen() {
  const { colors } = useTheme();
  const { t } = useLocale();
  const a11y = useA11y();
  const { isAdmin, isSecurity } = useAuth();
  const { effectiveLowData, batteryLow } = useSafetyModes();
  const [mapFailed, setMapFailed] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const max = Math.max(...HEATMAP_SPOTS.map((s) => s.reportCount));

  // Prefer the offline schematic when the phone is struggling.
  const useSchematic = effectiveLowData || mapFailed || batteryLow;


  return (
    <SafeAreaView
      style={[styles.safe, { backgroundColor: colors.bg }]}
      edges={["bottom"]}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.intro, { color: colors.textMuted }]}>
          {t("heatmapSub")} — aggregated anonymous concerns for campus planning.
          Individuals are never shown.
        </Text>

        {/* Staff get a reminder that this view is for planning, not individuals. */}
        {(isAdmin || isSecurity) && (
          <View
            style={[
              styles.adminBanner,
              { backgroundColor: colors.card },
              CARD_SHADOW,
            ]}
          >
            <Ionicons name="eye" size={18} color={colors.navy} />
            <Text style={[styles.adminBannerText, { color: colors.text }]}>
              {t("heatmapAdminBanner")}
            </Text>
          </View>
        )}

        {batteryLow && (
          <View
            style={[
              styles.warnBanner,
              { backgroundColor: colors.card, borderColor: colors.caution },
            ]}
          >
            <Ionicons name="battery-half" size={18} color={colors.caution} />
            <Text style={{ color: colors.text, flex: 1, fontWeight: "700" }}>
              {t("batteryLow")}
            </Text>
          </View>
        )}

        <Text style={[styles.mapTitle, { color: colors.text }]}>
          Campus concern map
        </Text>

        <View style={[styles.mapShell, CARD_SHADOW]}>
          {useSchematic ? (
            <SchematicFallback colors={colors} />
          ) : (
            <ConcernHeatMap
              spots={HEATMAP_SPOTS}
              lowData={effectiveLowData}
              onFail={() => setMapFailed(true)}
            />
          )}
        </View>

        {/* Manual escape hatch if the live tiles hang. */}
        {!useSchematic && (
          <TouchableOpacity
            onPress={() => setMapFailed(true)}
            style={styles.fallbackLink}
          >
            <Text style={{ color: colors.navy, fontWeight: "700", fontSize: 12 }}>
              Map not loading? Use offline schematic
            </Text>
          </TouchableOpacity>
        )}
        {mapFailed && !effectiveLowData && !batteryLow && (
          <TouchableOpacity
            onPress={() => setMapFailed(false)}
            style={styles.fallbackLink}
          >
            <Text style={{ color: colors.navy, fontWeight: "700", fontSize: 12 }}>
              Retry live campus map
            </Text>
          </TouchableOpacity>
        )}

        <View style={styles.legend}>
          {(["high", "medium", "low"] as const).map((k) => (
            <View key={k} style={styles.legendItem}>
              <View
                style={[styles.dot, { backgroundColor: INTENSITY[k].color }]}
              />
              <Text style={{ color: colors.textMuted, fontSize: 12 }}>
                {INTENSITY[k].label}
              </Text>
            </View>
          ))}
        </View>

        {/* List of spots under the map — tap to highlight a row. */}
        {HEATMAP_SPOTS.map((s) => {
          const active = selectedId === s.id;
          return (
            <TouchableOpacity
              key={s.id}
              style={[
                styles.row,
                {
                  backgroundColor: colors.card,
                  borderColor: active ? colors.navy : "transparent",
                  minHeight: a11y.hit + 8,
                },
                CARD_SHADOW,
              ]}
              onPress={() => setSelectedId(active ? null : s.id)}
              accessibilityRole="button"
              accessibilityLabel={`${s.name}, ${s.reportCount} reports, ${s.topConcern}`}
            >
              <View
                style={[
                  styles.barTrack,
                  { backgroundColor: colors.tileBorder },
                ]}
              >
                <View
                  style={[
                    styles.barFill,
                    {
                      width: `${(s.reportCount / max) * 100}%`,
                      backgroundColor: INTENSITY[s.intensity].color,
                    },
                  ]}
                />
              </View>
              <Text
                style={[
                  styles.name,
                  {
                    color: a11y.text,
                    fontSize: a11y.body,
                    fontWeight: a11y.fontWeight,
                  },
                ]}
              >
                {s.name}
              </Text>
              <Text
                style={[
                  styles.meta,
                  { color: a11y.muted, fontSize: a11y.caption },
                ]}
              >
                {s.reportCount} reports · {s.topConcern}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { padding: 18, paddingBottom: 40 },
  intro: { fontSize: 14, lineHeight: 20, marginBottom: 12 },
  adminBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  adminBannerText: { flex: 1, fontWeight: "700", fontSize: 13 },
  warnBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
  },
  mapTitle: { fontWeight: "900", fontSize: 16, marginBottom: 8 },
  mapShell: {
    height: 320,
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 8,
  },
  fallbackLink: { marginBottom: 10, alignSelf: "flex-start" },
  schematic: { flex: 1, padding: 14 },
  schematicTitle: { fontWeight: "900", fontSize: 15 },
  schematicSub: { fontSize: 12, marginTop: 4, marginBottom: 10 },
  plot: {
    flex: 1,
    minHeight: 200,
    borderRadius: 12,
    overflow: "hidden",
    position: "relative",
  },
  blob: { position: "absolute", borderWidth: 2 },
  legend: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 14,
  },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 6 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  row: {
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1.5,
  },
  barTrack: { height: 8, borderRadius: 4, overflow: "hidden", marginBottom: 8 },
  barFill: { height: "100%", borderRadius: 4 },
  name: { fontWeight: "800", fontSize: 15 },
  meta: { fontSize: 12, marginTop: 2 },
});
