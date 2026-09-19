import { api } from "@/services/database";

export type AlertLevel = "Information" | "Caution" | "Urgent";

export type SafetyAlert = {
  id: string;
  title: string;
  message: string;
  affectedArea: string;
  dateTime: string;
  recommendedAction: string;
  alertLevel: AlertLevel;
};

export type CampusZone = {
  id: string;
  name: string;
  description: string;
  riskStatus: "Low" | "Moderate" | "Elevated";
  nearestHelpPoint: string;
  mapReference: string;
  lat?: number | null;
  lng?: number | null;
};

export type HelpContact = {
  id: string;
  label: string;
  number: string;
};

export type SupportService = {
  id: string;
  title: string;
  detail: string;
  action: string;
  iconKey?: string | null;
};

export type SafetyResource = {
  id: string;
  title: string;
  summary: string;
  body: string;
};

export type PrivacySection = {
  id: string;
  title: string;
  body: string;
};

export type ReportCategory = {
  id: string;
  name: string;
  active: boolean;
};

export type IncidentStatus =
  | "New"
  | "Acknowledged"
  | "Responder Dispatched"
  | "Resolved"
  | "False Alarm"
  | "Cancelled";

export type ResponderIncident = {
  id: string;
  emergencyAlertId: number;
  studentName: string;
  studentId?: number;
  alertType: string;
  location: string;
  latitude?: number | null;
  longitude?: number | null;
  locationAccuracy?: number | null;
  locationCapturedAt?: string | null;
  timeTriggered: string;
  assignedResponder: string;
  notes: string;
  status: IncidentStatus;
};

export type AlertNotification = {
  notificationId: number;
  contactId: number;
  contactName?: string;
  channel: string;
  status: string;
};

export type WalkSession = {
  sessionId: number;
  studentId: number;
  studentName: string;
  startLabel?: string | null;
  endLabel?: string | null;
  travelMode: string;
  status: string;
  shareWithSecurity: boolean;
  startedAt: string;
  endedAt?: string | null;
  lastLat?: number | null;
  lastLng?: number | null;
  lastPingAt?: string | null;
  trustedContactName?: string | null;
};

export type SupportReferral = {
  referralId: number;
  reason: string;
  shownAt: string;
  acknowledgedAt?: string | null;
  emergencyAlertId?: number | null;
  reportId?: number | null;
  service: {
    id: number;
    title: string;
    detail: string;
    actionText: string;
  } | null;
};

export type RolePrivilege = {
  role: string;
  resource: string;
  create: boolean;
  read: boolean;
  update: boolean;
  delete: boolean;
  scope: string;
};

export type Responder = {
  id: string;
  name: string;
  role: string;
  contact: string;
  availability: string;
};

export type TrustedContact = {
  id: string;
  name: string;
  relationship: string;
  phone: string;
  email: string;
  preferredAlertMethod: string;
};

export type MapPoint = {
  id: string;
  name: string;
  lat: number;
  lng: number;
  type: string;
  description: string;
};

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

export async function fetchSafetyAlerts(): Promise<SafetyAlert[]> {
  const r = await api<{ ok: boolean; alerts?: SafetyAlert[]; error?: string }>(
    "/safety-alerts"
  );
  if (!r.ok) throw new Error(r.error || "Failed to load safety alerts.");
  return r.alerts || [];
}

export async function createSafetyAlert(input: {
  title: string;
  message?: string;
  alertLevel?: string;
  affectedArea?: string;
  recommendedAction?: string;
}): Promise<SafetyAlert> {
  const r = await api<{ ok: boolean; alert?: SafetyAlert; error?: string }>(
    "/safety-alerts",
    { method: "POST", body: JSON.stringify(input) }
  );
  if (!r.ok || !r.alert) throw new Error(r.error || "Failed to create alert.");
  return r.alert;
}

export async function fetchCampusZones(): Promise<CampusZone[]> {
  const r = await api<{ ok: boolean; zones?: CampusZone[]; error?: string }>(
    "/campus-zones"
  );
  if (!r.ok) throw new Error(r.error || "Failed to load campus zones.");
  return r.zones || [];
}

