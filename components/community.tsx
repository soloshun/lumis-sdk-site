"use client";

import { useEffect, useRef, useState } from "react";

const REPO = "soloshun/lumis-sdk";
const GITHUB = `https://github.com/${REPO}`;
export const CONTACT_EMAIL = "solomon@qadimlabs.com";

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
  return (
    <div className={`dot-matrix ${lit ? "lit" : ""}`} aria-label={`${text} GitHub stars`} role="img">
      {Array.from({ length: 7 }, (_, row) => (
        <div className="dot-row" key={row}>
          {text.split("").map((char, charIndex) => {
            const glyph = GLYPHS[char] || GLYPHS["."];
            return (
              <span className="dot-char" key={charIndex}>
                {glyph[row].split("").map((bit, col) => (
                  <i
                    className={bit === "1" ? "on" : ""}
                    key={col}
                    style={bit === "1" ? { transitionDelay: `${((charIndex * 13 + row * 7 + col * 3) % 24) * 40}ms` } : undefined}
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
    <section className="section alt" id="community" ref={sectionRef}>
      <div className="shell">
        <div className="section-head">
          <p className="eyebrow">The SDK is open source</p>
          <h2>An open-source proof of concept, under Apache-2.0.</h2>
          <p>Lumis SDK is the proof of concept of Lumis&rsquo; investigation core, and it is released as open source: read the source, run it locally, and see exactly what it checked. Other Lumis products and services are separate and are not necessarily open source.</p>
        </div>
        <div className="community-grid">
          <div className="community-card">
            <h3>Contributors</h3>
            <p>Lumis is early, and small. Questions, ideas, bug reports and offers to help are all welcome by email.</p>
            {contributors.length > 0 && (
              <div className="contributors">
                <span className="community-label">PEOPLE WHO HAVE CONTRIBUTED</span>
                <div className="contributor-row">
                  {contributors.map((person) => (
                    <a className="contributor" key={person.login} href={person.html_url} target="_blank" rel="noreferrer" title={person.login}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={`${person.avatar_url}${person.avatar_url.includes("?") ? "&" : "?"}s=80`} alt={person.login} loading="lazy" width={40} height={40} />
                    </a>
                  ))}
                </div>
              </div>
            )}
            <a className="button" href={`mailto:${CONTACT_EMAIL}?subject=Lumis%20SDK`}>Email {CONTACT_EMAIL}</a>
          </div>
          <a className="community-card star-board" href={`${GITHUB}/stargazers`} target="_blank" rel="noreferrer" aria-label="GitHub stars">
            <span className="community-label">GITHUB STARS</span>
            <DotMatrix text={stars === null ? "★" : `★${formatStars(stars)}`} lit={visible && stars !== null} />
            <small>{stars === null ? "Live count unavailable" : "Star the repository on GitHub ↗"}</small>
          </a>
        </div>
      </div>
    </section>
  );
}
