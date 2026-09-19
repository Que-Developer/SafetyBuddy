/**
 * Use case: UC-MAP-01 — Evening Walk With Me (campus library → North Residence)
 *
 * Actor: Student (Amahle)
 * Goal: Share a monitored night walk with a trusted contact, see danger zones,
 *       and simulate live movement along the route.
 *
 * Preconditions:
 *  - Student is signed in
 *  - Location permission granted (or campus demo coords used)
 *  - Trusted contact "Kutlwano" is available
 *
 * Main flow:
 *  1. Open Location tab (campus map)
 *  2. Confirm live GPS / campus center marker
 *  3. Select start = Library, end = North Residence
 *  4. Choose contact Kutlwano, ETA 10 min
 *  5. Start Walk With Me → blue route + moving live marker
 *  6. Arrive → progress 100%, status "arrived safely"
 *
 * Alternate:
 *  - A1: Use "My live location" as start instead of Library
 *  - A2: Toggle layers to hide/show Reported Concerns
 *
 * Postconditions:
 *  - Route drawn between start/end
 *  - Simulation completes without errors
 *  - Danger markers remain interactive during walk
 */

import {
  CAMPUS_CENTER,
  CAMPUS_DESTINATIONS,
  MAP_LAYER_POINTS,
  MAP_WALK_CONTACTS,
} from "@/data/mapData";

export type LatLng = { lat: number; lng: number };

export const WALK_WITH_ME_USE_CASE = {
  id: "UC-MAP-01",
  title: "Evening Walk With Me — Library to North Residence",
  actor: "Student",
  contactId: MAP_WALK_CONTACTS[0]?.id ?? "c1",
  contactName: MAP_WALK_CONTACTS[0]?.name ?? "Kutlwano",
  etaMinutes: 10,
  start: CAMPUS_DESTINATIONS.find((d) => d.id === "dest-library")!,
  end: CAMPUS_DESTINATIONS.find((d) => d.id === "dest-north-res")!,
  campusCenter: CAMPUS_CENTER,
} as const;

/** Soft curve between two campus points (same math as CampusMap HTML bridge). */
export function buildSimulatedRoute(
  a: LatLng,
  b: LatLng,
  steps = 40
): LatLng[] {
  const pts: LatLng[] = [];
  const midLat = (a.lat + b.lat) / 2 + (b.lng - a.lng) * 0.15;
  const midLng = (a.lng + b.lng) / 2 - (b.lat - a.lat) * 0.15;
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const lat =
      (1 - t) * (1 - t) * a.lat + 2 * (1 - t) * t * midLat + t * t * b.lat;
    const lng =
      (1 - t) * (1 - t) * a.lng + 2 * (1 - t) * t * midLng + t * t * b.lng;
    pts.push({ lat, lng });
  }
  return pts;
}

export function runWalkSimulation(
  route: LatLng[],
  onStep?: (point: LatLng, progress: number) => void
): { ok: boolean; steps: number; finalProgress: number } {
  if (route.length < 2) {
    return { ok: false, steps: 0, finalProgress: 0 };
  }
  let lastProgress = 0;
  for (let i = 0; i < route.length; i++) {
    lastProgress = i / (route.length - 1);
    onStep?.(route[i], lastProgress);
  }
  return { ok: true, steps: route.length, finalProgress: lastProgress };
}

export function validateMapUseCaseData() {
  const errors: string[] = [];
  const start = WALK_WITH_ME_USE_CASE.start;
  const end = WALK_WITH_ME_USE_CASE.end;

  if (!start?.lat || !end?.lat) {
    errors.push("Start/end destinations missing coordinates");
  }
  if (start.id === end.id) {
    errors.push("Start and end must be different places");
  }

  const dangers = MAP_LAYER_POINTS.filter((p) => p.type === "danger");
  if (dangers.length < 1) {
    errors.push("Expected at least one reported danger marker");
  }

  const route = buildSimulatedRoute(
    { lat: start.lat, lng: start.lng },
    { lat: end.lat, lng: end.lng }
  );
  if (route.length < 10) {
    errors.push("Simulated route too short");
  }

  const first = route[0];
  const last = route[route.length - 1];
  if (
    Math.abs(first.lat - start.lat) > 0.0001 ||
    Math.abs(last.lat - end.lat) > 0.0001
  ) {
    errors.push("Route does not start/end at selected destinations");
  }

  const sim = runWalkSimulation(route);
  if (!sim.ok || sim.finalProgress !== 1) {
    errors.push("Walk simulation did not complete to 100%");
  }

  // Danger markers should be near campus center (within ~2km)
  for (const d of dangers) {
    const dlat = Math.abs(d.lat - CAMPUS_CENTER.lat);
    const dlng = Math.abs(d.lng - CAMPUS_CENTER.lng);
    if (dlat > 0.05 || dlng > 0.05) {
      errors.push(`Danger marker ${d.id} is far from campus center`);
    }
  }

  return {
    ok: errors.length === 0,
    errors,
    summary: {
      useCaseId: WALK_WITH_ME_USE_CASE.id,
      from: start.name,
      to: end.name,
      contact: WALK_WITH_ME_USE_CASE.contactName,
      etaMinutes: WALK_WITH_ME_USE_CASE.etaMinutes,
      routePoints: route.length,
      dangerMarkers: dangers.length,
      simulationSteps: sim.steps,
    },
  };
}
