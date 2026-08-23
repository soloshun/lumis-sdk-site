const FALLBACK_ORIGIN = "https://lumis-sdk-site.vercel.app";

function normalizeOrigin(value: string) {
  const withProtocol = value.startsWith("http://") || value.startsWith("https://")
    ? value
    : `https://${value}`;
  return new URL(withProtocol).origin;
}

export const SITE_ORIGIN = normalizeOrigin(
  process.env.NEXT_PUBLIC_SITE_URL ??
  process.env.VERCEL_PROJECT_PRODUCTION_URL ??
  FALLBACK_ORIGIN,
);

export const SITE_URL = new URL(SITE_ORIGIN);

export function absoluteUrl(path = "/") {
  return new URL(path, SITE_URL).toString();
}
