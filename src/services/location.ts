import * as Location from "expo-location";

export type SharedLocation = {
  latitude: number;
  longitude: number;
  accuracy: number | null;
  label: string;
  zoneId?: string;
  updatedAt: string;
  source: "gps" | "manual" | "fallback";
};

const FALLBACK: SharedLocation = {
  latitude: -33.9617,
  longitude: 25.6147,
  accuracy: null,
  label: "South Campus — Library steps (fallback)",
  zoneId: "ZN-2",
  updatedAt: new Date().toISOString(),
  source: "fallback",
};

export async function getSharedLocation(
  manualLabel?: string
): Promise<SharedLocation> {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      return {
        ...FALLBACK,
        label: manualLabel ?? FALLBACK.label,
        source: manualLabel ? "manual" : "fallback",
        updatedAt: new Date().toISOString(),
      };
    }

    const pos = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });

    return {
      latitude: pos.coords.latitude,
      longitude: pos.coords.longitude,
      accuracy: pos.coords.accuracy,
      label:
        manualLabel ??
        `Live GPS ${pos.coords.latitude.toFixed(5)}, ${pos.coords.longitude.toFixed(5)}`,
      updatedAt: new Date().toISOString(),
      source: manualLabel ? "manual" : "gps",
    };
  } catch {
    return {
      ...FALLBACK,
      label: manualLabel ?? FALLBACK.label,
      updatedAt: new Date().toISOString(),
      source: manualLabel ? "manual" : "fallback",
    };
  }
}