export async function fetchHelpContacts(): Promise<HelpContact[]> {
  const r = await api<{ ok: boolean; contacts?: HelpContact[]; error?: string }>(
    "/help-contacts"
  );
  if (!r.ok) throw new Error(r.error || "Failed to load help contacts.");
  return r.contacts || [];
}

export async function createHelpContact(input: {
  label: string;
  number: string;
}): Promise<HelpContact> {
  const r = await api<{ ok: boolean; contact?: HelpContact; error?: string }>(
    "/help-contacts",
    { method: "POST", body: JSON.stringify(input) }
  );
  if (!r.ok || !r.contact) throw new Error(r.error || "Failed to add contact.");
  return r.contact;
}

export async function fetchSupportServices(): Promise<SupportService[]> {
  const r = await api<{
    ok: boolean;
    services?: SupportService[];
    error?: string;
  }>("/support-services");
  if (!r.ok) throw new Error(r.error || "Failed to load support services.");
  return r.services || [];
}

export async function fetchSafetyResources(): Promise<SafetyResource[]> {
  const r = await api<{
    ok: boolean;
    resources?: SafetyResource[];
    error?: string;
  }>("/safety-resources");
  if (!r.ok) throw new Error(r.error || "Failed to load resources.");
  return r.resources || [];
}

export async function fetchPrivacySections(): Promise<PrivacySection[]> {
  const r = await api<{
    ok: boolean;
    sections?: PrivacySection[];
    error?: string;
  }>("/privacy-sections");
  if (!r.ok) throw new Error(r.error || "Failed to load privacy notice.");
  return r.sections || [];
}

export async function fetchReportCategories(): Promise<ReportCategory[]> {
  const r = await api<{
    ok: boolean;
    categories?: ReportCategory[];
    error?: string;
  }>("/report-categories");
  if (!r.ok) throw new Error(r.error || "Failed to load report categories.");
  return r.categories || [];
}

