// Web: Google Analytics 4 via gtag
// Requires EXPO_PUBLIC_GA_MEASUREMENT_ID

const MEASUREMENT_ID = process.env.EXPO_PUBLIC_GA_MEASUREMENT_ID;

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag: (...args: unknown[]) => void;
  }
}

let initialized = false;

function init() {
  if (initialized || !MEASUREMENT_ID || typeof window === "undefined") return;
  initialized = true;

  const gtagScript = document.createElement("script");
  gtagScript.src = `https://www.googletagmanager.com/gtag/js?id=${MEASUREMENT_ID}`;
  gtagScript.async = true;
  document.head.appendChild(gtagScript);

  const initScript = document.createElement("script");
  initScript.textContent = `
    window.dataLayer = window.dataLayer || [];
    function gtag(){window.dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', '${MEASUREMENT_ID}');
  `;
  document.head.appendChild(initScript);
}

function getDeviceParams(): Record<string, string | number | boolean> {
  if (typeof window === "undefined") return {};
  return {
    platform: "web",
    language: navigator.language,
    screen_width: window.screen.width,
    screen_height: window.screen.height,
  };
}

export async function logEvent(
  name: string,
  params?: Record<string, string | number | boolean>,
): Promise<void> {
  init();
  if (!MEASUREMENT_ID || typeof window === "undefined" || !window.gtag) return;
  window.gtag("event", name, { ...getDeviceParams(), ...(params ?? {}) });
}

export function logScreenView(screenName: string): Promise<void> {
  return logEvent("screen_view", { screen_name: screenName });
}
