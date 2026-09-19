/**
 * Use case fixture for scripts/test-map-usecase.mjs (offline self-check).
 * Runtime map data loads from SQL Server via the API.
 */

import { CAMPUS_CENTER } from "@/data/mapData";

export type LatLng = { lat: number; lng: number };

export const WALK_WITH_ME_USE_CASE = {
  id: "UC-MAP-01",
  title: "Evening Walk With Me — Library to North Residence",
  actor: "Student",
  contactId: "c1",
  contactName: "Kutlwano",
  etaMinutes: 10,
  start: {
    id: "dest-library",
    name: "Library",
    lat: -33.9608,
    lng: 25.6162,
    type: "destination" as const,
    description: "Main campus library",
  },
  end: {
    id: "dest-north-res",
    name: "North Residence",
    lat: -33.9596,
    lng: 25.6174,
    type: "destination" as const,
    description: "North residence precinct",
  },
  campusCenter: CAMPUS_CENTER,
} as const;

export function buildSimulatedRoute(a: LatLng, b: LatLng, steps = 40): LatLng[] {
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

export function validateWalkWithMeUseCase() {
  const { start, end, campusCenter } = WALK_WITH_ME_USE_CASE;
  const route = buildSimulatedRoute(start, end);
  const dangers = [
    {
      id: "danger-1",
      name: "Reported: poorly lit path",
      lat: -33.9619,
      lng: 25.6168,
      type: "danger",
    },
  ];
  return {
    ok: route.length > 10 && !!campusCenter && dangers.length > 0,
    routePoints: route.length,
    start: start.name,
    end: end.name,
  };
}
