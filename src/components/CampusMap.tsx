import { useEffect, useMemo, useRef } from "react";
import { Platform, StyleSheet, View } from "react-native";
import { WebView, type WebViewMessageEvent } from "react-native-webview";
import {
  CAMPUS_CENTER,
  MAP_LAYER_POINTS,
  type MapLayerKey,
  type MapPoint,
} from "@/data/mapData";

export type MapCommand =
  | { type: "setMode"; mode: "2d" | "3d" }
  | { type: "setLayers"; layers: MapLayerKey[] }
  | { type: "setPickMode"; pick: "start" | "end" | null }
  | { type: "setRoute"; start: { lat: number; lng: number } | null; end: { lat: number; lng: number } | null }
  | { type: "simulate"; running: boolean }
  | { type: "flyTo"; lat: number; lng: number }
  | { type: "setBase"; base: "street" | "satellite" }
  | { type: "setLiveLocation"; lat: number; lng: number; follow?: boolean };

export type MapEvent =
  | { type: "ready" }
  | { type: "mapClick"; lat: number; lng: number }
  | { type: "markerClick"; id: string; name: string }
  | { type: "simProgress"; lat: number; lng: number; progress: number }
  | { type: "simDone" };

type Props = {
  mode: "2d" | "3d";
  base?: "street" | "satellite";
  activeLayers: MapLayerKey[];
  pickMode: "start" | "end" | null;
  start: { lat: number; lng: number } | null;
  end: { lat: number; lng: number } | null;
  simulating: boolean;
  liveLocation: { lat: number; lng: number } | null;
  followLive?: boolean;
  onEvent: (event: MapEvent) => void;
};

