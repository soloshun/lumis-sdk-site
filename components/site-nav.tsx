import Link from "next/link";
import { Brand, GitHubMark } from "./brand";

const GITHUB = "https://github.com/soloshun/lumis-sdk";

export function SiteNav() {
  return (
    <header className="site-nav">
      <div className="shell nav-inner">
        <Brand />
        <nav className="nav-links" aria-label="Primary navigation">
          <a href="#principles">Principles</a>
          <a href="#architecture">Architecture</a>
          <a href="#cookbooks">Cookbooks</a>
          <Link href="/docs">Documentation</Link>
        </nav>
        <a className="nav-github" href={GITHUB} target="_blank" rel="noreferrer">
          <GitHubMark /> GitHub <span aria-hidden="true">↗</span>
        </a>
      </div>
    </header>
  );
}

export function DocsNav() {
  return (
    <header className="docs-topbar">
      <div className="docs-topbar-inner">
        <Brand docs />
        <nav aria-label="Documentation utilities">
          <Link href="/">SDK overview</Link>
          <a href={GITHUB} target="_blank" rel="noreferrer">GitHub ↗</a>
        </nav>
      </div>
    </header>
  );
}
