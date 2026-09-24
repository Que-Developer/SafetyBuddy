import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE_URL } from "@/constants/api";

// Client helpers for login and talking to the SafetyBuddy API.

export type UserRole = "student" | "security_staff" | "security_admin";

export type AppUser = {
  id: number;
  email: string;
  fullName: string;
  role: UserRole;
  createdAt: string;
};

const TOKEN_KEY = "safetybuddy.authToken";

// Keep the JWT in memory so we don't hit AsyncStorage on every request.
let memoryToken: string | null = null;

export async function setAuthToken(token: string | null) {
  // null clears the session (logout).
  memoryToken = token;
  if (token) {
    await AsyncStorage.setItem(TOKEN_KEY, token);
  } else {
    await AsyncStorage.removeItem(TOKEN_KEY);
  }
}

export async function loadAuthToken(): Promise<string | null> {
  if (memoryToken) return memoryToken;
  memoryToken = await AsyncStorage.getItem(TOKEN_KEY);
  return memoryToken;
}

// Shared fetch wrapper — adds the Bearer token unless auth: false.
async function api<T>(
  path: string,
  options?: RequestInit & { auth?: boolean }
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((options?.headers as Record<string, string>) || {}),
  };

  if (options?.auth !== false) {
    const token = await loadAuthToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

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

  let data: T & {
    ok?: boolean;
    error?: string;
    user?: AppUser;
    users?: AppUser[];
    token?: string;
  };
  try {
    data = await response.json();
  } catch {
    throw new Error(
      `Cannot reach SafetyBuddy API at ${API_BASE_URL}. Start it with npm run api.`
    );
  }

  if (data.user) {
    // IDs sometimes come back as strings from JSON — keep them as numbers.
    data.user = { ...data.user, id: Number(data.user.id) };
  }
  if (Array.isArray(data.users)) {
    data.users = data.users.map((u) => ({ ...u, id: Number(u.id) }));
  }

  return data as T;
}

// Ping the API / SQL connection before we try to log anyone in.
export async function getDb(): Promise<void> {
  const health = await api<{ ok: boolean; error?: string }>("/health", {
    auth: false,
  });
  if (!health.ok) {
    throw new Error(health.error || "SQL Server health check failed.");
  }
}

export async function loginUser(
  email: string,
  password: string
): Promise<
  { ok: true; user: AppUser; token: string } | { ok: false; error: string }
> {
  try {
    const result = await api<{
      ok: boolean;
      user?: AppUser;
      token?: string;
      error?: string;
    }>("/auth/login", {
      method: "POST",
      auth: false,
      body: JSON.stringify({ email, password }),
    });

    if (!result.ok || !result.user || !result.token) {
      return { ok: false, error: result.error || "Login failed." };
    }

    // Store the JWT so later API calls are authenticated.
    await setAuthToken(result.token);
    return { ok: true, user: result.user, token: result.token };
  } catch (error) {
    return {
      ok: false,
      error:
        error instanceof Error
          ? error.message
          : "Login failed. Is the SQL Server API running?",
    };
  }
}

export async function registerUser(input: {
  email: string;
  password: string;
  fullName: string;
  role: UserRole;
}): Promise<
  { ok: true; user: AppUser; token: string } | { ok: false; error: string }
> {
  try {
    const result = await api<{
      ok: boolean;
      user?: AppUser;
      token?: string;
      error?: string;
    }>("/auth/register", {
      method: "POST",
      auth: false,
      body: JSON.stringify(input),
    });

    if (!result.ok || !result.user || !result.token) {
      return { ok: false, error: result.error || "Sign up failed." };
    }

    await setAuthToken(result.token);
    return { ok: true, user: result.user, token: result.token };
  } catch (error) {
    return {
      ok: false,
      error:
        error instanceof Error
          ? error.message
          : "Sign up failed. Is the SQL Server API running?",
    };
  }
}

export async function fetchCurrentUser(): Promise<AppUser | null> {
  const token = await loadAuthToken();
  if (!token) return null;

  try {
    // Ask the server who this token belongs to.
    const result = await api<{ ok: boolean; user?: AppUser; error?: string }>(
      "/auth/me"
    );
    if (!result.ok || !result.user) {
      await setAuthToken(null);
      return null;
    }
    return result.user;
  } catch {
    return null;
  }
}

export async function listUsers(): Promise<AppUser[]> {
  // Admin-only list of accounts.
  const result = await api<{ ok: boolean; users?: AppUser[]; error?: string }>(
    "/users"
  );
  if (!result.ok || !result.users) {
    throw new Error(result.error || "Failed to load users.");
  }
  return result.users;
}

export async function getUserById(id: number): Promise<AppUser | null> {
  try {
    const result = await api<{ ok: boolean; user?: AppUser }>(`/users/${id}`);
    return result.user ?? null;
  } catch {
    return null;
  }
}

// Security staff and admins both count as "responder" roles.
export function isSecurityRole(role: UserRole): boolean {
  return role === "security_staff" || role === "security_admin";
}

export function canAccessAdmin(role: UserRole): boolean {
  return role === "security_admin";
}
