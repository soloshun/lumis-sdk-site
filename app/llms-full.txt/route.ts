import { SDK_VERSION, docs, toMarkdown } from "@/content/docs";

export const dynamic = "force-static";

export function GET() {
  const body = [
    `# Lumis SDK ${SDK_VERSION} — complete documentation`,
    "",
    `Experimental, Apache-2.0 Python SDK for evidence-grounded incident investigation. Scoped graph → registered evidence → deterministic triage → optional bounded investigator → mechanical assessment → human review. Install: pip install "lumis-sdk[http,agent]" (${SDK_VERSION}). Read-only: no remediation executor or automatic learning. Supported is not causally confirmed. Repository: https://github.com/soloshun/lumis-sdk. Foundational research: https://arxiv.org/abs/2608.01955.`,
    "",
    ...docs.map((page) => toMarkdown(page)),
  ].join("\n\n---\n\n");
  return new Response(body, { headers: { "content-type": "text/plain; charset=utf-8" } });
}