export async function setReportCategoryActive(
  id: string,
  active: boolean
): Promise<ReportCategory[]> {
  const r = await api<{
    ok: boolean;
    categories?: ReportCategory[];
    error?: string;
  }>(`/report-categories/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ active }),
  });
  if (!r.ok) throw new Error(r.error || "Failed to update category.");
  return r.categories || [];
}

export async function fetchResponders(): Promise<Responder[]> {
  const r = await api<{ ok: boolean; responders?: Responder[]; error?: string }>(
    "/responders"
  );
  if (!r.ok) throw new Error(r.error || "Failed to load responders.");
  return r.responders || [];
}

export async function fetchEmergencyAlerts(): Promise<ResponderIncident[]> {
  const r = await api<{
    ok: boolean;
    alerts?: ResponderIncident[];
    error?: string;
  }>("/emergency-alerts");
  if (!r.ok) throw new Error(r.error || "Failed to load emergency alerts.");
  return r.alerts || [];
}

export async function updateEmergencyAlert(
  id: number,
  body: { status: string; assignedResponder?: string }
): Promise<ResponderIncident | null> {
  const r = await api<{
    ok: boolean;
    alert?: ResponderIncident;
    error?: string;
  }>(`/emergency-alerts/${id}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
  if (!r.ok) throw new Error(r.error || "Failed to update alert.");
  return r.alert || null;
}

export async function createEmergencyAlert(body?: {
  alertType?: string;
  locationLabel?: string;
  zoneId?: number;
  latitude?: number;
  longitude?: number;
  locationAccuracy?: number | null;
  notifyTrustedContacts?: boolean;
}): Promise<{
  emergencyAlertId: number;
  notificationsQueued: number;
  notifications: AlertNotification[];
}> {
  const r = await api<{
    ok: boolean;
    emergencyAlertId?: number;
    notificationsQueued?: number;
    notifications?: AlertNotification[];
    error?: string;
  }>("/emergency-alerts", {
    method: "POST",
    body: JSON.stringify(body || {}),
  });
  if (!r.ok || r.emergencyAlertId == null) {
    throw new Error(r.error || "Failed to create emergency alert.");
  }
  return {
    emergencyAlertId: r.emergencyAlertId,
    notificationsQueued: r.notificationsQueued ?? 0,
    notifications: r.notifications || [],
  };
}

export async function pingEmergencyAlertLocation(
  emergencyAlertId: number,
  body: { latitude: number; longitude: number; accuracy?: number | null }
): Promise<void> {
  const r = await api<{ ok: boolean; error?: string }>(
    `/emergency-alerts/${emergencyAlertId}/location`,
    {
      method: "POST",
      body: JSON.stringify({
        latitude: body.latitude,
        longitude: body.longitude,
        accuracy: body.accuracy,
      }),
    }
  );
  if (!r.ok) throw new Error(r.error || "Failed to update alert location.");
}

export async function fetchWalkSessions(): Promise<WalkSession[]> {
  const r = await api<{ ok: boolean; sessions?: WalkSession[]; error?: string }>(
    "/walk-sessions"
  );
  if (!r.ok) throw new Error(r.error || "Failed to load walk sessions.");
  return r.sessions || [];
}

export async function createWalkSession(input: {
  startLabel?: string;
  endLabel?: string;
  startLat?: number;
  startLng?: number;
  endLat?: number;
  endLng?: number;
  travelMode?: "foot" | "car";
  shareWithSecurity?: boolean;
  trustedContactId?: number;
}): Promise<{ sessionId: number; status: string; startedAt: string }> {
  const r = await api<{
    ok: boolean;
    session?: { sessionId: number; status: string; startedAt: string };
    error?: string;
  }>("/walk-sessions", {
    method: "POST",
    body: JSON.stringify(input),
  });
  if (!r.ok || !r.session) {
    throw new Error(r.error || "Failed to start walk session.");
  }
  return r.session;
}

export async function pingWalkSession(
  sessionId: number,
  body: { latitude: number; longitude: number; accuracy?: number | null }
): Promise<void> {
  const r = await api<{ ok: boolean; error?: string }>(
    `/walk-sessions/${sessionId}/ping`,
    {
      method: "POST",
      body: JSON.stringify(body),
    }
  );
  if (!r.ok) throw new Error(r.error || "Failed to ping walk session.");
}

export async function endWalkSession(
  sessionId: number,
  status: "Completed" | "Cancelled" | "Distress" | "Overdue" = "Completed"
): Promise<void> {
  const r = await api<{ ok: boolean; error?: string }>(
    `/walk-sessions/${sessionId}/end`,
    {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }
  );
  if (!r.ok) throw new Error(r.error || "Failed to end walk session.");
}

export async function fetchSupportReferrals(): Promise<SupportReferral[]> {
  const r = await api<{
    ok: boolean;
    referrals?: SupportReferral[];
    error?: string;
  }>("/support-referrals");
  if (!r.ok) throw new Error(r.error || "Failed to load support referrals.");
  return r.referrals || [];
}

export async function acknowledgeSupportReferral(
  referralId: number
): Promise<void> {
  const r = await api<{ ok: boolean; error?: string }>(
    `/support-referrals/${referralId}/ack`,
    { method: "POST" }
  );
  if (!r.ok) throw new Error(r.error || "Failed to acknowledge referral.");
}

export async function createSupportReferral(input: {
  studentId: number;
  emergencyAlertId?: number;
  reportId?: number;
  serviceId?: number;
  reason?: string;
}): Promise<void> {
  const r = await api<{ ok: boolean; error?: string }>("/support-referrals", {
    method: "POST",
    body: JSON.stringify(input),
  });
  if (!r.ok) throw new Error(r.error || "Failed to create referral.");
}

export async function markSafetyAlertRead(safetyAlertId: string | number): Promise<void> {
  const id = String(safetyAlertId).replace(/\D/g, "") || safetyAlertId;
  const r = await api<{ ok: boolean; error?: string }>(
    `/safety-alerts/${id}/read`,
    { method: "POST" }
  );
  if (!r.ok) throw new Error(r.error || "Failed to mark alert read.");
}

export async function fetchRolePrivileges(
  role?: string
): Promise<RolePrivilege[]> {
  const q = role ? `?role=${encodeURIComponent(role)}` : "";
  const r = await api<{
    ok: boolean;
    privileges?: RolePrivilege[];
    error?: string;
  }>(`/role-privileges${q}`);
  if (!r.ok) throw new Error(r.error || "Failed to load role privileges.");
  return r.privileges || [];
}

export async function createSafetyResource(input: {
  title: string;
  summary: string;
  body: string;
}): Promise<SafetyResource> {
  const r = await api<{ ok: boolean; resource?: SafetyResource; error?: string }>(
    "/safety-resources",
    { method: "POST", body: JSON.stringify(input) }
  );
  if (!r.ok || !r.resource) {
    throw new Error(r.error || "Failed to create resource.");
  }
  return r.resource;
}

export async function createSupportService(input: {
  title: string;
  detail: string;
  actionText: string;
  iconKey?: string;
}): Promise<SupportService> {
  const r = await api<{ ok: boolean; service?: SupportService; error?: string }>(
    "/support-services",
    { method: "POST", body: JSON.stringify(input) }
  );
  if (!r.ok || !r.service) {
    throw new Error(r.error || "Failed to create support service.");
  }
  return r.service;
}

export async function createIncidentReport(input: {
  reportType: string;
  location: string;
  description: string;
  photoUri?: string | null;
  isAnonymous?: boolean;
  followUpRequested?: boolean;
}): Promise<void> {
  const r = await api<{ ok: boolean; error?: string }>("/incident-reports", {
    method: "POST",
    body: JSON.stringify(input),
  });
  if (!r.ok) throw new Error(r.error || "Failed to submit report.");
}

export async function fetchTrustedContacts(): Promise<TrustedContact[]> {
  const r = await api<{
    ok: boolean;
    contacts?: TrustedContact[];
    error?: string;
  }>("/trusted-contacts");
  if (!r.ok) throw new Error(r.error || "Failed to load trusted contacts.");
  return r.contacts || [];
}

export async function addTrustedContact(contact: {
  name: string;
  phone: string;
  email?: string;
  relationship?: string;
  preferredAlertMethod?: string;
}): Promise<TrustedContact[]> {
  const r = await api<{
    ok: boolean;
    contacts?: TrustedContact[];
    error?: string;
  }>("/trusted-contacts", {
    method: "POST",
    body: JSON.stringify(contact),
  });
  if (!r.ok) throw new Error(r.error || "Failed to add trusted contact.");
  return r.contacts || [];
}

export async function removeTrustedContact(
  id: string
): Promise<TrustedContact[]> {
  const r = await api<{
    ok: boolean;
    contacts?: TrustedContact[];
    error?: string;
  }>(`/trusted-contacts/${id}`, { method: "DELETE" });
  if (!r.ok) throw new Error(r.error || "Failed to remove trusted contact.");
  return r.contacts || [];
}

export async function fetchMapMarkers(): Promise<MapPoint[]> {
  const r = await api<{ ok: boolean; markers?: MapPoint[]; error?: string }>(
    "/map/markers"
  );
  if (!r.ok) throw new Error(r.error || "Failed to load map markers.");
  return r.markers || [];
}

export async function fetchMapDestinations(): Promise<MapPoint[]> {
  const r = await api<{
    ok: boolean;
    destinations?: MapPoint[];
    error?: string;
  }>("/map/destinations");
  if (!r.ok) throw new Error(r.error || "Failed to load destinations.");
  return r.destinations || [];
}

export type IncidentReportRow = {
  id: string;
  reportId: number;
  reportType: string;
  location: string;
  description: string;
  status: string;
  dateTime?: string;
  latitude?: number | null;
  longitude?: number | null;
};

export async function fetchIncidentReports(): Promise<IncidentReportRow[]> {
  const r = await api<{
    ok: boolean;
    reports?: IncidentReportRow[];
    error?: string;
  }>("/incident-reports");
  if (!r.ok) throw new Error(r.error || "Failed to load incident reports.");
  return (r.reports || []).map((row) => ({
    ...row,
    reportId:
      row.reportId ??
      (Number(String(row.id).replace(/\D/g, "")) || 0),
  }));
}
