import { SDK_VERSION, docs } from "@/content/docs";
import { SITE_ORIGIN } from "@/lib/site";

export const dynamic = "force-static";

export function GET() {
  const origin = SITE_ORIGIN;
  const byGroup = new Map<string, typeof docs>();
  for (const page of docs) {
    const list = byGroup.get(page.group) || [];
    list.push(page);
    byGroup.set(page.group, list);
  }

  const lines: string[] = [
    "# Lumis SDK",
    "",
    `> Lumis SDK (${SDK_VERSION}) is an experimental, Apache-2.0, vendor-neutral Python framework for evidence-grounded operational intelligence. It prepares an incident-scoped graph, tests known signatures, optionally invokes one bounded investigator, mechanically assesses falsifiable explanations, and returns a human-review report.`,
    "",
    `Repository: https://github.com/soloshun/lumis-sdk`,
    `Current architecture: install a reviewed dev checkout, not an older package-index artifact.`,
    `Primary API: YamlProject.handle_incident / lumis incident.`,
    `Candidate-only comparison baseline: investigate / --use-model, not the tool-using agent.`,
    `Boundaries: no remediation executor, automatic rule promotion, live OTLP receiver, or confirmed causal diagnosis. Suggestions are not applied. Probes are degraded synthetic evidence. Models are explicit opt-in.`,
    `Supported candidates with competing roots remain insufficient_evidence; reports always require human review.`,
    `Foundational prior research (not an exact current SDK contract): https://arxiv.org/abs/2608.01955`,
    `Full documentation as one Markdown file: ${origin}/llms-full.txt`,
    "",
  ];
  for (const [group, pages] of byGroup) {
    lines.push(`## ${group}`, "");
    for (const page of pages) {
      const path = page.slug === "overview" ? "/docs" : `/docs/${page.slug}`;
      lines.push(`- [${page.title}](${origin}${path}): ${page.description}`);
    }
    lines.push("");
  }
  return new Response(lines.join("\n"), { headers: { "content-type": "text/plain; charset=utf-8" } });
}
