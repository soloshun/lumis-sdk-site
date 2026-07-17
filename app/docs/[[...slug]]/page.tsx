import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CopyCode } from "@/components/copy-code";
import { CopyMarkdown } from "@/components/copy-markdown";
import { DocsGroups } from "@/components/docs-groups";
import { Mermaid } from "@/components/mermaid";
import { MobileDocSelect } from "@/components/mobile-doc-select";
import { DocsNav } from "@/components/site-nav";
import { SDK_VERSION, docs, getAdjacentDoc, getDoc, groups, toMarkdown, type DocBlock } from "@/content/docs";
import { highlightCode } from "@/lib/highlight";

export function generateStaticParams() {
  return [{ slug: [] }, ...docs.filter((page) => page.slug !== "overview").map((page) => ({ slug: page.slug.split("/") }))];
}

export async function generateMetadata({ params }: { params: Promise<{ slug?: string[] }> }): Promise<Metadata> {
  const { slug } = await params;
  const page = getDoc(slug);
  if (!page) return {};
  return { title: page.title, description: page.description };
}

export default async function DocsPage({ params }: { params: Promise<{ slug?: string[] }> }) {
  const { slug } = await params;
  const page = getDoc(slug);
  if (!page) notFound();
  const adjacent = getAdjacentDoc(page.slug);

  return (
    <div className="docs-shell">
      <DocsNav />
      <aside className="docs-sidebar" aria-label="Documentation navigation">
        <div className="docs-version"><span>VERSION</span><b>{SDK_VERSION}</b><small>PHASE 1</small></div>
        <DocsGroups
          groups={groups.map(({ group, pages }) => ({ group, pages: pages.map((item) => ({ slug: item.slug, label: item.label, nested: item.nested })) }))}
          activeSlug={page.slug}
          activeGroup={page.group}
        />
        <div className="docs-ai-note">
          <span>FOR AI ASSISTANTS</span>
          <a href="/llms.txt">llms.txt</a> · <a href="/llms-full.txt">llms-full.txt</a>
        </div>
      </aside>
      <main className="docs-main" id="main">
        <MobileDocSelect current={page.slug} options={docs.map((item) => ({ slug: item.slug, label: `${item.group} / ${item.label}` }))} />
        <article className="docs-article">
          <header>
            <p className="docs-breadcrumb">DOCS / {page.group.toUpperCase()}</p>
            <h1>{page.title}</h1>
            <p>{page.description}</p>
            <div className="docs-page-meta">
              <span>PHASE 1 · PRE-1.0</span><span>PYTHON 3.11+</span>
              <CopyMarkdown markdown={toMarkdown(page)} />
              <a href="https://github.com/soloshun/lumis-sdk" target="_blank" rel="noreferrer">EDIT ON GITHUB ↗</a>
            </div>
          </header>
          {page.sections.map((section) => (
            <section id={section.id} key={section.id}><h2>{section.title}</h2>{section.blocks.map((block, index) => <DocBlockView block={block} key={index} />)}</section>
          ))}
          <nav className="docs-pagination" aria-label="Previous and next pages">
            {adjacent.previous ? <Link href={adjacent.previous.slug === "overview" ? "/docs" : `/docs/${adjacent.previous.slug}`}><small>PREVIOUS</small><span>← {adjacent.previous.label}</span></Link> : <span />}
            {adjacent.next ? <Link className="next" href={`/docs/${adjacent.next.slug}`}><small>NEXT</small><span>{adjacent.next.label} →</span></Link> : <span />}
          </nav>
        </article>
      </main>
      <aside className="docs-toc" aria-label="On this page"><h2>ON THIS PAGE</h2>{page.sections.map((section) => <a href={`#${section.id}`} key={section.id}>{section.title}</a>)}</aside>
    </div>
  );
}

const LINK_PATTERN = /\[([^\]]+)\]\(([^)\s]+)\)/g;

// Renders plain text with [label](url) markdown links; everything else stays literal text.
function Inline({ text }: { text: string }) {
  const parts: React.ReactNode[] = [];
  let cursor = 0;
  for (const match of text.matchAll(LINK_PATTERN)) {
    const index = match.index ?? 0;
    if (index > cursor) parts.push(text.slice(cursor, index));
    const [, label, href] = match;
    if (href.startsWith("/docs")) parts.push(<Link href={href} key={index}>{label}</Link>);
    else if (href.startsWith("/")) parts.push(<a href={href} target="_blank" rel="noreferrer" key={index}>{label}</a>);
    else parts.push(<a href={href} target="_blank" rel="noreferrer" key={index}>{label} ↗</a>);
    cursor = index + match[0].length;
  }
  if (parts.length === 0) return text;
  if (cursor < text.length) parts.push(text.slice(cursor));
  return <>{parts}</>;
}

function CodeBlock({ language, code }: { language: string; code: string }) {
  const highlighted = highlightCode(code, language);
  return (
    <div className="doc-code">
      <div><span>{language}</span><CopyCode code={code} /></div>
      <pre>{highlighted ? <code className="hljs" dangerouslySetInnerHTML={{ __html: highlighted }} /> : <code>{code}</code>}</pre>
    </div>
  );
}

function DocBlockView({ block }: { block: DocBlock }) {
  if (block.type === "p") return <p><Inline text={block.text} /></p>;
  if (block.type === "list") return <ul>{block.items.map((item) => <li key={item}><Inline text={item} /></li>)}</ul>;
  if (block.type === "note") return <aside className={`doc-note ${block.tone || "blue"}`}><strong>{block.title}</strong><p><Inline text={block.text} /></p></aside>;
  if (block.type === "code") return <CodeBlock language={block.language} code={block.code} />;
  if (block.type === "diagram") return <Mermaid code={block.code} caption={block.caption} />;
  return <div className="doc-table-wrap"><table><thead><tr>{block.headers.map((header) => <th key={header}>{header}</th>)}</tr></thead><tbody>{block.rows.map((row, index) => <tr key={index}>{row.map((cell, cellIndex) => <td key={cellIndex}><Inline text={cell} /></td>)}</tr>)}</tbody></table></div>;
}
