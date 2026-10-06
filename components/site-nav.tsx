"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Brand } from "./brand";
import { ThemeToggle } from "./theme-toggle";
import { DocsSearch } from "./docs-search";

const GITHUB = "https://github.com/soloshun/lumis-sdk";
const LUMIS = "https://lumis.qadimlabs.com";

function StatusBanner() {
  return (
    <aside className="wip-banner" role="status" aria-label="Project status">
      <strong>Experimental · v0.1.0</strong>
      <span>Research software. APIs may change. Evaluated on one reference estate so far.</span>
      <Link href="/docs/evaluation">See the results →</Link>
    </aside>
  );
}

function useHideOnScroll() {
  const [hidden, setHidden] = useState(false);
  const lastY = useRef(0);

  useEffect(() => {
    lastY.current = window.scrollY;
    const onScroll = () => {
      const currentY = window.scrollY;
      const distance = currentY - lastY.current;
      if (currentY < 80) setHidden(false);
      else if (Math.abs(distance) > 6) setHidden(distance > 0);
      lastY.current = currentY;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return hidden;
}

export function SiteNav() {
  const hidden = useHideOnScroll();
  return (
    <>
      <StatusBanner />
      <header className={`site-nav${hidden ? " is-hidden" : ""}`}>
        <div className="shell nav-inner">
          <Brand />
          <nav className="nav-links" aria-label="Primary navigation">
            <a href="#how">How it works</a>
            <a href="#results">Results</a>
            <a href="#start">Get started</a>
            <Link href="/docs">Documentation</Link>
          </nav>
          <div className="nav-tools">
            <ThemeToggle />
            <a className="nav-github" href={LUMIS} target="_blank" rel="noreferrer">Lumis.com ↗</a>
            <a className="nav-github" href={GITHUB} target="_blank" rel="noreferrer">GitHub ↗</a>
          </div>
        </div>
      </header>
    </>
  );
}

export function DocsNav() {
  return (
    <>
      <StatusBanner />
      <header className="docs-topbar">
        <div className="docs-topbar-inner">
          <Brand docs />
          <nav aria-label="Documentation utilities">
            <DocsSearch />
            <ThemeToggle />
            <Link className="hide-sm" href="/">Home</Link>
            <a className="hide-sm" href={LUMIS} target="_blank" rel="noreferrer">Lumis.com ↗</a>
            <a className="hide-sm" href="https://pypi.org/project/lumis-sdk/" target="_blank" rel="noreferrer">PyPI ↗</a>
            <a href={GITHUB} target="_blank" rel="noreferrer">GitHub ↗</a>
          </nav>
        </div>
      </header>
    </>
  );
}
