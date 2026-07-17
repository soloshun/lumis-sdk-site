"use client";

import { useEffect, useRef, useState } from "react";

let renderCount = 0;

function themeVariables(dark: boolean) {
  return dark
    ? {
        background: "transparent",
        primaryColor: "#121620",
        primaryTextColor: "#e8ebf1",
        primaryBorderColor: "#2962ff",
        secondaryColor: "#0d1017",
        tertiaryColor: "#171b25",
        lineColor: "#7aa2ff",
        textColor: "#b2bac6",
        noteBkgColor: "#171b25",
        noteTextColor: "#b2bac6",
        noteBorderColor: "#2962ff",
        actorBkg: "#121620",
        actorTextColor: "#e8ebf1",
        actorBorder: "#2962ff",
        signalColor: "#7aa2ff",
        signalTextColor: "#b2bac6",
        clusterBkg: "rgba(41,98,255,.05)",
        clusterBorder: "rgba(122,162,255,.4)",
        edgeLabelBackground: "#0d1017",
        fontFamily: "var(--font-geist-sans), system-ui, sans-serif",
      }
    : {
        background: "transparent",
        primaryColor: "#eef2ff",
        primaryTextColor: "#0b0d12",
        primaryBorderColor: "#2962ff",
        secondaryColor: "#f3f4f7",
        tertiaryColor: "#e9ecf2",
        lineColor: "#2962ff",
        textColor: "#4f5968",
        noteBkgColor: "#f3f4f7",
        noteTextColor: "#4f5968",
        noteBorderColor: "#2962ff",
        actorBkg: "#ffffff",
        actorTextColor: "#0b0d12",
        actorBorder: "#2962ff",
        signalColor: "#2962ff",
        signalTextColor: "#4f5968",
        clusterBkg: "rgba(41,98,255,.045)",
        clusterBorder: "rgba(41,98,255,.35)",
        edgeLabelBackground: "#f8f9fb",
        fontFamily: "var(--font-geist-sans), system-ui, sans-serif",
      };
}

export function Mermaid({ code, caption }: { code: string; caption?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function draw() {
      try {
        const mermaid = (await import("mermaid")).default;
        const dark = document.documentElement.dataset.docTheme === "dark";
        mermaid.initialize({
          startOnLoad: false,
          securityLevel: "strict",
          theme: "base",
          themeVariables: themeVariables(dark),
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
