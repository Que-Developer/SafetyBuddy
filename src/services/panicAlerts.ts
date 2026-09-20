import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE_URL } from "@/constants/api";
import { loadAuthToken } from "@/services/database";
import type { IncidentStatus } from "@/data/mockData";

// Talks to the API for panic alerts (create, list, update).

export type PanicAlert = {
  id: string;
  studentUserId: number;
  studentName: string;
  studentEmail: string;
  alertType: string;
  location: string;
  lat: number | null;
  lng: number | null;
  status: IncidentStatus;
  assignedResponderId: number | null;
  assignedResponder: string;
  notes: string;
  timeTriggered: string;
  updatedAt: string;
};

export type NotifiedResponder = {
  id: number;
  fullName: string;
  role: string;
};

// Offline fallback — stash alerts locally if the API is down.
const QUEUE_KEY = "safetybuddy.queuedPanicAlerts";

// Small helper: attach the JWT and talk to the Node API.
async function apiJson<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((options?.headers as Record<string, string>) || {}),
  };
  const token = await loadAuthToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers,
    });
  } catch {
    throw new Error(
      `Cannot reach SafetyBuddy API at ${API_BASE_URL}. Start it with npm run api.`
    );
  }

  const data = await response.json();
  return data as T;
}

function formatTime(iso: string) {
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleString();
  } catch {
    return iso;
  }
}

// Shape the alert the way the responder dashboard expects it.
export function toResponderIncident(alert: PanicAlert) {
  return {
    id: alert.id,
    studentName: alert.studentName,
    alertType: alert.alertType,
    location: alert.location,
    timeTriggered: formatTime(alert.timeTriggered),
    assignedResponder: alert.assignedResponder,
    notes: alert.notes,
    status: alert.status,
  };
}

// Student side: create a new SOS. Only students are allowed by the API.
export async function createPanicAlertRequest(input: {
  locationLabel: string;
  lat?: number | null;
  lng?: number | null;
  notes?: string;
}): Promise<
  | {
      ok: true;
      alert: PanicAlert;
      notifiedResponders: NotifiedResponder[];
      queued?: false;
    }
  | { ok: false; error: string; queued?: boolean }
> {
  try {
    const result = await apiJson<{
      ok: boolean;
      alert?: PanicAlert;
      notifiedResponders?: NotifiedResponder[];
      error?: string;
    }>("/panic-alerts", {
      method: "POST",
      body: JSON.stringify({
        alertType: "SOS — Security",
        locationLabel: input.locationLabel,
        lat: input.lat ?? null,
        lng: input.lng ?? null,
        notes:
          input.notes ||
          "Student triggered Panic / SOS. Please respond and contact the student.",
      }),
    });

    if (!result.ok || !result.alert) {
      return { ok: false, error: result.error || "Failed to send panic alert." };
    }

    return {
      ok: true,
      alert: result.alert,
      notifiedResponders: result.notifiedResponders || [],
    };
  } catch (error) {
    // Queue locally so the student still gets feedback offline.
    try {
      const raw = await AsyncStorage.getItem(QUEUE_KEY);
      const list = raw ? (JSON.parse(raw) as unknown[]) : [];
      list.push({
        ...input,
        queuedAt: new Date().toISOString(),
      });
      await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(list));
    } catch {
      /* ignore queue write errors */
    }
    return {
      ok: false,
      queued: true,
      error:
        error instanceof Error
          ? error.message
          : "Could not reach campus security API.",
    };
  }
}

// Used by the responder dashboard to show open / recent alerts.
export async function listPanicAlerts(
  activeOnly = false
): Promise<{ ok: true; alerts: PanicAlert[] } | { ok: false; error: string }> {
  try {
    const q = activeOnly ? "?activeOnly=1" : "";
    const result = await apiJson<{
      ok: boolean;
      alerts?: PanicAlert[];
      error?: string;
    }>(`/panic-alerts${q}`);
    if (!result.ok || !result.alerts) {
      return { ok: false, error: result.error || "Failed to load alerts." };
    }
    return { ok: true, alerts: result.alerts };
  } catch (error) {
    return {
      ok: false,
      error:
        error instanceof Error ? error.message : "Failed to load panic alerts.",
    };
  }
}

// Responder claims the alert or marks it resolved / in progress.
export async function updatePanicAlertStatus(
  id: string,
  patch: {
    status?: IncidentStatus;
    assignToSelf?: boolean;
    notes?: string;
  }
): Promise<{ ok: true; alert: PanicAlert } | { ok: false; error: string }> {
  try {
    const result = await apiJson<{
      ok: boolean;
      alert?: PanicAlert;
      error?: string;
    }>(`/panic-alerts/${id}`, {
      method: "PATCH",
      body: JSON.stringify(patch),
    });
    if (!result.ok || !result.alert) {
      return { ok: false, error: result.error || "Failed to update alert." };
    }
    return { ok: true, alert: result.alert };
  } catch (error) {
    return {
      ok: false,
      error:
        error instanceof Error ? error.message : "Failed to update panic alert.",
    };
  }
}

// Who’s on duty — security users the student might get notified about.
export async function listSecurityResponders(): Promise<
  { ok: true; responders: NotifiedResponder[] } | { ok: false; error: string }
> {
  try {
    const result = await apiJson<{
      ok: boolean;
      responders?: NotifiedResponder[];
      error?: string;
    }>("/security/responders");
    if (!result.ok || !result.responders) {
      return { ok: false, error: result.error || "Failed to load responders." };
    }
    return { ok: true, responders: result.responders };
  } catch (error) {
    return {
      ok: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to load security responders.",
    };
  }
}
