import type { CampusZone, ResponderIncident, WalkSession } from "@/services/campusApi";
import type { ReportMapMarker } from "@/components/OpsReportsMap";

export type IncidentReportRow = {
  id: string;
  reportId: number;
  reportType: string;
  location: string;
  description: string;
  status: string;
  latitude?: number | null;
  longitude?: number | null;
};

function matchZone(
  label: string | null | undefined,
  zones: CampusZone[]
): CampusZone | undefined {
  if (!label) return undefined;
  const lower = label.toLowerCase();
  return zones.find(
    (z) =>
      lower.includes(z.name.toLowerCase()) ||
      z.name.toLowerCase().includes(lower.slice(0, 12))
  );
}

/** Build map markers from panics, reports, walks, and campus zones. */
export function buildOpsMapMarkers(input: {
  alerts?: ResponderIncident[];
  reports?: IncidentReportRow[];
  walks?: WalkSession[];
  zones?: CampusZone[];
}): ReportMapMarker[] {
  const zones = input.zones || [];
  const out: ReportMapMarker[] = [];

  for (const a of input.alerts || []) {
    let lat = a.latitude;
    let lng = a.longitude;
    if (lat == null || lng == null) {
      const z = matchZone(a.location, zones);
      lat = z?.lat ?? null;
      lng = z?.lng ?? null;
    }
    if (lat == null || lng == null) continue;
    out.push({
      id: `panic-${a.emergencyAlertId}`,
      name: a.alertType,
      lat,
      lng,
      kind: "panic",
      description: `${a.studentName} · ${a.location} · ${a.status}`,
    });
  }

  for (const r of input.reports || []) {
    let lat = r.latitude;
    let lng = r.longitude;
    if (lat == null || lng == null) {
      const z = matchZone(r.location, zones);
      lat = z?.lat ?? null;
      lng = z?.lng ?? null;
    }
    if (lat == null || lng == null) continue;
    out.push({
      id: `report-${r.reportId}`,
      name: r.reportType,
      lat,
      lng,
      kind: "report",
      description: `${r.location} · ${r.status}`,
    });
  }

  for (const w of input.walks || []) {
    if (w.lastLat == null || w.lastLng == null) continue;
    out.push({
      id: `walk-${w.sessionId}`,
      name: `Walk · ${w.studentName}`,
      lat: w.lastLat,
      lng: w.lastLng,
      kind: "walk",
      description: `${w.startLabel || "?"} → ${w.endLabel || "?"} · ${w.status}`,
    });
  }

  return out;
}
