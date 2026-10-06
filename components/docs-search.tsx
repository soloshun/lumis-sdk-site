"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useId, useRef, useState, useSyncExternalStore, type KeyboardEvent } from "react";
import { searchDocumentation, searchExcerpt, type DocsSearchEntry } from "@/lib/docs-search";

const subscribePlatform = () => () => {};
const isMacPlatform = () => /Mac|iPhone|iPad|iPod/.test(navigator.platform);
const serverPlatform = () => false;

function SearchIcon() {
  return <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><circle cx="8.5" cy="8.5" r="5.5" /><path d="m13 13 4 4" /></svg>;
}

function Highlight({ text, query }: { text: string; query: string }) {
  const terms = [...new Set(query.trim().split(/\s+/).filter(Boolean))].slice(0, 8);
  if (!terms.length) return <>{text}</>;
  const pattern = new RegExp(`(${terms.map((term) => term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})`, "gi");
  return <>{text.split(pattern).map((part, index) => index % 2 ? <mark key={index}>{part}</mark> : part)}</>;
}

export function DocsSearch() {
  const router = useRouter();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const previousFocus = useRef<HTMLElement | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLUListElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [entries, setEntries] = useState<DocsSearchEntry[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [active, setActive] = useState(0);
  const isMac = useSyncExternalStore(subscribePlatform, isMacPlatform, serverPlatform);
  const id = useId();
  const resultsId = `${id}-results`;
  const results = entries ? searchDocumentation(entries, query) : [];
  const activeIndex = Math.min(active, Math.max(0, results.length - 1));

  const openSearch = useCallback(() => {
    if (!dialogRef.current?.open) {
      previousFocus.current = document.activeElement as HTMLElement | null;
      dialogRef.current?.showModal();
      setOpen(true);
    }
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    function shortcut(event: globalThis.KeyboardEvent) {
      if (event.key.toLowerCase() === "k" && (event.metaKey || event.ctrlKey) && !event.altKey && !event.shiftKey) {
        event.preventDefault();
        openSearch();
      }
    }
    window.addEventListener("keydown", shortcut);
    return () => window.removeEventListener("keydown", shortcut);
  }, [openSearch]);

  useEffect(() => {
    if (!open || entries || failed) return;
    const controller = new AbortController();
    fetch("/docs-search.json", { signal: controller.signal })
      .then((response) => { if (!response.ok) throw new Error("Search index unavailable"); return response.json(); })
      .then((data: DocsSearchEntry[]) => setEntries(data))
      .catch(() => { if (!controller.signal.aborted) setFailed(true); });
    return () => controller.abort();
  }, [open, entries, failed]);

  function closeSearch() { dialogRef.current?.close(); }

  function navigate(href: string) {
    closeSearch();
    router.push(href);
  }

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (!results.length) return;
    if (event.key === "Enter") {
      event.preventDefault();
      navigate(results[activeIndex].href);
    } else if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      const next = (activeIndex + (event.key === "ArrowDown" ? 1 : -1) + results.length) % results.length;
      setActive(next);
      resultsRef.current?.querySelectorAll("a")[next]?.scrollIntoView({ block: "nearest" });
    }
  }

  return <>
    <button className="docs-search-trigger" ref={triggerRef} type="button" aria-label="Search documentation" aria-keyshortcuts="Control+K Meta+K"
      title={`Search documentation (${isMac ? "⌘" : "Ctrl"}+K)`} onClick={openSearch}>
      <SearchIcon /><span>Search</span><kbd>{isMac ? "⌘" : "Ctrl"} K</kbd>
    </button>
    <dialog className="docs-search-dialog" ref={dialogRef} aria-label="Search documentation" aria-modal="true"
      onClose={() => {
        setOpen(false); setQuery(""); setActive(0); setFailed(false);
        const target = previousFocus.current;
        (target?.isConnected && target.tabIndex >= 0 ? target : triggerRef.current)?.focus({ preventScroll: true });
      }}
      onClick={(event) => { if (event.target === event.currentTarget) closeSearch(); }}>
      <div className="docs-search-surface">
        <div className="docs-search-input-row">
          <SearchIcon />
          <input ref={inputRef} type="search" role="combobox" aria-label="Search documentation" aria-autocomplete="list" aria-expanded={open}
            aria-controls={resultsId} aria-activedescendant={results.length ? `${id}-result-${activeIndex}` : undefined}
            placeholder="Search the documentation…" autoComplete="off" spellCheck={false} maxLength={120} value={query}
            onChange={(event) => { setQuery(event.target.value); setActive(0); }} onKeyDown={onKeyDown} />
          <button type="button" className="docs-search-close" aria-label="Close search" onClick={closeSearch}>Esc</button>
        </div>
        <div className="docs-search-results">
          <p className="docs-search-status" aria-live="polite">
            {failed ? "Search could not load. Close and reopen to retry." : !entries ? "Loading documentation…" : query.trim() ? `${results.length} matching ${results.length === 1 ? "result" : "results"}` : "Jump to a page"}
          </p>
          <ul id={resultsId} ref={resultsRef} role="listbox" aria-label="Search results">
            {results.map((result, index) => <li role="presentation" key={result.id}>
              <Link href={result.href} id={`${id}-result-${index}`} role="option" aria-selected={index === activeIndex} tabIndex={-1}
                className="docs-search-result" onClick={closeSearch} onMouseEnter={() => setActive(index)}>
                <small>{result.group} · {result.page}</small>
                <strong><Highlight text={result.title} query={query} /></strong>
                <span><Highlight text={searchExcerpt(result.text, query)} query={query} /></span>
              </Link>
            </li>)}
          </ul>
          {entries && !results.length ? <p className="docs-search-empty">No matches for “{query}”. Try a page name, API name, or a shorter phrase.</p> : null}
        </div>
        <div className="docs-search-footer"><span><kbd>↑</kbd> <kbd>↓</kbd> Navigate</span><span><kbd>Enter</kbd> Open</span><span><kbd>Esc</kbd> Close</span></div>
      </div>
    </dialog>
  </>;
}
