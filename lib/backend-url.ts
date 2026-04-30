const DEFAULT_BACKEND_URL = "https://api.suncarsrl.com";
const WEB_HOSTS = new Set(["suncarsrl.com", "www.suncarsrl.com"]);

export function getBackendUrl(): string {
  const rawUrl =
    process.env.BACKEND_URL ||
    process.env.NEXT_PUBLIC_BACKEND_URL ||
    DEFAULT_BACKEND_URL;

  const cleanedUrl = rawUrl.trim().replace(/^["']|["']$/g, "");

  try {
    const parsed = new URL(cleanedUrl);
    if (WEB_HOSTS.has(parsed.hostname)) {
      return DEFAULT_BACKEND_URL;
    }

    return cleanedUrl.replace(/\/+$/, "");
  } catch {
    return DEFAULT_BACKEND_URL;
  }
}
