import { ImageResponse } from "next/og";

export const dynamic = "force-static";
export function GET() {
  return new ImageResponse(<div style={{display: "flex", flexDirection: "column", width: "100%", height: "100%", padding: "64px 72px", background: "#f7f7f4", color: "#15181b", fontFamily: "sans-serif"}}>
    <div style={{display: "flex", justifyContent: "space-between", fontSize: 24}}><span style={{fontWeight: 700}}>Lumis SDK</span><span style={{color: "#687076", fontSize: 18}}>Apache-2.0 proof of concept · v0.1.0 experimental</span></div>
    <div style={{display: "flex", flexDirection: "column", marginTop: 96, fontSize: 68, fontWeight: 700, letterSpacing: -2, lineHeight: 1.08}}><span>Incident investigation,</span><span style={{color: "#0d7a6f"}}>grounded in evidence.</span></div>
    <div style={{display: "flex", marginTop: "auto", paddingTop: 24, borderTop: "1px solid #cdd0c8", fontSize: 22, color: "#3c4248"}}>Checks first · a bounded model only when needed · evidence decides · a person reviews</div>
  </div>, {width: 1200, height: 630});
}
