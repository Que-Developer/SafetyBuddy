import AsyncStorage from "@react-native-async-storage/async-storage";

export type AppRole =
  | "student"
  | "campus_security"
  | "student_support"
  | "administrator";

const ROLE_KEY = "safetybuddy.role";

export const ROLE_LABELS: Record<AppRole, string> = {
  student: "Student",
  campus_security: "Campus Security",
  student_support: "Student Support Staff",
  administrator: "Administrator",
};

export async function loadRole(): Promise<AppRole> {
  try {
    const raw = await AsyncStorage.getItem(ROLE_KEY);
    if (
      raw === "student" ||
      raw === "campus_security" ||
      raw === "student_support" ||
      raw === "administrator"
    ) {
      return raw;
    }
  } catch {
    /* ignore */
  }
  return "student";
}

export async function saveRole(role: AppRole): Promise<void> {
  await AsyncStorage.setItem(ROLE_KEY, role);
}
