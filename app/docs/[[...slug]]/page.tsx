import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CopyCode } from "@/components/copy-code";
import { MobileDocSelect } from "@/components/mobile-doc-select";
import { DocsNav } from "@/components/site-nav";
import { docs, getAdjacentDoc, getDoc, groups, type DocBlock } from "@/content/docs";

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
        <div className="docs-version"><span>VERSION</span><b>0.0.1</b><small>PRE-ALPHA</small></div>
        {groups.map(({ group, pages }) => (
          <details className="docs-group" key={group} open={group === page.group}>
            <summary>{group}<span aria-hidden="true">⌄</span></summary>
            <div>{pages.map((item) => (
              <div className="docs-nav-item" key={item.slug}>
                <Link className={item.slug === page.slug ? "active" : ""} href={item.slug === "overview" ? "/docs" : `/docs/${item.slug}`}>{item.label}</Link>
                {item.slug === page.slug && item.sections.length > 1 ? <div className="docs-subnav">{item.sections.map((section) => <a href={`#${section.id}`} key={section.id}>{section.title}</a>)}</div> : null}
              </div>
            ))}</div>
          </details>
        ))}
      </aside>
      <main className="docs-main" id="main">
        <MobileDocSelect current={page.slug} options={docs.map((item) => ({ slug: item.slug, label: `${item.group} / ${item.label}` }))} />
        <article className="docs-article">
          <header><p className="docs-breadcrumb">DOCS / {page.group.toUpperCase()}</p><h1>{page.title}</h1><p>{page.description}</p><div className="docs-page-meta"><span>PRE-ALPHA</span><span>PYTHON 3.11+</span><a href="https://github.com/soloshun/lumis-sdk" target="_blank" rel="noreferrer">EDIT ON GITHUB ↗</a></div></header>
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

function DocBlockView({ block }: { block: DocBlock }) {
  if (block.type === "p") return <p>{block.text}</p>;
  if (block.type === "list") return <ul>{block.items.map((item) => <li key={item}>{item}</li>)}</ul>;
  if (block.type === "note") return <aside className={`doc-note ${block.tone || "blue"}`}><strong>{block.title}</strong><p>{block.text}</p></aside>;
  if (block.type === "code") return <div className="doc-code"><div><span>{block.language}</span><CopyCode code={block.code} /></div><pre><code>{block.code}</code></pre></div>;
  return <div className="doc-table-wrap"><table><thead><tr>{block.headers.map((header) => <th key={header}>{header}</th>)}</tr></thead><tbody>{block.rows.map((row, index) => <tr key={index}>{row.map((cell, cellIndex) => <td key={cellIndex}>{cell}</td>)}</tr>)}</tbody></table></div>;
}
