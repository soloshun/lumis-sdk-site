"use client";

import { useRouter } from "next/navigation";

export function MobileDocSelect({ current, options }: { current: string; options: { slug: string; label: string }[] }) {
  const router = useRouter();
  return (
    <div className="docs-mobile-nav">
      <label htmlFor="docs-page">Documentation page</label>
      <select id="docs-page" value={current} onChange={(event) => router.push(event.target.value === "overview" ? "/docs" : `/docs/${event.target.value}`)}>
        {options.map((item) => <option key={item.slug} value={item.slug}>{item.label}</option>)}
      </select>
    </div>
  );
}
