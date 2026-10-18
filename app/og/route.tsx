import { ImageResponse } from "next/og";
import { SDK_VERSION } from "@/content/docs";
import { OG_SIZE, OgCard } from "@/lib/og-card";

export const dynamic = "force-static";
export function GET() {
  return new ImageResponse(
    <OgCard
      label={`Apache-2.0 proof of concept · v${SDK_VERSION} experimental`}
      title="Incident investigation,"
      accent="grounded in evidence."
      footer="Checks first · a bounded model only when needed · evidence decides · a person reviews"
    />,
    OG_SIZE,
  );
}
