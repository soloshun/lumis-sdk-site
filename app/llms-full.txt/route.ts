import { SDK_VERSION, docs, toMarkdown } from "@/content/docs";

export function GET() {
  const body = [
    `# Lumis SDK ${SDK_VERSION} — complete documentation`,
    "",
    "Apache-2.0 open-source Python framework for deterministic-first, evidence-grounded incident diagnosis and guarded recovery. Repository: https://github.com/soloshun/lumis-sdk",
    "",
    ...docs.map((page) => toMarkdown(page)),
  ].join("\n\n---\n\n");
  return new Response(body, { headers: { "content-type": "text/plain; charset=utf-8" } });
}
