import { useMemo } from "react";
import { Platform, StyleSheet, View } from "react-native";
import { WebView } from "react-native-webview";
import { CAMPUS_CENTER } from "@/data/mapData";
import { useTheme } from "@/context/ThemeContext";

export type ReportMapMarker = {
  id: string;
  name: string;
  lat: number;
  lng: number;
  kind: "panic" | "report" | "walk" | "zone";
  description?: string;
};

type Props = {
  markers: ReportMapMarker[];
  height?: number;
};

function buildHtml(
  markers: ReportMapMarker[],
  themeBg: string,
  themeAccent: string
) {
  const markersJson = JSON.stringify(markers);
  const centerJson = JSON.stringify(CAMPUS_CENTER);
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <style>
    html, body, #map { margin:0; padding:0; height:100%; width:100%; background:${themeBg}; }
    .pin {
      min-width:26px; height:26px; border-radius:999px; color:#fff;
      display:flex; align-items:center; justify-content:center;
      font:800 11px/1 system-ui,sans-serif; border:2px solid #fff;
      box-shadow:0 2px 8px rgba(0,0,0,.35);
    }
  </style>
</head>
<body>
  <div id="map"></div>
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <script>
    const MARKERS = ${markersJson};
    const CENTER = ${centerJson};
    const COLORS = { panic:'#EF4444', report:'#F59E0B', walk:'#2563EB', zone:'#14B8A6' };
    const LABELS = { panic:'!', report:'R', walk:'W', zone:'Z' };
    const map = L.map('map', { zoomControl: false }).setView([CENTER.lat, CENTER.lng], 15);
    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}', {
      attribution: 'Tiles © Esri', maxZoom: 19
    }).addTo(map);
    const group = L.featureGroup().addTo(map);
    MARKERS.forEach(m => {
      const color = COLORS[m.kind] || '${themeAccent}';
      const icon = L.divIcon({
        className: '',
        html: '<div class="pin" style="background:' + color + '">' + (LABELS[m.kind] || '•') + '</div>',
        iconSize: [28, 28],
        iconAnchor: [14, 14]
      });
      L.marker([m.lat, m.lng], { icon })
        .bindPopup('<b>' + m.name + '</b><br/>' + (m.description || m.kind))
        .addTo(group);
    });
    if (MARKERS.length) {
      try { map.fitBounds(group.getBounds().pad(0.25)); } catch (e) {}
    }
  </script>
</body>
</html>`;
}

/** Compact campus map for Security / Admin — shows panic, report, and walk points. */
export function OpsReportsMap({ markers, height = 220 }: Props) {
  const { colors } = useTheme();
  const html = useMemo(
    () => buildHtml(markers, colors.bg, colors.navy),
    [markers, colors.bg, colors.navy]
  );

  if (Platform.OS === "web") {
    return (
      <View style={[styles.wrap, { height, backgroundColor: colors.card }]}>
        <iframe
          title="Reports map"
          srcDoc={html}
          style={{ border: 0, width: "100%", height: "100%" }}
        />
      </View>
    );
  }

  return (
    <View style={[styles.wrap, { height, backgroundColor: colors.card }]}>
      <WebView
        originWhitelist={["*"]}
        source={{ html }}
        style={styles.webview}
        javaScriptEnabled
        scrollEnabled={false}
        setSupportMultipleWindows={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderRadius: 16,
    overflow: "hidden",
  },
  webview: { flex: 1, backgroundColor: "transparent" },
});