function buildHtml(points: MapPoint[]) {
  const pointsJson = JSON.stringify(points);
  const centerJson = JSON.stringify(CAMPUS_CENTER);

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <link href="https://unpkg.com/maplibre-gl@4.7.1/dist/maplibre-gl.css" rel="stylesheet" />
  <style>
    html, body, #map2d, #map3d { margin:0; padding:0; height:100%; width:100%; background:#0b1b3a; }
    #map3d { display:none; }
    .badge {
      background:#002B5B; color:#fff; border-radius:999px; padding:4px 8px;
      font:700 11px/1.2 system-ui,sans-serif; border:2px solid #fff;
      box-shadow:0 2px 8px rgba(0,0,0,.35);
    }
    .live-dot {
      width:18px; height:18px; border-radius:50%; background:#2563EB;
      border:3px solid #fff; box-shadow:0 0 0 8px rgba(37,99,235,.35);
    }
    .you-label {
      background:#FFD24C; color:#002B5B; font:800 11px/1 system-ui,sans-serif;
      padding:4px 8px; border-radius:999px; border:2px solid #fff;
      box-shadow:0 2px 8px rgba(0,0,0,.3); white-space:nowrap;
    }
    .start-pin, .end-pin {
      width:14px; height:14px; border-radius:50%; border:3px solid #fff;
      box-shadow:0 2px 6px rgba(0,0,0,.4);
    }
    .start-pin { background:#22C55E; }
    .end-pin { background:#EF4444; }
  </style>
</head>
<body>
  <div id="map2d"></div>
  <div id="map3d"></div>
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <script src="https://unpkg.com/maplibre-gl@4.7.1/dist/maplibre-gl.js"></script>
  <script>
    const POINTS = ${pointsJson};
    const CENTER = ${centerJson};
    const COLORS = {
      danger: '#EAB308',
      security: '#F5C842',
      emergency: '#EF4444',
      firstAid: '#22C55E',
      safeZone: '#60A5FA',
      destination: '#002B5B'
    };

    let mode = '2d';
    let activeLayers = ['danger','security','emergency','firstAid','safeZone'];
    let pickMode = null;
    let start = null;
    let end = null;
    let simulating = false;
    let simTimer = null;
    let simIndex = 0;
    let routeCoords = [];

    function post(msg) {
      const payload = JSON.stringify(msg);
      if (window.ReactNativeWebView) window.ReactNativeWebView.postMessage(payload);
      else if (window.parent !== window) window.parent.postMessage(payload, '*');
    }

    // --- Leaflet 2D ---
    const map2d = L.map('map2d', { zoomControl: false }).setView([CENTER.lat, CENTER.lng], 16);
    const streetTiles = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}', {
      attribution: 'Tiles © Esri',
      maxZoom: 19
    });
    const satTiles = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      attribution: 'Tiles © Esri',
      maxZoom: 19
    });
    const satLabels = L.tileLayer('https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}', {
      attribution: '© Esri',
      maxZoom: 19
    });
    let baseMode = 'street';
    streetTiles.addTo(map2d);

    const layerGroup = L.layerGroup().addTo(map2d);
    const routeLine = L.polyline([], { color: '#2563EB', weight: 6, opacity: 0.9 }).addTo(map2d);
    let startMarker = null;
    let endMarker = null;
    let liveMarker = L.marker([CENTER.lat, CENTER.lng], {
      icon: L.divIcon({
        className: '',
        html: '<div style="display:flex;flex-direction:column;align-items:center;gap:4px"><div class="you-label">You</div><div class="live-dot"></div></div>',
        iconSize: [48, 40],
        iconAnchor: [24, 36]
      })
    }).addTo(map2d);

    function makeIcon(type, label) {
      const color = COLORS[type] || '#002B5B';
      const text = type === 'danger' ? '!' : (label || '').slice(0,1).toUpperCase();
      return L.divIcon({
        className: '',
        html: '<div class="badge" style="background:' + color + ';color:#002B5B">' + text + '</div>',
        iconSize: [28, 22],
        iconAnchor: [14, 11]
      });
    }

    function refreshLayers() {
      layerGroup.clearLayers();
      POINTS.forEach(p => {
        if (!activeLayers.includes(p.type === 'destination' ? 'safeZone' : p.type) && p.type !== 'destination') return;
        if (p.type === 'destination') return;
        const m = L.marker([p.lat, p.lng], { icon: makeIcon(p.type, p.name) });
        m.bindPopup('<b>' + p.name + '</b><br/>' + p.description);
        m.on('click', () => post({ type: 'markerClick', id: p.id, name: p.name }));
        layerGroup.addLayer(m);
      });
    }

    function updateRouteMarkers() {
      if (startMarker) { map2d.removeLayer(startMarker); startMarker = null; }
      if (endMarker) { map2d.removeLayer(endMarker); endMarker = null; }
      if (start) {
        startMarker = L.marker([start.lat, start.lng], {
          icon: L.divIcon({ className:'', html:'<div class="start-pin"></div>', iconSize:[14,14], iconAnchor:[7,7] })
        }).addTo(map2d);
      }
      if (end) {
        endMarker = L.marker([end.lat, end.lng], {
          icon: L.divIcon({ className:'', html:'<div class="end-pin"></div>', iconSize:[14,14], iconAnchor:[7,7] })
        }).addTo(map2d);
      }
      if (start && end) {
        routeCoords = buildRoute(start, end);
        routeLine.setLatLngs(routeCoords);
        map2d.fitBounds(routeLine.getBounds(), { padding: [40, 40] });
        sync3dRoute();
      } else {
        routeCoords = [];
        routeLine.setLatLngs([]);
        sync3dRoute();
      }
    }

    // Soft curve between two campus points (simulated path)
    function buildRoute(a, b) {
      const pts = [];
      const steps = 40;
      const midLat = (a.lat + b.lat) / 2 + (b.lng - a.lng) * 0.15;
      const midLng = (a.lng + b.lng) / 2 - (b.lat - a.lat) * 0.15;
      for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        const lat = (1-t)*(1-t)*a.lat + 2*(1-t)*t*midLat + t*t*b.lat;
        const lng = (1-t)*(1-t)*a.lng + 2*(1-t)*t*midLng + t*t*b.lng;
        pts.push([lat, lng]);
      }
      return pts;
    }

    map2d.on('click', (e) => {
      post({ type: 'mapClick', lat: e.latlng.lat, lng: e.latlng.lng });
    });

    // --- MapLibre 3D ---
    let map3d = null;
    function ensure3d() {
      if (map3d) return map3d;
      map3d = new maplibregl.Map({
        container: 'map3d',
        style: {
          version: 8,
          sources: {
            osm: {
              type: 'raster',
              tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
              tileSize: 256,
              attribution: '© OpenStreetMap'
            }
          },
          layers: [{ id: 'osm', type: 'raster', source: 'osm' }]
        },
        center: [CENTER.lng, CENTER.lat],
        zoom: 16,
        pitch: 60,
        bearing: -20
      });
      map3d.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), 'top-right');
      map3d.on('click', (e) => {
        post({ type: 'mapClick', lat: e.lngLat.lat, lng: e.lngLat.lng });
      });
      map3d.on('load', () => {
        map3d.addSource('route', {
          type: 'geojson',
          data: { type: 'Feature', geometry: { type: 'LineString', coordinates: [] } }
        });
        map3d.addLayer({
          id: 'route-line',
          type: 'line',
          source: 'route',
          paint: { 'line-color': '#2563EB', 'line-width': 6 }
        });
        sync3dRoute();
        sync3dMarkers();
      });
      return map3d;
    }

    const glMarkers = [];
    function sync3dMarkers() {
      if (!map3d) return;
      glMarkers.forEach(m => m.remove());
      glMarkers.length = 0;
      POINTS.forEach(p => {
        if (!activeLayers.includes(p.type)) return;
        const el = document.createElement('div');
        el.className = 'badge';
        el.style.background = COLORS[p.type];
        el.style.color = '#002B5B';
        el.textContent = p.type === 'danger' ? '!' : p.name.slice(0,1);
        const marker = new maplibregl.Marker({ element: el }).setLngLat([p.lng, p.lat]).addTo(map3d);
        glMarkers.push(marker);
      });
    }

    function sync3dRoute() {
      if (!map3d || !map3d.getSource) return;
      const src = map3d.getSource('route');
      if (!src) return;
      const coords = routeCoords.map(([lat, lng]) => [lng, lat]);
      src.setData({ type: 'Feature', geometry: { type: 'LineString', coordinates: coords } });
    }

    function setBase(next) {
      baseMode = next;
      map2d.removeLayer(streetTiles);
      map2d.removeLayer(satTiles);
      map2d.removeLayer(satLabels);
      if (next === 'satellite') {
        satTiles.addTo(map2d);
        satLabels.addTo(map2d);
      } else {
        streetTiles.addTo(map2d);
      }
    }

    function setMode(next) {
      mode = next;
      const d2 = document.getElementById('map2d');
      const d3 = document.getElementById('map3d');
      if (next === '3d') {
        d2.style.display = 'none';
        d3.style.display = 'block';
        const m = ensure3d();
        setTimeout(() => { m.resize(); sync3dMarkers(); sync3dRoute(); }, 80);
      } else {
        d3.style.display = 'none';
        d2.style.display = 'block';
        setTimeout(() => map2d.invalidateSize(), 80);
      }
    }

    function startSim() {
      stopSim();
      if (!routeCoords.length) return;
      simulating = true;
      simIndex = 0;
      simTimer = setInterval(() => {
        if (simIndex >= routeCoords.length) {
          stopSim();
          post({ type: 'simDone' });
          return;
        }
        const [lat, lng] = routeCoords[simIndex];
        liveMarker.setLatLng([lat, lng]);
        if (map3d) {
          map3d.easeTo({ center: [lng, lat], duration: 200, pitch: 60 });
        } else {
          map2d.panTo([lat, lng], { animate: true, duration: 0.2 });
        }
        post({ type: 'simProgress', lat, lng, progress: simIndex / (routeCoords.length - 1) });
        simIndex += 1;
      }, 350);
    }

    function stopSim() {
      simulating = false;
      if (simTimer) clearInterval(simTimer);
      simTimer = null;
    }

    function handleCommand(cmd) {
      if (!cmd || !cmd.type) return;
      if (cmd.type === 'setMode') setMode(cmd.mode);
      if (cmd.type === 'setBase') setBase(cmd.base || 'street');
      if (cmd.type === 'setLayers') { activeLayers = cmd.layers || []; refreshLayers(); sync3dMarkers(); }
      if (cmd.type === 'setPickMode') pickMode = cmd.pick;
      if (cmd.type === 'setRoute') {
        start = cmd.start; end = cmd.end; updateRouteMarkers();
      }
      if (cmd.type === 'simulate') {
        if (cmd.running) startSim(); else stopSim();
      }
      if (cmd.type === 'flyTo') {
        map2d.flyTo([cmd.lat, cmd.lng], 17);
        if (map3d) map3d.flyTo({ center: [cmd.lng, cmd.lat], zoom: 17 });
      }
      if (cmd.type === 'setLiveLocation') {
        liveMarker.setLatLng([cmd.lat, cmd.lng]);
        if (cmd.follow) {
          map2d.setView([cmd.lat, cmd.lng], Math.max(map2d.getZoom(), 17), { animate: true });
          if (map3d) map3d.easeTo({ center: [cmd.lng, cmd.lat], zoom: 17, duration: 600 });
        }
      }
    }

    // RN bridge
    document.addEventListener('message', (e) => {
      try { handleCommand(JSON.parse(e.data)); } catch (err) {}
    });
    window.addEventListener('message', (e) => {
      try {
        const data = typeof e.data === 'string' ? JSON.parse(e.data) : e.data;
        handleCommand(data);
      } catch (err) {}
    });

    refreshLayers();
    post({ type: 'ready' });
  </script>
