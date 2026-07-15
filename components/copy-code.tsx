"use client";

import { useState } from "react";

export function CopyCode({ code, label = "Copy" }: { code: string; label?: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <button className="copy-button" type="button" onClick={copy} aria-label={`${label} code`}>
      {copied ? "Copied" : label}
    </button>
  );
}
