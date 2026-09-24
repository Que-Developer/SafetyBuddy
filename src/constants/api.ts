import Constants from "expo-constants";
import { Platform } from "react-native";

// Figures out where the Node API lives (phone vs emulator vs web).
// Set EXPO_PUBLIC_API_URL if you're on a real phone over Wi-Fi.
function resolveApiBaseUrl() {
  // Explicit override wins (handy when Expo host IP is wrong).
  const fromEnv = process.env.EXPO_PUBLIC_API_URL;
  if (fromEnv) return fromEnv.replace(/\/$/, "");

  const hostUri =
    Constants.expoConfig?.hostUri ||
    Constants.linkingUri ||
    "";

  // Expo host looks like "192.168.x.x:8081" — reuse that LAN IP for the API.
  const lanHost = String(hostUri).split(":")[0];
  if (
    lanHost &&
    lanHost !== "localhost" &&
    lanHost !== "127.0.0.1" &&
    /^\d+\.\d+\.\d+\.\d+$/.test(lanHost)
  ) {
    return `http://${lanHost}:3001`;
  }

  if (Platform.OS === "android") {
    // Android emulator reaches the host PC at 10.0.2.2.
    return "http://10.0.2.2:3001";
  }

  // iOS simulator / web on the same machine.
  return "http://localhost:3001";
}

// Used by every client service that talks to /server.
export const API_BASE_URL = resolveApiBaseUrl();