</body>
</html>`;
}

export function CampusMap({
  mode,
  base = "street",
  activeLayers,
  pickMode,
  start,
  end,
  simulating,
  liveLocation,
  followLive = false,
  onEvent,
}: Props) {
  const ref = useRef<WebView>(null);
  const ready = useRef(false);

  const html = useMemo(() => buildHtml(MAP_LAYER_POINTS), []);

  const send = (cmd: MapCommand) => {
    const payload = JSON.stringify(cmd);
    if (Platform.OS === "web") {
      const iframe = document.querySelector(
        "iframe[data-campus-map='1']"
      ) as HTMLIFrameElement | null;
      iframe?.contentWindow?.postMessage(payload, "*");
      return;
    }
    ref.current?.postMessage(payload);
  };

  useEffect(() => {
    if (!ready.current) return;
    send({ type: "setMode", mode });
  }, [mode]);

  useEffect(() => {
    if (!ready.current) return;
    send({ type: "setBase", base });
  }, [base]);

  useEffect(() => {
    if (!ready.current) return;
    send({ type: "setLayers", layers: activeLayers });
  }, [activeLayers]);

  useEffect(() => {
    if (!ready.current) return;
    send({ type: "setPickMode", pick: pickMode });
  }, [pickMode]);

  useEffect(() => {
    if (!ready.current) return;
    send({ type: "setRoute", start, end });
  }, [start, end]);

  useEffect(() => {
    if (!ready.current) return;
    send({ type: "simulate", running: simulating });
  }, [simulating]);

  useEffect(() => {
    if (!ready.current || !liveLocation) return;
    send({
      type: "setLiveLocation",
      lat: liveLocation.lat,
      lng: liveLocation.lng,
      follow: followLive,
    });
  }, [liveLocation, followLive]);

  const onMessage = (event: WebViewMessageEvent) => {
    try {
      const data = JSON.parse(event.nativeEvent.data) as MapEvent;
      if (data.type === "ready") {
        ready.current = true;
        send({ type: "setMode", mode });
        send({ type: "setBase", base });
        send({ type: "setLayers", layers: activeLayers });
        send({ type: "setRoute", start, end });
      }
      onEvent(data);
    } catch {
      /* ignore */
    }
  };

  // Web: listen for iframe messages
  useEffect(() => {
    if (Platform.OS !== "web") return;
    const handler = (e: MessageEvent) => {
      try {
        const data =
          typeof e.data === "string" ? JSON.parse(e.data) : e.data;
        if (!data?.type) return;
        if (data.type === "ready") {
          ready.current = true;
          send({ type: "setMode", mode });
          send({ type: "setBase", base });
          send({ type: "setLayers", layers: activeLayers });
          send({ type: "setRoute", start, end });
        }
        onEvent(data as MapEvent);
      } catch {
        /* ignore */
      }
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, [mode, base, activeLayers, start, end, onEvent]);

  if (Platform.OS === "web") {
    return (
      <View style={styles.wrap}>
        <iframe
          data-campus-map="1"
          title="Campus map"
          srcDoc={html}
          style={styles.iframe as object}
          sandbox="allow-scripts allow-same-origin"
        />
      </View>
    );
  }

  return (
    <View style={styles.wrap}>
      <WebView
        ref={ref}
        originWhitelist={["*"]}
        source={{ html }}
        onMessage={onMessage}
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
  wrap: { flex: 1, overflow: "hidden", backgroundColor: "#0b1b3a" },
  webview: { flex: 1, backgroundColor: "transparent" },
  iframe: {
    borderWidth: 0,
    width: "100%",
    height: "100%",
  },
});
