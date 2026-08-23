import { SDK_VERSION, docs, toMarkdown } from "@/content/docs";

export function GET() {
  const body = [
    `# Lumis SDK ${SDK_VERSION} — complete documentation`,
    "",
    "Apache-2.0, vendor-agnostic Python framework for agentic self-healing across data, ML, and software-delivery pipelines—combining deterministic-first diagnosis, guarded recovery, operational memory, explicit approval, verification, and governed learning. Repository: https://github.com/soloshun/lumis-sdk · Package: https://pypi.org/project/lumis-sdk/ · Paper: https://arxiv.org/abs/2608.01955",
    "",
    ...docs.map((page) => toMarkdown(page)),
  ].join("\n\n---\n\n");
  return new Response(body, { headers: { "content-type": "text/plain; charset=utf-8" } });
}
