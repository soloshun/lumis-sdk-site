const FALLBACK_ORIGIN = "https://lumis-sdk.vercel.app";

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

export const SITE_TITLE = "Lumis SDK: Evidence-Grounded Incident Investigation";
export const SITE_DESCRIPTION = "An experimental, open-source Python SDK for evidence-grounded incident investigation: deterministic checks first, an optional bounded investigator, mechanical assessment of every explanation, and a report for human review. Read-only by design.";
export const CONTENT_UPDATED = "2026-10-05";
export const SOCIAL_IMAGE = { url: "/og", width: 1200, height: 630, alt: "Lumis SDK — incident investigation, grounded in evidence" };
export const IS_PREVIEW = process.env.VERCEL_ENV === "preview";

export function absoluteUrl(path = "/") {
  return new URL(path, SITE_URL).toString();
}
