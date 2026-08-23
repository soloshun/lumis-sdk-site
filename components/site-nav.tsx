"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Brand, GitHubMark } from "./brand";
import { ThemeToggle } from "./theme-toggle";

const GITHUB = "https://github.com/soloshun/lumis-sdk";
const PAPER = "https://arxiv.org/abs/2608.01955";

function WorkInProgressBanner() {
  return (
    <aside className="wip-banner" role="status" aria-label="Experimental work in progress">
      <strong>WORK IN PROGRESS · EXPERIMENTAL PREVIEW</strong>
      <span>Published as a proof of concept. APIs, capabilities, and architecture may change.</span>
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
      <WorkInProgressBanner />
      <header className={`site-nav scroll-header${hidden ? " is-hidden" : ""}`}>
        <div className="shell nav-inner">
          <Brand />
          <nav className="nav-links" aria-label="Primary navigation">
            <a href="#principles">Principles</a>
            <a href="#architecture">Architecture</a>
            <a href="#lifecycle">Lifecycle</a>
            <a href="#framework">Framework</a>
            <a href="#research">Research</a>
            <a href="#community">Community</a>
            <Link href="/docs">Documentation</Link>
          </nav>
          <a className="nav-github" href={GITHUB} target="_blank" rel="noreferrer">
            <GitHubMark /> GitHub <span aria-hidden="true">↗</span>
          </a>
        </div>
      </header>
    </>
  );
}

export function DocsNav() {
  return (
    <>
      <WorkInProgressBanner />
      <header className="docs-topbar">
        <div className="docs-topbar-inner">
          <Brand docs />
          <nav aria-label="Documentation utilities">
            <ThemeToggle />
            <a href={PAPER} target="_blank" rel="noreferrer">Paper ↗</a>
            <Link href="/">SDK overview</Link>
            <a href={GITHUB} target="_blank" rel="noreferrer">GitHub ↗</a>
          </nav>
        </div>
      </header>
    </>
  );
}
