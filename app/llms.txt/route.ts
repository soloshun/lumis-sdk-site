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
    `> Lumis SDK (${SDK_VERSION}, experimental) is an Apache-2.0 Python SDK for evidence-grounded incident investigation. It prepares an incident-scoped operational graph, runs deterministic checks first, optionally invokes one bounded tool-using investigator, mechanically assesses falsifiable explanations against evidence it collected itself, and returns a report for human review. It is read-only: it never acts on systems.`,
    "",
    `Install: pip install "lumis-sdk[http,agent]" (PyPI, version ${SDK_VERSION}). The older 0.1.0rc1 upload is a different architecture.`,
    `Repository: https://github.com/soloshun/lumis-sdk (Apache-2.0). The SDK is the open-source proof of concept of Lumis' investigation core; other Lumis products and services are separate and not necessarily open source.`,
    `Primary API: YamlProject.handle_incident / lumis incident (add --use-agent to enable the investigator).`,
    `Conclusions: supported_diagnosis (supported candidates agree on one root cause), insufficient_evidence, requires_human_expert. Reports always require human review; truth_state is always unconfirmed_hypothesis.`,
    `Boundaries: no remediation executor, no automatic rule learning, no hosted service. Missing data is unknown, never zero. Probes are degraded evidence. Models are explicit opt-in.`,
    `Evaluation: one reference estate (GridCast, 15 injected failures) with one model (DeepSeek v4 pro); see ${origin}/docs/evaluation.`,
    `Foundational research: https://arxiv.org/abs/2608.01955`,
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
