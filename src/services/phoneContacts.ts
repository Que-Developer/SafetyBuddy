import {
  Contact,
  requestPermissionsAsync,
} from "expo-contacts";
import { Platform } from "react-native";
import type { TrustedContact } from "./contacts";

// Pick a contact from the phone book (iOS / Android).

export type PickedPhoneContact = {
  name: string;
  phone: string;
  email: string;
  relationship: string;
};

export type PickContactResult =
  | { ok: true; contact: PickedPhoneContact }
  | {
      ok: false;
      reason:
        | "unsupported"
        | "permission"
        | "cancelled"
        | "no_phone"
        | "error";
    };

function normalizePhone(phone: string) {
  // Strip spaces/dashes so we can compare numbers loosely.
  return phone.replace(/[^\d+]/g, "");
}

function pickBestPhone(
  phones: { number?: string; label?: string }[]
): { number: string; label: string } | null {
  const usable = phones
    .map((p) => ({
      number: (p.number ?? "").trim(),
      label: (p.label ?? "mobile").trim() || "mobile",
    }))
    .filter((p) => p.number.length > 0);
  if (!usable.length) return null;
  // Prefer a mobile number if the contact has more than one.
  const preferred = usable.find((p) =>
    /mobile|cell|iphone|main/i.test(p.label)
  );
  return preferred ?? usable[0];
}

// Opens the system contact picker and pulls out name / phone / email.
export async function pickContactFromPhone(): Promise<PickContactResult> {
  if (Platform.OS === "web") {
    return { ok: false, reason: "unsupported" };
  }

  try {
    // Need Contacts permission before the system picker will open.
    const permission = await requestPermissionsAsync();
    if (permission.status !== "granted") {
      return { ok: false, reason: "permission" };
    }

    const selected = await Contact.presentPicker();
    if (!selected) return { ok: false, reason: "cancelled" };

    const [fullName, givenName, familyName, phones, emails] = await Promise.all(
      [
        selected.getFullName(),
        selected.getGivenName(),
        selected.getFamilyName(),
        selected.getPhones(),
        selected.getEmails(),
      ]
    );

    const bestPhone = pickBestPhone(phones);
    // Walk With Me needs at least one phone number.
    if (!bestPhone) return { ok: false, reason: "no_phone" };

    const name =
      (fullName || "").trim() ||
      [givenName, familyName].filter(Boolean).join(" ").trim() ||
      "Contact";

    const email =
      emails.map((e) => (e.address ?? "").trim()).find((a) => a.length > 0) ??
      "";

    return {
      ok: true,
      contact: {
        name,
        phone: bestPhone.number,
        email,
        relationship: bestPhone.label,
      },
    };
  } catch {
    return { ok: false, reason: "error" };
  }
}

export function phonesMatch(a: string, b: string) {
  // Treat numbers as the same if one ends with the other (country code quirks).
  const na = normalizePhone(a);
  const nb = normalizePhone(b);
  if (!na || !nb) return false;
  return na === nb || na.endsWith(nb) || nb.endsWith(na);
}

export function toTrustedContact(picked: PickedPhoneContact): TrustedContact {
  // Turn a phone-book pick into our saved TrustedContact shape.
  return {
    id: `phone-${Date.now()}`,
    name: picked.name,
    phone: picked.phone,
    email: picked.email || "phone-contact@local",
    relationship: picked.relationship || "Trusted",
    preferredAlertMethod: "SMS",
  };
}
