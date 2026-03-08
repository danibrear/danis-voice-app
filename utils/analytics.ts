// Native: GA4 Measurement Protocol
// Requires EXPO_PUBLIC_GA_MEASUREMENT_ID and EXPO_PUBLIC_GA_API_SECRET

import { Dimensions, Platform } from "react-native";

const MEASUREMENT_ID = process.env.EXPO_PUBLIC_GA_MEASUREMENT_ID;
const API_SECRET = process.env.EXPO_PUBLIC_GA_API_SECRET;

// Simple persistent client ID using module-level cache
let _clientId: string | null = null;
function getClientId(): string {
  if (!_clientId) {
    _clientId = Math.random().toString(36).slice(2) + Date.now().toString(36);
  }
  return _clientId;
}

function getDeviceParams(): Record<string, string | number | boolean> {
  const { width, height } = Dimensions.get("window");
  return {
    platform: Platform.OS,
    os_version: String(Platform.Version),
    screen_width: Math.round(width),
    screen_height: Math.round(height),
  };
}

export async function logEvent(
  name: string,
  params?: Record<string, string | number | boolean>,
): Promise<void> {
  if (!MEASUREMENT_ID || !API_SECRET) return;
  try {
    await fetch(
      `https://www.google-analytics.com/mp/collect?measurement_id=${MEASUREMENT_ID}&api_secret=${API_SECRET}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client_id: getClientId(),
          events: [{ name, params: { ...getDeviceParams(), ...(params ?? {}) } }],
        }),
      },
    );
    console.log(`[Analytics] Logged event: ${name}`, params ?? {});
  } catch {
    // Analytics should never crash the app
    console.log("[Analytics] Failed to log event:", name);
  }
}

export function logScreenView(screenName: string): Promise<void> {
  return logEvent("screen_view", { screen_name: screenName });
}
