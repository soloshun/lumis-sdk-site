"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

const REPO = "soloshun/lumis-sdk";
const GITHUB = `https://github.com/${REPO}`;

type Contributor = { login: string; avatar_url: string; html_url: string; type?: string };

function isHuman(person: Contributor) {
  return person.type !== "Bot" && !/\[bot\]$/i.test(person.login) && !/^(dependabot|renovate|github-actions)/i.test(person.login);
}

// 5x7 dot-matrix glyphs for the star counter.
const GLYPHS: Record<string, string[]> = {
  "0": ["01110", "10001", "10011", "10101", "11001", "10001", "01110"],
  "1": ["00100", "01100", "00100", "00100", "00100", "00100", "01110"],
  "2": ["01110", "10001", "00001", "00110", "01000", "10000", "11111"],
  "3": ["01110", "10001", "00001", "00110", "00001", "10001", "01110"],
  "4": ["00010", "00110", "01010", "10010", "11111", "00010", "00010"],
  "5": ["11111", "10000", "11110", "00001", "00001", "10001", "01110"],
  "6": ["00110", "01000", "10000", "11110", "10001", "10001", "01110"],
  "7": ["11111", "00001", "00010", "00100", "01000", "01000", "01000"],
  "8": ["01110", "10001", "10001", "01110", "10001", "10001", "01110"],
  "9": ["01110", "10001", "10001", "01111", "00001", "00010", "01100"],
  ".": ["00000", "00000", "00000", "00000", "00000", "01100", "01100"],
  ",": ["00000", "00000", "00000", "00000", "01100", "00100", "01000"],
  K: ["10001", "10010", "10100", "11000", "10100", "10010", "10001"],
  M: ["10001", "11011", "10101", "10101", "10001", "10001", "10001"],
  "★": ["00100", "00100", "11111", "01110", "01110", "01010", "10001"],
};

function formatStars(count: number): string {
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  if (count >= 1_000) return `${(count / 1_000).toFixed(1).replace(/\.0$/, "")}K`;
  return String(count);
}

function DotMatrix({ text, lit }: { text: string; lit: boolean }) {
  const rows = 7;
  const chars = text.split("");
  return (
    <div className={`dot-matrix ${lit ? "lit" : ""}`} aria-label={`${text} GitHub stars`} role="img">
      {Array.from({ length: rows }, (_, row) => (
        <div className="dot-row" key={row}>
          {chars.map((char, charIndex) => {
            const glyph = GLYPHS[char] || GLYPHS["."];
            return (
              <span className="dot-char" key={charIndex}>
                {glyph[row].split("").map((bit, col) => (
                  <i
                    className={bit === "1" ? "on" : ""}
                    key={col}
                    style={bit === "1" ? { transitionDelay: `${((charIndex * 13 + row * 7 + col * 3) % 24) * 45}ms` } : undefined}
                  />
                ))}
              </span>
            );
          })}
        </div>
      ))}
    </div>
  );
}

const CHANNELS = [
  { name: "GitHub", detail: "Issues, RFCs, and discussions", href: GITHUB, live: true },
  { name: "X / Twitter", detail: "Build-in-public updates", href: null, live: false },
  { name: "Discord", detail: "Community chat and support", href: null, live: false },
];

export function Community() {
  const [stars, setStars] = useState<number | null>(null);
  const [contributors, setContributors] = useState<Contributor[]>([]);
  const [visible, setVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const controller = new AbortController();
    const headers = { Accept: "application/vnd.github+json" };
    fetch(`https://api.github.com/repos/${REPO}`, { headers, signal: controller.signal })
      .then((response) => (response.ok ? response.json() : null))
      .then((repo) => { if (typeof repo?.stargazers_count === "number") setStars(repo.stargazers_count); })
      .catch(() => {});
    fetch(`https://api.github.com/repos/${REPO}/contributors?per_page=32`, { headers, signal: controller.signal })
      .then((response) => (response.ok ? response.json() : []))
      .then((list) => { if (Array.isArray(list)) setContributors(list.filter((item) => item?.login && item?.avatar_url).filter(isHuman)); })
      .catch(() => {});
    return () => controller.abort();
  }, []);

  useEffect(() => {
    const node = sectionRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((entry) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect(); } }),
      { threshold: 0.2 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <section className={`community dark-zone ${visible ? "is-visible" : ""}`} id="community" ref={sectionRef}>
      <div className="shell">
        <div className="section-heading split-heading reverse" data-reveal="">
          <p>Lumis SDK is developed in the open under Apache-2.0. Every rule engine, contract, and safety boundary is reviewable—and shaped by the people who show up.</p>
          <div><p className="eyebrow">BUILT IN PUBLIC</p><h2>Open source,<br />from the first commit.</h2></div>
        </div>

        <div className="community-hero" data-reveal="">
          <div className="community-copy">
            <h3>Star history starts here.</h3>
            <p>
              Great infrastructure tools are transparent, inspectable, and owned by their
              community. Read the source, run it offline, self-host it—you are never locked in.
            </p>
            <div className="hero-actions">
              <a className="button primary" href={GITHUB} target="_blank" rel="noreferrer">Star on GitHub ★</a>
              <Link className="button secondary" href="/docs/project/contributing">Contribute →</Link>
            </div>
            <div className="contributor-strip">
              <span className="community-label">CONTRIBUTORS</span>
              <div className="contributor-row">
                {contributors.map((person, index) => (
                  <a
                    className="contributor"
                    key={person.login}
                    href={person.html_url}
                    target="_blank"
                    rel="noreferrer"
                    data-name={person.login}
                    style={{ transitionDelay: `${index * 70}ms` }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={`${person.avatar_url}${person.avatar_url.includes("?") ? "&" : "?"}s=96`} alt={person.login} loading="lazy" width={44} height={44} />
                  </a>
                ))}
                <a className="contributor join" href={`${GITHUB}/blob/main/CONTRIBUTING.md`} target="_blank" rel="noreferrer" data-name="This could be you" aria-label="Read the contributing guide">+</a>
              </div>
            </div>
          </div>
          <a className="star-board" href={`${GITHUB}/stargazers`} target="_blank" rel="noreferrer" aria-label="GitHub stargazers">
            <span className="community-label">GITHUB STARS</span>
            <DotMatrix text={stars === null ? "★" : `★${formatStars(stars)}`} lit={visible && stars !== null} />
            <small>{stars === null ? "counting…" : "every one of them counted, dot by dot"}</small>
          </a>
        </div>

        <div className="channel-row" data-reveal="stagger">
          {CHANNELS.map((channel) =>
            channel.href ? (
              <a className="channel-card live" key={channel.name} href={channel.href} target="_blank" rel="noreferrer">
                <span className="community-label">{channel.name.toUpperCase()}</span>
                <strong>{channel.detail}</strong>
                <em>OPEN ↗</em>
              </a>
            ) : (
              <div className="channel-card" key={channel.name}>
                <span className="community-label">{channel.name.toUpperCase()}</span>
                <strong>{channel.detail}</strong>
                <em>SOON</em>
              </div>
            ),
          )}
        </div>

        <div className="closing-cta" data-reveal="">
          <div><p className="eyebrow">PRE-ALPHA / CONTRIBUTORS WELCOME</p><h2>Build the open foundation for trustworthy self-healing systems.</h2></div>
          <div>
            <p>Apache-2.0 licensed, typed, local-first, and built in public.</p>
            <div className="hero-actions">
              <Link className="button primary" href="/docs">Read the docs →</Link>
              <a className="button secondary" href={GITHUB} target="_blank" rel="noreferrer">Contribute ↗</a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
