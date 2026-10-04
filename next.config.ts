import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    // Retired APIs belong to history. Redirect their documentation to the reset
    // guide, not to pages that could suggest the old interfaces still exist.
    const migration = [
      "concepts/diagnosis-as-code", "concepts/healing-as-code", "concepts/guarded-recovery", "concepts/operational-memory",
      "architecture/ports-and-adapters", "architecture/lifecycle-contracts", "architecture/framework-and-cookbooks",
      "configuration/rules", "configuration/structured-rules", "configuration/migrate-to-v1",
      "python-api/memory", "python-api/policy-verification-learning", "python-api/plugins",
      "cookbooks/overview", "learn/videos", "project/roadmap", "project/contributing", "project/stability", "project/research", "project/lumis-and-sdk",
    ];
    const current: Record<string, string> = {
      "overview": "", "getting-started/quickstart": "quickstart", "getting-started/framework-workflow": "investigation",
      "concepts/deterministic-first": "investigation", "concepts/evidence-grounded": "investigation",
      "architecture/overview": "architecture", "architecture/model-boundary": "safety", "configuration/project": "configuration",
      "python-api/overview": "api", "python-api/evidence-and-reports": "api", "python-api/connectors": "connectors",
      "reference/cli": "api", "reference/domain-models": "architecture", "reference/ports": "api", "safety/threat-model": "safety",
    };
    return [
      ...migration.map(slug => ({source: `/docs/${slug}`, destination: "/docs/project", permanent: true})),
      ...Object.entries(current).map(([slug, target]) => ({source: `/docs/${slug}`, destination: target ? `/docs/${target}` : "/docs", permanent: true})),
      {source: "/og.png", destination: "/og", permanent: true},
    ];
  },
};

export default nextConfig;
