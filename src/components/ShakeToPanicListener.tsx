import * as Haptics from "expo-haptics";
import { Accelerometer } from "expo-sensors";
import { useRouter, usePathname } from "expo-router";
import { useEffect, useRef } from "react";
import { Platform } from "react-native";

/** Acceleration magnitude (g) that counts as a shake spike. */
const SHAKE_THRESHOLD = 2.35;
/** Spikes needed within the window to confirm a shake. */
const SPIKES_NEEDED = 2;
/** Window to collect spikes (ms). */
const SPIKE_WINDOW_MS = 900;
/** Ignore further shakes after triggering (ms). */
const COOLDOWN_MS = 4000;
/** Sensor sample interval (ms). */
const UPDATE_INTERVAL_MS = 80;

const PANIC_ROUTES = [
  "/panic",
  "/(tabs)/panic",
  "/panicCountdownAlert",
  "/AlertCanceled",
];

function isOnPanicRoute(pathname: string | null | undefined) {
  if (!pathname) return false;
  return PANIC_ROUTES.some(
    (route) => pathname === route || pathname.endsWith(route)
  );
}

/**
 * Listens for a firm phone shake and opens the panic countdown screen.
 * No UI — mount once inside the student tab shell.
 */
export function ShakeToPanicListener() {
  const router = useRouter();
  const pathname = usePathname();
  const pathnameRef = useRef(pathname);
  const lastSpikeAt = useRef(0);
  const spikeCount = useRef(0);
  const cooldownUntil = useRef(0);
  const lastMagnitude = useRef(1);

  useEffect(() => {
    pathnameRef.current = pathname;
  }, [pathname]);

  useEffect(() => {
    if (Platform.OS === "web") return;

    let subscription: { remove: () => void } | null = null;
    let cancelled = false;

    (async () => {
      const available = await Accelerometer.isAvailableAsync();
      if (!available || cancelled) return;

      const permission = await Accelerometer.requestPermissionsAsync();
      if (!permission.granted || cancelled) return;

      Accelerometer.setUpdateInterval(UPDATE_INTERVAL_MS);
      subscription = Accelerometer.addListener(({ x, y, z }) => {
        const magnitude = Math.sqrt(x * x + y * y + z * z);
        const now = Date.now();

        if (now < cooldownUntil.current) {
          lastMagnitude.current = magnitude;
          return;
        }

        // Rising edge past threshold (avoids holding phone while jogging)
        const crossed =
          magnitude >= SHAKE_THRESHOLD &&
          lastMagnitude.current < SHAKE_THRESHOLD;
        lastMagnitude.current = magnitude;

        if (!crossed) return;

        if (now - lastSpikeAt.current > SPIKE_WINDOW_MS) {
          spikeCount.current = 0;
        }

        lastSpikeAt.current = now;
        spikeCount.current += 1;

        if (spikeCount.current < SPIKES_NEEDED) return;

        spikeCount.current = 0;
        cooldownUntil.current = now + COOLDOWN_MS;

        if (isOnPanicRoute(pathnameRef.current)) return;

        try {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        } catch {
          /* haptics optional */
        }

        router.push("/(tabs)/panic");
      });
    })();

    return () => {
      cancelled = true;
      subscription?.remove();
    };
  }, [router]);

  return null;
}
