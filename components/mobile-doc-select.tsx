"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";

type DocOption = { slug: string; label: string; group: string };

export function MobileDocSelect({ current, options }: { current: string; options: DocOption[] }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const initialFocus = useRef<"current" | "first" | "last">("current");
  const id = useId();
  const panelId = `${id}-pages`;
  const labelId = `${id}-label`;
  const valueId = `${id}-value`;
  const selected = options.find((item) => item.slug === current) ?? options[0];
  const groups = [...new Set(options.map((item) => item.group))];

  useEffect(() => {
    if (!open) return;
    const list = listRef.current;
    const links = list?.querySelectorAll<HTMLAnchorElement>("a[href]");
    const target = initialFocus.current === "first" ? links?.[0]
      : initialFocus.current === "last" ? links?.[links.length - 1]
      : list?.querySelector<HTMLAnchorElement>('[aria-current="page"]') ?? links?.[0];
    target?.focus({ preventScroll: true });
    if (list && target) {
      list.scrollTop = target.offsetTop - list.offsetTop - (list.clientHeight - target.clientHeight) / 2;
    }

    function dismiss(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }
    const desktop = window.matchMedia("(min-width: 861px)");
    function onResize() { if (desktop.matches) setOpen(false); }
    document.addEventListener("pointerdown", dismiss);
    desktop.addEventListener("change", onResize);
    return () => {
      document.removeEventListener("pointerdown", dismiss);
      desktop.removeEventListener("change", onResize);
    };
  }, [open]);

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Escape" && open) {
      event.preventDefault();
      setOpen(false);
      buttonRef.current?.focus({ preventScroll: true });
      return;
    }
    if (!open) {
      if (event.key === "ArrowDown" || event.key === "ArrowUp") {
        event.preventDefault();
        initialFocus.current = event.key === "ArrowDown" ? "first" : "last";
        setOpen(true);
      }
      return;
    }
    if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) return;
    const links = [...(listRef.current?.querySelectorAll<HTMLAnchorElement>("a[href]") ?? [])];
    if (!links.length) return;
    event.preventDefault();
    const index = links.indexOf(document.activeElement as HTMLAnchorElement);
    const next = event.key === "Home" ? 0 : event.key === "End" ? links.length - 1
      : index < 0 ? (event.key === "ArrowDown" ? 0 : links.length - 1)
      : (index + (event.key === "ArrowDown" ? 1 : -1) + links.length) % links.length;
    links[next].focus({ preventScroll: true });
    links[next].scrollIntoView({ block: "nearest" });
  }

  return (
    <div className="docs-mobile-nav" ref={rootRef} onKeyDown={onKeyDown}
      onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setOpen(false); }}>
      <span className="docs-picker-label" id={labelId}>Documentation page</span>
      <button className="docs-picker-trigger" type="button" ref={buttonRef}
        aria-expanded={open} aria-controls={panelId} aria-labelledby={`${labelId} ${valueId}`}
        onClick={() => { initialFocus.current = "current"; setOpen(!open); }}>
        <svg className="docs-picker-book" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
          <path d="M12 5.5c-3-2-7-2-9-1v15c2-1 6-1 9 1 3-2 7-2 9-1v-15c-2-1-6-1-9 1Z" /><path d="M12 5.5v15" />
        </svg>
        <span className="docs-picker-value" id={valueId}><small>{selected.group}</small><strong>{selected.label}</strong></span>
        <svg className="docs-picker-chevron" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="m5 7.5 5 5 5-5" /></svg>
      </button>
      {open ? <nav className="docs-picker-panel" id={panelId} aria-label="Documentation pages">
        <div className="docs-picker-header"><span>Browse documentation</span><small>{options.length} pages</small></div>
        <div className="docs-picker-list" ref={listRef}>
          {groups.map((group, index) => <section className="docs-picker-group" key={group} aria-labelledby={`${id}-group-${index}`}>
            <h2 id={`${id}-group-${index}`}>{group}</h2>
            {options.filter((item) => item.group === group).map((item) => <Link
              className="docs-picker-link" key={item.slug} href={item.slug === "overview" ? "/docs" : `/docs/${item.slug}`}
              aria-current={item.slug === current ? "page" : undefined}
              onClick={() => { setOpen(false); buttonRef.current?.focus({ preventScroll: true }); }}>
              <span>{item.label}</span>
              {item.slug === current ? <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><path d="m4 10 4 4 8-8" /></svg> : null}
            </Link>)}
          </section>)}
        </div>
      </nav> : null}
    </div>
  );
}
