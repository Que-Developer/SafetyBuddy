import AsyncStorage from "@react-native-async-storage/async-storage";

// Trusted contacts saved on the phone (used by Walk With Me).

export type TrustedContact = {
  id: string;
  name: string;
  relationship: string;
  phone: string;
  email: string;
  preferredAlertMethod: "SMS" | "Call" | "Email" | "App push";
};

const KEY = "safetybuddy.trustedContacts";

// Demo contacts shown until the student adds their own.
export const DEFAULT_TRUSTED_CONTACTS: TrustedContact[] = [
  {
    id: "tc-1",
    name: "Thandi M.",
    relationship: "Mother",
    phone: "+27 82 000 1111",
    email: "thandi.demo@example.com",
    preferredAlertMethod: "SMS",
  },
  {
    id: "tc-2",
    name: "Sipho K.",
    relationship: "Roommate",
    phone: "+27 83 000 2222",
    email: "sipho.demo@example.com",
    preferredAlertMethod: "App push",
  },
];

export async function loadTrustedContacts(): Promise<TrustedContact[]> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    // Nothing saved yet — fall back to the demo list.
    if (!raw) return DEFAULT_TRUSTED_CONTACTS;
    const parsed = JSON.parse(raw) as TrustedContact[];
    return Array.isArray(parsed) && parsed.length > 0
      ? parsed
      : DEFAULT_TRUSTED_CONTACTS;
  } catch {
    return DEFAULT_TRUSTED_CONTACTS;
  }
}

export async function saveTrustedContacts(
  contacts: TrustedContact[]
): Promise<void> {
  // Persist the student's contact list on this device.
  await AsyncStorage.setItem(KEY, JSON.stringify(contacts));
}
