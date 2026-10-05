"use client";

import { useEffect, useRef, useState } from "react";

let renderCount = 0;

function themeVariables(dark: boolean, fontFamily: string) {
  return dark
    ? {
        background: "transparent",
        primaryColor: "#181d1e",
        primaryTextColor: "#e8ebe9",
        primaryBorderColor: "#3bbfad",
        secondaryColor: "#131617",
        tertiaryColor: "#1d2223",
        lineColor: "#6fd5c7",
        textColor: "#c3c9c6",
        clusterBkg: "rgba(59,191,173,.06)",
        clusterBorder: "rgba(111,213,199,.35)",
        edgeLabelBackground: "#131617",
        fontFamily,
        fontSize: "14px",
      }
    : {
        background: "transparent",
        primaryColor: "#eef7f5",
        primaryTextColor: "#15181b",
        primaryBorderColor: "#0d7a6f",
        secondaryColor: "#f0f1ec",
        tertiaryColor: "#f7f7f4",
        lineColor: "#0d7a6f",
        textColor: "#3c4248",
        clusterBkg: "rgba(13,122,111,.04)",
        clusterBorder: "rgba(13,122,111,.3)",
        edgeLabelBackground: "#ffffff",
        fontFamily,
        fontSize: "14px",
      };
}

export function Mermaid({ code, caption }: { code: string; caption?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function draw() {
      try {
        // Measure labels with the page font, or Mermaid sizes nodes for the fallback font and clips text.
        await document.fonts.ready;
        const mermaid = (await import("mermaid")).default;
        const dark = document.documentElement.dataset.docTheme === "dark";
        // Mermaid measures labels with this font, so it must be a real family list, not a CSS variable.
        const fontFamily = getComputedStyle(document.body).fontFamily;
        mermaid.initialize({
          startOnLoad: false,
          securityLevel: "strict",
          theme: "base",
          themeVariables: themeVariables(dark, fontFamily),
          flowchart: { curve: "basis", htmlLabels: true },
          sequence: { mirrorActors: false },
        });
        const { svg } = await mermaid.render(`lumis-mmd-${++renderCount}`, code);
        if (!cancelled && containerRef.current) containerRef.current.innerHTML = svg;
      } catch {
        if (!cancelled) setError(true);
      }
    }

    draw();
    const observer = new MutationObserver(() => draw());
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-doc-theme"] });
    return () => { cancelled = true; observer.disconnect(); };
  }, [code]);

  if (error) {
    return <div className="doc-code"><div><span>diagram</span></div><pre><code>{code}</code></pre></div>;
  }
  return (
    <figure className="doc-diagram">
      <div ref={containerRef} aria-label={caption || "Diagram"} role="img" />
      {caption ? <figcaption>{caption}</figcaption> : null}
    </figure>
  );
}
