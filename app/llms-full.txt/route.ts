import { SDK_VERSION, RELEASE_BOUNDARY, docs, toMarkdown } from "@/content/docs";

export const dynamic = "force-static";

export function GET() {
  const body = [
    `# Lumis SDK ${SDK_VERSION} — complete documentation`,
    "",
    `Experimental, Apache-2.0 Python SDK for evidence-grounded incident investigation. Scoped graph → registered evidence → deterministic triage → optional bounded investigator → mechanical assessment → human review. Install: pip install "lumis-sdk[http,agent]" (${SDK_VERSION}). Read-only: no remediation executor or automatic learning. Supported is not causally confirmed. Repository: https://github.com/soloshun/lumis-sdk. Foundational research: https://arxiv.org/abs/2608.01955.`,
    "",
    `Release boundary: ${RELEASE_BOUNDARY} The Unreleased maintenance page must not be read as part of the published-0.1.0 API.`,
    ...docs.map((page) => toMarkdown(page)),
  ].join("\n\n---\n\n");
  return new Response(body, { headers: { "content-type": "text/plain; charset=utf-8" } });
}
