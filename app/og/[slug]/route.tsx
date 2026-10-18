import { ImageResponse } from "next/og";
import { SDK_VERSION, docs } from "@/content/docs";
import { OG_SIZE, OgCard } from "@/lib/og-card";

export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams() {
  return docs.map(({ slug }) => ({ slug }));
}

/** The share card for one documentation page: its title and summary, so a shared link names its page. */
export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = docs.find((doc) => doc.slug === slug);
  if (!page) return new Response("Not found", { status: 404 });
  const path = page.slug === "overview" ? "/docs" : `/docs/${page.slug}`;
  return new ImageResponse(
    <OgCard
      label={`Documentation · ${page.group} · v${SDK_VERSION}`}
      title={page.title}
      lede={page.description}
      footer={`lumis-sdk.vercel.app${path}`}
    />,
    OG_SIZE,
  );
}
