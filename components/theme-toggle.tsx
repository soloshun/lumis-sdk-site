"use client";

export function ThemeToggle() {
  function toggle() {
    const next = document.documentElement.dataset.docTheme === "dark" ? "light" : "dark";
    document.documentElement.dataset.docTheme = next;
    window.localStorage.setItem("lumis-doc-theme", next);
  }

  return <button className="theme-toggle" type="button" onClick={toggle} aria-label="Toggle documentation color theme"><span aria-hidden="true">◐</span>Theme</button>;
}
