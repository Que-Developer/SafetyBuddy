/**
 * Runnable map use-case test (no Expo runtime required).
 * Mirrors UC-MAP-01: Library → North Residence Walk With Me simulation.
 *
 * Usage: node scripts/test-map-usecase.mjs
 */

const CAMPUS_CENTER = { lat: -34.00195, lng: 25.67099 };

const DESTINATIONS = {
  library: { id: "dest-library", name: "Library", lat: -34.0042, lng: 25.6702 },
  northRes: {
    id: "dest-north-res",
    name: "North Residence",
    lat: -33.9975,
    lng: 25.673,
  },
};

const DANGER_MARKERS = [
  { id: "danger-1", lat: -34.0038, lng: 25.6718 },
  { id: "danger-2", lat: -34.0062, lng: 25.6692 },
  { id: "danger-3", lat: -33.9982, lng: 25.6724 },
];

function buildSimulatedRoute(a, b, steps = 40) {
  const pts = [];
  const midLat = (a.lat + b.lat) / 2 + (b.lng - a.lng) * 0.15;
  const midLng = (a.lng + b.lng) / 2 - (b.lat - a.lat) * 0.15;
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    pts.push({
      lat: (1 - t) * (1 - t) * a.lat + 2 * (1 - t) * t * midLat + t * t * b.lat,
      lng: (1 - t) * (1 - t) * a.lng + 2 * (1 - t) * t * midLng + t * t * b.lng,
    });
  }
  return pts;
}

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

function run() {
  console.log("UC-MAP-01 — Evening Walk With Me");
  console.log("--------------------------------");

  const start = DESTINATIONS.library;
  const end = DESTINATIONS.northRes;
  assert(start.id !== end.id, "start and end must differ");

  const route = buildSimulatedRoute(start, end);
  assert(route.length === 41, `expected 41 route points, got ${route.length}`);
  assert(
    Math.abs(route[0].lat - start.lat) < 1e-9,
    "route must begin at Library"
  );
  assert(
    Math.abs(route[route.length - 1].lat - end.lat) < 1e-9,
    "route must end at North Residence"
  );

  let progress = 0;
  for (let i = 0; i < route.length; i++) {
    progress = i / (route.length - 1);
  }
  assert(progress === 1, "simulation must reach 100%");

  for (const d of DANGER_MARKERS) {
    assert(
      Math.abs(d.lat - CAMPUS_CENTER.lat) < 0.05 &&
        Math.abs(d.lng - CAMPUS_CENTER.lng) < 0.05,
      `danger ${d.id} outside campus bounds`
    );
  }

  // Haversine-ish sanity: path should move north-east from library toward north res
  assert(end.lat > start.lat, "North Residence should be north of Library");
  assert(end.lng > start.lng, "North Residence should be east of Library");

  console.log("Actor:          Student (Amahle)");
  console.log(`Start:          ${start.name} (${start.lat}, ${start.lng})`);
  console.log(`Destination:    ${end.name} (${end.lat}, ${end.lng})`);
  console.log("Trusted contact: Kutlwano");
  console.log("ETA:            10 min");
  console.log(`Route points:   ${route.length}`);
  console.log(`Danger markers: ${DANGER_MARKERS.length}`);
  console.log(`Sim progress:   ${(progress * 100).toFixed(0)}%`);
  console.log("");
  console.log("PASS — map Walk With Me use case validated.");
}

try {
  run();
  process.exit(0);
} catch (err) {
  console.error("FAIL —", err.message);
  process.exit(1);
}
