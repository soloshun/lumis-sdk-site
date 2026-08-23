import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Lumis SDK — Agentic Self-Healing for Data & AI Pipelines",
    short_name: "Lumis SDK",
    description: "Open-source, vendor-agnostic Python framework for deterministic-first diagnosis and guarded recovery across data, ML, and software delivery pipelines.",
    start_url: "/",
    display: "standalone",
    background_color: "#050507",
    theme_color: "#050507",
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml" }],
  };
}
