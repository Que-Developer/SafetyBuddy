/**
 * Legacy mock data removed — app screens load from SQL Server via
 * `@/services/campusApi` and `/server` API routes.
 *
 * Status UI constants remain here for Responder dashboard styling.
 */

export type IncidentStatus =
  | "New"
  | "Acknowledged"
  | "Responder Dispatched"
  | "Resolved"
  | "False Alarm"
  | "Cancelled";

export const INCIDENT_STATUS_FLOW: IncidentStatus[] = [
  "New",
  "Acknowledged",
  "Responder Dispatched",
  "Resolved",
  "False Alarm",
];

export const STATUS_COLORS: Record<string, string> = {
  New: "#EF4444",
  Acknowledged: "#3B82F6",
  "Responder Dispatched": "#FACC15",
  Resolved: "#22C55E",
  "False Alarm": "#8A9BB3",
  Cancelled: "#8A9BB3",
};
