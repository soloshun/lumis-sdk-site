import type { DocBlock, DocPage } from "@/content/docs";

export type DocsSearchEntry = {
  id: string;
  href: string;
  title: string;
  page: string;
  group: string;
  text: string;
};

function plainText(text: string) {
  return text.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1").replace(/[*`]/g, "").replace(/\s+/g, " ").trim();
}

function blockText(block: DocBlock) {
  if (block.type === "p") return block.text;
  if (block.type === "note") return `${block.title} ${block.text}`;
  if (block.type === "list") return block.items.join(" ");
  if (block.type === "table") return [...block.headers, ...block.rows.flat()].join(" ");
  if (block.type === "code") return block.code;
  return block.caption ?? "";
}

export function createDocsSearchIndex(pages: DocPage[]): DocsSearchEntry[] {
  return pages.flatMap((page) => {
    const href = page.slug === "overview" ? "/docs" : `/docs/${page.slug}`;
    const shared = { page: page.label, group: page.group };
    return [
      { ...shared, id: page.slug, href, title: page.label, text: plainText(`${page.title}. ${page.description}`) },
      ...page.sections.map((section) => ({
        ...shared, id: `${page.slug}:${section.id}`, href: `${href}#${section.id}`, title: section.title,
        text: plainText(section.blocks.map(blockText).join(" ")),
      })),
    ];
  });
}

export function searchDocumentation(entries: DocsSearchEntry[], query: string, limit = 10): DocsSearchEntry[] {
  const phrase = query.trim().toLowerCase();
  const terms = [...new Set(phrase.split(/\s+/).filter(Boolean))].slice(0, 8);
  if (!terms.length) return entries.filter((entry) => !entry.href.includes("#")).slice(0, limit);
  const matches = entries.map((entry, order) => {
    const title = entry.title.toLowerCase();
    const page = entry.page.toLowerCase();
    const text = entry.text.toLowerCase();
    const haystack = `${title} ${page} ${entry.group.toLowerCase()} ${text}`;
    if (!terms.every((term) => haystack.includes(term))) return null;
    const score = terms.reduce((total, term) => total + (title.includes(term) ? 30 : 0) + (page.includes(term) ? 8 : 0) + (text.includes(term) ? 1 : 0), 0)
      + (title.includes(phrase) ? 20 : 0) + (!entry.href.includes("#") ? 2 : 0);
    return { entry, score, order };
  }).filter((match) => match !== null).sort((a, b) => b.score - a.score || a.order - b.order);
  const perPage = new Map<string, number>();
  return matches.filter(({ entry }) => {
    const page = entry.href.split("#")[0];
    const count = perPage.get(page) ?? 0;
    perPage.set(page, count + 1);
    return count < 2;
  }).slice(0, limit).map(({ entry }) => entry);
}

export function searchExcerpt(text: string, query: string) {
  const terms = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  const positions = terms.map((term) => text.toLowerCase().indexOf(term)).filter((index) => index >= 0);
  const position = positions.length ? Math.min(...positions) : 0;
  let start = Math.max(0, position - 55);
  const boundary = text.indexOf(" ", start);
  if (start && boundary >= 0 && boundary < position) start = boundary + 1;
  let end = Math.min(text.length, start + 190);
  if (end < text.length) {
    const lastSpace = text.lastIndexOf(" ", end);
    if (lastSpace > position) end = lastSpace;
  }
  return `${start ? "…" : ""}${text.slice(start, end)}${end < text.length ? "…" : ""}`;
}
