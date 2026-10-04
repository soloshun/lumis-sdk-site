import type { MetadataRoute } from "next";
import { absoluteUrl, SITE_ORIGIN, IS_PREVIEW } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", ...(IS_PREVIEW ? { disallow: "/" } : { allow: "/" }) }],
    sitemap: absoluteUrl("/sitemap.xml"),
    host: SITE_ORIGIN,
  };
}
