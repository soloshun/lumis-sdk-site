import { SDK_VERSION, docs } from "@/content/docs";

export function GET(request: Request) {
  const origin = new URL(request.url).origin;
  const byGroup = new Map<string, typeof docs>();
  for (const page of docs) {
    const list = byGroup.get(page.group) || [];
    list.push(page);
    byGroup.set(page.group, list);
  }

  const lines: string[] = [
    "# Lumis SDK",
    "",
    `> Lumis SDK ${SDK_VERSION} is an Apache-2.0 open-source Python framework for deterministic-first, evidence-grounded incident diagnosis and guarded recovery across data, ML, and software-delivery pipelines. Models are optional, storage is local-first, and consequential actions stay behind explicit policy, approval, and verification boundaries.`,
    "",
    `Repository: https://github.com/soloshun/lumis-sdk`,
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
