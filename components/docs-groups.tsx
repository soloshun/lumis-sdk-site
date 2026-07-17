"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";

const STORAGE_KEY = "lumis-docs-open-groups";
const CHANGE_EVENT = "lumis-docs-nav-change";

type NavPage = { slug: string; label: string; nested?: boolean };
type NavGroup = { group: string; pages: NavPage[] };

function subscribe(callback: () => void) {
  window.addEventListener(CHANGE_EVENT, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(CHANGE_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

function getSnapshot() {
  try { return window.localStorage.getItem(STORAGE_KEY) || "{}"; } catch { return "{}"; }
}

function getServerSnapshot() {
  return "{}";
}

export function DocsGroups({ groups, activeSlug, activeGroup }: { groups: NavGroup[]; activeSlug: string; activeGroup: string }) {
  const raw = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  let stored: Record<string, boolean> = {};
  try { stored = JSON.parse(raw) as Record<string, boolean>; } catch {}

  function isOpen(group: string) {
    if (typeof stored[group] === "boolean") return stored[group];
    return group === activeGroup;
  }

  function persist(group: string, value: boolean) {
    const next = { ...stored, [group]: value };
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      window.dispatchEvent(new Event(CHANGE_EVENT));
    } catch {}
  }

  return (
    <>
      {groups.map(({ group, pages }) => (
        <details
          className="docs-group"
          key={group}
          open={isOpen(group)}
          onToggle={(event) => {
            const domOpen = (event.target as HTMLDetailsElement).open;
            if (domOpen !== isOpen(group)) persist(group, domOpen);
          }}
        >
          <summary>{group}<span aria-hidden="true">⌄</span></summary>
          <div>
            {pages.map((item) => (
              <div className="docs-nav-item" key={item.slug}>
                <Link
                  className={`${item.nested ? "nested" : ""} ${item.slug === activeSlug ? "active" : ""}`.trim()}
                  href={item.slug === "overview" ? "/docs" : `/docs/${item.slug}`}
                >
                  {item.label}
                </Link>
              </div>
            ))}
          </div>
        </details>
      ))}
    </>
  );
}
