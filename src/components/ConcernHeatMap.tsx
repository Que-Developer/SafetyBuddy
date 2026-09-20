import { CAMPUS_CENTER } from "@/data/mapData";
import type { HeatSpot } from "@/data/featureData";
import { useTheme } from "@/context/ThemeContext";
import { useMemo, useRef } from "react";
import { Platform, StyleSheet, View } from "react-native";
import { WebView, type WebViewMessageEvent } from "react-native-webview";

type Props = {
  spots: HeatSpot[];
  lowData?: boolean;
  onReady?: () => void;
  onFail?: () => void;
};

const INTENSITY_COLOR: Record<HeatSpot["intensity"], string> = {
  high: "#EF4444",
  medium: "#F59E0B",
  low: "#22C55E",
};

// Leaflet HTML for the concern circles — runs inside a WebView.
function buildHeatHtml(spots: HeatSpot[], lowData: boolean) {
  const spotsJson = JSON.stringify(
    spots.map((s) => ({
      ...s,
      color: INTENSITY_COLOR[s.intensity],
    }))
  );
  const centerJson = JSON.stringify(CAMPUS_CENTER);
  // Lighter OSM tiles when the phone is in low-data mode.
  const tileUrl = lowData
    ? "https://tile.openstreetmap.org/{z}/{x}/{y}.png"
    : "https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}";

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=${lowData ? 1 : 4}, user-scalable=${lowData ? "no" : "yes"}" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <style>
    html, body, #map { margin:0; padding:0; height:100%; width:100%; background:#0b1b3a; }
    .heat-label {
      background:rgba(0,43,91,.92); color:#fff; border-radius:8px; padding:4px 8px;
      font:700 10px/1.2 system-ui,sans-serif; border:1px solid rgba(255,255,255,.35);
      white-space:nowrap; box-shadow:0 2px 8px rgba(0,0,0,.35);
    }
  </style>
</head>
<body>
  <div id="map"></div>
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <script>
    const SPOTS = ${spotsJson};
    const CENTER = ${centerJson};
    function post(msg) {
      const payload = JSON.stringify(msg);
      if (window.ReactNativeWebView) window.ReactNativeWebView.postMessage(payload);
      else if (window.parent !== window) window.parent.postMessage(payload, '*');
    }
    try {
      const map = L.map('map', { zoomControl: false }).setView([CENTER.lat, CENTER.lng], 16);
      L.tileLayer('${tileUrl}', {
        attribution: '© map',
        maxZoom: 19
      }).addTo(map);

      const bounds = [];
      SPOTS.forEach((s) => {
        const radius = 40 + Math.min(120, s.reportCount * 8);
        const circle = L.circle([s.lat, s.lng], {
          radius: radius,
          color: s.color,
          fillColor: s.color,
          fillOpacity: 0.35,
          weight: 2
        }).addTo(map);
        circle.bindPopup(
          '<b>' + s.name + '</b><br/>' +
          s.reportCount + ' reports<br/>' +
          s.topConcern + ' · ' + s.intensity
        );
        L.marker([s.lat, s.lng], {
          icon: L.divIcon({
            className: '',
            html: '<div class="heat-label">' + s.reportCount + '</div>',
            iconSize: [36, 20],
            iconAnchor: [18, 10]
          })
        }).addTo(map);
        bounds.push([s.lat, s.lng]);
      });
      if (bounds.length) map.fitBounds(bounds, { padding: [36, 36], maxZoom: 17 });
      post({ type: 'ready' });
    } catch (e) {
      post({ type: 'fail', message: String(e && e.message ? e.message : e) });
    }
  </script>
</body>
</html>`;
}

// Live campus heatmap (WebView). Parent can fall back if tiles fail.
export function ConcernHeatMap({ spots, lowData = false, onReady, onFail }: Props) {
  const { colors } = useTheme();
  const ref = useRef<WebView>(null);
  const html = useMemo(() => buildHeatHtml(spots, lowData), [spots, lowData]);

  const onMessage = (event: WebViewMessageEvent) => {
    // Map page tells us when it's ready or when Leaflet blew up.
    try {
      const data = JSON.parse(event.nativeEvent.data) as {
        type: string;
      };
      if (data.type === "ready") onReady?.();
      if (data.type === "fail") onFail?.();
    } catch {
      /* ignore */
    }
  };

  const wrapStyle = [styles.wrap, { backgroundColor: colors.bgDeep }];

  if (Platform.OS === "web") {
    // Browser preview uses an iframe with the same HTML.
    return (
      <View style={wrapStyle}>
        <iframe
          title="Concern heatmap"
          srcDoc={html}
          style={styles.iframe as object}
          sandbox="allow-scripts allow-same-origin"
          onError={() => onFail?.()}
        />
      </View>
    );
  }

  return (
    <View style={wrapStyle}>
      <WebView
        ref={ref}
        originWhitelist={["*"]}
        source={{ html }}
        onMessage={onMessage}
        onError={() => onFail?.()}
        onHttpError={() => onFail?.()}
        style={styles.webview}
        javaScriptEnabled
        domStorageEnabled
        mixedContentMode="always"
        allowFileAccess
        setSupportMultipleWindows={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, overflow: "hidden" },
  webview: { flex: 1, backgroundColor: "transparent" },
  iframe: { borderWidth: 0, width: "100%", height: "100%" },
});
