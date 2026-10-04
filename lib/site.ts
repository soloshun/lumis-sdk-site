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

export const SITE_TITLE = "Lumis SDK: Evidence-Grounded Operational Intelligence";
export const SITE_DESCRIPTION = "An experimental, open-source Python SDK for evidence-grounded operational intelligence: scoped incident investigation, deterministic triage, bounded agents, and human review.";
export const CONTENT_UPDATED = "2026-10-04";
export const SOCIAL_IMAGE = { url: "/og", width: 1200, height: 630, alt: "Lumis SDK — operational intelligence, grounded in evidence" };
export const IS_PREVIEW = process.env.VERCEL_ENV === "preview";

export function absoluteUrl(path = "/") {
  return new URL(path, SITE_URL).toString();
}
