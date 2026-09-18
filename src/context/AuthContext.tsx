import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  fetchCurrentUser,
  getDb,
  isSecurityRole,
  loginUser,
  registerUser,
  setAuthToken,
  type AppUser,
  type UserRole,
} from "@/services/database";

const SESSION_KEY = "safetybuddy.sessionUserId";

type AuthContextValue = {
  user: AppUser | null;
  ready: boolean;
  apiOnline: boolean;
  login: (
    email: string,
    password: string
  ) => Promise<{ ok: true; user: AppUser } | { ok: false; error: string }>;
  signup: (input: {
    email: string;
    password: string;
    fullName: string;
    role: UserRole;
  }) => Promise<{ ok: true; user: AppUser } | { ok: false; error: string }>;
  logout: () => Promise<void>;
  isSecurity: boolean;
  isAdmin: boolean;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [ready, setReady] = useState(false);
  const [apiOnline, setApiOnline] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        await getDb();
        setApiOnline(true);
        const existing = await fetchCurrentUser();
        if (existing) {
          setUser(existing);
          await AsyncStorage.setItem(SESSION_KEY, String(existing.id));
        } else {
          await AsyncStorage.removeItem(SESSION_KEY);
        }
      } catch {
        setApiOnline(false);
      } finally {
        setReady(true);
      }
    })();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) {
      return { ok: false as const, error: "Email and password are required." };
    }

    const result = await loginUser(trimmedEmail, password);
    if (!result.ok) return result;

    setUser(result.user);
    setApiOnline(true);
    await AsyncStorage.setItem(SESSION_KEY, String(result.user.id));
    return { ok: true as const, user: result.user };
  }, []);

  const signup = useCallback(
    async (input: {
      email: string;
      password: string;
      fullName: string;
      role: UserRole;
    }) => {
      if (!input.fullName.trim() || !input.email.trim() || !input.password) {
        return {
          ok: false as const,
          error: "Full name, email, and password are required.",
        };
      }

      const result = await registerUser({
        ...input,
        email: input.email.trim(),
        fullName: input.fullName.trim(),
      });
      if (!result.ok) return result;

      setUser(result.user);
      setApiOnline(true);
      await AsyncStorage.setItem(SESSION_KEY, String(result.user.id));
      return { ok: true as const, user: result.user };
    },
    []
  );

  const logout = useCallback(async () => {
    setUser(null);
    await setAuthToken(null);
    await AsyncStorage.removeItem(SESSION_KEY);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      ready,
      apiOnline,
      login,
      signup,
      logout,
      isSecurity: user ? isSecurityRole(user.role) : false,
      isAdmin: user?.role === "security_admin",
    }),
    [user, ready, apiOnline, login, signup, logout]
  );

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
