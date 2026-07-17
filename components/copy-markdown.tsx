"use client";

import { useState } from "react";

export function CopyMarkdown({ markdown }: { markdown: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      className="copy-markdown"
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(markdown);
          setCopied(true);
          setTimeout(() => setCopied(false), 1800);
        } catch {}
      }}
      title="Copy this page as Markdown — paste it into any AI assistant or editor"
    >
      {copied ? "COPIED ✓" : "COPY AS MARKDOWN"}
    </button>
  );
}
