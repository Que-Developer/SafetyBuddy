import Constants from "expo-constants";
import { Platform } from "react-native";

/**
 * API talks to local SQL Server through the Node backend in /server.
 * - Web / emulator on same PC: localhost
 * - Physical phone on Wi-Fi: set EXPO_PUBLIC_API_URL to your PC LAN IP
 */
function resolveApiBaseUrl() {
  const fromEnv = process.env.EXPO_PUBLIC_API_URL;
  if (fromEnv) return fromEnv.replace(/\/$/, "");

  const hostUri =
    Constants.expoConfig?.hostUri ||
    Constants.linkingUri ||
    "";

  // When Expo is serving, hostUri looks like "192.168.x.x:8081"
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
    // Android emulator loopback to host machine
    return "http://10.0.2.2:3001";
  }

  return "http://localhost:3001";
}

export const API_BASE_URL = resolveApiBaseUrl();
