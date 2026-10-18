/**
 * The share card (link preview) layout, 1200×630: the home card at /og and one card per documentation
 * page at /og/<slug>, so a shared docs link names its own page.
 */
export const OG_SIZE = { width: 1200, height: 630 };

const clip = (text: string, max: number) => (text.length > max ? `${text.slice(0, max - 1).replace(/[\s,;:.]+\S*$/, "")}…` : text);

export function OgCard({ label, title, accent, lede, footer }: { label: string; title: string; accent?: string; lede?: string; footer: string }) {
  const size = title.length > 40 ? 54 : title.length > 26 ? 62 : 68;
  return (
    <div style={{ display: "flex", flexDirection: "column", width: "100%", height: "100%", padding: "64px 72px", background: "#f7f7f4", color: "#15181b", fontFamily: "sans-serif" }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 24 }}>
        <span style={{ fontWeight: 700 }}>Lumis SDK</span>
        <span style={{ color: "#687076", fontSize: 18 }}>{label}</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", marginTop: lede ? 72 : 96, fontSize: size, fontWeight: 700, letterSpacing: -2, lineHeight: 1.08 }}>
        <span>{title}</span>
        {accent && <span style={{ color: "#0d7a6f" }}>{accent}</span>}
      </div>
      {lede && <div style={{ display: "flex", marginTop: 28, fontSize: 28, lineHeight: 1.35, color: "#3c4248", maxWidth: 980 }}>{clip(lede, 150)}</div>}
      <div style={{ display: "flex", marginTop: "auto", paddingTop: 24, borderTop: "1px solid #cdd0c8", fontSize: 22, color: "#3c4248" }}>{footer}</div>
    </div>
  );
}
