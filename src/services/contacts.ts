import {
  addTrustedContact,
  fetchTrustedContacts,
  removeTrustedContact,
  type TrustedContact,
} from "@/services/campusApi";

export type { TrustedContact };

/** Load trusted contacts from SQL Server for the logged-in student. */
export async function loadTrustedContacts(): Promise<TrustedContact[]> {
  try {
    return await fetchTrustedContacts();
  } catch {
    return [];
  }
}

export async function saveTrustedContacts(
  _contacts: TrustedContact[]
): Promise<void> {
  // Persistence is per-contact via API; kept for call-site compatibility.
}

export async function createTrustedContact(contact: {
  name: string;
  phone: string;
  email?: string;
  relationship?: string;
  preferredAlertMethod?: string;
}): Promise<TrustedContact[]> {
  return addTrustedContact(contact);
}

export async function deleteTrustedContact(
  id: string
): Promise<TrustedContact[]> {
  return removeTrustedContact(id);
}
