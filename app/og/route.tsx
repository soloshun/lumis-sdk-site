import { ImageResponse } from "next/og";

export const dynamic = "force-static";
export function GET() {
  return new ImageResponse(<div style={{display: "flex", flexDirection: "column", width: "100%", height: "100%", padding: "64px 72px", background: "#050507", color: "#f5f6f8", fontFamily: "sans-serif"}}>
    <div style={{display: "flex", justifyContent: "space-between", fontSize: 22, letterSpacing: 3}}><span>LUMIS / SDK</span><span style={{color: "#aaa99f", fontSize: 16}}>OPEN SOURCE · EXPERIMENTAL</span></div>
    <div style={{display: "flex", flexDirection: "column", marginTop: 90, fontSize: 70, fontWeight: 700, letterSpacing: -3, lineHeight: 1.06}}><span>Operational intelligence.</span><span style={{color: "#7aa2ff"}}>Grounded in evidence.</span></div>
    <div style={{display: "flex", marginTop: "auto", paddingTop: 24, borderTop: "1px solid #414747", fontSize: 19, color: "#c3c4bb"}}>SCOPED CONTEXT · BOUNDED INVESTIGATION · HUMAN REVIEW</div>
  </div>, {width: 1200, height: 630});
}
