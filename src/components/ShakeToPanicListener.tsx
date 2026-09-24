import * as Haptics from "expo-haptics";
import { usePathname, useRouter } from "expo-router";
import { Accelerometer } from "expo-sensors";
import { useEffect, useRef } from "react";
import { Platform } from "react-native";

// Shake detection settings 
const SHAKE_THRESHOLD = 2.35;
const SPIKES_NEEDED = 2;
const SPIKE_WINDOW_MS = 900;
const COOLDOWN_MS = 4000;
const UPDATE_INTERVAL_MS = 80;

// Don't open panic again if we're already on a panic-related screen.
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

// Listens for a firm shake and opens the panic screen (students only).
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
    // Shake needs the accelerometer — skip on web.
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

        // After a shake we pause briefly so it doesn’t re-trigger.
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

        // Need a few spikes close together before we treat it as a shake.
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

        // Open the panic tab so the countdown can start.
        router.push("/(tabs)/panic");
      });
    })();

    return () => {
      cancelled = true;
      subscription?.remove();
    };
  }, [router]);

  // Invisible listener — no UI of its own.
  return null;
}
