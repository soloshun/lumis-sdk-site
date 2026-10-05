"use client";

export function ThemeToggle() {
  function toggle() {
    const next = document.documentElement.dataset.docTheme === "dark" ? "light" : "dark";
    document.documentElement.dataset.docTheme = next;
    try { window.localStorage.setItem("lumis-doc-theme", next); } catch {}
  }

  return <button className="theme-toggle" type="button" onClick={toggle} aria-label="Toggle color theme"><span aria-hidden="true">◐</span>Theme</button>;
}
